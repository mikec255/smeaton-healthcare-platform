import { Link } from "wouter";
import Seo from "@/components/seo";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowRight, Filter, Phone } from "lucide-react";
import Ticker from "@/components/layout/ticker";
import { useState, useMemo, useEffect } from "react";
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

  const stripLeadingImages = (html: string): string => {
    if (!html) return html;
    // Remove any leading <figure>…</figure> or <img …> blocks before the first text content
    return html
      .replace(/^\s*(<figure[^>]*>[\s\S]*?<\/figure>\s*)+/, "")
      .replace(/^\s*(<img[^>]*\/?>\s*)+/, "")
      .trim();
  };

  const extractImage = (post: BlogPost): string => {
    // 1. Featured image from images array
    const featured = post.images?.find((img: any) => img.isFeatured);
    if (featured?.url) return featured.url;
    // 2. First image in images array
    if (post.images && post.images.length > 0) return (post.images[0] as any).url || "";
    // 3. Legacy imagePath field
    if (post.imagePath) return post.imagePath;
    // 4. First <img> src from HTML content
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
      date: formatDate(post.createdAt),
      readTime: post.readTime || "5 min read",
      author: post.author,
      category: getCategoryName(post.categoryId),
      image: extractImage(post),
      fullContent: post.content,
    }));
  }, [blogPosts, categories]);

  const categoryOptions = ["All", ...categories.map(cat => cat.name)];
  const isLoading = postsLoading || categoriesLoading;
  const displayPosts = transformedBlogPosts.filter(p => selectedCategory === "All" || p.category === selectedCategory);

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
      <div className="flex gap-5">
        <Skeleton className="w-28 h-20 rounded-xl shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );

  // Breadcrumb data for structured data
  const breadcrumbs = [
    { name: 'Home', url: 'https://smeatonhealthcare.co.uk/' },
    { name: 'Resources', url: 'https://smeatonhealthcare.co.uk/resources' },
    { name: 'Blog', url: 'https://smeatonhealthcare.co.uk/resources/blog' }
  ];

  return (
    <div data-testid="blog-page">
      <Seo title="Blog & News — Care Tips & Insights" description="Read the latest care news, tips and insights from the Smeaton Healthcare team. Helping families across Devon and Cornwall make informed care decisions." path="/resources/blog" />
      <Ticker />

      {/* HERO */}
      <section style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-8 sm:pt-14 sm:pb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Articles & insights</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-1 tracking-tight" style={{ color: BLUE }}>Our Blog</h1>
          <div className="mb-4" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>stories from the heart of care.</div>
          <p className="text-gray-500 text-base max-w-2xl leading-relaxed" data-testid="blog-description">
            Insights, guidance, and stories from the Smeaton Healthcare team.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-6 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex gap-8 items-start">
            {/* SIDEBAR */}
            <aside className="w-52 shrink-0 hidden md:block">
              <div className="rounded-2xl p-5 border-2 border-gray-100 sticky top-28" style={{ backgroundColor: CREAM }}>
                <div className="flex items-center gap-2 mb-4">
                  <Filter size={14} style={{ color: PINK }} />
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: NAVY }}>Filter</span>
                </div>
                <div className="space-y-1">
                  {isLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-lg" />) : (
                    categoryOptions.map((cat) => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all font-medium ${selectedCategory === cat ? "text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                        style={selectedCategory === cat ? { backgroundColor: PINK } : {}}
                        data-testid={`filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}>
                        {cat}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 min-w-0 space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              ) : displayPosts.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border-2 border-gray-100" style={{ backgroundColor: CREAM }}>
                  <p className="text-gray-400 text-lg">No blog posts available yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Check back soon for new content!</p>
                </div>
              ) : (
                displayPosts.map((post, index) => (
                  <article key={post.id} className="bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all p-6" data-testid={`blog-post-${index}`}>
                    <div className="flex gap-5">
                      {post.image && (
                        <div className="shrink-0 w-28 sm:w-36 h-20 sm:h-24 rounded-xl overflow-hidden">
                          <img src={post.image} alt={post.title} className="w-full h-full object-cover" data-testid={`blog-image-${index}`} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${PINK}15`, color: PINK }}>{post.category}</span>
                          <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar size={11} /> {post.date}</span>
                        </div>
                        <h2 className="font-extrabold text-base sm:text-lg mb-3 leading-snug tracking-tight" style={{ color: NAVY }}>{post.title}</h2>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="inline-flex items-center gap-1.5 text-sm font-bold hover:gap-2.5 transition-all" style={{ color: BLUE }} data-testid={`read-article-${index}`}>
                              Read Full Article <ArrowRight size={13} />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold text-left pr-8">{post.title}</DialogTitle>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 pt-2">
                                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${PINK}15`, color: PINK }}>{post.category}</span>
                                <span className="flex items-center gap-1"><Calendar size={11} /> {post.date}</span>
                              </div>
                            </DialogHeader>
                            {post.image && (
                              <div className="w-full mt-2 mb-4 rounded-xl overflow-hidden">
                                <img src={post.image} alt={post.title} className="w-full object-cover block" style={{ maxHeight: "380px" }} />
                              </div>
                            )}
                            <SocialShareBar url={`${window.location.origin}/blog/${post.slug}`} title={post.title} />
                            <div className="prose prose-lg max-w-none" style={{ clear: "both" }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.fullContent) }} data-testid={`full-article-${index}`} />
                            <div className="mt-8">
                              <SocialShareBar url={`${window.location.origin}/blog/${post.slug}`} title={post.title} />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </article>
                ))
              )}

              <div className="text-center pt-8 pb-4">
                <p className="text-gray-400 mb-4">More articles coming soon.</p>
                <Link href="/resources/newsletter" className="inline-flex items-center gap-1.5 font-bold text-sm hover:gap-2.5 transition-all" style={{ color: PINK }}>
                  Subscribe to our newsletter <ArrowRight size={13} />
                </Link>
              </div>
            </main>
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
