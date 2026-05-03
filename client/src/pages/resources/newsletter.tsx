import { useState } from "react";
import { Link } from "wouter";
import Seo from "@/components/seo";
import { Input } from "@/components/ui/input";
import { Mail, Calendar, Bell, Sparkles, Users, ArrowRight, CheckCircle } from "lucide-react";
import Ticker from "@/components/layout/ticker";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const FEATURES = [
  { icon: Mail, title: "Monthly Industry Insights", description: "Curated home care industry news, trends, and analysis delivered monthly." },
  { icon: Users, title: "Exclusive Job Opportunities", description: "Early access to care roles before they go public." },
  { icon: Sparkles, title: "Professional Development", description: "Career advancement tips and training opportunities for care professionals." },
  { icon: Calendar, title: "Event Notifications", description: "Stay informed about conferences, webinars, and networking events." },
];

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

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
      setSubscribed(true);
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

  return (
    <div data-testid="newsletter-page">
      <Seo title="Sign Up to Our Newsletter" description="Stay up to date with the latest care news, tips and updates from Smeaton Healthcare. Sign up to our free newsletter today." path="/resources/newsletter" />
      <Ticker />

      {/* HERO */}
      <section style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-8 sm:pt-14 sm:pb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Stay in the loop</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-1 tracking-tight" style={{ color: BLUE }}>Our Newsletter</h1>
          <div className="mb-4" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>straight to your inbox.</div>
          <p className="text-gray-500 text-base max-w-2xl leading-relaxed" data-testid="newsletter-description">
            Exclusive healthcare insights, job opportunities, and company updates — launching soon.
          </p>
        </div>
      </section>

      {/* COMING SOON CARD */}
      <section className="py-6 sm:py-12 bg-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8">
          <div className="rounded-3xl border-2 border-gray-100 p-10 text-center" style={{ backgroundColor: CREAM }}>
            {!subscribed ? (
              <>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${PINK}15` }}>
                  <Bell size={28} style={{ color: PINK }} />
                </div>
                <h2 className="text-2xl font-extrabold mb-3 tracking-tight" style={{ color: BLUE }}>Coming Soon</h2>
                <p className="text-gray-500 leading-relaxed mb-8 max-w-md mx-auto">
                  We're crafting something special. Be the first to know when our newsletter launches.
                </p>
                <form onSubmit={handleSubscribe} className="flex gap-3 max-w-sm mx-auto mb-4">
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 border-2 border-gray-200 focus:border-pink-400 rounded-xl"
                    data-testid="newsletter-email-input"
                  />
                  <button
                    type="submit"
                    disabled={subscribeMutation.isPending}
                    className="px-5 py-2.5 text-white font-bold rounded-xl shrink-0 hover:scale-105 transition-all disabled:opacity-60"
                    style={{ backgroundColor: PINK }}
                    data-testid="newsletter-subscribe-button"
                  >
                    {subscribeMutation.isPending ? "..." : "Notify Me"}
                  </button>
                </form>
                <p className="text-xs text-gray-400">Join the waitlist for launch updates and exclusive early access.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-green-100">
                  <CheckCircle size={28} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-extrabold mb-3 tracking-tight" style={{ color: BLUE }}>You're on the list!</h2>
                <p className="text-gray-500 leading-relaxed">Thank you for your interest. We'll notify you as soon as our newsletter is ready.</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* WHAT TO EXPECT */}
      <section className="py-7 sm:py-14" style={{ backgroundColor: CREAM }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>What to expect</p>
          <h2 className="text-2xl font-extrabold mb-4 sm:mb-8 tracking-tight" style={{ color: BLUE }}>What we'll cover</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex gap-4 p-6 rounded-2xl border-2 bg-white border-gray-100" data-testid={`feature-${i}`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${BLUE}15` }}>
                    <Icon size={18} style={{ color: BLUE }} />
                  </div>
                  <div>
                    <h3 className="font-extrabold mb-1 text-base tracking-tight" style={{ color: NAVY }}>{f.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-7 sm:py-14 bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-2xl font-extrabold mb-2 tracking-tight" style={{ color: BLUE }}>While you wait</h2>
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: PINK }}>explore our current opportunities.</div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/jobs" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-white font-bold rounded-xl hover:scale-105 transition-all" style={{ backgroundColor: PINK, boxShadow: "0 8px 24px rgba(239,42,134,0.35)" }} data-testid="browse-jobs-button">
              Browse Job Opportunities <ArrowRight size={15} />
            </Link>
            <Link href="/resources/blog" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-bold rounded-xl hover:bg-black/5 transition-all border-2" style={{ color: NAVY, borderColor: "rgba(5,22,61,0.15)" }} data-testid="read-blog-button">
              Read Our Blog <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
