import express from "express";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { resolveClientDir } from "./paths";

/**
 * Resolve a file that lives under the client's public/ folder.
 *
 * In dev these sit in the source tree; once built, vite copies them into the
 * client build directory (dist/public on Replit, public on the Azure layout)
 * and the source tree is not shipped at all. A path hardcoded to client/public
 * or client/src therefore resolves fine locally and finds nothing in
 * production — which surfaces as a flat pink fallback share image, not as an
 * error. Check the build output first, the source tree second.
 */
function publicAssetRoots(): string[] {
  const source = path.join(process.cwd(), "client", "public");
  const build = resolveClientDir();
  // In dev the source tree is authoritative: preferring a leftover dist/ build
  // would keep serving yesterday's picture after the file had been replaced.
  // In production the source tree is not shipped, so the build dir is all there is.
  return process.env.NODE_ENV === "production"
    ? [...(build ? [build] : []), source]
    : [source, ...(build ? [build] : [])];
}

function resolvePublicAsset(relative: string): string | null {
  // These URLs come from database content, so they must not be able to select
  // an arbitrary file. Resolve inside each root and require the result to stay
  // under it — "/blog-images/../../.env.png" normalises outside and is rejected.
  const rel = relative.replace(/^\/+/, "");
  if (!rel || rel.includes("\0") || path.isAbsolute(rel)) return null;

  const within = (base: string, target: string) =>
    target === base || target.startsWith(base + path.sep);

  for (const root of publicAssetRoots()) {
    try {
      // Compare real paths, not just the strings. path.resolve() collapses "..",
      // but a symlink sitting inside the root can still point outside it, and
      // that only shows up once the link is followed.
      const base = fs.realpathSync(path.resolve(root));
      const candidate = path.resolve(base, rel);
      if (!within(base, candidate)) continue;

      const real = fs.realpathSync(candidate);
      if (!within(base, real)) continue;
      if (fs.statSync(real).isFile()) return real;
    } catch {
      // Missing root, missing file or broken link — just try the next root.
      continue;
    }
  }
  return null;
}

/**
 * share-badge.png is the wordmark pre-composed on a white panel, sized snugly so
 * it reads as a deliberate label over any photo. logo.png is the plain mark and
 * carries its own white square, which stamps an obvious box onto the image — so
 * it is only a fallback. The source copy is a last resort for dev; it is not
 * shipped to a deployed server.
 */
function resolveLogoPath(): string | null {
  const built =
    resolvePublicAsset("share-badge.png") ?? resolvePublicAsset("logo.png");
  if (built) return built;
  const source = path.join(process.cwd(), "client", "src", "assets", "logo.png");
  return fs.existsSync(source) ? source : null;
}

// Social media optimal dimensions
const SOCIAL_MEDIA_WIDTH = 1200;
const SOCIAL_MEDIA_HEIGHT = 630;

const LOGO_SIZE = 240;
const LOGO_PADDING = 24;

let logoBuffer: Buffer | null = null;
let fallbackImageBuffer: Buffer | null = null;

async function getLogoBuffer(): Promise<Buffer | null> {
  if (logoBuffer) return logoBuffer;
  const logoPath = resolveLogoPath();
  if (!logoPath) return null;
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
  const logoPath = resolveLogoPath();
  const base = await sharp({
    create: {
      width: SOCIAL_MEDIA_WIDTH,
      height: SOCIAL_MEDIA_HEIGHT,
      channels: 3,
      background: { r: 239, g: 42, b: 134 }, // #EF2A86
    },
  }).png().toBuffer();

  if (logoPath) {
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

  // local /blog-images/ file — lives in the client build once deployed
  if (imageUrl.startsWith("/blog-images/")) {
    const filePath = resolvePublicAsset(imageUrl);
    if (filePath) return fs.readFileSync(filePath);
    console.warn(`[BlogImage] ${imageUrl} not found in the client build`);
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
