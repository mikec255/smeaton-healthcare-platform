import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Award, Gift, Mail, Calculator } from "lucide-react";

export default function Resources() {
  const resourceCategories = [
    {
      icon: BookOpen,
      title: "Blog",
      description: "Latest insights and healthcare industry news to keep you informed about trends, best practices, and innovations in healthcare staffing.",
      link: "/resources/blog",
      color: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-600"
    },
    {
      icon: Award,
      title: "Working at Smeaton",
      description: "Discover what makes Smeaton Healthcare a great place to work. Learn about our culture, benefits, and opportunities for growth.",
      link: "/resources/working-at-smeaton",
      color: "from-primary/20 to-primary/30",
      iconColor: "text-primary"
    },
    {
      icon: Gift,
      title: "Sponsorship",
      description: "Explore our training and development sponsorship opportunities to advance your career in healthcare with our support.",
      link: "/resources/sponsorship",
      color: "from-purple-500/20 to-purple-600/20",
      iconColor: "text-purple-600"
    },
    {
      icon: Mail,
      title: "Newsletter",
      description: "Stay updated with our latest news, job opportunities, industry insights, and company updates delivered straight to your inbox.",
      link: "/resources/newsletter",
      color: "from-orange-500/20 to-orange-600/20",
      iconColor: "text-orange-600"
    },
    {
      icon: Calculator,
      title: "Understanding Care Funding",
      description: "Navigate UK care funding options including NHS support, council funding, and eligibility criteria for 2024-25.",
      link: "/resources/costings",
      color: "from-secondary/20 to-secondary/30",
      iconColor: "text-secondary"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-16" data-testid="resources-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground" data-testid="resources-title">
              Resources Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="resources-description">
              Everything you need to succeed in your healthcare career. From industry insights to career guidance, 
              we're here to support your professional journey.
            </p>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resourceCategories.map((resource, index) => {
              const IconComponent = resource.icon;
              return (
                <div 
                  key={resource.title}
                  className={`group bg-gradient-to-br ${resource.color} rounded-2xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-slate-200`}
                  data-testid={`resource-card-${resource.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="space-y-6">
                    {/* Icon */}
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <IconComponent className={`h-8 w-8 ${resource.iconColor}`} />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="text-center space-y-4">
                      <h3 className="text-2xl font-bold text-foreground" data-testid={`resource-title-${resource.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        {resource.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed" data-testid={`resource-description-${resource.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        {resource.description}
                      </p>
                    </div>
                    
                    {/* CTA Button */}
                    <div className="text-center">
                      <Link href={resource.link}>
                        <Button 
                          variant="outline" 
                          className="group/btn border-slate-300 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                          data-testid={`resource-button-${resource.title.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          Explore {resource.title}
                          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white" data-testid="resources-cta">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Need Personalized Support?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our team is here to help you with any questions or provide tailored guidance for your healthcare career.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="resources-contact-button"
                >
                  Get in Touch
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/jobs">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-secondary text-secondary hover:bg-secondary/10"
                  data-testid="resources-jobs-button"
                >
                  Browse Job Opportunities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}