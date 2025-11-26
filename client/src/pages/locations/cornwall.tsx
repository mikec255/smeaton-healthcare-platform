import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MapPin, Phone, Clock, Home, Heart, Users, CheckCircle, ArrowRight, Shield, Star, Building2, Stethoscope } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";
import { OrganisationSchema } from "@/components/seo/StructuredData";

export default function CornwallPage() {
  const services = [
    {
      icon: Home,
      title: "Live-in Care",
      description: "Round-the-clock care in your Cornwall home, with a dedicated carer providing continuous support.",
      href: "/services/live-in-care"
    },
    {
      icon: Clock,
      title: "Short Visits",
      description: "Flexible daily visits for personal care, medication support, and companionship across Cornwall.",
      href: "/services/short-visits"
    },
    {
      icon: Heart,
      title: "Respite Care",
      description: "Give family carers a well-deserved break with our professional short-term care services.",
      href: "/services/respite"
    },
    {
      icon: Shield,
      title: "24/7 Care",
      description: "Continuous care for complex needs, with experienced carers available whenever you need them.",
      href: "/services/care-24-7"
    },
    {
      icon: Users,
      title: "Supported Living",
      description: "Helping individuals live independently in their Cornish community with tailored support.",
      href: "/services/supported-living"
    },
    {
      icon: Stethoscope,
      title: "Condition-Led Care",
      description: "Specialist care for dementia, Parkinson's, and other conditions from trained local carers.",
      href: "/services/condition-led-care"
    }
  ];

  const benefits = [
    {
      icon: MapPin,
      title: "County-Wide Coverage",
      description: "From Bude to Land's End, we provide care across Cornwall including rural and coastal communities."
    },
    {
      icon: Star,
      title: "CQC Rated Good",
      description: "We're rated Good by the Care Quality Commission for quality, safety, and effectiveness."
    },
    {
      icon: Users,
      title: "Local Carers",
      description: "Our carers live in Cornwall, so they understand local communities and can respond quickly."
    },
    {
      icon: Building2,
      title: "NHS Approved",
      description: "We're an NHS approved supplier, meeting the highest standards for quality care."
    }
  ];

  const areas = [
    "Truro",
    "Falmouth",
    "Newquay",
    "St Austell",
    "Penzance",
    "Bodmin",
    "Redruth",
    "Camborne",
    "Bude",
    "Helston",
    "St Ives",
    "Launceston"
  ];

  const faqs = [
    {
      question: "Do you provide care in rural parts of Cornwall?",
      answer: "Yes, we understand Cornwall has many rural and coastal communities. Our carers are based across the county, so we can provide care even in more remote locations. We're experienced in supporting people who live outside town centres."
    },
    {
      question: "Which towns in Cornwall do you cover?",
      answer: "We provide home care across Cornwall including Truro, Falmouth, Newquay, St Austell, Penzance, Bodmin, Redruth, Camborne, Bude, Helston, St Ives, Launceston, and the areas in between."
    },
    {
      question: "Is Smeaton Healthcare CQC registered in Cornwall?",
      answer: "Yes, we're CQC registered and rated Good. This means we meet rigorous standards for quality, safety, and care. All our carers are fully trained, DBS-checked, and supervised."
    },
    {
      question: "How much does home care cost in Cornwall?",
      answer: "Costs depend on the type and amount of care you need. We offer competitive rates and will provide a clear, personalised quote after a free assessment. There are no hidden fees."
    },
    {
      question: "Can you help with hospital discharge in Cornwall?",
      answer: "Yes, we can arrange care quickly to help you return home safely from hospital. We work with hospital discharge teams to ensure everything is in place for your return home."
    }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="cornwall-location-page">
      <PageSEO
        title="Home Care in Cornwall - Quality Care Services | Smeaton Healthcare"
        description="Professional home care services across Cornwall. Live-in care, short visits, respite care and 24/7 support. CQC rated Good. Trusted local carers in Truro, Falmouth, Newquay, Penzance and across Cornwall."
        keywords={[
          "home care Cornwall",
          "homecare in Cornwall",
          "care services Cornwall",
          "live-in care Cornwall",
          "domiciliary care Cornwall",
          "carers in Cornwall",
          "elderly care Cornwall",
          "respite care Cornwall",
          "Cornwall care agency"
        ]}
        canonicalUrl="https://www.smeatonhealthcare.co.uk/locations/cornwall"
      />
      
      <OrganisationSchema
        name="Smeaton Healthcare Cornwall"
        description="Professional home care services across Cornwall. CQC rated Good. Providing live-in care, short visits, respite care and 24/7 support throughout Cornwall."
        url="https://www.smeatonhealthcare.co.uk/locations/cornwall"
        address={{
          addressRegion: "Cornwall",
          addressCountry: "GB"
        }}
      />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary"></div>
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-semibold mb-6">
                <MapPin className="w-4 h-4 mr-2" />
                Cornwall
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                Home Care in Cornwall
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                From the tip of Land's End to the Tamar, we provide compassionate home care 
                across Cornwall. Our local carers understand what makes Cornish communities 
                special, delivering care that helps you stay independent at home.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/referral">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-xl font-semibold text-lg px-8 py-4 w-full sm:w-auto">
                    Book Free Assessment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold text-lg px-8 py-4 w-full sm:w-auto">
                    <Phone className="mr-2 h-5 w-5" />
                    Call Us Today
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-2xl border-0">
                <CardContent className="p-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="text-3xl font-bold text-primary">Good</div>
                      <div className="text-sm text-muted-foreground">CQC Rating</div>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="text-3xl font-bold text-primary">24/7</div>
                      <div className="text-sm text-muted-foreground">Care Available</div>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="text-3xl font-bold text-primary">Local</div>
                      <div className="text-sm text-muted-foreground">Cornwall Team</div>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="text-3xl font-bold text-primary">NHS</div>
                      <div className="text-sm text-muted-foreground">Approved</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Our Care Services Across Cornwall</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From daily visits to live-in care, we provide flexible support tailored to your needs. 
              All our services are delivered by trained, local carers who know Cornwall.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <Link href={service.href}>
                      <Button variant="link" className="p-0 h-auto gap-1 text-primary">
                        Find out more <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Location Link */}
      <section className="py-8 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground mb-4">Looking for care in a specific area?</p>
          <Link href="/locations/truro">
            <Button variant="outline" className="gap-2">
              <MapPin className="h-4 w-4" />
              View Truro & Mid Cornwall
            </Button>
          </Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Why Families in Cornwall Choose Us</h2>
              <p className="text-lg text-muted-foreground mb-8">
                We understand what makes Cornwall special — and what makes caring for people here 
                different. Our team knows the local communities, from busy towns to quiet coastal 
                villages, and we're committed to providing care that makes a real difference.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Towns We Cover
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {areas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{area}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-6 pt-6 border-t">
                We cover most of Cornwall including rural areas. Contact us to confirm.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Common Questions About Care in Cornwall</h2>
            <p className="text-lg text-muted-foreground">
              Here are answers to the questions we hear most often from families across Cornwall.
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-lg shadow-sm border px-6">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Talk About Care?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Whether you're exploring options for yourself or a loved one, we're here to help. 
            Book a free assessment and let's discuss how we can support you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/referral">
              <Button size="lg" variant="secondary" className="font-semibold text-lg px-8">
                Book Free Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold text-lg px-8">
                <Phone className="mr-2 h-5 w-5" />
                Call Us Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
