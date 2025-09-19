import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Users, Award, Coffee, Target, Shield } from "lucide-react";

export default function WorkingAtSmeaton() {
  const benefits = [
    {
      icon: Heart,
      title: "Work-Life Balance",
      description: "Flexible working arrangements and support for your personal wellbeing alongside your professional growth."
    },
    {
      icon: Users,
      title: "Supportive Team",
      description: "Join a family-like environment where colleagues support each other and celebrate successes together."
    },
    {
      icon: Award,
      title: "Career Development",
      description: "Ongoing training, mentorship programs, and clear pathways for career progression and skill enhancement."
    },
    {
      icon: Coffee,
      title: "Great Workplace Culture",
      description: "Enjoy team events, social activities, and a positive workplace atmosphere that makes coming to work a pleasure."
    },
    {
      icon: Target,
      title: "Making a Difference",
      description: "Your work directly impacts healthcare delivery across Devon and Cornwall, connecting skilled professionals with vital roles."
    },
    {
      icon: Shield,
      title: "Job Security",
      description: "Stable employment with a growing company that values long-term relationships with our team members."
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
                  <Button variant="ghost" size="sm" data-testid="back-to-resources">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Resources
                  </Button>
                </Link>
              </div>
              
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <div className="inline-block">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4 mx-auto shadow-lg">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="py-4">
                    <h1 className="text-4xl lg:text-5xl font-bold overflow-visible" data-testid="working-title">
                      <span className="inline-block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent [-webkit-text-fill-color:transparent] leading-[1.1] pb-[0.15em]">
                        Working at Smeaton Healthcare
                      </span>
                    </h1>
                  </div>
                  <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto"></div>
                </div>
                <p className="text-lg lg:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium" data-testid="working-description">
                  Discover what makes Smeaton Healthcare more than just a workplace – we're a family.
                </p>
                
                {/* Hero Icons & Stats */}
                <div className="flex flex-wrap justify-center items-center gap-8 mt-8 text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Work-Life Balance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Award className="h-5 w-5 text-secondary" />
                    </div>
                    <span className="text-sm font-medium">Career Growth</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Making a Difference</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Users className="h-5 w-5 text-secondary" />
                    </div>
                    <span className="text-sm font-medium">Team Culture</span>
                  </div>
                </div>
              </div>
            </div> {/* close white card */}
          </div> {/* close gradient border */}
        </div> {/* close container */}
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Smeaton?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We believe that happy, supported collegues provide the best service to our customers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div 
                  key={index}
                  className="text-center space-y-4 p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow"
                  data-testid={`benefit-${index}`}
                >
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Smeaton Healthcare */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">About Smeaton Healthcare</h2>
            <p className="text-xl text-muted-foreground">
              Discover the story behind our commitment to excellence in healthcare staffing across Devon and Cornwall.
            </p>
          </div>
          
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200" data-testid="company-story">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground text-center">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Founded with a passion for connecting exceptional healthcare professionals with organizations that need them most, 
                  we bridge the gap between talent and opportunity across the Southwest.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200" data-testid="company-experience">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center">
                    <Award className="h-8 w-8 text-secondary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground text-center">Local Expertise</h3>
                <p className="text-muted-foreground leading-relaxed">
                  With deep roots in Devon and Cornwall, we understand the unique healthcare landscape of our region. 
                  Our local knowledge ensures perfect matches between professionals and organizations.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200" data-testid="company-values">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground text-center">Our Values</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Excellence, integrity, and genuine care guide everything we do. We believe that when our team thrives, 
                  we can better serve the healthcare community that depends on us.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Ready to Join Our Family?
              </h2>
              <p className="text-xl text-muted-foreground">
                Explore current opportunities and take the next step in your healthcare career with Smeaton Healthcare.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/jobs">
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="view-jobs-button"
                >
                  View Current Opportunities
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-secondary text-secondary hover:bg-secondary/10"
                  data-testid="contact-hr-button"
                >
                  Contact Our HR Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}