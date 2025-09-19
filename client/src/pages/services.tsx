import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Clock, Home, Clock12, TrendingUp, Coffee, ArrowRight } from "lucide-react";

export default function Services() {
  const services = [
    {
      icon: Clock,
      title: "Short Visits",
      description: "Essential care visits throughout the day, helping you maintain independence while receiving the support you need in your own home.",
      features: [
        "Personal care assistance",
        "Medication support",
        "Companionship services",
        "Flexible scheduling"
      ],
      color: "primary",
      href: "/services/short-visits"
    },
    {
      icon: Home,
      title: "Supported Living",
      description: "Independent living with personalized support that empowers you to achieve your goals and build the life you want in your community.",
      features: [
        "Person-centered care plans",
        "Skills development support",
        "Community integration",
        "24/7 emergency support"
      ],
      color: "secondary",
      href: "/services/supported-living"
    },
    {
      icon: Clock12,
      title: "24/7 Care",
      description: "Round-the-clock professional care and support in the comfort and familiarity of your own home, providing complete peace of mind.",
      features: [
        "Continuous care presence",
        "Night-time monitoring",
        "Emergency response",
        "Complex medical support"
      ],
      color: "primary",
      href: "/services/care-24-7"
    },
    {
      icon: TrendingUp,
      title: "Enablements",
      description: "Build skills, confidence, and independence through personalized support that empowers you to achieve your goals and live life to the fullest.",
      features: [
        "Goal-focused approach",
        "Skill building programs",
        "Confidence development",
        "Independence training"
      ],
      color: "accent",
      href: "/services/enablements"
    },
    {
      icon: Coffee,
      title: "Respite Care",
      description: "Temporary relief for family caregivers providing professional, compassionate care for your loved one so you can take the break you deserve.",
      features: [
        "Flexible duration options",
        "Emergency respite available",
        "Experienced care staff",
        "Family peace of mind"
      ],
      color: "secondary",
      href: "/services/respite"
    }
  ];

  return (
    <div data-testid="services-page">
      {/* Hero Section */}
      <section className="relative min-h-[22vh] overflow-hidden bg-gradient-to-r from-primary/10 via-background to-secondary/10">
        <div className="relative min-h-[22vh] flex items-center">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          {/* Hero Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4" data-testid="services-hero-title">
                Our Services
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="services-hero-subtitle">
                Comprehensive healthcare solutions tailored to your needs across Devon and Cornwall
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => {
          const IconComponent = service.icon;
          return (
            <Card 
              key={index} 
              className="shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:scale-105"
              data-testid={`service-card-${service.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <CardContent className="p-8 flex flex-col h-full">
                <div className={`bg-${service.color}/10 rounded-full w-16 h-16 flex items-center justify-center mb-6`}>
                  <IconComponent className={`text-${service.color} h-8 w-8`} />
                </div>
                <h3 className="text-2xl font-bold mb-4" data-testid={`service-title-${index}`}>
                  {service.title}
                </h3>
                <p className="text-muted-foreground mb-6 flex-grow" data-testid={`service-description-${index}`}>
                  {service.description}
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 mb-6" data-testid={`service-features-${index}`}>
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} data-testid={`feature-${index}-${featureIndex}`}>
                      • {feature}
                    </li>
                  ))}
                </ul>
                <Link href={service.href} data-testid={`service-link-${index}`}>
                  <Button 
                    className={`w-full mt-auto bg-${service.color} text-${service.color}-foreground hover:bg-${service.color}/90`}
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
      </div>
    </div>
  );
}
