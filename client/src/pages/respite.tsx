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
import { Clock, Users, Shield, CheckCircle, ArrowRight, Phone, Mail, Heart, Home, Coffee, Calendar, Smile, Building2, PoundSterling, FileText, HelpCircle, Info } from "lucide-react";

export default function RespiteCare() {
  const whatsIncluded = [
    {
      category: "Temporary Relief Care",
      items: [
        "Short-term care from a few hours to several weeks",
        "Qualified and experienced care staff",
        "Personalized care plans for each individual",
        "Emergency respite care when needed"
      ]
    },
    {
      category: "Family Support", 
      items: [
        "Complete break for primary caregivers",
        "Peace of mind knowing loved ones are safe",
        "Opportunity for family time and self-care",
        "Regular updates during respite periods"
      ]
    },
    {
      category: "Flexible Options",
      items: [
        "Day respite care in your home",
        "Overnight and weekend respite",
        "Holiday and vacation coverage",
        "Emergency respite arrangements"
      ]
    }
  ];

  const benefits = [
    {
      icon: Coffee,
      title: "Caregiver Relief",
      description: "Essential breaks for family caregivers to rest, recharge, and attend to personal needs"
    },
    {
      icon: Shield,
      title: "Professional Care",
      description: "Qualified staff provide expert care while maintaining familiar routines and environments"
    },
    {
      icon: Heart,
      title: "Emotional Support",
      description: "Compassionate care that provides comfort and companionship during respite periods"
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Respite care arranged around your schedule, from a few hours to extended periods"
    }
  ];

  const faqs = [
    {
      question: "How long can respite care be arranged for?",
      answer: "Respite care can be arranged from just a few hours up to several weeks, depending on your needs. We offer flexible scheduling including day care, overnight stays, weekends, and extended holiday coverage."
    },
    {
      question: "Can respite care be provided in our own home?",
      answer: "Yes, most of our respite care is provided in your own home environment to maintain familiarity and comfort. This helps reduce stress for both the care recipient and family members."
    },
    {
      question: "What happens if we need emergency respite care?",
      answer: "We understand that emergencies arise. We maintain a network of qualified carers who can provide emergency respite care, often within 24 hours notice, subject to availability."
    },
    {
      question: "Will the same carer provide respite care each time?",
      answer: "We aim to provide consistency by using the same respite carer when possible. This helps build familiarity and trust. However, we also ensure backup carers are familiar with individual care needs."
    },
    {
      question: "What qualifications do respite care staff have?",
      answer: "All respite care staff are fully qualified with relevant healthcare certifications, DBS checks, and insurance. Many have specialized training in areas like dementia care, learning disabilities, or complex medical needs."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Vibrant Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Respite Care Icon Patterns - Hidden on mobile for better performance */}
        <div className="absolute inset-0 opacity-10 pointer-events-none hidden md:block">
          {/* Top Row - Respite & Care themed */}
          <Coffee className="absolute top-16 left-[8%] w-8 h-8 text-white animate-[rollInLeft_5s_ease-out_forwards]" />
          <Heart className="absolute top-20 left-[25%] w-6 h-6 text-white rotate-12 animate-[rollInTop_5s_ease-out_forwards]" style={{ animationDelay: '0.2s' }} />
          <Home className="absolute top-12 left-[42%] w-7 h-7 text-white animate-[rollInTop_5s_ease-out_forwards]" style={{ animationDelay: '0.4s' }} />
          <Calendar className="absolute top-24 left-[58%] w-9 h-9 text-white rotate-45 animate-[rollInTop_5s_ease-out_forwards]" style={{ animationDelay: '0.6s' }} />
          <Shield className="absolute top-16 left-[75%] w-6 h-6 text-white animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '0.8s' }} />
          <Smile className="absolute top-32 left-[92%] w-5 h-5 text-white rotate-180 animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '1s' }} />
          
          {/* Upper-Mid Row - Support themed */}
          <Users className="absolute top-[30%] left-[15%] w-8 h-8 text-white animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '0.3s' }} />
          <Clock className="absolute top-[25%] left-[33%] w-7 h-7 text-white rotate-12 animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '0.7s' }} />
          <Heart className="absolute top-[35%] left-[50%] w-6 h-6 text-white animate-[rollInTop_5s_ease-out_forwards]" style={{ animationDelay: '0.9s' }} />
          <Coffee className="absolute top-[28%] left-[67%] w-6 h-6 text-white rotate-12 animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '1.1s' }} />
          <Calendar className="absolute top-[32%] left-[83%] w-7 h-7 text-white animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '1.3s' }} />
          
          {/* Middle Row - Center distribution */}
          <CheckCircle className="absolute top-[50%] left-[12%] w-6 h-6 text-white animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '1.5s' }} />
          <Smile className="absolute top-[45%] left-[28%] w-5 h-5 text-white animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '1.2s' }} />
          <Home className="absolute top-[55%] left-[45%] w-6 h-6 text-white animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '1.4s' }} />
          <Shield className="absolute top-[50%] left-[62%] w-7 h-7 text-white rotate-45 animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '1.6s' }} />
          <Users className="absolute top-[48%] left-[80%] w-6 h-6 text-white animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '1.8s' }} />
          
          {/* Lower-Mid Row - Wellbeing & Family */}
          <Heart className="absolute top-[65%] left-[18%] w-7 h-7 text-white rotate-45 animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '1.1s' }} />
          <Coffee className="absolute top-[70%] left-[35%] w-8 h-8 text-white animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '1.3s' }} />
          <Calendar className="absolute top-[60%] left-[55%] w-6 h-6 text-white rotate-12 animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '1.5s' }} />
          <Smile className="absolute top-[68%] left-[75%] w-5 h-5 text-white animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '1.7s' }} />
          
          {/* Bottom Row - Care & Support */}
          <Clock className="absolute bottom-20 left-[10%] w-6 h-6 text-white animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '2s' }} />
          <Home className="absolute bottom-16 left-[30%] w-7 h-7 text-white rotate-12 animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '2.2s' }} />
          <Heart className="absolute bottom-24 left-[50%] w-5 h-5 text-white animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '2.4s' }} />
          <Shield className="absolute bottom-20 left-[70%] w-6 h-6 text-white rotate-45 animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '2.6s' }} />
          <Users className="absolute bottom-12 left-[90%] w-8 h-8 text-white animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '2.8s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-semibold mb-6" data-testid="service-badge">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                Our Services
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 leading-tight" data-testid="hero-title">
                <span className="block">Respite Care</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed font-medium" data-testid="hero-description">
                Our Respite service gives families and carers a well-deserved break and peace of mind.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/referral" data-testid="hero-cta-primary">
                  <Button size="lg" className="bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-xl font-semibold text-lg px-8 py-4">
                    Book Your Assessment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact" data-testid="hero-cta-secondary">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-xl font-semibold text-lg px-8 py-4">
                    <Phone className="mr-2 h-5 w-5" />
                    Call Us Today
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative lg:ml-8">
              {/* Main Stats Card - Mobile Responsive */}
              <div className="space-y-6">
                <Card className="p-4 sm:p-6 bg-white/95 backdrop-blur-sm shadow-2xl border-0 transform hover:scale-105 transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="text-center space-y-4">
                      <div className="space-y-1">
                        <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          Hours to Weeks
                        </div>
                        <div className="text-muted-foreground font-semibold text-sm">Flexible respite duration</div>
                      </div>
                      
                      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                      
                      <div className="space-y-1">
                        <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                          24/7 Available
                        </div>
                        <div className="text-muted-foreground font-semibold text-sm">Emergency respite support</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Feature Cards - Stack on mobile, float on desktop */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-0">
                  <Card className="lg:absolute lg:-top-12 lg:-left-12 p-4 sm:p-6 bg-secondary text-white shadow-xl border-0 lg:rotate-3 hover:lg:rotate-0 transition-transform duration-300">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold">Rates from</div>
                      <div className="text-sm sm:text-base opacity-90">£32.00 per hour</div>
                    </div>
                  </Card>
                  
                  <Card className="lg:absolute lg:-bottom-8 lg:-right-8 p-4 sm:p-6 bg-primary text-white shadow-xl border-0 lg:-rotate-3 hover:lg:rotate-0 transition-transform duration-300">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold">Devon &</div>
                      <div className="text-sm sm:text-base opacity-90">Cornwall</div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-10 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="whats-included-title">
              What's Included in Respite Care
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground" data-testid="whats-included-subtitle">
              Comprehensive relief care tailored to your family's needs
            </p>
          </div>

          <Tabs defaultValue="Temporary Relief Care" className="w-full" data-testid="service-tabs">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 mb-8 h-auto">
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
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
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
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="who-its-for-title">
              Who Respite Care Is For
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="who-its-for-subtitle">
              Our respite care service provides essential relief for families and caregivers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "Family caregivers who need a break to rest, recharge, and attend to personal needs",
              "Primary carers looking after loved ones with dementia, disabilities, or chronic conditions",
              "Families going on holiday or attending important events requiring temporary care coverage",
              "Caregivers recovering from illness or dealing with their own health challenges",
              "Family members needing emergency relief care when unexpected situations arise",
              "Those seeking professional support to maintain their loved one's care routine"
            ].map((description, index) => (
              <Card key={index} className="border-l-4 border-l-primary" data-testid={`target-audience-${index}`}>
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
                      <p className="font-semibold text-foreground">Respite Care Support</p>
                      <p className="text-muted-foreground text-sm">NHS funding may cover respite care for those with eligible health needs</p>
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
                      <p className="font-semibold text-foreground">Carers Assessment</p>
                      <p className="text-muted-foreground text-sm">Carers may be entitled to assessment and support, including respite care</p>
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
                      <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <PoundSterling className="h-8 w-8 text-accent" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Costs</h4>
                      <p className="text-sm text-muted-foreground">NHS: Free when eligible<br/>Council: Contribution required</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Info className="h-8 w-8 text-accent" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Assessment</h4>
                      <p className="text-sm text-muted-foreground">NHS: Clinical health review<br/>Council: Care & financial review</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground italic">
                  Important: Care funding can be complex. We recommend seeking independent advice 
                  and contacting your local authority for a care needs assessment.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-10 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="faq-title">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground" data-testid="faq-subtitle">
              Common questions about our respite care services
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-lg border-0 shadow-sm">
                <AccordionTrigger className="px-6 py-4 text-left font-semibold hover:no-underline">
                  <span className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground leading-relaxed">
                  <div className="pl-8">{faq.answer}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 bg-white" data-testid="cta-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-container">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
                  Ready to Arrange Respite Care?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Contact us today to discuss your respite care needs. Our team is here to support both you and your loved ones.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/contact" data-testid="cta-contact">
                  <Button 
                    size="lg" 
                    className="modern-button-primary group text-lg px-10 py-4"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Request Information
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <Link href="/contact" data-testid="cta-phone">
                  <Button 
                    size="lg" 
                    className="bg-secondary text-white hover:bg-secondary/90 group text-lg px-10 py-4"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Call (01752) 123-456
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