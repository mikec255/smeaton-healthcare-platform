import express from "express";
import type { Job, BlogPost } from "@shared/schema";

export function registerSeoRoutes(app: express.Application) {
  
  // Dynamic sitemap.xml
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const { storage } = await import("./storage");
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // Get all published jobs and blog posts
      const [jobs, blogPosts] = await Promise.all([
        storage.getAllJobs(),
        storage.getAllBlogPosts({ isPublished: true })
      ]);
      
      const publishedPosts = blogPosts;
      
      // Static pages with their priorities and change frequencies
      const staticPages = [
        { url: '/', priority: '1.0', changefreq: 'weekly' },
        { url: '/services', priority: '0.9', changefreq: 'monthly' },
        { url: '/services/live-in-care', priority: '0.8', changefreq: 'monthly' },
        { url: '/services/short-visits', priority: '0.8', changefreq: 'monthly' },
        { url: '/services/respite', priority: '0.8', changefreq: 'monthly' },
        { url: '/services/condition-led-care', priority: '0.8', changefreq: 'monthly' },
        { url: '/services/enablements', priority: '0.8', changefreq: 'monthly' },
        { url: '/services/supported-living', priority: '0.8', changefreq: 'monthly' },
        { url: '/services/care-24-7', priority: '0.8', changefreq: 'monthly' },
        { url: '/jobs', priority: '0.9', changefreq: 'daily' },
        { url: '/contact', priority: '0.7', changefreq: 'monthly' },
        { url: '/resources', priority: '0.7', changefreq: 'weekly' },
        { url: '/resources/blog', priority: '0.8', changefreq: 'daily' },
        { url: '/resources/working-at-smeaton', priority: '0.7', changefreq: 'monthly' },
        { url: '/resources/sponsorship', priority: '0.7', changefreq: 'monthly' },
        { url: '/apply', priority: '0.8', changefreq: 'monthly' },
        { url: '/referral', priority: '0.6', changefreq: 'monthly' },
        // Location pages (local SEO)
        { url: '/locations/plymouth', priority: '0.9', changefreq: 'monthly' },
        { url: '/locations/truro', priority: '0.9', changefreq: 'monthly' },
        { url: '/locations/exeter', priority: '0.9', changefreq: 'monthly' },
        { url: '/locations/cornwall', priority: '0.9', changefreq: 'monthly' },
        { url: '/locations/devon', priority: '0.9', changefreq: 'monthly' },
        { url: '/privacy', priority: '0.4', changefreq: 'yearly' },
      ];
      
      const today = new Date().toISOString().split('T')[0];
      
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;
      
      // Add static pages
      for (const page of staticPages) {
        sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
      }
      
      // Add individual job pages
      for (const job of jobs) {
        const jobDate = job.updatedAt
          ? new Date(job.updatedAt).toISOString().split('T')[0]
          : today;
        sitemap += `  <url>
    <loc>${baseUrl}/jobs/${job.id}</loc>
    <lastmod>${jobDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
      
      // Add blog posts with images (using the server-side sharing URL for SEO)
      for (const post of publishedPosts) {
        const postDate = post.publishedAt 
          ? new Date(post.publishedAt).toISOString().split('T')[0]
          : today;
        
        sitemap += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${postDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>`;
        
        // Add featured image if available
        const hasImage = post.images?.length || 
          (post.blocks && Array.isArray(post.blocks) && 
           post.blocks.some((b: any) => b.type === 'image'));
        
        if (hasImage) {
          sitemap += `
    <image:image>
      <image:loc>${baseUrl}/api/blog-images/${post.id}/featured</image:loc>
      <image:title>${escapeXml(post.title)}</image:title>
    </image:image>`;
        }
        
        sitemap += `
  </url>
`;
      }
      
      sitemap += `</urlset>`;
      
      res.set('Content-Type', 'application/xml');
      res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.send(sitemap);
      
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send('Error generating sitemap');
    }
  });
  
  // robots.txt
  app.get("/robots.txt", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const robotsTxt = `# Smeaton Healthcare - robots.txt
User-agent: *
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin and private areas
Disallow: /admin
Disallow: /admin/*
Disallow: /api/
Disallow: /login
Disallow: /create-password

# Allow specific API endpoints for SEO
Allow: /api/blog-images/*/featured
Allow: /blog/*

# Crawl-delay for respectful crawling
Crawl-delay: 1
`;
    
    res.set('Content-Type', 'text/plain');
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(robotsTxt);
  });
}

// Helper to escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
