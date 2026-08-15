import express from "express";
import sharp from "sharp";
import path from "path";
import fs from "fs";

// Social media optimal dimensions
const SOCIAL_MEDIA_WIDTH = 1200;
const SOCIAL_MEDIA_HEIGHT = 630;

const LOGO_SIZE = 240;
const LOGO_PADDING = 24;

let logoBuffer: Buffer | null = null;
let fallbackImageBuffer: Buffer | null = null;

async function getLogoBuffer(): Promise<Buffer | null> {
  if (logoBuffer) return logoBuffer;
  const logoPath = path.join(process.cwd(), "client/src/assets/logo.png");
  if (!fs.existsSync(logoPath)) return null;
  try {
    logoBuffer = await sharp(logoPath)
      .resize(LOGO_SIZE, LOGO_SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    return logoBuffer;
  } catch {
    return null;
  }
}

/** Branded 1200×630 fallback — pink background with logo centred */
async function getFallbackImage(): Promise<Buffer> {
  if (fallbackImageBuffer) return fallbackImageBuffer;
  const logoPath = path.join(process.cwd(), "client/src/assets/logo.png");
  const base = await sharp({
    create: {
      width: SOCIAL_MEDIA_WIDTH,
      height: SOCIAL_MEDIA_HEIGHT,
      channels: 3,
      background: { r: 239, g: 42, b: 134 }, // #EF2A86
    },
  }).png().toBuffer();

  if (fs.existsSync(logoPath)) {
    try {
      const centredLogo = await sharp(logoPath)
        .resize(320, 320, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
      fallbackImageBuffer = await sharp(base)
        .composite([{ input: centredLogo, gravity: "centre" }])
        .jpeg({ quality: 90 })
        .toBuffer();
      return fallbackImageBuffer;
    } catch { /* fall through to plain pink */ }
  }
  fallbackImageBuffer = await sharp(base).jpeg({ quality: 90 }).toBuffer();
  return fallbackImageBuffer;
}

/** Resize/letterbox any buffer to 1200×630 and composite the logo */
async function buildSocialImage(originalBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(originalBuffer).metadata();
  const ow = metadata.width || 1200;
  const oh = metadata.height || 630;
  const oRatio = ow / oh;
  const tRatio = SOCIAL_MEDIA_WIDTH / SOCIAL_MEDIA_HEIGHT;

  let resized: Buffer;
  if (Math.abs(oRatio - tRatio) < 0.1) {
    resized = await sharp(originalBuffer)
      .resize(SOCIAL_MEDIA_WIDTH, SOCIAL_MEDIA_HEIGHT, { fit: "fill" })
      .jpeg({ quality: 90 })
      .toBuffer();
  } else {
    resized = await sharp({
      create: {
        width: SOCIAL_MEDIA_WIDTH,
        height: SOCIAL_MEDIA_HEIGHT,
        channels: 3,
        background: { r: 239, g: 42, b: 134 },
      },
    })
      .composite([{
        input: await sharp(originalBuffer)
          .resize(SOCIAL_MEDIA_WIDTH, SOCIAL_MEDIA_HEIGHT, { fit: "inside", withoutEnlargement: false })
          .toBuffer(),
        gravity: "centre",
      }])
      .jpeg({ quality: 90 })
      .toBuffer();
  }

  const logo = await getLogoBuffer();
  if (!logo) return resized;
  return sharp(resized)
    .composite([{
      input: logo,
      left: SOCIAL_MEDIA_WIDTH - LOGO_SIZE - LOGO_PADDING,
      top: SOCIAL_MEDIA_HEIGHT - LOGO_SIZE - LOGO_PADDING,
    }])
    .jpeg({ quality: 90 })
    .toBuffer();
}

/** Resolve any image URL to a raw Buffer, or return null if unsupported/unavailable */
async function resolveImageUrl(imageUrl: string): Promise<Buffer | null> {
  // base64 data URL
  const base64Match = imageUrl.match(/^data:image\/(png|jpg|jpeg|gif|webp);base64,(.+)$/);
  if (base64Match) return Buffer.from(base64Match[2], "base64");

  // local /blog-images/ file
  if (imageUrl.startsWith("/blog-images/")) {
    const filePath = path.join(process.cwd(), "client/public", imageUrl);
    if (fs.existsSync(filePath)) return fs.readFileSync(filePath);
    return null;
  }

  // external http/https URL — fetch with timeout
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const resp = await fetch(imageUrl, { signal: controller.signal });
      clearTimeout(timer);
      if (!resp.ok) return null;
      return Buffer.from(await resp.arrayBuffer());
    } catch {
      return null;
    }
  }

  return null;
}

export function registerBlogImageRoutes(app: express.Application) {
  app.get("/api/blog-images/:postId/featured", async (req, res) => {
    const sendImage = (buf: Buffer) => {
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(buf);
    };

    try {
      const { storage } = await import("./storage");
      const post = await storage.getBlogPost(req.params.postId);

      // If post not found, serve branded fallback so Facebook always gets an image
      if (!post) {
        return sendImage(await getFallbackImage());
      }

      // Gather all candidate image URLs in priority order
      const candidates: string[] = [];
      const featuredImg = post.images?.find((img: any) => img.isFeatured);
      if (featuredImg?.url) candidates.push(featuredImg.url);
      if (post.images?.length) post.images.forEach((img: any) => { if (img.url && img.url !== candidates[0]) candidates.push(img.url); });
      if (post.blocks && Array.isArray(post.blocks)) {
        for (const block of post.blocks as any[]) {
          if (block.type === "image" && block.content?.url) candidates.push(block.content.url);
        }
      }
      if (post.content && typeof post.content === "string") {
        const m = post.content.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (m?.[1]) candidates.push(m[1]);
      }

      // Try each candidate until one resolves
      let originalBuffer: Buffer | null = null;
      for (const url of candidates) {
        originalBuffer = await resolveImageUrl(url);
        if (originalBuffer) break;
      }

      // Fall back to branded image if nothing resolved
      if (!originalBuffer) {
        console.warn(`[BlogImage] No resolvable image for post ${req.params.postId}, serving fallback`);
        return sendImage(await getFallbackImage());
      }

      sendImage(await buildSocialImage(originalBuffer));
    } catch (error) {
      console.error("Error serving blog image:", error);
      try { return res.send(await getFallbackImage()); } catch { res.status(500).end(); }
    }
  });
}
