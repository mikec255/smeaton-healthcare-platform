import express from "express";

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
      
      // Find featured image
      const featuredImage = post.images?.find(img => img.isFeatured);
      
      if (!featuredImage || !featuredImage.url) {
        return res.status(404).send("No featured image found");
      }
      
      // Extract base64 data
      const base64Match = featuredImage.url.match(/^data:image\/(png|jpg|jpeg|gif|webp);base64,(.+)$/);
      
      if (!base64Match) {
        return res.status(400).send("Invalid image format");
      }
      
      const imageType = base64Match[1];
      const imageData = base64Match[2];
      
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(imageData, 'base64');
      
      // Set proper content type and cache headers
      res.setHeader('Content-Type', `image/${imageType}`);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.send(imageBuffer);
    } catch (error) {
      console.error("Error serving blog image:", error);
      res.status(500).send("Error serving image");
    }
  });
}
