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

export default function PlymouthPage() {
  const services = [
    {
      icon: Home,
      title: "Live-in Care",
      description: "Round-the-clock care in the comfort of your Plymouth home, providing complete peace of mind for you and your family.",
      href: "/services/live-in-care"
    },
    {
      icon: Clock,
      title: "Short Visits",
      description: "Flexible daily visits for personal care, medication support, and companionship across Plymouth and surrounding areas.",
      href: "/services/short-visits"
    },
    {
      icon: Heart,
      title: "Respite Care",
      description: "Give family carers in Plymouth a well-deserved break with our professional short-term care services.",
      href: "/services/respite"
    },
    {
      icon: Shield,
      title: "24/7 Care",
      description: "Continuous care and support for complex needs, with experienced carers available day and night.",
      href: "/services/care-24-7"
    },
    {
      icon: Users,
      title: "Supported Living",
      description: "Helping individuals live independently in their Plymouth community with tailored support packages.",
      href: "/services/supported-living"
    },
    {
      icon: Stethoscope,
      title: "Condition-Led Care",
      description: "Specialist care for dementia, Parkinson's, and other conditions from trained Plymouth-based carers.",
      href: "/services/condition-led-care"
    }
  ];

  const benefits = [
    {
      icon: MapPin,
      title: "Local Plymouth Team",
      description: "Our carers live and work in Plymouth, so they understand the local community and can respond quickly to your needs."
    },
    {
      icon: Star,
      title: "CQC Rated Good",
      description: "We're proud to be rated Good by the Care Quality Commission for the quality and safety of our care services."
    },
    {
      icon: Users,
      title: "Consistent Carers",
      description: "We match you with regular carers who get to know you, building trust and meaningful relationships over time."
    },
    {
      icon: Building2,
      title: "NHS Approved",
      description: "We're an NHS approved supplier and Supported Living Framework provider, meeting the highest standards."
    }
  ];

  const areas = [
    "Plymouth City Centre",
    "Plympton",
    "Plymstock",
    "Mutley",
    "Devonport",
    "Stonehouse",
    "Crownhill",
    "Derriford",
    "Saltash",
    "Ivybridge"
  ];

  const faqs = [
    {
      question: "How much does home care cost in Plymouth?",
      answer: "Home care costs depend on the level of support you need. We offer flexible packages from short visits starting at competitive hourly rates, through to comprehensive live-in care. We'll provide a clear, personalised quote after understanding your specific requirements during a free assessment."
    },
    {
      question: "What areas of Plymouth do you cover?",
      answer: "We provide home care services across Plymouth including the city centre, Plympton, Plymstock, Mutley, Devonport, Stonehouse, Crownhill, and Derriford. We also cover nearby areas like Saltash and Ivybridge. If you're unsure whether we cover your area, just give us a call."
    },
    {
      question: "Are your Plymouth carers qualified and checked?",
      answer: "Absolutely. All our carers are fully trained, DBS-checked, and supervised by experienced care managers. We're CQC registered and rated Good, which means we meet rigorous standards for quality and safety."
    },
    {
      question: "How quickly can you arrange care in Plymouth?",
      answer: "We understand that care needs can arise suddenly. In many cases, we can arrange an assessment within 24-48 hours and start care shortly after. For urgent situations, we'll always do our best to help as quickly as possible."
    },
    {
      question: "Can I meet my carer before they start?",
      answer: "Yes, we encourage this. Meeting your carer beforehand helps build confidence and ensures you're comfortable with the person who'll be supporting you. We take great care in matching carers to clients based on personality and preferences."
    }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="plymouth-location-page">
      <PageSEO
        title="Home Care in Plymouth - Quality Care Services | Smeaton Healthcare"
        description="Professional home care services in Plymouth. Live-in care, short visits, respite care and 24/7 support. CQC rated Good. Trusted local carers serving Plymouth, Plympton, Plymstock and surrounding areas."
        keywords={[
          "home care Plymouth",
          "homecare in Plymouth",
          "care services Plymouth",
          "live-in care Plymouth",
          "domiciliary care Plymouth",
          "carers in Plymouth",
          "elderly care Plymouth",
          "respite care Plymouth",
          "Plymouth care agency"
        ]}
        canonicalUrl="https://www.smeatonhealthcare.co.uk/locations/plymouth"
      />
      
      <OrganisationSchema
        name="Smeaton Healthcare Plymouth"
        description="Professional home care services in Plymouth. CQC rated Good. Providing live-in care, short visits, respite care and 24/7 support across Plymouth and South Devon."
        url="https://www.smeatonhealthcare.co.uk/locations/plymouth"
        telephone="+44 1752 241655"
        address={{
          streetAddress: "5 Devonport Road",
          addressLocality: "Plymouth",
          addressRegion: "Devon",
          postalCode: "PL3 4DJ",
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
                Plymouth, Devon
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                Home Care in Plymouth
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                Compassionate, professional care services delivered by local carers who understand Plymouth. 
                Whether you need daily visits or round-the-clock support, we're here to help you live 
                independently in the comfort of your own home.
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
                      <div className="text-sm text-muted-foreground">Plymouth Team</div>
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
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Our Care Services in Plymouth</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From daily visits to live-in care, we provide flexible support tailored to your needs. 
              All our services are delivered by trained, local carers.
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

      {/* Why Choose Us */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Families in Plymouth Choose Us</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're not just a care agency — we're part of the Plymouth community. Our local team 
              understands what matters to families here, and we're committed to providing care 
              that makes a real difference.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold mb-6 flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Areas We Cover
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {areas.map((area, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-6 pt-6 border-t text-center">
              Not sure if we cover your area? Give us a call and we'll let you know.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Common Questions About Care in Plymouth</h2>
            <p className="text-lg text-muted-foreground">
              Here are answers to the questions we hear most often from Plymouth families.
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
            Book a free, no-obligation assessment and let's discuss how we can support you.
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
