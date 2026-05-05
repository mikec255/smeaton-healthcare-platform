import { Link } from "wouter";
import Seo from "@/components/seo";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowRight, Clock, Phone } from "lucide-react";
import Ticker from "@/components/layout/ticker";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { type BlogPost, type BlogCategory } from "@shared/schema";
import DOMPurify from "dompurify";
import SocialShareBar from "@/components/shared/SocialShareBar";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

interface TransformedBlogPost {
  id: string;
  slug: string;
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

  const { data: blogPosts = [], isLoading: postsLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts?isPublished=true"],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog-categories"],
  });

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "Uncategorised";
  };

  const formatDate = (dateString: Date | null): string => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const extractImage = (post: BlogPost): string => {
    const featured = post.images?.find((img: any) => img.isFeatured);
    if (featured?.url) return featured.url;
    if (post.images && post.images.length > 0) return (post.images[0] as any).url || "";
    if (post.imagePath) return post.imagePath;
    if (post.content) {
      const match = post.content.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match?.[1]) return match[1];
    }
    return "";
  };

  const transformedBlogPosts: TransformedBlogPost[] = useMemo(() => {
    if (!blogPosts.length || !categories.length) return [];
    return blogPosts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      date: formatDate(post.publishedAt ?? post.createdAt),
      readTime: post.readTime || "5 min read",
      author: post.author,
      category: getCategoryName(post.categoryId),
      image: extractImage(post),
      fullContent: post.content,
    }));
  }, [blogPosts, categories]);

  const categoryOptions = ["All", ...categories.map(cat => cat.name)];
  const isLoading = postsLoading || categoriesLoading;
  const displayPosts = transformedBlogPosts
    .filter(p => selectedCategory === "All" || p.category === selectedCategory)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const featuredPost = displayPosts[0] ?? null;
  const gridPosts = displayPosts.slice(1);

  const SkeletonFeatured = () => (
    <div className="rounded-3xl overflow-hidden border border-gray-100 bg-white">
      <div className="grid md:grid-cols-2">
        <Skeleton className="h-64 md:h-80 w-full rounded-none" />
        <div className="p-8 space-y-4">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  );

  const SkeletonCard = () => (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
    </div>
  );

  const ArticleModal = ({ post, children }: { post: TransformedBlogPost; children: React.ReactNode }) => (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-left pr-8" style={{ color: NAVY }}>{post.title}</DialogTitle>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 pt-2">
            <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${PINK}15`, color: PINK }}>{post.category}</span>
            <span className="flex items-center gap-1"><Calendar size={11} /> {post.date}</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>
          </div>
        </DialogHeader>
        {post.image && (
          <div className="w-full mt-2 mb-4 rounded-xl overflow-hidden">
            <img src={post.image} alt={post.title} className="w-full object-cover block" style={{ maxHeight: "380px" }} />
          </div>
        )}
        <SocialShareBar url={`${window.location.origin}/blog/${post.slug}`} title={post.title} />
        <div className="prose prose-lg max-w-none mt-4" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.fullContent) }} />
        <div className="mt-8">
          <SocialShareBar url={`${window.location.origin}/blog/${post.slug}`} title={post.title} />
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div data-testid="blog-page">
      <Seo
        title="Blog & News — Care Tips & Insights"
        description="Read the latest care news, tips and insights from the Smeaton Healthcare team. Helping families across Devon and Cornwall make informed care decisions."
        path="/resources/blog"
      />
      <Ticker />

      {/* HERO */}
      <section style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-10 sm:pt-14 sm:pb-14">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Articles &amp; insights</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-1 tracking-tight" style={{ color: BLUE }}>Our Blog</h1>
          <div className="mb-4" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>stories from the heart of care.</div>
          <p className="text-gray-500 text-base max-w-2xl leading-relaxed" data-testid="blog-description">
            Insights, guidance, and stories from the Smeaton Healthcare team.
          </p>
        </div>
      </section>

      {/* CATEGORY FILTER PILLS */}
      <section className="sticky top-16 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-full shrink-0" />)
            : categoryOptions.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                style={
                  selectedCategory === cat
                    ? { backgroundColor: PINK, color: "#fff", boxShadow: "0 4px 14px rgba(239,42,134,0.35)" }
                    : { backgroundColor: "#f3f4f6", color: "#6b7280" }
                }
                data-testid={`filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {cat}
              </button>
            ))
          }
        </div>
      </section>

      {/* POSTS GRID */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {isLoading ? (
            <>
              <SkeletonFeatured />
              <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            </>
          ) : displayPosts.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-gray-100" style={{ backgroundColor: CREAM }}>
              <p className="text-gray-400 text-lg">No posts in this category yet.</p>
              <p className="text-sm text-gray-400 mt-1">Check back soon!</p>
            </div>
          ) : (
            <>
              {/* FEATURED POST */}
              {featuredPost && (
                <ArticleModal post={featuredPost}>
                  <article
                    className="group cursor-pointer rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 bg-white mb-10"
                    data-testid="blog-post-featured"
                  >
                    <div className="grid md:grid-cols-2">
                      {featuredPost.image ? (
                        <div className="h-64 md:h-full overflow-hidden">
                          <img
                            src={featuredPost.image}
                            alt={featuredPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="h-64 md:h-full" style={{ backgroundColor: `${BLUE}18` }} />
                      )}
                      <div className="p-8 sm:p-10 flex flex-col justify-center">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: `${PINK}15`, color: PINK }}>
                            {featuredPost.category}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar size={11} /> {featuredPost.date}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={11} /> {featuredPost.readTime}
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug mb-3 tracking-tight" style={{ color: NAVY }}>
                          {featuredPost.title}
                        </h2>
                        {featuredPost.excerpt && (
                          <p className="text-gray-500 text-base leading-relaxed mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                        )}
                        <span
                          className="inline-flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all"
                          style={{ color: BLUE }}
                        >
                          Read Full Article <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </article>
                </ArticleModal>
              )}

              {/* GRID */}
              {gridPosts.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridPosts.map((post, index) => (
                    <ArticleModal key={post.id} post={post}>
                      <article
                        className="group cursor-pointer rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 bg-white flex flex-col h-full"
                        data-testid={`blog-post-${index + 1}`}
                      >
                        <div className="overflow-hidden h-48">
                          {post.image ? (
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              data-testid={`blog-image-${index + 1}`}
                            />
                          ) : (
                            <div className="w-full h-full" style={{ backgroundColor: `${BLUE}18` }} />
                          )}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PINK}15`, color: PINK }}>
                              {post.category}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar size={10} /> {post.date}
                            </span>
                          </div>
                          <h2 className="font-extrabold text-base leading-snug mb-2 tracking-tight flex-1" style={{ color: NAVY }}>
                            {post.title}
                          </h2>
                          {post.excerpt && (
                            <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                          )}
                          <span
                            className="inline-flex items-center gap-1.5 text-sm font-bold group-hover:gap-2.5 transition-all mt-auto"
                            style={{ color: BLUE }}
                            data-testid={`read-article-${index + 1}`}
                          >
                            Read Article <ArrowRight size={13} />
                          </span>
                        </div>
                      </article>
                    </ArticleModal>
                  ))}
                </div>
              )}
            </>
          )}

          {/* FOOTER NOTE */}
          <div className="text-center pt-12 pb-2">
            <p className="text-gray-400 mb-4">More articles coming soon.</p>
            <Link href="/resources/newsletter" className="inline-flex items-center gap-1.5 font-bold text-sm hover:gap-2.5 transition-all" style={{ color: PINK }}>
              Subscribe to our newsletter <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 sm:py-20" style={{ backgroundColor: CREAM }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: BLUE }}>Ready to get started?</h2>
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>We'd love to hear from you.</div>
          <p className="text-gray-500 mb-8 leading-relaxed">Our team can discuss your care needs and guide you to the right support. No obligation, completely free.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/referral" className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-xl hover:scale-105 transition-all" style={{ backgroundColor: PINK, boxShadow: "0 8px 32px rgba(239,42,134,0.4)" }}>
              Request Free Assessment <ArrowRight size={16} />
            </Link>
            <a href="tel:03301658880" className="inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold rounded-xl hover:opacity-80 transition-all border-2" style={{ color: NAVY, borderColor: "rgba(5,22,61,0.2)" }}>
              <Phone size={16} /> 0330 165 8880
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
