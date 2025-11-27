import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Newsletter, type NewsletterBlock } from "@shared/schema";
import { ArrowLeft, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from "dompurify";
import SocialShareBar from "@/components/shared/SocialShareBar";
import { useEffect } from "react";

export default function NewsletterPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: newsletter, isLoading, error } = useQuery<Newsletter>({
    queryKey: ['/api/newsletters/slug', slug],
    enabled: !!slug,
  });

  const { data: blocks = [] } = useQuery<NewsletterBlock[]>({
    queryKey: ['/api/newsletters', newsletter?.id, 'blocks'],
    enabled: !!newsletter?.id,
  });

  useEffect(() => {
    if (newsletter) {
      document.title = `${newsletter.title} | Smeaton Healthcare Newsletter`;
    }
    return () => {
      document.title = "Smeaton Healthcare";
    };
  }, [newsletter]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-6 w-64 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !newsletter) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Newsletter Not Found</h1>
        <p className="text-muted-foreground mb-6">
          Sorry, we couldn't find the newsletter you're looking for.
        </p>
        <Link href="/resources/newsletter">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Newsletters
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

  const renderBlock = (block: NewsletterBlock) => {
    const content = block.content as Record<string, any>;
    
    switch (block.type) {
      case 'heading':
        const HeadingTag = (content?.level || 'h2') as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag 
            key={block.id} 
            className="font-bold mb-4"
            style={{ 
              textAlign: content?.align || 'left',
              color: content?.color || 'inherit'
            }}
          >
            {content?.text || ''}
          </HeadingTag>
        );
      
      case 'text':
        return (
          <div 
            key={block.id}
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(content?.text || content?.html || '') 
            }}
          />
        );
      
      case 'image':
        if (!content?.url && !content?.src) return null;
        return (
          <figure key={block.id} className="my-6">
            <img
              src={content?.url || content?.src}
              alt={content?.alt || ''}
              className="w-full rounded-lg"
            />
            {content?.caption && (
              <figcaption className="text-center text-sm text-muted-foreground mt-2">
                {content.caption}
              </figcaption>
            )}
          </figure>
        );
      
      case 'button':
        return (
          <div key={block.id} className="my-6" style={{ textAlign: content?.align || 'center' }}>
            <a
              href={content?.url || '#'}
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              style={{ backgroundColor: content?.backgroundColor || undefined }}
            >
              {content?.text || 'Click Here'}
            </a>
          </div>
        );
      
      case 'divider':
        return <hr key={block.id} className="my-8 border-t border-gray-200" />;
      
      case 'spacer':
        return <div key={block.id} style={{ height: content?.height || '24px' }} />;
      
      case 'html':
        return (
          <div
            key={block.id}
            className="my-4"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(content?.html || '') 
            }}
          />
        );
      
      default:
        return null;
    }
  };

  const shareUrl = `${window.location.origin}/newsletter/${newsletter.slug}`;

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/resources/newsletter">
        <Button variant="ghost" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Newsletters
        </Button>
      </Link>

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Mail className="h-3 w-3" />
            Newsletter
          </span>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {formatDate(newsletter.createdAt)}
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="newsletter-post-title">
          {newsletter.title}
        </h1>

        {newsletter.preheader && (
          <p className="text-lg text-muted-foreground">
            {newsletter.preheader}
          </p>
        )}
      </header>

      <div className="mb-8">
        <SocialShareBar url={shareUrl} title={newsletter.title} />
      </div>

      <div className="newsletter-content" data-testid="newsletter-post-content">
        {blocks.length > 0 ? (
          blocks
            .sort((a, b) => a.position - b.position)
            .map(block => renderBlock(block))
        ) : (
          <p className="text-muted-foreground text-center py-8">
            This newsletter has no content yet.
          </p>
        )}
      </div>

      <div className="mt-12 pt-8 border-t">
        <SocialShareBar url={shareUrl} title={newsletter.title} />
      </div>

      <div className="mt-8">
        <Link href="/resources/newsletter">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Newsletters
          </Button>
        </Link>
      </div>
    </article>
  );
}
