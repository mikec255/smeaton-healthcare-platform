import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin, Phone, Clock, Home, Heart, Users, CheckCircle, ArrowRight } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";
import { OrganisationSchema } from "@/components/seo/StructuredData";

export default function ExeterPage() {
  const services = [
    {
      title: "Live-in Care",
      description: "Round-the-clock live-in care in Exeter, providing continuous support and companionship at home.",
      href: "/services/live-in-care"
    },
    {
      title: "Short Visits",
      description: "Flexible daily care visits for personal care, medication support, and companionship across Exeter.",
      href: "/services/short-visits"
    },
    {
      title: "Respite Care",
      description: "Give family carers in Exeter a well-deserved break with professional respite care.",
      href: "/services/respite"
    },
    {
      title: "24/7 Care",
      description: "Continuous care for complex needs with experienced carers available day and night in Exeter.",
      href: "/services/care-24-7"
    },
    {
      title: "Supported Living",
      description: "Supporting independent living in Exeter with tailored care and support packages.",
      href: "/services/supported-living"
    },
    {
      title: "Condition-Led Care",
      description: "Specialist care for dementia, Parkinson's, and other conditions from trained Exeter carers.",
      href: "/services/condition-led-care"
    }
  ];

  const areas = [
    "Exeter City Centre",
    "St Thomas",
    "Heavitree",
    "Pinhoe",
    "Topsham",
    "Exwick",
    "Alphington",
    "Countess Wear",
    "Crediton (nearby)",
    "Dawlish (nearby)"
  ];

  return (
    <div data-testid="exeter-location-page">
      <PageSEO
        title="Homecare in Exeter - Quality Home Care Services | Smeaton Healthcare"
        description="Professional home care services in Exeter. Live-in care, short visits, respite care and 24/7 support. CQC rated Good. Trusted local carers serving Exeter, Topsham, Heavitree and East Devon."
        keywords={[
          "homecare in Exeter",
          "home care Exeter",
          "care services Exeter",
          "live-in care Exeter",
          "domiciliary care Exeter",
          "carers in Exeter",
          "elderly care Exeter",
          "respite care Exeter",
          "Exeter care agency",
          "home help Exeter",
          "East Devon care services"
        ]}
        canonicalUrl="https://www.smeatonhealthcare.co.uk/locations/exeter"
      />
      
      <OrganisationSchema
        name="Smeaton Healthcare Exeter"
        description="Professional home care services in Exeter and East Devon. CQC rated Good. Providing live-in care, short visits, respite care and 24/7 support."
        url="https://www.smeatonhealthcare.co.uk/locations/exeter"
        address={{
          addressLocality: "Exeter",
          addressRegion: "Devon",
          addressCountry: "GB"
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-[35vh] overflow-hidden bg-gradient-to-r from-primary/10 via-background to-secondary/10">
        <div className="relative min-h-[35vh] flex items-center">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
            <div className="flex items-center gap-2 text-primary mb-4">
              <MapPin className="h-5 w-5" />
              <span className="text-lg font-medium">Exeter, Devon</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4" data-testid="exeter-hero-title">
              Homecare in Exeter
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mb-8" data-testid="exeter-hero-subtitle">
              Quality home care services across Exeter and East Devon. Our CQC-rated Good team provides compassionate, personalised care to help you live independently at home.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <Button size="lg" className="gap-2" data-testid="exeter-contact-btn">
                  <Phone className="h-5 w-5" />
                  Get in Touch
                </Button>
              </Link>
              <Link href="/referral">
                <Button size="lg" variant="outline" className="gap-2" data-testid="exeter-referral-btn">
                  Make a Referral
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-muted/50 py-8 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">Good</div>
              <div className="text-sm text-muted-foreground">CQC Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Care Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">Local</div>
              <div className="text-sm text-muted-foreground">Devon-Based Team</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">NHS</div>
              <div className="text-sm text-muted-foreground">Approved Supplier</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Home Care Services in Exeter</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Flexible care solutions from daily visits to round-the-clock support, tailored to your needs in Exeter and East Devon.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <Link href={service.href}>
                    <Button variant="link" className="p-0 h-auto gap-1">
                      Learn more <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose Smeaton Healthcare in Exeter?</h2>
              <div className="space-y-4">
                {[
                  "Local Devon-based care team with Exeter knowledge",
                  "CQC rated Good for quality, safety, and care",
                  "Flexible packages from short visits to live-in care",
                  "Fully trained, DBS-checked, experienced carers",
                  "NHS approved supplier in Devon",
                  "No long-term contracts - care that adapts to you",
                  "Free, no-obligation care assessments in Exeter"
                ].map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-primary/5 rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-4">Areas We Cover Around Exeter</h3>
              <div className="grid grid-cols-2 gap-2">
                {areas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{area}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                We cover Exeter and much of East Devon. Contact us to confirm.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Looking for Home Care in Exeter?</h2>
          <p className="text-lg opacity-90 mb-8">
            Our friendly team is here to help. Get in touch for a free, no-obligation 
            conversation about how we can support you or your loved one in Exeter.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="gap-2">
                <Phone className="h-5 w-5" />
                Contact Us Today
              </Button>
            </Link>
            <Link href="/referral">
              <Button size="lg" variant="outline" className="gap-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Make a Referral
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions About Home Care in Exeter</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">What home care services do you offer in Exeter?</h3>
              <p className="text-muted-foreground">
                We provide a full range of home care services in Exeter including short visits, live-in care, 
                respite care, 24/7 care, supported living, and specialist condition-led care for dementia and 
                other health conditions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">How quickly can you start care in Exeter?</h3>
              <p className="text-muted-foreground">
                We understand care needs can be urgent. Contact our team and we'll arrange a care assessment 
                as soon as possible, with same-day starts available in some cases.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Do you cover areas outside Exeter city centre?</h3>
              <p className="text-muted-foreground">
                Yes, we provide care across Exeter and the surrounding East Devon area including Topsham, 
                Heavitree, Pinhoe, Crediton, and Dawlish. Contact us to confirm coverage in your area.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Are your Exeter carers qualified?</h3>
              <p className="text-muted-foreground">
                All our Exeter carers are fully trained, DBS-checked, and supervised. We're CQC registered 
                and rated Good, maintaining high standards across all our care services.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
