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
import { Home, Heart, UserCheck, CheckCircle, ArrowRight, Phone, Mail, Shield, Clock, Bed, Coffee, Utensils, Pill, Book, Music, Flower, Sun, Moon, Star, Palette, TreePine, Building2, Users, PoundSterling, FileText, HelpCircle, Info, Clipboard } from "lucide-react";

export default function LiveInCare() {
  const whatsIncluded = [
    {
      category: "Comprehensive Home Care",
      items: [
        "24/7 live-in carer residing in your home",
        "Assistance with Personal Care",
        "Medication management and administration", 
        "Meal planning, preparation and assistance",
        "Light housekeeping and domestic tasks",
        "Companionship and social interaction"
      ]
    },
    {
      category: "Health & Wellbeing Support", 
      items: [
        "Health monitoring and condition management",
        "Assistance with mobility and transfers",
        "Appointment coordination and accompaniment",
        "Emergency response and care coordination",
        "Communication with family and healthcare providers",
        "Condition led care"
      ]
    },
    {
      category: "Lifestyle & Independence",
      items: [
        "Maintaining familiar routines and environment",
        "Support with hobbies and personal interests",
        "Social activities and community engagement",
        "Support to arrange transportation",
        "Emotional support and mental wellbeing",
        "Flexible care that adapts to changing needs"
      ]
    }
  ];

  const benefits = [
    {
      icon: Home,
      title: "Stay Home Comfortably",
      description: "Remain in the familiar, comfortable environment you love with professional care support"
    },
    {
      icon: Heart,
      title: "One-to-One Care",
      description: "Dedicated carer focused entirely on your individual needs and preferences"
    },
    {
      icon: Clock,
      title: "24/7 Peace of Mind",
      description: "Round-the-clock presence ensures immediate assistance whenever needed"
    },
    {
      icon: Shield,
      title: "Family Reassurance",
      description: "Regular updates and communication give families confidence in care quality"
    }
  ];

  const faqs = [
    {
      question: "How do you match carers to individual needs and preferences?",
      answer: "We carefully assess your care requirements, personality, and lifestyle preferences to match you with a compatible carer. We consider factors like interests, background, and care experience to ensure the best possible fit."
    },
    {
      question: "What happens if the live-in carer needs time off?",
      answer: "We provide relief carers to ensure continuity of care. Our team coordinates seamlessly to maintain your routine and care standards even during carer holidays or sick leave."
    },
    {
      question: "Can live-in care accommodate complex medical needs?",
      answer: "Yes, our carers are trained to support various medical conditions including dementia, diabetes, mobility issues, and post-surgical recovery. We work closely with healthcare professionals to ensure comprehensive care."
    },
    {
      question: "How much notice do you need to arrange live-in care?",
      answer: "While we recommend 1-2 weeks notice for planned care, we understand urgent situations arise. We do our best to arrange emergency live-in care within 24-48 hours when possible."
    },
    {
      question: "What are the accommodation requirements for live-in carers?",
      answer: "The carer needs a private bedroom and access to kitchen and bathroom facilities. We'll discuss the specific arrangements during our assessment to ensure both comfort and privacy are maintained."
    },
    {
      question: "Can Smeaton Healthcare provide live-in care if I'm not close to your office location?",
      answer: "Yes, absolutely. We provide live-in care services throughout Devon and Cornwall, regardless of your distance from our main office. Our experienced carers are strategically located across the region, allowing us to serve clients in rural and remote areas as effectively as those in town centres. We believe everyone deserves access to quality care in their own home, no matter where they live."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Home & Comfort Theme */}
      <section className="relative py-20 lg:py-32 overflow-hidden isolate">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20"></div>
        </div>

        {/* Animated Background Icons - Hidden on mobile for better performance */}
        <div className="absolute inset-0 opacity-10 pointer-events-none z-0 hidden md:block">
          {/* Top Row - Home & Comfort themed */}
          <Home className="absolute top-16 left-[8%] w-8 h-8 text-white animate-[rollInLeft_5s_ease-out_forwards]" />
          <Heart className="absolute top-20 left-[25%] w-7 h-7 text-white rotate-12 animate-[rollInTop_5s_ease-out_forwards]" style={{ animationDelay: '0.2s' }} />
          <Coffee className="absolute top-12 left-[42%] w-8 h-8 text-white animate-[rollInTop_5s_ease-out_forwards]" style={{ animationDelay: '0.4s' }} />
          <Shield className="absolute top-24 left-[58%] w-9 h-9 text-white rotate-45 animate-[rollInTop_5s_ease-out_forwards]" style={{ animationDelay: '0.6s' }} />
          <Sun className="absolute top-16 left-[75%] w-7 h-7 text-white animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '0.8s' }} />
          <Flower className="absolute top-32 left-[92%] w-6 h-6 text-white rotate-180 animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '1s' }} />
          
          {/* Middle Row - Care & Daily Life themed */}
          <Bed className="absolute top-40 left-[5%] w-6 h-6 text-white -rotate-45 animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '1.2s' }} />
          <Utensils className="absolute top-48 left-[22%] w-8 h-8 text-white animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '1.4s' }} />
          <Pill className="absolute top-36 left-[38%] w-7 h-7 text-white rotate-90 animate-[rollInTop_5s_ease-out_forwards]" style={{ animationDelay: '1.6s' }} />
          <Book className="absolute top-52 left-[55%] w-6 h-6 text-white animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '1.8s' }} />
          <Music className="absolute top-44 left-[72%] w-8 h-8 text-white rotate-12 animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '2s' }} />
          <Palette className="absolute top-36 left-[88%] w-7 h-7 text-white animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '2.2s' }} />
          
          {/* Bottom Row - Comfort & Serenity themed */}
          <Moon className="absolute top-64 left-[12%] w-8 h-8 text-white rotate-12 animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '2.4s' }} />
          <TreePine className="absolute top-68 left-[28%] w-6 h-6 text-white -rotate-12 animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '2.6s' }} />
          <Star className="absolute top-60 left-[45%] w-7 h-7 text-white rotate-45 animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '2.8s' }} />
          <Coffee className="absolute top-72 left-[62%] w-6 h-6 text-white animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '3s' }} />
          <Home className="absolute top-66 left-[78%] w-8 h-8 text-white rotate-180 animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '3.2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-semibold mb-6" data-testid="service-badge">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                Our Services
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 leading-tight" data-testid="hero-title">
                <span className="block">Live-In Care</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed font-medium" data-testid="hero-description">
                Experience the comfort and security of having a dedicated carer living in your home, 
                providing 24/7 support while you maintain your independence and familiar routines.
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
                          24/7 Care
                        </div>
                        <div className="text-muted-foreground font-semibold text-sm">Live-in support at home</div>
                      </div>
                      
                      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                      
                      <div className="space-y-1">
                        <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                          Your Home
                        </div>
                        <div className="text-muted-foreground font-semibold text-sm">Stay in familiar surroundings</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Feature Cards - Stack on mobile, float on desktop */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-0">
                  <Card className="lg:absolute lg:-top-12 lg:-left-12 p-4 sm:p-6 bg-secondary text-white shadow-xl border-0 lg:rotate-3 hover:lg:rotate-0 transition-transform duration-300">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold">Rates from</div>
                      <div className="text-sm sm:text-base opacity-90">£185 per day</div>
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="whats-included-title">
              What Live-In Care Includes
            </h2>
            <p className="text-xl text-muted-foreground" data-testid="whats-included-subtitle">
              Comprehensive care and support in the comfort and familiarity of your own home
            </p>
          </div>

          <Tabs defaultValue="Comprehensive Home Care" className="w-full" data-testid="service-tabs">
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="who-its-for-title">
              Who Benefits from Live-In Care
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="who-its-for-subtitle">
              Live-in care provides the perfect solution for those who want to maintain independence at home
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "Adults who want to age in place with dignity and independence",
              "Individuals recovering from surgery, illness, or hospital stays",
              "People with dementia who benefit from familiar environments",
              "Those with mobility challenges or chronic health conditions",
              "Adults who need ongoing support but prefer not to move to care facilities",
              "Families seeking comprehensive care without disrupting home life"
            ].map((description, index) => (
              <Card key={index} className="border-l-4 border-l-primary" data-testid={`target-audience-${index}`}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Home className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-foreground leading-relaxed text-center">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="benefits-title">
              Benefits of Live-In Care
            </h2>
            <p className="text-xl text-muted-foreground" data-testid="benefits-subtitle">
              Experience the advantages of professional care in the comfort of your own home
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="text-center" data-testid={`benefit-${index}`}>
                  <CardContent className="p-8">
                    <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="h-8 w-8 text-primary" />
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
                      <p className="font-semibold text-foreground">Direct Payments</p>
                      <p className="text-muted-foreground text-sm">Funding to arrange your own care and support services</p>
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
                        <Clipboard className="h-8 w-8 text-accent" />
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

      {/* FAQs Section */}
      <section className="py-10 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="faqs-title">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground" data-testid="faqs-subtitle">
              Understanding how live-in care works and what to expect
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

      {/* CTA Section */}
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