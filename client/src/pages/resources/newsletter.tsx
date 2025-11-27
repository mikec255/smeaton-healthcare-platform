import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Mail, Calendar, Clock, Bell, Sparkles, Users, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Newsletter } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const { data: newsletters = [], isLoading } = useQuery<Newsletter[]>({
    queryKey: ["/api/newsletters"],
  });

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("POST", "/api/subscribers", { 
        email,
        status: "pending",
        source: "newsletter_page"
      });
    },
    onSuccess: () => {
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["/api/subscribers"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribeMutation.mutate(email);
    }
  };

  const formatDate = (dateString: Date | string | null): string => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'long', 
      year: 'numeric' 
    });
  };

  const publishedNewsletters = newsletters.filter(n => n.status === "published" && n.slug);

  const upcomingFeatures = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Monthly Industry Insights",
      description: "Curated healthcare industry news, trends, and analysis delivered monthly"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Exclusive Job Opportunities",
      description: "Early access to premium healthcare positions before they go public"
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Professional Development",
      description: "Career advancement tips and training opportunities for healthcare professionals"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Event Notifications",
      description: "Stay informed about healthcare conferences, webinars, and networking events"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-primary/20 via-white to-secondary/15 py-12 overflow-hidden">
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
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="py-4">
                    <h1 className="text-4xl lg:text-5xl font-bold overflow-visible" data-testid="newsletter-title">
                      <span className="inline-block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent [-webkit-text-fill-color:transparent] leading-[1.1] pb-[0.15em]">
                        Newsletter
                      </span>
                    </h1>
                  </div>
                  <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto"></div>
                </div>
                <p className="text-lg lg:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium" data-testid="newsletter-description">
                  Stay ahead with exclusive healthcare insights, job opportunities, and industry updates
                </p>
                
                <div className="flex flex-wrap justify-center items-center gap-8 mt-8 text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Monthly Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Users className="h-5 w-5 text-secondary" />
                    </div>
                    <span className="text-sm font-medium">Healthcare Focus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">5 Min Reads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Sparkles className="h-5 w-5 text-secondary" />
                    </div>
                    <span className="text-sm font-medium">Exclusive Content</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bell className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-slate-600 mb-6 max-w-lg mx-auto">
              Join our community of healthcare professionals and receive the latest updates directly in your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 border-slate-300 focus:border-primary"
                  data-testid="newsletter-email-input"
                />
                <Button 
                  type="submit"
                  className="modern-button-primary px-6"
                  disabled={subscribeMutation.isPending}
                  data-testid="newsletter-subscribe-button"
                >
                  {subscribeMutation.isPending ? "..." : "Subscribe"}
                  {!subscribeMutation.isPending && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Newsletter List */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Past Newsletters</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Browse our archive of newsletters for valuable healthcare insights and updates
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : publishedNewsletters.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="h-10 w-10 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-3">No Newsletters Yet</h3>
              <p className="text-slate-600 max-w-md mx-auto mb-6">
                We're working on our first newsletter. Subscribe above to be notified when it's ready!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedNewsletters.map((newsletter) => (
                <article 
                  key={newsletter.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 overflow-hidden group"
                  data-testid={`newsletter-card-${newsletter.id}`}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4" />
                      {formatDate(newsletter.createdAt)}
                    </div>
                    
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {newsletter.title}
                    </h3>
                    
                    {newsletter.preheader && (
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                        {newsletter.preheader}
                      </p>
                    )}
                    
                    <Link href={`/newsletter/${newsletter.slug}`}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full hover:bg-primary hover:text-primary-foreground group"
                        data-testid={`read-newsletter-${newsletter.id}`}
                      >
                        Read Newsletter
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">What We Cover</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our newsletter delivers carefully curated content designed specifically for healthcare professionals
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {upcomingFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-md transition-all duration-300"
                data-testid={`feature-${index}`}
              >
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="text-primary">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-white to-secondary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Stay Connected
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Explore our current opportunities and resources while you stay updated with our newsletter
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/jobs">
                <Button 
                  size="lg" 
                  className="modern-button-primary text-lg px-8 py-4"
                  data-testid="browse-jobs-button"
                >
                  Browse Job Opportunities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/resources/blog">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-slate-300 text-slate-600 hover:bg-slate-50 text-lg px-8 py-4"
                  data-testid="read-blog-button"
                >
                  Read Our Blog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
