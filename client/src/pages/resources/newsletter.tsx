import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, Calendar, Clock, Bell, Sparkles, Users, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail("");
  };

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
              Stay ahead with exclusive healthcare insights, job opportunities, and industry updates — launching soon
            </p>
            
            {/* Hero Icons & Stats */}
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

      {/* Coming Soon Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="p-12 space-y-8">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Bell className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Coming Soon</h2>
                  <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    We're crafting something special for healthcare professionals. Be the first to know when our newsletter launches.
                  </p>
                </div>
              </div>
              
              {!subscribed ? (
                <div className="space-y-6">
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
                        className="modern-button-primary px-8"
                        data-testid="newsletter-subscribe-button"
                      >
                        Notify Me
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                  <p className="text-sm text-slate-500">
                    Join the waitlist to receive launch updates and exclusive early access.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto">
                    <Sparkles className="h-10 w-10 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">You're on the List!</h3>
                    <p className="text-lg text-slate-600">
                      Thank you for your interest. We'll notify you as soon as our newsletter is ready.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">What to Expect</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our newsletter will deliver carefully curated content designed specifically for healthcare professionals
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
                While you wait for our newsletter, explore our current opportunities and resources
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