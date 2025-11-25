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
      
      // Resize image to optimal social media dimensions (1200x630)
      // Uses smart cropping to focus on the center/important parts
      const resizedBuffer = await sharp(originalBuffer)
        .resize(SOCIAL_MEDIA_WIDTH, SOCIAL_MEDIA_HEIGHT, {
          fit: 'cover',
          position: 'centre'
        })
        .jpeg({ quality: 85 }) // Convert to JPEG for best compatibility
        .toBuffer();
      
      // Set proper content type and cache headers
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.send(resizedBuffer);
    } catch (error) {
      console.error("Error serving blog image:", error);
      res.status(500).send("Error serving image");
    }
  });
}
