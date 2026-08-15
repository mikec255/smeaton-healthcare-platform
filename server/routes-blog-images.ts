import express from "express";
import sharp from "sharp";
import path from "path";
import fs from "fs";

// Social media optimal dimensions
const SOCIAL_MEDIA_WIDTH = 1200;
const SOCIAL_MEDIA_HEIGHT = 630;

// Logo watermark — resize once at startup and cache the buffer
const LOGO_SIZE = 240; // px wide (square logo, so height = same)
const LOGO_PADDING = 24; // px from edges
let logoBuffer: Buffer | null = null;

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

// Endpoint to serve blog post featured image by post ID
export function registerBlogImageRoutes(app: express.Application) {
  app.get("/api/blog-images/:postId/featured", async (req, res) => {
    try {
      const { storage } = await import("./storage");
      const post = await storage.getBlogPost(req.params.postId);

      if (!post) {
        return res.status(404).send("Post not found");
      }

      // Find featured image from multiple sources
      let imageUrl: string | null = null;

      // 1. Explicitly marked featured image
      const featuredImage = post.images?.find(img => img.isFeatured);
      if (featuredImage?.url) imageUrl = featuredImage.url;

      // 2. First image in images array
      if (!imageUrl && post.images && post.images.length > 0) {
        imageUrl = post.images[0].url;
      }

      // 3. First image block in visual editor
      if (!imageUrl && post.blocks && Array.isArray(post.blocks)) {
        const imageBlock = post.blocks.find((block: any) =>
          block.type === "image" && block.content?.url
        );
        if (imageBlock) imageUrl = (imageBlock as any).content.url;
      }

      // 4. First <img> in HTML content
      if (!imageUrl && post.content && typeof post.content === "string") {
        const imgMatch = post.content.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch?.[1]) imageUrl = imgMatch[1];
      }

      if (!imageUrl) return res.status(404).send("No featured image found");

      // Resolve image to a Buffer — supports base64 data URLs and /blog-images/* file paths
      let originalBuffer: Buffer;

      const base64Match = imageUrl.match(/^data:image\/(png|jpg|jpeg|gif|webp);base64,(.+)$/);
      if (base64Match) {
        originalBuffer = Buffer.from(base64Match[2], "base64");
      } else if (imageUrl.startsWith("/blog-images/")) {
        const filePath = path.join(process.cwd(), "client/public", imageUrl);
        if (!fs.existsSync(filePath)) return res.status(404).send("Image file not found");
        originalBuffer = fs.readFileSync(filePath);
      } else {
        return res.status(400).send("Unsupported image format");
      }

      // Determine dimensions
      const metadata = await sharp(originalBuffer).metadata();
      const originalWidth = metadata.width || 1200;
      const originalHeight = metadata.height || 630;
      const originalAspectRatio = originalWidth / originalHeight;
      const targetAspectRatio = SOCIAL_MEDIA_WIDTH / SOCIAL_MEDIA_HEIGHT;

      // Resize / letterbox to 1200×630
      let resizedBuffer: Buffer;
      if (Math.abs(originalAspectRatio - targetAspectRatio) < 0.1) {
        resizedBuffer = await sharp(originalBuffer)
          .resize(SOCIAL_MEDIA_WIDTH, SOCIAL_MEDIA_HEIGHT, { fit: "fill" })
          .jpeg({ quality: 90 })
          .toBuffer();
      } else {
        resizedBuffer = await sharp({
          create: {
            width: SOCIAL_MEDIA_WIDTH,
            height: SOCIAL_MEDIA_HEIGHT,
            channels: 3,
            background: { r: 236, g: 72, b: 153 }, // Brand pink letterbox
          },
        })
          .composite([{
            input: await sharp(originalBuffer)
              .resize(SOCIAL_MEDIA_WIDTH, SOCIAL_MEDIA_HEIGHT, {
                fit: "inside",
                withoutEnlargement: false,
              })
              .toBuffer(),
            gravity: "centre",
          }])
          .jpeg({ quality: 90 })
          .toBuffer();
      }

      // Composite Smeaton logo — bottom-right corner
      const logo = await getLogoBuffer();
      let finalBuffer = resizedBuffer;
      if (logo) {
        finalBuffer = await sharp(resizedBuffer)
          .composite([{
            input: logo,
            left: SOCIAL_MEDIA_WIDTH - LOGO_SIZE - LOGO_PADDING,
            top: SOCIAL_MEDIA_HEIGHT - LOGO_SIZE - LOGO_PADDING,
          }])
          .jpeg({ quality: 90 })
          .toBuffer();
      }

      // Cache for 24 hours so Facebook/LinkedIn CDNs can serve the image
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(finalBuffer);
    } catch (error) {
      console.error("Error serving blog image:", error);
      res.status(500).send("Error serving image");
    }
  });
}
