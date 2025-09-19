import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import heroBackground from "@/assets/hero-background.png";
import aboutUsBackground from "@assets/Green Modern Marketing Logo-3_1757678769218.png";
import joinTeamBackground from "@assets/Red Professional Art Director Recruitment Instagram Post-2_1757676921358.png";
import supportedLivingLogo from "@assets/Supported Living Framework Provider Logo 105[38]_1757665089697.png";
import nhsSupplierLogo from "@assets/nhs-supplier_1757665089697.png";
import pqsLogo from "@assets/PQS-Pre-Qualification-Scheme_1757665089697.webp";
import founderPhoto from "@assets/Green Modern Marketing Logo-3_1757678769218.png";
import { 
  Heart, 
  Shield, 
  Star, 
  Users, 
  Clock, 
  CheckCircle, 
  MapPin, 
  Phone,
  ArrowRight,
  Award,
  Building2,
  FileCheck,
  UserCheck,
  Home as HomeIcon,
  Activity,
  Coffee,
  TrendingUp,
  ExternalLink,
  Pin,
  Search,
  Lightbulb,
  Handshake,
  Crown,
  Rocket,
  Briefcase,
  User,
  Mail
} from "lucide-react";

export default function Home({ heroTab = "find-care", onHeroTabChange }: { heroTab?: string, onHeroTabChange?: (value: string) => void }) {
  const [shouldPulsate, setShouldPulsate] = useState(true);
  
  useEffect(() => {
    // Stop pulsating after 5 seconds
    const timer = setTimeout(() => {
      setShouldPulsate(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  // Load CQC widgets dynamically
  useEffect(() => {
    // Function to load CQC widget script
    const loadCQCWidget = (containerId: string, widgetId: string, useHttps: boolean = false) => {
      const container = document.getElementById(containerId);
      if (container && !container.querySelector('script')) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = useHttps 
          ? `https://www.cqc.org.uk/sites/all/modules/custom/cqc_widget/widget.js?data-id=${widgetId}&data-host=https://www.cqc.org.uk&type=location`
          : `//www.cqc.org.uk/sites/all/modules/custom/cqc_widget/widget.js?data-id=${widgetId}&data-host=www.cqc.org.uk&type=location`;
        
        container.appendChild(script);
      }
    };

    // Load both widgets with a small delay to prevent conflicts
    setTimeout(() => {
      loadCQCWidget('cqc-widget-container-1', '1-18068593493', false);
    }, 100);
    
    setTimeout(() => {
      loadCQCWidget('cqc-widget-container-2', '1-9768929200', true);
    }, 300);

    // Cleanup function
    return () => {
      const container1 = document.getElementById('cqc-widget-container-1');
      const container2 = document.getElementById('cqc-widget-container-2');
      
      if (container1) {
        const script = container1.querySelector('script');
        if (script) script.remove();
      }
      
      if (container2) {
        const script = container2.querySelector('script');
        if (script) script.remove();
      }
    };
  }, []);

  const stats = [
    { value: "250,000+", label: "hours of care delivered", icon: Clock },
    { value: "98%", label: "employee satisfaction rate", icon: Heart },
    { value: "300+", label: "healthcare professionals", icon: Users },
    { value: "6", label: "years of excellence", icon: Award },
  ];

  const services = [
    {
      title: "Short Visits",
      description: "Personalised short visit care for everyday support and companionship — helping you stay independent in the comfort of your own home.",
      icon: Clock,
      link: "/short-visits"
    },
    {
      title: "Supported Living",
      description: "Independent living with personalised support tailored to individual needs and preferences.",
      icon: HomeIcon,
      link: "/supported-living"
    },
    {
      title: "24/7 Care",
      description: "Round-the-clock professional care and support for those who need continuous assistance.",
      icon: Shield,
      link: "/care-24-7"
    },
    {
      title: "Enabling",
      description: "Our enabling service is designed to help individuals regain independence and life skills.",
      icon: TrendingUp,
      link: "/enablements"
    },
    {
      title: "Respite Care",
      description: "Our Respite service gives families and carers a well-deserved break and peace of mind.",
      icon: Coffee,
      link: "/respite"
    }
  ];

  const process = [
    {
      step: "01",
      title: "Referral",
      description: "Contact us by phone or complete our online referral form.",
      icon: Phone
    },
    {
      step: "02", 
      title: "Assessment",
      description: "We arrange a convenient care assessment to fully understand your needs.",
      icon: Search
    },
    {
      step: "03",
      title: "Care Plan",
      description: "Together, we create a personalised care plan with you at the centre.",
      icon: FileCheck
    },
    {
      step: "04",
      title: "Your Journey Begins",
      description: "We match you with the right carers and put your plan into action, with regular reviews to adapt as your needs change.",
      icon: ArrowRight
    }
  ];

  const mission = {
    title: "Our mission",
    description: "To be recognised as industry leaders who collectively strive for excellence and share a passion for innovation and creativity.",
    position: "mission"
  };

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "To take risks, encourage curiosity and new ideas, learn from mistakes and constantly strive to propel forward within the industry.",
      position: "left",
      color: "blue"
    },
    {
      icon: Users,
      title: "Community",
      description: "To provide a haven of inclusion, trust and support to colleagues, customers and stakeholders.",
      position: "left",
      color: "pink"
    },
    {
      icon: Handshake,
      title: "Collaboration",
      description: "To navigate in partnership, listening to one another and working collaboratively to achieve better outcomes.",
      position: "right",
      color: "blue"
    },
    {
      icon: Award,
      title: "Excellence",
      description: "To adapt our methods of practice accordingly, through vigilance and integrity, ensuring excellence.",
      position: "right",
      color: "pink"
    },
    {
      icon: Crown,
      title: "Leadership",
      description: "To maintain a company culture which empowers colleagues to achieve the company mission and realise the importance of their contribution.",
      position: "right",
      color: "blue"
    }
  ];

  return (
    <div data-testid="home-page">
      {/* Hero Section with Tabs */}
      <section className="relative min-h-[90vh] overflow-hidden pt-3">
        <Tabs value={heroTab} onValueChange={onHeroTabChange} className="w-full h-full">
          {/* Find Care Hero */}
          <TabsContent value="find-care" className="m-0 h-full">
            <div className="relative min-h-[90vh] flex items-end pb-20" 
                 style={{ 
                   backgroundImage: `url(${heroBackground})`,
                   backgroundSize: 'cover',
                   backgroundPosition: 'center 30%',
                   backgroundRepeat: 'no-repeat'
                 }}
                 data-testid="hero-find-care">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden z-10">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-bright/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              
              {/* Hero Content */}
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
                  <div className="space-y-8">
                    <div className="max-w-xl w-full mx-auto lg:mx-0">
                      <div className="relative">
                        <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search for care services..."
                          className="w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-4 text-base sm:text-lg text-slate-700 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-400 focus:ring-1 focus:ring-accent-bright focus:outline-none shadow-sm placeholder:text-slate-600"
                          data-testid="hero-search-care"
                        />
                      </div>
                    </div>
                    
                    <Link href="/services" className="block">
                      <h1 className={`text-sm sm:text-base lg:text-xl font-bold text-white bg-gradient-to-r from-secondary to-primary px-3 sm:px-4 py-2 sm:py-3 rounded-lg w-fit mx-auto lg:mx-0 cursor-pointer hover:scale-105 transition-transform text-center lg:text-left ${shouldPulsate ? 'animate-pulse' : ''}`} data-testid="hero-title-care">
                        <span className="block sm:hidden">Comprehensive Care Services</span>
                        <span className="hidden sm:block lg:hidden">Elderly Care | Learning Disabilities | Condition Led Care</span>
                        <span className="hidden lg:block whitespace-nowrap lg:text-sm xl:text-base 2xl:text-lg leading-tight">Elderly Care | Learning Disabilities | Condition Led Care | Supported Living | Short Visits</span>
                      </h1>
                    </Link>
                    
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
                      <Link href="/referral">
                        <Button 
                          size="lg" 
                          className="modern-button-primary group text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                          data-testid="button-looking-for-care"
                        >
                          <Heart className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
                          <span className="hidden sm:inline">Looking for care</span>
                          <span className="sm:hidden">Find Care</span>
                          <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link href="/jobs">
                        <Button 
                          size="lg" 
                          className="bg-primary hover:bg-primary/90 text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                          data-testid="button-join-team"
                        >
                          <span className="hidden sm:inline">Join Our Team</span>
                          <span className="sm:hidden">Join Us</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="relative hidden lg:block lg:h-64">
                    {/* Empty space where character was - maintains layout balance */}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Join Our Team Hero */}
          <TabsContent value="join-team" className="m-0 h-full">
            <div className="relative min-h-[90vh] flex items-center pb-20" 
                 style={{ 
                   backgroundImage: `url(${joinTeamBackground})`,
                   backgroundSize: 'cover',
                   backgroundPosition: 'center center',
                   backgroundRepeat: 'no-repeat',
                   transform: 'scaleX(-1)'
                 }}
                 data-testid="hero-join-team">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden z-10">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-bright/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              
              {/* Hero Content */}
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 overflow-visible" style={{ transform: 'scaleX(-1)' }}>
                <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
                  <div className="space-y-6 overflow-visible">
                    <h1 className="text-white leading-tight overflow-visible text-center lg:text-left" data-testid="hero-title-jobs">
                      <span className="block text-white text-[clamp(24px,6vw,48px)] font-black">
                        Join Our Team
                      </span>
                      <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-[clamp(18px,5.5vw,42px)] tracking-tight font-bold">
                        Be part of something special
                      </span>
                    </h1>
                    
                    <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-xl text-center lg:text-left">
                      Be part of a team that makes a real difference in people's lives. We're looking for dedicated healthcare professionals who share our passion for exceptional care and support.
                    </p>
                    
                    <div className="bg-white/20 rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4 border border-white/30">
                      <h3 className="text-xl sm:text-2xl font-bold text-white text-center lg:text-left">Why Join Smeaton Healthcare?</h3>
                      <ul className="space-y-2 text-white/90 text-base sm:text-lg">
                        <li className="flex items-center"><CheckCircle className="text-primary mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" /> Competitive pay rates and benefits</li>
                        <li className="flex items-center"><CheckCircle className="text-primary mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" /> Comprehensive training and development</li>
                        <li className="flex items-center"><CheckCircle className="text-primary mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" /> Flexible working arrangements</li>
                        <li className="flex items-center"><CheckCircle className="text-primary mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" /> Supportive team environment</li>
                      </ul>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                      <Link href="/jobs">
                        <Button 
                          size="lg" 
                          className="modern-button-primary group text-base sm:text-lg px-5 sm:px-7 py-3 sm:py-4 w-full sm:w-auto"
                          data-testid="button-view-jobs"
                        >
                          <Briefcase className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                          <span className="hidden sm:inline">View Open Positions</span>
                          <span className="sm:hidden">View Jobs</span>
                          <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link href="/services">
                        <Button 
                          size="lg" 
                          className="bg-primary text-white hover:bg-primary/90 text-base sm:text-lg px-5 sm:px-7 py-3 sm:py-4 w-full sm:w-auto"
                          data-testid="button-view-services"
                        >
                          View Services
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="relative lg:h-64 w-full">
                    {/* Empty space for layout balance */}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* About Us Hero */}
          <TabsContent value="about-us" className="m-0 h-full">
            <div className="relative min-h-[90vh] flex items-end pb-20" 
                 style={{ 
                   backgroundImage: `url(${aboutUsBackground})`,
                   backgroundSize: 'cover',
                   backgroundPosition: 'center 30%',
                   backgroundRepeat: 'no-repeat'
                 }}
                 data-testid="hero-about-us">
              {/* Color overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 via-slate-700/50 to-slate-600/50"></div>
              {/* Different Background Pattern */}
              <div className="absolute inset-0 overflow-hidden z-10">
                <div className="absolute top-20 right-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-60 h-60 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              </div>
              
              {/* Hero Content */}
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 transform -translate-y-12 lg:-translate-y-20">
                <div className="w-full flex justify-center">
                  {/* About Me Content */}
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 space-y-4 sm:space-y-6 w-full max-w-5xl mx-auto">
                    
                    {/* Personal Story */}
                    <div className="space-y-3 sm:space-y-4">
                      <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed" data-testid="about-me-intro">
                        At Smeaton Healthcare, we are committed to delivering care built on compassion, trust, and excellence. Founded in 2019, our mission has always been simple: to provide the highest quality of care that enables people to live safely, independently, and with dignity in their own homes and communities.
                      </p>
                      
                      <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed" data-testid="about-me-background">
                        We provide a full range of services, from domiciliary and visiting care to live-in care and specialist complex care packages across Devon and Cornwall. Whether supporting someone with daily routines, promoting independence through enablement care, or managing specialist clinical needs, our team is dedicated to making a positive difference every day.
                      </p>

                      <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed" data-testid="about-me-approach">
                        What makes us different is our personal approach. We take time to understand each individual's story, preferences, and aspirations, tailoring care around what matters most to them. Our teams are trained to the highest standards, supported with continuous professional development, and guided by our core values of innovation, community, collaboration, excellence, and leadership.
                      </p>

                      <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed" data-testid="about-me-commitment">
                        As a CQC-registered provider, we are proud to uphold the highest levels of compliance, safety, and accountability. But beyond regulation, we are driven by something deeper – the belief that care should feel personal, respectful, and empowering.
                      </p>

                      <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed" data-testid="about-me-culture">
                        Together, with our dedicated staff, local partners, and the people we support, we are building a culture of care that is professional, compassionate, and truly person-centred.
                      </p>
                    </div>
                    {/* Call to Action */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4 justify-center">
                      <Link href="/contact">
                        <Button 
                          size="lg" 
                          className="modern-button-primary group text-base sm:text-lg px-5 sm:px-6 py-3 w-full sm:w-auto"
                          data-testid="button-get-in-touch"
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Get in Touch
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link href="/jobs">
                        <Button 
                          size="lg" 
                          className="bg-secondary text-white hover:bg-secondary/90 text-base sm:text-lg px-5 sm:px-6 py-3 w-full sm:w-auto"
                          data-testid="button-view-opportunities"
                        >
                          <Briefcase className="mr-2 h-4 w-4" />
                          View Opportunities
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Modern Services Grid */}
      <section className="py-16 bg-white" data-testid="services-overview">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="section-title mb-4 sm:mb-6">
              Our Care Services
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Comprehensive care solutions tailored to your individual needs, 
              delivered with compassion and professional excellence.
            </p>
          </div>
          
          {/* Services Tabs */}
          <Tabs defaultValue={services[0].title.toLowerCase().replace(/[^a-z0-9]/g, '-')} className="mb-12">
            <div className="max-w-7xl mx-auto">
              <TabsList className="flex w-full flex-wrap justify-center gap-1 sm:grid sm:grid-cols-3 lg:grid-cols-5 mb-6 sm:mb-8 bg-slate-100 p-2">
                {services.map((service) => {
                  const IconComponent = service.icon;
                  const slug = service.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
                  return (
                    <TabsTrigger 
                      key={service.title}
                      value={slug}
                      className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4 lg:px-6 py-2 sm:py-3 min-w-max flex-shrink-0 whitespace-nowrap"
                      data-testid={`tab-trigger-${slug}`}
                    >
                      <IconComponent className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden lg:inline">{service.title}</span>
                      <span className="lg:hidden">{service.title.split(' ')[0]}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
            
            {services.map((service) => {
              const IconComponent = service.icon;
              const slug = service.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
              
              // Service-specific detailed information
              const serviceDetails: Record<string, { whatIncludes: string[]; keyPoints: string[] }> = {
                'short-visits': {
                  whatIncludes: ['Personal Care', 'Household Support', 'Companionship', 'Medication'],
                  keyPoints: [
                    'Flexible care visits from 1 hour upwards, shaped around your daily routine',
                    'Consistent, trusted carers who build meaningful relationships',
                    'Compassionate Carers — fully trained, experienced, and DBS-checked'
                  ]
                },
                'supported-living': {
                  whatIncludes: ['Daily Living Support', 'Skills Development', 'Community Integration'],
                  keyPoints: [
                    'Live independently in your own home',
                    'Person-centered care plans designed around your goals',
                    'Build new skills and increase independence over time'
                  ]
                },
                '24-7-care': {
                  whatIncludes: ['Round-the-Clock Care', 'Personal Care', 'Companionship & Activities'],
                  keyPoints: [
                    'Round-the-clock care with immediate assistance available',
                    'Continuous monitoring for safety and security',
                    'Personalised care adapted to specific medical requirements'
                  ]
                },
                'enabling': {
                  whatIncludes: ['Skill Development', 'Confidence Building', 'Community Integration'],
                  keyPoints: [
                    'Support to grow confidence and independence at your own pace',
                    'Learn and strengthen everyday life skills with guidance and encouragement',
                    'Empowering you to make positive changes'
                  ]
                },
                'respite-care': {
                  whatIncludes: ['Short-Term Care', 'Complete Care Support', 'Family Peace of Mind'],
                  keyPoints: [
                    'Professional care from a few hours to several days',
                    'Well-deserved break while your loved one gets expert care',
                    'Flexible options with emergency respite available'
                  ]
                }
              };
              
              const details = serviceDetails[slug] || { whatIncludes: [], keyPoints: [] };
              
              return (
                <TabsContent 
                  key={service.title}
                  value={slug}
                  className="mt-0"
                  data-testid={`tab-content-${slug}`}
                >
                  <div className="max-w-7xl mx-auto">
                    <div 
                      className="group bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 lg:p-10 hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
                      data-testid={`service-card-${slug}`}
                    >
                      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
                        {/* Left Column - Main Info */}
                        <div className="space-y-4 sm:space-y-6">
                          {/* Icon and Title */}
                          <div className="flex items-center gap-3 sm:gap-4 justify-center lg:justify-start">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                              <IconComponent className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-primary" />
                            </div>
                            <h3 
                              className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-300"
                              data-testid={`service-title-${slug}`}
                            >
                              {service.title}
                            </h3>
                          </div>
                          
                          <div className="text-center lg:text-left">
                            <p 
                              className="text-base sm:text-lg text-muted-foreground leading-relaxed"
                              data-testid={`service-description-${slug}`}
                            >
                              {service.description}
                            </p>
                          </div>
                          
                          {/* What's Included */}
                          <div className="space-y-3">
                            <h4 className="text-base sm:text-lg font-semibold text-foreground text-center lg:text-left">We can support with:</h4>
                            <div className="flex flex-wrap sm:flex-nowrap gap-1 sm:gap-2 overflow-x-auto">
                              {details.whatIncludes.map((item: string, index: number) => (
                                <span 
                                  key={index}
                                  className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Right Column - Key Benefits */}
                        <div className="space-y-6">
                          <h4 className="text-lg font-semibold text-foreground text-center lg:text-left">Key Benefits:</h4>
                          <div className="space-y-4">
                            {details.keyPoints.map((point: string, index: number) => (
                              <div key={index} className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <p className="text-muted-foreground leading-relaxed">{point}</p>
                              </div>
                            ))}
                          </div>
                          
                          {/* Read More Button */}
                          <div className="pt-4 text-center lg:text-left">
                            <Link href={service.link}>
                              <Button 
                                size="lg"
                                variant="outline"
                                className="group/btn border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 px-8 py-3"
                                data-testid={`button-read-more-${slug}`}
                              >
                                Read More
                                <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
          
          {/* Call to Action */}
          <div className="text-center">
            <p className="text-xl font-semibold text-slate-700 mb-4">
              Need help finding the right support for you or a loved one?
            </p>
            <p className="text-lg text-muted-foreground mb-12">
              Our team is here to help. Make a referral and someone will be in touch to arrange a free, no obligation assessment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button 
                  size="lg" 
                  className="bg-white text-secondary border-2 border-secondary hover:bg-secondary hover:text-white group"
                  data-testid="button-get-assessment"
                >
                  <Building2 className="mr-2 h-5 w-5" />
                  Make a Referral
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/services">
                <Button 
                  size="lg" 
                  className="bg-secondary text-white hover:bg-secondary/90"
                  data-testid="button-view-all-services"
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  View All Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process Timeline Section */}
      <section className="py-16 bg-slate-50" data-testid="process-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="section-title mb-4 sm:mb-6">
              Our Process
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Our streamlined process ensures you get the right healthcare professionals quickly and efficiently.
            </p>
          </div>
          
          {/* Process Timeline - Mobile Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-6">
            {process.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.step} className="group relative" data-testid={`process-step-${index + 1}`}>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full">
                    {/* Step Number */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                        {step.step}
                      </div>
                      <div className="bg-primary/10 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300" data-testid={`process-title-${index + 1}`}>
                        {step.title}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed" data-testid={`process-description-${index + 1}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Mobile-friendly connector - only show on larger screens between items */}
                  {index < process.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <div className="w-6 h-0.5 bg-primary/30"></div>
                      <div className="w-6 h-0.5 bg-primary/30 mt-1"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Values - Icon Line */}
      <section className="py-16 bg-white" data-testid="values-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="section-title mb-4 sm:mb-6" data-testid="values-title">
              Our Values
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div 
                  key={value.title}
                  className="group relative flex flex-col items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg transition-all duration-300 w-full"
                  tabIndex={0}
                  role="button"
                  aria-label={`${value.title}: ${value.description}`}
                  data-testid={`value-icon-${value.title.toLowerCase()}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      // Optional: Add behavior if needed
                    }
                  }}
                >
                  {/* Grey Box with Icon and Title - Visible by default, hidden on hover */}
                  <div className="group-hover:opacity-0 group-focus:opacity-0 transition-all duration-300 bg-gray-100 rounded-xl p-3 sm:p-4 lg:p-6 flex flex-col items-center w-full aspect-square">
                    {/* Icon Container */}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-full flex items-center justify-center transition-all duration-300 ${value.color === 'blue' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10" />
                    </div>
                    
                    {/* Value Title */}
                    <h3 className="mt-2 sm:mt-3 text-xs sm:text-sm lg:text-base font-semibold text-foreground text-center leading-tight">
                      {value.title}
                    </h3>
                  </div>

                  {/* Description - Hidden by default, visible on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-300 bg-gray-900 text-white rounded-xl p-2 sm:p-3 lg:p-4 flex items-center justify-center w-full aspect-square">
                    <p className="text-xs sm:text-xs lg:text-sm text-center leading-tight">
                      {value.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-16 stats-gradient text-white relative overflow-hidden" data-testid="feedback-section">
        <div className="absolute inset-0 stats-pattern opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Feedback Information */}
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6" data-testid="feedback-title">
                  Your feedback matters
                </h2>
                <p className="text-lg sm:text-xl text-white/90" data-testid="feedback-subtitle">
                  Help us maintain the highest standards of care. Your experiences and insights drive our continuous improvement and ensure we meet CQC requirements for quality healthcare services.
                </p>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="bg-white/20 p-2 sm:p-3 rounded-full flex-shrink-0">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">CQC Compliance</h3>
                    <p className="text-white/90 text-sm">
                      Your feedback helps us demonstrate quality standards and regulatory compliance with the Care Quality Commission.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="bg-white/20 p-2 sm:p-3 rounded-full flex-shrink-0">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">Continuous Improvement</h3>
                    <p className="text-white/90 text-sm">
                      We actively use your feedback to enhance our services and address any areas for improvement.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="bg-white/20 p-2 sm:p-3 rounded-full flex-shrink-0">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">Service Excellence</h3>
                    <p className="text-white/90 text-sm">
                      Your input helps us ensure every service user receives the highest quality care and support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feedback Form */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 lg:p-8 border border-white/20">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" data-testid="feedback-form-title">
                Share Your Experience
              </h3>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input 
                      type="text" 
                      className="w-full p-2 sm:p-3 rounded-md bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base" 
                      placeholder="Your first name"
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full p-2 sm:p-3 rounded-md bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base" 
                      placeholder="Your last name"
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Overall Rating</label>
                  <div className="flex space-x-1" data-testid="rating-overall">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-6 w-6 sm:h-8 sm:w-8 text-white/50 hover:text-white cursor-pointer transition-colors" />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Service Used</label>
                  <select 
                    className="w-full p-2 sm:p-3 rounded-md bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
                    data-testid="select-service"
                  >
                    <option value="">Select a service</option>
                    <option value="care-at-home">Care at Home</option>
                    <option value="temporary-staff">Temporary Staff</option>
                    <option value="permanent-placement">Permanent Placement</option>
                    <option value="domiciliary-care">Domiciliary Care</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Comments</label>
                  <textarea 
                    rows={4}
                    className="w-full p-2 sm:p-3 rounded-md bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base" 
                    placeholder="Tell us about your experience..."
                    data-testid="textarea-comments"
                  ></textarea>
                </div>
                
                <Button 
                  className="w-full bg-white text-primary hover:bg-white/90 font-semibold py-2 sm:py-3 text-sm sm:text-base"
                  data-testid="button-submit-feedback"
                >
                  Submit Feedback
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-slate-50" data-testid="coverage-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="accreditations-modern">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-8 sm:mb-12 text-center" data-testid="accreditations-title">
                CQC Ratings and Reports
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 isolate auto-rows-fr">
                {/* First CQC Widget */}
                <div className="accreditation-badge" data-testid="accreditation-cqc-1">
                  <div id="cqc-widget-container-1" className="relative w-full max-w-[480px] p-4 pb-2 mx-auto">
                  </div>
                </div>

                {/* Second CQC Widget */}
                <div className="accreditation-badge" data-testid="accreditation-cqc-2">
                  <div id="cqc-widget-container-2" className="relative w-full max-w-[480px] p-4 pb-2 mx-auto">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Accreditations */}
      <section className="py-12 bg-white" data-testid="professional-accreditations">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-6 sm:mb-8" data-testid="professional-accreditations-title">
              Professional Accreditations & Approvals
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-center justify-items-center max-w-4xl mx-auto">
              {/* Supported Living Framework */}
              <div className="accreditation-logo" data-testid="supported-living-logo">
                <img 
                  src={supportedLivingLogo} 
                  alt="Supported Living Framework Provider" 
                  className="h-12 sm:h-14 lg:h-16 w-auto mx-auto object-contain"
                />
              </div>
              
              {/* NHS Approved Supplier */}
              <div className="accreditation-logo" data-testid="nhs-supplier-logo">
                <img 
                  src={nhsSupplierLogo} 
                  alt="NHS Approved Supplier" 
                  className="h-12 sm:h-14 lg:h-16 w-auto mx-auto object-contain"
                />
              </div>
              
              {/* PQS Pre-Qualification Scheme */}
              <div className="accreditation-logo" data-testid="pqs-logo">
                <img 
                  src={pqsLogo} 
                  alt="Pre-Qualification Scheme" 
                  className="h-12 sm:h-14 lg:h-16 w-auto mx-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Modern CTA Section */}
      <section className="py-16 bg-white" data-testid="cta-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-container">
            <div className="text-center space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground">
                  Ready to get started?
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                  Whether you or a loved one need care or you are looking for your next opportunity, 
                  we're here to help you succeed.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <Link href="/contact">
                  <Button 
                    size="lg" 
                    className="modern-button-primary group text-base sm:text-lg px-6 sm:px-8 lg:px-10 py-3 sm:py-4 w-full sm:w-auto"
                    data-testid="cta-button-contact"
                  >
                    <Building2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Book Healthcare Staff</span>
                    <span className="sm:hidden">Book Staff</span>
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <Link href="/jobs">
                  <Button 
                    size="lg" 
                    className="bg-secondary text-white hover:bg-secondary/90 group text-base sm:text-lg px-6 sm:px-8 lg:px-10 py-3 sm:py-4 w-full sm:w-auto"
                    data-testid="cta-button-jobs"
                  >
                    <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Make a Referral</span>
                    <span className="sm:hidden">Referral</span>
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}