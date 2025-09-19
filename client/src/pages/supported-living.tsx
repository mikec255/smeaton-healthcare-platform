import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "wouter";
import { Home, Users, Shield, CheckCircle, ArrowRight, Phone, Mail, Heart, Activity, Building, UserCheck, Target, Globe, Award, Lightbulb, Zap, Compass, BookOpen, Star, Clock, HandHeart, Eye, Building2, PoundSterling, FileText, HelpCircle, Info } from "lucide-react";

export default function SupportedLiving() {
  const whatsIncluded = [
    {
      category: "Daily Living Support",
      items: [
        "Personal care and hygiene assistance",
        "Meal planning and preparation support",
        "Medication management and reminders",
        "Household management and maintenance"
      ]
    },
    {
      category: "Life Skills Development", 
      items: [
        "Independent living skills",
        "Financial management support",
        "Community integration activities",
        "Create structure and consistency in day-to-day living"
      ]
    },
    {
      category: "Social & Emotional Support",
      items: [
        "Building social connections and relationships",
        "Emotional support and counselling",
        "Advocacy and representation",
        "Crisis intervention and emergency support"
      ]
    }
  ];

  const benefits = [
    {
      icon: Home,
      title: "Your Own Home",
      description: "Live independently in your own space with the dignity and freedom you deserve"
    },
    {
      icon: Users,
      title: "Personalised Support",
      description: "Tailored care plans designed around your individual goals and preferences"
    },
    {
      icon: Shield,
      title: "24/7 Security",
      description: "Round-the-clock support available whenever you need it for complete peace of mind"
    },
    {
      icon: CheckCircle,
      title: "Goal Achievement",
      description: "Work towards your personal goals with dedicated support to help you succeed"
    }
  ];

  const faqs = [
    {
      question: "What is the difference between supported living and residential care?",
      answer: "Supported living allows you to live in your own home with personalised support, maintaining independence and control over your life. Residential care involves living in a care facility with shared spaces and structured routines."
    },
    {
      question: "How much does supported living cost?",
      answer: "Costs vary depending on your individual support needs and funding eligibility. Many people receive funding through local authorities, NHS continuing healthcare, or direct payments. We can help you understand your funding options."
    },
    {
      question: "Can I choose who provides my support?",
      answer: "Yes, you have control over choosing your support provider and can be involved in selecting your support workers. This helps ensure you're comfortable with the people supporting you."
    },
    {
      question: "What if I need emergency support?",
      answer: "We provide 24/7 emergency support services. You'll have access to our support team around the clock for any urgent needs or emergencies that may arise."
    },
    {
      question: "Can I have friends and family visit?",
      answer: "Absolutely! Living in your own home means you can have visitors whenever you choose. We encourage maintaining relationships with family and friends as part of independent living."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Vibrant Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/90 to-primary"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Independence & Empowerment Icon Patterns - Hidden on mobile for better performance */}
        <div className="absolute inset-0 opacity-10 pointer-events-none hidden md:block">
          {/* Top Row - Independence & Home themed */}
          <Home className="absolute top-16 left-[8%] w-8 h-8 text-white animate-[rollInLeft_5s_ease-out_forwards]" />
          <Building className="absolute top-20 left-[25%] w-6 h-6 text-white rotate-12 animate-[rollInTop_5s_ease-out_forwards]" style={{ animationDelay: '0.2s' }} />
          <UserCheck className="absolute top-12 left-[42%] w-7 h-7 text-white animate-[rollInTop_5s_ease-out_forwards]" style={{ animationDelay: '0.4s' }} />
          <Target className="absolute top-24 left-[58%] w-9 h-9 text-white rotate-45 animate-[rollInTop_5s_ease-out_forwards]" style={{ animationDelay: '0.6s' }} />
          <Globe className="absolute top-16 left-[75%] w-6 h-6 text-white animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '0.8s' }} />
          <Award className="absolute top-32 left-[92%] w-5 h-5 text-white rotate-180 animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '1s' }} />
          
          {/* Upper-Mid Row - Empowerment themed */}
          <Lightbulb className="absolute top-[30%] left-[15%] w-8 h-8 text-white animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '0.3s' }} />
          <Zap className="absolute top-[25%] left-[33%] w-7 h-7 text-white rotate-12 animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '0.7s' }} />
          <Compass className="absolute top-[35%] left-[50%] w-6 h-6 text-white animate-[rollInTop_5s_ease-out_forwards]" style={{ animationDelay: '0.9s' }} />
          <Users className="absolute top-[28%] left-[67%] w-6 h-6 text-white rotate-12 animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '1.1s' }} />
          <Shield className="absolute top-[32%] left-[83%] w-7 h-7 text-white animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '1.3s' }} />
          
          {/* Lower-Mid Row - Community & Skills */}
          <BookOpen className="absolute top-[55%] left-[20%] w-7 h-7 text-white rotate-45 animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '1.1s' }} />
          <Users className="absolute top-[50%] left-[40%] w-8 h-8 text-white animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '1.3s' }} />
          <Shield className="absolute top-[60%] left-[65%] w-6 h-6 text-white rotate-12 animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '1.5s' }} />
          <Clock className="absolute top-[52%] left-[78%] w-7 h-7 text-white rotate-45 animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '0.5s' }} />
          
          {/* Bottom Row - Support & Growth */}
          <Heart className="absolute bottom-20 left-[10%] w-6 h-6 text-white animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '1.7s' }} />
          <Star className="absolute bottom-16 left-[30%] w-7 h-7 text-white rotate-45 animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '1.9s' }} />
          <CheckCircle className="absolute bottom-24 left-[55%] w-8 h-8 text-white animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '2.1s' }} />
          <ArrowRight className="absolute bottom-20 left-[80%] w-6 h-6 text-white rotate-180 animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '2.3s' }} />
          
          {/* Extra Side Icons */}
          <HandHeart className="absolute top-[40%] left-[2%] w-6 h-6 text-white animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '1.7s' }} />
          <Eye className="absolute top-[60%] left-[4%] w-7 h-7 text-white animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '2.1s' }} />
          <Activity className="absolute top-[78%] left-[1%] w-5 h-5 text-white rotate-30 animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '2.9s' }} />
          <UserCheck className="absolute top-[22%] left-[3%] w-6 h-6 text-white animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '1.9s' }} />
          
          <Target className="absolute top-[45%] left-[98%] w-6 h-6 text-white rotate-45 animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '2.3s' }} />
          <Compass className="absolute top-[38%] left-[96%] w-7 h-7 text-white animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '1.1s' }} />
          <Globe className="absolute top-[64%] left-[97%] w-5 h-5 text-white animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '2.7s' }} />
          <Award className="absolute top-[80%] left-[99%] w-6 h-6 text-white rotate-15 animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '3.1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-semibold mb-6" data-testid="service-badge">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                Our Services
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-white mb-6 leading-tight" data-testid="hero-title">
                <span className="block">Supported Living</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed font-medium" data-testid="hero-description">
                Independent living with personalised support tailored to individual needs and preferences.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/referral" data-testid="hero-cta-primary">
                  <Button size="lg" className="bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-xl font-semibold text-lg px-8 py-4">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact" data-testid="hero-cta-secondary">
                  <Button size="lg" className="bg-white text-secondary hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-xl font-semibold text-lg px-8 py-4">
                    <Phone className="mr-2 h-5 w-5" />
                    Speak to Our Team
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative lg:ml-8">
              {/* Floating Cards */}
              <div className="relative">
                {/* Main Stats Card */}
                <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-2xl border-0 transform hover:scale-105 transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="text-center space-y-4">
                      <div className="space-y-1">
                        <div className="text-3xl font-black bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                          24/7
                        </div>
                        <div className="text-muted-foreground font-semibold text-sm">Emergency support available</div>
                      </div>
                      
                      <div className="h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent"></div>
                      
                      <div className="space-y-1">
                        <div className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          Person-Centred
                        </div>
                        <div className="text-muted-foreground font-semibold text-sm">Tailored to your goals</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Floating Feature Cards */}
                <Card className="absolute -top-12 -left-12 p-6 bg-primary text-white shadow-xl border-0 rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-xl font-bold">Your Home</div>
                    <div className="text-base opacity-90">Your Choice</div>
                  </div>
                </Card>
                
                <Card className="absolute -bottom-8 -right-8 p-6 bg-secondary text-white shadow-xl border-0 -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-xl font-bold">Devon &</div>
                    <div className="text-base opacity-90">Cornwall</div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-10 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="whats-included-title">
              Comprehensive Supported Living Services
            </h2>
            <p className="text-xl text-muted-foreground" data-testid="whats-included-subtitle">
              Holistic support designed to promote independence and community integration
            </p>
          </div>

          <Tabs defaultValue="Daily Living Support" className="w-full" data-testid="service-tabs">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {whatsIncluded.map((category) => (
                <TabsTrigger 
                  key={category.category} 
                  value={category.category}
                  data-testid={`tab-${category.category.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {category.category}
                </TabsTrigger>
              ))}
            </TabsList>
            {whatsIncluded.map((category) => (
              <TabsContent key={category.category} value={category.category} className="mt-6">
                <Card>
                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      {category.items.map((item, index) => (
                        <div key={index} className="flex items-start space-x-3" data-testid={`service-item-${index}`}>
                          <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                          <span className="text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="who-its-for-title">
              Who Benefits from Supported Living
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="who-its-for-subtitle">
              Our supported living service empowers people to live independently while providing the right level of support
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "Adults with learning disabilities who want to live independently in their own home",
              "People with physical disabilities seeking personalised support to maintain independence",
              "Individuals with autism who benefit from structured support in their daily routines",
              "Young adults transitioning from family home or residential care to independent living",
              "People with mental health needs who want to build confidence and life skills",
              "Those requiring support to manage their home, finances, and community connections"
            ].map((description, index) => (
              <Card key={index} className="border-l-4 border-l-secondary" data-testid={`target-audience-${index}`}>
                <CardContent className="p-6">
                  <p className="text-foreground leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Care Funding Section */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-muted/30 to-muted/10 border-0 shadow-lg rounded-2xl">
            <CardContent className="p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="funding-title">
                  Understanding Care Funding
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="funding-subtitle">
                  Navigate the different funding options available for your care needs in the UK
                </p>
              </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* NHS Funding */}
            <Card className="border-l-4 border-l-secondary">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-secondary/10 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <Heart className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">NHS Health Funding</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-secondary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">NHS Continuing Healthcare (CHC)</p>
                      <p className="text-muted-foreground text-sm">Free health and social care for complex long-term needs - no means test required</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-secondary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Funded Nursing Care (FNC)</p>
                      <p className="text-muted-foreground text-sm">NHS contribution for nursing home care - paid directly to the care home</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-secondary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">No Financial Assessment</p>
                      <p className="text-muted-foreground text-sm">Eligibility based purely on health needs, not financial situation</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Local Authority Funding */}
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Local Authority Social Care</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <PoundSterling className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Asset Limits (2024-25)</p>
                      <p className="text-muted-foreground text-sm">Upper limit: £23,250 | Lower limit: £14,250 - unchanged since 2010</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Means Testing</p>
                      <p className="text-muted-foreground text-sm">Financial assessment determines your contribution to care costs</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <HelpCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Personal Expenses Allowance</p>
                      <p className="text-muted-foreground text-sm">£30.15 per week retained for personal expenses in 2024-25</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

              {/* Key Differences */}
              <Card className="bg-background border-2 border-dashed border-muted-foreground/30 mt-8">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-foreground mb-6 text-center">Key Funding Differences</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-8 w-8 text-accent" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Eligibility</h4>
                      <p className="text-sm text-muted-foreground">NHS: Health needs only<br/>Council: Care needs + finances</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <PoundSterling className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Cost</h4>
                      <p className="text-sm text-muted-foreground">NHS: Completely free<br/>Council: Means-tested contribution</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <UserCheck className="h-8 w-8 text-secondary" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Assessment</h4>
                      <p className="text-sm text-muted-foreground">NHS: Clinical assessment<br/>Council: Care needs assessment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA for Funding Guidance */}
              <div className="text-center mt-12">
                <p className="text-lg text-muted-foreground mb-6">
                  Important: Funding rules can be complex. We recommend seeking independent financial advice and contacting your local authority for a care needs assessment.
                </p>
                <Link href="/resources/costings" data-testid="funding-cta">
                  <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
                    <FileText className="mr-2 h-5 w-5" />
                    Learn More About Funding
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="benefits-title">
              The Benefits of Supported Living
            </h2>
            <p className="text-xl text-muted-foreground" data-testid="benefits-subtitle">
              Empowering independence while providing the security of professional support
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300" data-testid={`benefit-${index}`}>
                  <CardContent className="p-8">
                    <div className="bg-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="h-8 w-8 text-secondary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-10 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="faqs-title">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground" data-testid="faqs-subtitle">
              Common questions about our supported living services
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full" data-testid="faqs-accordion">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium" data-testid={`faq-question-${index}`}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed" data-testid={`faq-answer-${index}`}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="py-8 bg-white" data-testid="cta-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-container">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
                  Ready to get started?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Whether you or a loved one need care or you are looking for your next opportunity, 
                  we're here to help you succeed.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/contact">
                  <Button 
                    size="lg" 
                    className="modern-button-primary group text-lg px-10 py-4"
                    data-testid="cta-button-contact"
                  >
                    <Building2 className="mr-2 h-5 w-5" />
                    View Vacancies
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <Link href="/jobs">
                  <Button 
                    size="lg" 
                    className="bg-secondary text-white hover:bg-secondary/90 group text-lg px-10 py-4"
                    data-testid="cta-button-jobs"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Make a Referral
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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