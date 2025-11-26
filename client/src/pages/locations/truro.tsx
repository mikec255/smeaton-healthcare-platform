import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin, Phone, Clock, Home, Heart, Users, CheckCircle, ArrowRight } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";
import { OrganisationSchema } from "@/components/seo/StructuredData";

export default function TruroPage() {
  const services = [
    {
      title: "Live-in Care",
      description: "24/7 live-in care in Truro and across Cornwall, providing continuous support in your own home.",
      href: "/services/live-in-care"
    },
    {
      title: "Short Visits",
      description: "Daily care visits for personal care, medication, and companionship across Truro and Mid Cornwall.",
      href: "/services/short-visits"
    },
    {
      title: "Respite Care",
      description: "Short-term care to give family carers in Truro and Cornwall a much-needed break.",
      href: "/services/respite"
    },
    {
      title: "24/7 Care",
      description: "Round-the-clock care for complex needs with experienced Truro-based carers.",
      href: "/services/care-24-7"
    },
    {
      title: "Supported Living",
      description: "Supporting independent living in the Truro community with personalised care packages.",
      href: "/services/supported-living"
    },
    {
      title: "Condition-Led Care",
      description: "Specialist dementia, Parkinson's and stroke care from trained Cornwall carers.",
      href: "/services/condition-led-care"
    }
  ];

  const areas = [
    "Truro City Centre",
    "Threemilestone",
    "Chacewater",
    "Perranporth",
    "St Agnes",
    "Redruth",
    "Falmouth",
    "Penryn",
    "St Austell",
    "Newquay"
  ];

  return (
    <div data-testid="truro-location-page">
      <PageSEO
        title="Homecare in Truro - Quality Home Care Services in Cornwall | Smeaton Healthcare"
        description="Professional home care services in Truro and Cornwall. Live-in care, short visits, respite care and 24/7 support. CQC rated Good. Trusted local carers serving Truro, Falmouth, Redruth and across Cornwall."
        keywords={[
          "homecare in Truro",
          "home care Truro",
          "care services Truro",
          "live-in care Truro",
          "domiciliary care Truro",
          "carers in Truro",
          "elderly care Truro",
          "respite care Truro",
          "Cornwall care agency",
          "home help Truro",
          "care services Cornwall"
        ]}
        canonicalUrl="https://www.smeatonhealthcare.co.uk/locations/truro"
      />
      
      <OrganisationSchema
        name="Smeaton Healthcare Truro"
        description="Professional home care services in Truro and Cornwall. CQC rated Good. Providing live-in care, short visits, respite care and 24/7 support across Cornwall."
        url="https://www.smeatonhealthcare.co.uk/locations/truro"
        address={{
          addressLocality: "Truro",
          addressRegion: "Cornwall",
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
              <span className="text-lg font-medium">Truro, Cornwall</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4" data-testid="truro-hero-title">
              Homecare in Truro
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mb-8" data-testid="truro-hero-subtitle">
              Compassionate home care services across Truro and Cornwall. Our CQC-rated Good team delivers personalised care that helps you maintain your independence at home.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <Button size="lg" className="gap-2" data-testid="truro-contact-btn">
                  <Phone className="h-5 w-5" />
                  Get in Touch
                </Button>
              </Link>
              <Link href="/referral">
                <Button size="lg" variant="outline" className="gap-2" data-testid="truro-referral-btn">
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
              <div className="text-sm text-muted-foreground">Cornwall-Based Team</div>
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
            <h2 className="text-3xl font-bold mb-4">Our Home Care Services in Truro</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From daily visits to live-in care, we provide flexible care solutions across Truro and Cornwall tailored to your needs.
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
              <h2 className="text-3xl font-bold mb-6">Why Choose Smeaton Healthcare in Truro?</h2>
              <div className="space-y-4">
                {[
                  "Local Cornwall-based care team who understand rural communities",
                  "CQC rated Good for quality, safety, and effectiveness",
                  "Flexible care from 1-hour visits to 24/7 live-in care",
                  "Fully trained, DBS-checked carers with local knowledge",
                  "NHS approved supplier serving Cornwall",
                  "No long-term contracts - adaptable care packages",
                  "Free home assessments across Truro and Cornwall"
                ].map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-primary/5 rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-4">Areas We Cover Around Truro</h3>
              <div className="grid grid-cols-2 gap-2">
                {areas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{area}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                We cover most of Cornwall. Contact us to check your area.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Home Care in Truro or Cornwall?</h2>
          <p className="text-lg opacity-90 mb-8">
            Our friendly team is ready to discuss your care needs. Get in touch for a free, 
            no-obligation conversation about how we can support you or your loved one.
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
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions About Home Care in Truro</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">How much does home care cost in Truro?</h3>
              <p className="text-muted-foreground">
                Home care costs in Truro depend on the type and amount of support you need. We offer 
                competitive rates for everything from short visits to live-in care. Contact us for a 
                personalised quote.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Do you provide care in rural Cornwall areas?</h3>
              <p className="text-muted-foreground">
                Yes, we understand Cornwall's rural communities have unique needs. We provide care 
                across Truro, Falmouth, Redruth, St Austell, Newquay, and many rural areas in between.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Is Smeaton Healthcare CQC registered in Cornwall?</h3>
              <p className="text-muted-foreground">
                Yes, Smeaton Healthcare Cornwall is CQC registered and rated Good. We maintain high 
                standards of care with fully trained and supervised carers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I arrange care quickly in Cornwall?</h3>
              <p className="text-muted-foreground">
                We understand care needs can be urgent. Contact our Cornwall team and we'll work to 
                arrange care as quickly as possible, including same-day starts where we can.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
