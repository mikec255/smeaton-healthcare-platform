import express from "express";
import type { BlogPost } from "@shared/schema";

// Server-side rendered page for blog posts (for Facebook/social media scraping)
export function registerBlogSharingRoutes(app: express.Application) {
  app.get("/blog/:postId", async (req, res) => {
    try {
      const { storage } = await import("./storage");
      const post = await storage.getBlogPost(req.params.postId);
      
      if (!post || !post.isPublished) {
        return res.redirect("/resources/blog");
      }
      
      // Find featured image from multiple sources
      let hasImage = false;
      
      // 1. Check for explicitly marked featured image in images array
      const featuredImage = post.images?.find(img => img.isFeatured);
      if (featuredImage?.url) {
        hasImage = true;
      }
      
      // 2. Fallback: Check if there are any images in images array
      if (!hasImage && post.images && post.images.length > 0) {
        hasImage = true;
      }
      
      // 3. Fallback: Check for images in visual editor blocks
      if (!hasImage && post.blocks && Array.isArray(post.blocks)) {
        const imageBlock = post.blocks.find((block: any) => 
          block.type === 'image' && block.content?.url
        );
        if (imageBlock) {
          hasImage = true;
        }
      }
      
      const imageUrl = hasImage
        ? `${req.protocol}://${req.get('host')}/api/blog-images/${post.id}/featured`
        : `${req.protocol}://${req.get('host')}/og-default.jpg`;
      
      const pageUrl = `${req.protocol}://${req.get('host')}/blog/${post.id}`;
      
      // Escape HTML to prevent meta tag injection
      const escapeHtml = (text: string) => text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      
      const safeTitle = escapeHtml(post.title);
      const safeExcerpt = escapeHtml(post.excerpt || post.title);
      
      // Return HTML with meta tags for social media
      res.send(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle} | Smeaton Healthcare Blog</title>
    <meta name="description" content="${safeExcerpt}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeExcerpt}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${pageUrl}" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeExcerpt}" />
    <meta name="twitter:image" content="${imageUrl}" />
    
    <!-- Redirect to the React app after meta tags are loaded -->
    <meta http-equiv="refresh" content="0;url=/resources/blog#${post.id}" />
  </head>
  <body>
    <p>Loading blog post...</p>
    <script>
      // Immediate redirect for users (meta tags already loaded for social crawlers)
      window.location.href = '/resources/blog#${post.id}';
    </script>
  </body>
</html>
      `);
    } catch (error) {
      console.error("Error generating blog share page:", error);
      res.redirect("/resources/blog");
    }
  });
}
