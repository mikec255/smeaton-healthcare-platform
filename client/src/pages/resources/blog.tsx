import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Clock, ArrowRight, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { type BlogPost, type BlogCategory } from "@shared/schema";
import DOMPurify from "dompurify";
import SocialShareBar from "@/components/shared/SocialShareBar";
import teamMeetingImg from "@assets/generated_images/Healthcare_team_meeting_photo_21dc58ac.png";
import homeCareImg from "@assets/generated_images/Home_care_support_photo_f0866fa2.png";
import trainingImg from "@assets/generated_images/Healthcare_training_session_photo_91ddee63.png";
import careMomentsImg from "@assets/generated_images/Care_moments_connection_photo_e9d18840.png";
import wellnessImg from "@assets/generated_images/Healthcare_wellness_photo_f702b02c.png";
import fundingImg from "@assets/generated_images/Healthcare_funding_guidance_photo_035ba46c.png";
import teamPhotoImg from "@assets/generated_images/Smeaton_Healthcare_team_photo_b7ccf951.png";

// Transform API BlogPost to component-expected format
interface TransformedBlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  date: string;
  readTime: string | null;
  author: string;
  category: string;
  image: string;
  fullContent: string;
}

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Fetch blog posts (only published ones for public view)
  const { data: blogPosts = [], isLoading: postsLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts?isPublished=true"],
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog-categories"],
  });

  // Helper function to get category name from ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "Uncategorized";
  };

  // Helper function to format date
  const formatDate = (dateString: Date | null): string => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Helper function to convert Google Cloud Storage URL to proxy URL
  const convertToProxyUrl = (url: string): string => {
    // If it's already a proxy URL or regular URL, return as is
    if (!url.includes('storage.googleapis.com')) {
      return url;
    }
    
    // Extract the object path from Google Cloud Storage URL
    // URL format: https://storage.googleapis.com/bucket-name/.private/uploads/filename
    const match = url.match(/\.private\/uploads\/(.+)/);
    if (match) {
      return `/objects/uploads/${match[1]}`;
    }
    
    // Fallback: return original URL
    return url;
  };

  // Helper function to extract first image from visual editor blocks
  const extractImageFromBlocks = (blocks: any[]): string | null => {
    if (!blocks || !Array.isArray(blocks)) return null;
    
    for (const block of blocks) {
      if (block.type === 'image' && (block.content?.url || block.content?.src)) {
        const imageUrl = block.content.url || block.content.src;
        return convertToProxyUrl(imageUrl);
      }
    }
    return null;
  };

  // Helper function to convert block style object to CSS string
  const blockStyleToCss = (style: any): string => {
    if (!style || typeof style !== 'object') return '';
    
    const cssProps: string[] = [];
    
    if (style.color) cssProps.push(`color: ${style.color}`);
    if (style.backgroundColor) cssProps.push(`background-color: ${style.backgroundColor}`);
    if (style.fontSize) cssProps.push(`font-size: ${style.fontSize}`);
    if (style.fontWeight) cssProps.push(`font-weight: ${style.fontWeight}`);
    if (style.textAlign) cssProps.push(`text-align: ${style.textAlign}`);
    if (style.margin) cssProps.push(`margin: ${style.margin}`);
    if (style.padding) cssProps.push(`padding: ${style.padding}`);
    if (style.borderRadius) cssProps.push(`border-radius: ${style.borderRadius}`);
    if (style.border) cssProps.push(`border: ${style.border}`);
    
    return cssProps.length > 0 ? ` style="${cssProps.join('; ')}"` : '';
  };

  // Helper function to get image width class
  const getImageWidthClass = (imageWidth?: string) => {
    switch (imageWidth) {
      case 'small': return 'w-1/4';
      case 'medium': return 'w-1/2';
      case 'large': return 'w-3/4';
      default: return 'w-full';
    }
  };

  // Helper function to render visual editor blocks as HTML
  const renderBlocksAsHTML = (blocks: any[]): string => {
    if (!blocks || !Array.isArray(blocks)) return '';
    
    const rows: string[] = [];
    let currentRow: string[] = [];
    
    blocks.forEach(block => {
      const styleAttr = blockStyleToCss(block.style);
      const width = block.width || '100%';
      const isInline = block.layout === 'inline';
      
      let html = '';
      
      switch (block.type) {
        case 'header':
          const level = block.content?.level || 'h2';
          html = `<${level}${styleAttr}>${block.content?.text || ''}</${level}>`;
          break;
        
        case 'text':
          const textContent = block.content?.text || '';
          // Preserve line breaks by splitting on newlines and creating separate paragraphs
          const textParagraphs = textContent.split('\n').filter((p: string) => p.trim());
          if (textParagraphs.length === 0) break;
          const containerStyle = isInline ? ` style="width: ${width}"` : '';
          if (textParagraphs.length === 1) {
            html = `<div${containerStyle}><p${styleAttr}>${textContent}</p></div>`;
          } else {
            html = `<div${containerStyle}>${textParagraphs.map((para: string) => `<p${styleAttr} style="margin-bottom: 1em">${para}</p>`).join('')}</div>`;
          }
          break;
        
        case 'image':
          const imageSrc = block.content?.url || block.content?.src;
          if (imageSrc) {
            const alt = block.content?.alt || '';
            const caption = block.content?.caption || '';
            const proxyUrl = convertToProxyUrl(imageSrc);
            const imgWidthClass = getImageWidthClass(block.imageWidth);
            const imgContainerStyle = isInline ? ` style="width: ${width}"` : '';
            html = `
              <div class="image-block${isInline ? ' inline-block' : ''}"${styleAttr}${imgContainerStyle}>
                <img src="${proxyUrl}" alt="${alt}" class="${imgWidthClass} h-auto rounded-lg" style="object-fit: contain; max-height: 100%;" />
                ${caption ? `<p class="text-sm text-gray-600 mt-2 italic text-center">${caption}</p>` : ''}
              </div>
            `;
          }
          break;
        
        case 'quote':
          html = `<blockquote class="border-l-4 border-primary pl-4 italic"${styleAttr}>${block.content?.text || ''}</blockquote>`;
          break;
        
        case 'list':
          const items = block.content?.items || [];
          const isNumbered = block.content?.listType === 'numbered' || block.content?.ordered;
          const listType = isNumbered ? 'ol' : 'ul';
          html = `<${listType} class="${isNumbered ? 'list-decimal' : 'list-disc'} ml-6 space-y-1"${styleAttr}>${items.map((item: string) => `<li>${item}</li>`).join('')}</${listType}>`;
          break;
        
        case 'divider':
          html = `<hr class="my-4"${styleAttr} />`;
          break;
        
        case 'spacer':
          const height = block.content?.height || '20px';
          const spacerStyle = blockStyleToCss(block.style);
          const combinedStyle = spacerStyle ? ` style="height: ${height}; ${spacerStyle.replace('style="', '').replace('"', '')}"` : ` style="height: ${height}"`;
          html = `<div${combinedStyle}></div>`;
          break;
        
        case 'button':
          const text = block.content?.text || 'Button';
          const url = block.content?.url || '#';
          const buttonClasses = "inline-block bg-primary text-white px-4 py-2 rounded hover:bg-primary/90";
          html = `<a href="${url}" class="${buttonClasses}"${styleAttr}>${text}</a>`;
          break;
        
        default:
          break;
      }
      
      // Group inline blocks together
      if (!html) return;
      
      if (isInline) {
        currentRow.push(html);
      } else {
        // If we have accumulated inline blocks, render them first
        if (currentRow.length > 0) {
          rows.push(`<div class="flex gap-4 mb-4 flex-wrap">${currentRow.join('')}</div>`);
          currentRow = [];
        }
        // Add the full-width block
        rows.push(`<div class="mb-4">${html}</div>`);
      }
    });
    
    // Don't forget remaining inline blocks
    if (currentRow.length > 0) {
      rows.push(`<div class="flex gap-4 mb-4 flex-wrap">${currentRow.join('')}</div>`);
    }
    
    return rows.join('\n');
  };

  // Transform API data to component format
  const transformedBlogPosts: TransformedBlogPost[] = useMemo(() => {
    if (!blogPosts.length || !categories.length) return [];
    
    return blogPosts.map(post => {
      // Extract image from visual editor blocks or use imagePath
      const blockImage = extractImageFromBlocks(post.blocks || []);
      const displayImage = blockImage || post.imagePath || '';
      
      // Render content from visual editor blocks or use regular content
      const hasBlocks = post.blocks && Array.isArray(post.blocks) && post.blocks.length > 0;
      const displayContent = hasBlocks ? renderBlocksAsHTML(post.blocks || []) : (post.content || '');
      
      return {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        date: formatDate(post.createdAt),
        readTime: post.readTime || "5 min read",
        author: post.author,
        category: getCategoryName(post.categoryId),
        image: displayImage,
        fullContent: displayContent
      };
    });
  }, [blogPosts, categories]);

  // Create category options with "All" option
  const categoryOptions = ["All", ...categories.map(cat => cat.name)];
  
  // Show loading state
  const isLoading = postsLoading || categoriesLoading;
  
  // Use transformed data if available, otherwise show empty state
  const displayPosts = transformedBlogPosts.length > 0 ? transformedBlogPosts : [];
  
  // Create a loading skeleton component
  const BlogPostSkeleton = () => (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="p-8">
        <div className="flex gap-6 flex-col sm:flex-row">
          <div className="flex-shrink-0">
            <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
  

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-primary/20 via-white to-secondary/15 py-12 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-[1px]" style={{
            background: 'linear-gradient(90deg, #EF2587, #275799, #EF2587)'
          }}>
            <div className="rounded-3xl bg-white/90 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/resources">
              <Button variant="ghost" size="sm" className="hover:bg-white/80 backdrop-blur-sm" data-testid="back-to-resources">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Resources
              </Button>
            </Link>
          </div>
          
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="inline-block">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4 mx-auto shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L3.09 8.26L12 14L20.91 8.26L12 2ZM21 16V10.81C21.38 10.93 21.75 11.1 22.1 11.32L21 12V16C21 16.5304 20.7893 17.0391 20.4142 17.4142C20.0391 17.7893 19.5304 18 19 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V12L1.9 11.32C2.25 11.1 2.62 10.93 3 10.81V16C3 17.0609 3.42143 18.0783 4.17157 18.8284C4.92172 19.5786 5.93913 20 7 20H17C18.0609 20 19.0783 19.5786 19.8284 18.8284C20.5786 18.0783 21 17.0609 21 16ZM12 20C12.5304 20 13.0391 19.7893 13.4142 19.4142C13.7893 19.0391 14 18.5304 14 18V16C14 15.4696 13.7893 14.9609 13.4142 14.5858C13.0391 14.2107 12.5304 14 12 14C11.4696 14 10.9609 14.2107 10.5858 14.5858C10.2107 14.9609 10 15.4696 10 16V18C10 18.5304 10.2107 19.0391 10.5858 19.4142C10.9609 19.7893 11.4696 20 12 20Z"/>
                  </svg>
                </div>
              </div>
              <div className="py-4">
                <h1 className="text-4xl lg:text-5xl font-bold overflow-visible" data-testid="blog-title">
                  <span className="inline-block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent [-webkit-text-fill-color:transparent] leading-[1.1] pb-[0.15em]">
                    Our Blog
                  </span>
                </h1>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto"></div>
            </div>
            <p className="text-lg lg:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium" data-testid="blog-description">
              Discover insights, stories, and expertise from the heart of healthcare at Smeaton Healthcare
            </p>
            
            {/* Hero Icons & Stats */}
            <div className="flex flex-wrap justify-center items-center gap-8 mt-8 text-slate-600">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Regular Content</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Filter className="h-5 w-5 text-secondary" />
                </div>
                <span className="text-sm font-medium">7 Categories</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Quick Reads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <svg className="h-5 w-5 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">Expert Insights</span>
              </div>
          </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Filter Dropdown */}
          <div className="mb-6 lg:hidden">
            <label className="block text-sm font-medium text-foreground mb-2">Filter by Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="mobile-category-filter"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-8">
            {/* Desktop Sidebar Filter */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Filter by Category</h3>
                </div>
                <div className="space-y-2">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full rounded-lg" />
                    ))
                  ) : (
                    categoryOptions.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          selectedCategory === category
                            ? 'bg-primary text-white'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                        data-testid={`filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {category}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 min-w-0">
          <div className="space-y-8">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <BlogPostSkeleton key={i} />
              ))
            ) : displayPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No blog posts available yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Check back soon for new content!</p>
              </div>
            ) : (
              displayPosts
                .filter(post => selectedCategory === "All" || post.category === selectedCategory)
                .map((post, index) => (
              <article 
                key={post.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-slate-200"
                data-testid={`blog-post-${index}`}
              >
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="flex gap-4 sm:gap-6 flex-col sm:flex-row">
                    {/* Small Thumbnail Image - only show if image exists */}
                    {post.image && (
                      <div className="flex-shrink-0">
                        <div className="w-full sm:w-32 h-48 sm:h-24 md:w-40 md:h-28 overflow-hidden rounded-lg">
                          <img 
                            src={post.image} 
                            alt={post.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            data-testid={`blog-image-${index}`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 space-y-3 sm:space-y-4">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                          {post.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {post.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.readTime}
                        </div>
                      </div>
                      
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="hover:bg-primary hover:text-primary-foreground group"
                            data-testid={`read-article-${index}`}
                          >
                            Read Full Article
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-left pr-8">
                              {post.title}
                            </DialogTitle>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
                              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                                {post.category}
                              </span>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {post.date}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {post.readTime}
                              </div>
                            </div>
                          </DialogHeader>
                          
                          {/* Article Image in Modal - only show if image exists */}
                          {post.image && (
                            <div className="aspect-video w-full overflow-hidden rounded-lg mb-6">
                              <img 
                                src={post.image} 
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Social Share Bar */}
                          <SocialShareBar 
                            url={`${window.location.origin}/resources/blog#${post.id}`}
                            title={post.title}
                          />
                          
                          {/* Full Article Content */}
                          <div 
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.fullContent) }}
                            data-testid={`full-article-${index}`}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </article>
                ))
            )}
          </div>
          
          {/* Coming Soon */}
          <div className="text-center mt-16 p-8">
            <p className="text-lg text-muted-foreground mb-4">More articles coming soon!</p>
            <p className="text-muted-foreground">
              Subscribe to our newsletter to be the first to know when we publish new content.
            </p>
            <Link href="/resources/newsletter" className="mt-4 inline-block">
              <Button className="bg-primary text-primary-foreground" data-testid="subscribe-newsletter-button">
                Subscribe to Newsletter
              </Button>
            </Link>
          </div>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}