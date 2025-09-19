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
import { Clock, Users, Shield, CheckCircle, ArrowRight, Phone, Mail, Heart, Home, Activity, Stethoscope, Pill, HandHeart, UserCheck, Thermometer, Clipboard, Eye, Building2, PoundSterling, FileText, HelpCircle, Info } from "lucide-react";

export default function ShortVisits() {
  const whatsIncluded = [
    {
      category: "Personal Care",
      items: [
        "Assistance with washing and bathing",
        "Help with dressing and grooming",
        "Medication reminders and support",
        "Support with mobility and transfers"
      ]
    },
    {
      category: "Household Support", 
      items: [
        "Light housekeeping and cleaning",
        "Meal preparation and cooking",
        "Shopping and errands",
        "Laundry and ironing assistance"
      ]
    },
    {
      category: "Companionship",
      items: [
        "Social interaction and conversation",
        "Emotional support and encouragement",
        "Accompanying to appointments",
        "Engaging in hobbies and activities"
      ]
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Visits scheduled around your routine and preferences, from 1 hour to several hours"
    },
    {
      icon: Users,
      title: "Consistent Carers",
      description: "The comfort of familiar faces - consistent, trusted carers who build meaningful relationships"
    },
    {
      icon: Shield,
      title: "Peace of Mind",
      description: "Fully trained, DBS-checked, and insured care professionals you can trust"
    },
    {
      icon: CheckCircle,
      title: "Independent Living",
      description: "Maintain independence and dignity while receiving the support you need"
    }
  ];

  const faqs = [
    {
      question: "How often can I have short visits?",
      answer: "Short visits can be arranged as frequently as needed - from once a week to multiple times daily. We work with you to create a schedule that meets your specific needs and preferences."
    },
    {
      question: "What is the minimum duration for a visit?",
      answer: "Our minimum visit duration is 1 hour, though most clients find 1-2 hour visits work best for their needs. We can arrange longer visits if required."
    },
    {
      question: "Can the same carer visit me each time?",
      answer: "We always aim to provide the same trusted carers so you can build comfort, trust, and meaningful relationships. While there may occasionally be times when a different carer visits, due to things like absence or change, you can be assured that every member of our team is trained to the same high standards and will deliver the same level of compassionate care."
    },
    {
      question: "How quickly can care start?",
      answer: "We can often arrange care to start within 24-48 hours of your initial assessment. Emergency care can sometimes be arranged more quickly depending on availability."
    },
    {
      question: "Do you provide care at weekends and evenings?",
      answer: "Yes, our short visit service is available 7 days a week, including evenings and weekends. We understand that care needs don't follow a 9-5 schedule."
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
        
        {/* Care-Related Icon Patterns - Hidden on mobile for better performance */}
        <div className="absolute inset-0 opacity-10 pointer-events-none hidden md:block">
          {/* Top Row - Even distribution across width */}
          <Heart className="absolute top-16 left-[8%] w-8 h-8 text-white animate-[rollInLeft_5s_ease-out_forwards]" />
          <Stethoscope className="absolute top-20 left-[25%] w-6 h-6 text-white rotate-12 animate-[rollInTop_5s_ease-out_forwards]" style={{ animationDelay: '0.2s' }} />
          <Home className="absolute top-12 left-[42%] w-7 h-7 text-white animate-[rollInTop_5s_ease-out_forwards]" style={{ animationDelay: '0.4s' }} />
          <HandHeart className="absolute top-24 left-[58%] w-9 h-9 text-white rotate-45 animate-[rollInTop_5s_ease-out_forwards]" style={{ animationDelay: '0.6s' }} />
          <Activity className="absolute top-16 left-[75%] w-6 h-6 text-white animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '0.8s' }} />
          <Pill className="absolute top-32 left-[92%] w-5 h-5 text-white rotate-180 animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '1s' }} />
          
          {/* Upper-Mid Row - Offset positioning */}
          <UserCheck className="absolute top-[30%] left-[15%] w-8 h-8 text-white animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '0.3s' }} />
          <Thermometer className="absolute top-[25%] left-[33%] w-7 h-7 text-white rotate-12 animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '0.7s' }} />
          <Eye className="absolute top-[35%] left-[50%] w-6 h-6 text-white animate-[rollInTop_5s_ease-out_forwards]" style={{ animationDelay: '0.9s' }} />
          <Users className="absolute top-[28%] left-[67%] w-6 h-6 text-white rotate-12 animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '1.1s' }} />
          <Shield className="absolute top-[32%] left-[83%] w-7 h-7 text-white animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '1.3s' }} />
          
          {/* Middle Row - Center distribution */}
          <CheckCircle className="absolute top-[50%] left-[12%] w-6 h-6 text-white animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '1.5s' }} />
          <Clock className="absolute top-[45%] left-[28%] w-5 h-5 text-white animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '1.2s' }} />
          <Heart className="absolute top-[55%] left-[45%] w-6 h-6 text-white animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '1.4s' }} />
          <Stethoscope className="absolute top-[48%] left-[62%] w-5 h-5 text-white rotate-45 animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '2s' }} />
          <Clipboard className="absolute top-[52%] left-[78%] w-7 h-7 text-white rotate-45 animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '0.5s' }} />
          
          {/* Lower-Mid Row - Even spacing */}
          <HandHeart className="absolute top-[68%] left-[18%] w-6 h-6 text-white animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '2.2s' }} />
          <Pill className="absolute top-[72%] left-[35%] w-8 h-8 text-white rotate-90 animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '2.4s' }} />
          <Thermometer className="absolute top-[65%] left-[52%] w-6 h-6 text-white animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '2.6s' }} />
          <UserCheck className="absolute top-[70%] left-[68%] w-7 h-7 text-white rotate-30 animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '2.8s' }} />
          <Eye className="absolute top-[75%] left-[85%] w-5 h-5 text-white animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '3s' }} />
          
          {/* Bottom Row - Final distribution */}
          <Users className="absolute top-[85%] left-[10%] w-8 h-8 text-white rotate-12 animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '3.2s' }} />
          <Shield className="absolute top-[88%] left-[27%] w-6 h-6 text-white animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '3.4s' }} />
          <Clock className="absolute top-[82%] left-[44%] w-7 h-7 text-white rotate-45 animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '3.6s' }} />
          <Activity className="absolute top-[90%] left-[61%] w-7 h-7 text-white animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '1.8s' }} />
          <Home className="absolute top-[86%] left-[78%] w-8 h-8 text-white animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '1.6s' }} />
          <CheckCircle className="absolute top-[92%] left-[95%] w-6 h-6 text-white animate-[rollInBottom_5s_ease-out_forwards]" style={{ animationDelay: '4s' }} />
          
          {/* Extra Side Icons - Left Edge */}
          <Thermometer className="absolute top-[40%] left-[2%] w-6 h-6 text-white animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '1.7s' }} />
          <Heart className="absolute top-[60%] left-[4%] w-7 h-7 text-white animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '2.1s' }} />
          <Stethoscope className="absolute top-[78%] left-[1%] w-5 h-5 text-white rotate-30 animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '2.9s' }} />
          <UserCheck className="absolute top-[22%] left-[3%] w-6 h-6 text-white animate-[rollInLeft_5s_ease-out_forwards]" style={{ animationDelay: '1.9s' }} />
          
          {/* Extra Side Icons - Right Edge */}
          <Pill className="absolute top-[45%] left-[98%] w-6 h-6 text-white rotate-45 animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '2.3s' }} />
          <Eye className="absolute top-[38%] left-[96%] w-7 h-7 text-white animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '1.1s' }} />
          <HandHeart className="absolute top-[64%] left-[97%] w-5 h-5 text-white animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '2.7s' }} />
          <Clipboard className="absolute top-[80%] left-[99%] w-6 h-6 text-white rotate-15 animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '3.1s' }} />
          <Users className="absolute top-[26%] left-[97%] w-6 h-6 text-white animate-[rollInRight_5s_ease-out_forwards]" style={{ animationDelay: '3.3s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-semibold mb-6" data-testid="service-badge">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                Our Services
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 leading-tight" data-testid="hero-title">
                <span className="block">Short Visit Care</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed font-medium" data-testid="hero-description">
                Personalised short visit care for everyday support and companionship — helping you stay independent in the comfort of your own home.
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
                          1 - 4 hours
                        </div>
                        <div className="text-muted-foreground font-semibold text-sm">Flexible visit duration</div>
                      </div>
                      
                      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                      
                      <div className="space-y-1">
                        <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                          7 days a week
                        </div>
                        <div className="text-muted-foreground font-semibold text-sm">Including evenings & weekends</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Feature Cards - Stack on mobile, float on desktop */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-0">
                  <Card className="lg:absolute lg:-top-12 lg:-left-12 p-4 sm:p-6 bg-secondary text-white shadow-xl border-0 lg:rotate-3 hover:lg:rotate-0 transition-transform duration-300">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold">Rates from</div>
                      <div className="text-sm sm:text-base opacity-90">£28.00 per hour</div>
                    </div>
                  </Card>
                  
                  <Card className="lg:absolute lg:-bottom-8 lg:-right-8 p-4 sm:p-6 bg-primary text-white shadow-xl border-0 lg:-rotate-3 hover:lg:rotate-0 transition-transform duration-300">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold">Plymouth</div>
                      <div className="text-sm sm:text-base opacity-90">only</div>
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
              What's Included in Short Visits
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground" data-testid="whats-included-subtitle">
              Comprehensive support tailored to your individual needs
            </p>
          </div>

          <Tabs defaultValue="Personal Care" className="w-full" data-testid="service-tabs">
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
              Who Short Visits Are For
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="who-its-for-subtitle">
              Our short visit care service is designed to support independence while providing essential assistance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "Adults who need assistance with daily activities but want to maintain independence",
              "People recovering from illness, injury, or hospital stays requiring temporary support",
              "Individuals with disabilities who need help with specific tasks throughout the day",
              "Elderly people who live alone and need regular check-ins and assistance",
              "Those with chronic conditions requiring medication support and monitoring",
              "Family members seeking reliable support for their loved ones' daily care needs"
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
                      <p className="text-sm text-muted-foreground">NHS: Clinical assessment<br/>Council: Care & financial review</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground italic">
                  Important: Funding rules can be complex. We recommend seeking independent financial advice 
                  and contacting your local authority for a care needs assessment.
                </p>
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
              Benefits of Short Visit Care
            </h2>
            <p className="text-xl text-muted-foreground" data-testid="benefits-subtitle">
              Professional care that adapts to your lifestyle and needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-lg" data-testid={`benefit-${index}`}>
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

      {/* FAQs Section */}
      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="faqs-title">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground" data-testid="faqs-subtitle">
              Get answers to common questions about our short visit care service
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