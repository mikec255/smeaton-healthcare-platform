import express from "express";
import sharp from "sharp";

// Social media optimal dimensions
const SOCIAL_MEDIA_WIDTH = 1200;
const SOCIAL_MEDIA_HEIGHT = 630;

// Endpoint to serve base64 images as proper image URLs for social media
export function registerBlogImageRoutes(app: express.Application) {
  // Serve blog post featured image by post ID
  app.get("/api/blog-images/:postId/featured", async (req, res) => {
    try {
      const { storage } = await import("./storage");
      const post = await storage.getBlogPost(req.params.postId);
      
      if (!post) {
        return res.status(404).send("Post not found");
      }
      
      // Find featured image from multiple sources
      let imageUrl: string | null = null;
      
      // 1. First, check for explicitly marked featured image in images array
      const featuredImage = post.images?.find(img => img.isFeatured);
      if (featuredImage?.url) {
        imageUrl = featuredImage.url;
      }
      
      // 2. Fallback: Use first image from images array
      if (!imageUrl && post.images && post.images.length > 0) {
        imageUrl = post.images[0].url;
      }
      
      // 3. Fallback: Extract first image from visual editor blocks
      if (!imageUrl && post.blocks && Array.isArray(post.blocks)) {
        const imageBlock = post.blocks.find((block: any) => 
          block.type === 'image' && block.content?.url
        );
        if (imageBlock) {
          imageUrl = (imageBlock as any).content.url;
        }
      }
      
      // 4. Fallback: Extract first image from HTML content (TipTap editor)
      if (!imageUrl && post.content && typeof post.content === 'string') {
        const imgMatch = post.content.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1];
        }
      }
      
      if (!imageUrl) {
        return res.status(404).send("No featured image found");
      }
      
      // Extract base64 data
      const base64Match = imageUrl.match(/^data:image\/(png|jpg|jpeg|gif|webp);base64,(.+)$/);
      
      if (!base64Match) {
        return res.status(400).send("Invalid image format");
      }
      
      const imageData = base64Match[2];
      
      // Convert base64 to buffer
      const originalBuffer = Buffer.from(imageData, 'base64');
      
      // Get original image metadata
      const metadata = await sharp(originalBuffer).metadata();
      const originalWidth = metadata.width || 1200;
      const originalHeight = metadata.height || 630;
      
      // Calculate the aspect ratio
      const originalAspectRatio = originalWidth / originalHeight;
      const targetAspectRatio = SOCIAL_MEDIA_WIDTH / SOCIAL_MEDIA_HEIGHT; // 1.9:1
      
      let resizedBuffer: Buffer;
      
      // If original is wider than target, add padding top/bottom
      // If original is taller than target, add padding left/right
      // This ensures the FULL image is always visible without any cropping
      if (Math.abs(originalAspectRatio - targetAspectRatio) < 0.1) {
        // Aspect ratio is close enough, just resize directly
        resizedBuffer = await sharp(originalBuffer)
          .resize(SOCIAL_MEDIA_WIDTH, SOCIAL_MEDIA_HEIGHT, {
            fit: 'fill'
          })
          .jpeg({ quality: 90 })
          .toBuffer();
      } else {
        // Create a canvas at the target size with brand background
        // Then composite the original image centered on it
        resizedBuffer = await sharp({
          create: {
            width: SOCIAL_MEDIA_WIDTH,
            height: SOCIAL_MEDIA_HEIGHT,
            channels: 3,
            background: { r: 236, g: 72, b: 153 } // Brand pink
          }
        })
        .composite([{
          input: await sharp(originalBuffer)
            .resize(SOCIAL_MEDIA_WIDTH, SOCIAL_MEDIA_HEIGHT, {
              fit: 'inside', // Scale to fit inside, maintaining aspect ratio
              withoutEnlargement: false
            })
            .toBuffer(),
          gravity: 'centre'
        }])
        .jpeg({ quality: 90 })
        .toBuffer();
      }
      
      // Set proper content type and cache headers
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.send(resizedBuffer);
    } catch (error) {
      console.error("Error serving blog image:", error);
      res.status(500).send("Error serving image");
    }
  });
}
