import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type BlogPost, type BlogCategory } from "@shared/schema";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from "dompurify";
import SocialShareBar from "@/components/shared/SocialShareBar";
import { useEffect } from "react";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ['/api/blog-posts/slug', slug],
    enabled: !!slug,
  });

  const { data: categories = [] } = useQuery<BlogCategory[]>({
    queryKey: ['/api/blog-categories'],
  });

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "Uncategorised";
  };

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Smeaton Healthcare Blog`;
    }
    return () => {
      document.title = "Smeaton Healthcare";
    };
  }, [post]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-6 w-64 mb-8" />
        <Skeleton className="h-64 w-full mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
        <p className="text-muted-foreground mb-6">
          Sorry, we couldn't find the blog post you're looking for.
        </p>
        <Link href="/resources/blog">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getFeaturedImage = (): string | null => {
    const featuredImage = post.images?.find(img => img.isFeatured);
    if (featuredImage?.url) return featuredImage.url;
    
    if (post.images && post.images.length > 0) {
      return post.images[0].url;
    }
    
    if (post.blocks && Array.isArray(post.blocks)) {
      const imageBlock = post.blocks.find((block: any) => 
        block.type === 'image' && block.content?.url
      );
      if (imageBlock) {
        return (imageBlock as any).content.url;
      }
    }
    
    return null;
  };

  const getContent = (): string => {
    if (post.blocks && Array.isArray(post.blocks) && post.blocks.length > 0) {
      return post.blocks
        .map((block: any) => {
          if (block.type === 'text' && block.content) {
            return block.content;
          }
          if (block.type === 'image' && block.content?.url) {
            // Skip if this image is already shown as the featured image above
            if (block.content.url === featuredImage) return '';
            const caption = block.content.caption ? `<figcaption class="text-center text-sm text-muted-foreground mt-2">${block.content.caption}</figcaption>` : '';
            return `<figure class="my-6"><img src="${block.content.url}" alt="${block.content.alt || ''}" class="w-full rounded-lg" />${caption}</figure>`;
          }
          return '';
        })
        .join('');
    }
    return post.content || '';
  };

  const featuredImage = getFeaturedImage();
  const content = getContent();
  const shareUrl = `${window.location.origin}/blog/${post.slug}`;

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/resources/blog">
        <Button variant="ghost" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
      </Link>

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {post.categoryId && (
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {getCategoryName(post.categoryId)}
            </span>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {formatDate(post.publishedAt || post.createdAt)}
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="blog-post-title">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg text-muted-foreground">
            {post.excerpt}
          </p>
        )}
      </header>

      {featuredImage && (
        <div className="mb-8">
          <img
            src={featuredImage}
            alt={post.title}
            className="w-full h-auto rounded-lg shadow-md"
            data-testid="blog-post-featured-image"
          />
        </div>
      )}

      <div className="mb-8">
        <SocialShareBar url={shareUrl} title={post.title} />
      </div>

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
        data-testid="blog-post-content"
      />

      <div className="mt-12 pt-8 border-t">
        <SocialShareBar url={shareUrl} title={post.title} />
      </div>

      <div className="mt-8">
        <Link href="/resources/blog">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>
      </div>
    </article>
  );
}
