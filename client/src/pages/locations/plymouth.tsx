import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin, Phone, Clock, Home, Heart, Users, CheckCircle, ArrowRight } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";
import { OrganisationSchema } from "@/components/seo/StructuredData";

export default function PlymouthPage() {
  const services = [
    {
      title: "Live-in Care",
      description: "Round-the-clock care in the comfort of your Plymouth home, providing complete peace of mind for you and your family.",
      href: "/services/live-in-care"
    },
    {
      title: "Short Visits",
      description: "Flexible daily visits for personal care, medication support, and companionship across Plymouth and surrounding areas.",
      href: "/services/short-visits"
    },
    {
      title: "Respite Care",
      description: "Give family carers in Plymouth a well-deserved break with our professional short-term care services.",
      href: "/services/respite"
    },
    {
      title: "24/7 Care",
      description: "Continuous care and support for complex needs, with experienced carers available day and night in Plymouth.",
      href: "/services/care-24-7"
    },
    {
      title: "Supported Living",
      description: "Helping individuals live independently in their Plymouth community with tailored support packages.",
      href: "/services/supported-living"
    },
    {
      title: "Condition-Led Care",
      description: "Specialist care for dementia, Parkinson's, and other conditions from trained Plymouth-based carers.",
      href: "/services/condition-led-care"
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
    "Saltash (nearby)",
    "Ivybridge (nearby)"
  ];

  return (
    <div data-testid="plymouth-location-page">
      <PageSEO
        title="Homecare in Plymouth - Quality Home Care Services | Smeaton Healthcare"
        description="Professional home care services in Plymouth. Live-in care, short visits, respite care and 24/7 support. CQC rated Good. Trusted local carers serving Plymouth, Plympton, Plymstock and surrounding areas."
        keywords={[
          "homecare in Plymouth",
          "home care Plymouth",
          "care services Plymouth",
          "live-in care Plymouth",
          "domiciliary care Plymouth",
          "carers in Plymouth",
          "elderly care Plymouth",
          "respite care Plymouth",
          "Plymouth care agency",
          "home help Plymouth"
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
      <section className="relative min-h-[35vh] overflow-hidden bg-gradient-to-r from-primary/10 via-background to-secondary/10">
        <div className="relative min-h-[35vh] flex items-center">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
            <div className="flex items-center gap-2 text-primary mb-4">
              <MapPin className="h-5 w-5" />
              <span className="text-lg font-medium">Plymouth, Devon</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4" data-testid="plymouth-hero-title">
              Homecare in Plymouth
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mb-8" data-testid="plymouth-hero-subtitle">
              Trusted, compassionate home care services across Plymouth and South Devon. Our CQC-rated Good team provides personalised care that helps you stay independent in your own home.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <Button size="lg" className="gap-2" data-testid="plymouth-contact-btn">
                  <Phone className="h-5 w-5" />
                  Get in Touch
                </Button>
              </Link>
              <Link href="/referral">
                <Button size="lg" variant="outline" className="gap-2" data-testid="plymouth-referral-btn">
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
              <div className="text-sm text-muted-foreground">Plymouth-Based Team</div>
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
            <h2 className="text-3xl font-bold mb-4">Our Home Care Services in Plymouth</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From short daily visits to round-the-clock live-in care, we provide flexible care solutions tailored to your needs in Plymouth.
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
              <h2 className="text-3xl font-bold mb-6">Why Choose Smeaton Healthcare in Plymouth?</h2>
              <div className="space-y-4">
                {[
                  "Local Plymouth-based care team who know the community",
                  "CQC rated Good for safety, effectiveness, and care",
                  "Flexible care packages from 1 hour to 24/7 live-in care",
                  "Fully trained, DBS-checked, and experienced carers",
                  "NHS approved supplier and Supported Living Framework provider",
                  "No long-term contracts - care that adapts to your needs",
                  "Free, no-obligation care assessments in your home"
                ].map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-primary/5 rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-4">Areas We Cover in Plymouth</h3>
              <div className="grid grid-cols-2 gap-2">
                {areas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{area}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Don't see your area? Contact us - we may still be able to help.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Discuss Your Care Needs?</h2>
          <p className="text-lg opacity-90 mb-8">
            Whether you need care for yourself or a loved one in Plymouth, our friendly team is here to help. 
            Get in touch for a free, no-obligation chat about how we can support you.
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

      {/* FAQ Section for SEO */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions About Home Care in Plymouth</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">How much does home care cost in Plymouth?</h3>
              <p className="text-muted-foreground">
                Home care costs in Plymouth vary depending on the level of support needed. We offer flexible packages 
                from short visits starting at competitive rates to comprehensive live-in care. Contact us for a 
                personalised quote based on your specific needs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">What areas of Plymouth do you cover?</h3>
              <p className="text-muted-foreground">
                We provide home care services across Plymouth including the city centre, Plympton, Plymstock, 
                Mutley, Devonport, Stonehouse, Crownhill, and Derriford. We also cover nearby areas like 
                Saltash and Ivybridge.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Are your Plymouth carers CQC registered?</h3>
              <p className="text-muted-foreground">
                Yes, Smeaton Healthcare Plymouth is CQC registered and rated Good. All our carers are fully 
                trained, DBS-checked, and supervised by experienced care managers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Can you provide emergency or urgent care in Plymouth?</h3>
              <p className="text-muted-foreground">
                Yes, we understand that care needs can arise suddenly. Contact our Plymouth team and we'll do 
                our best to arrange care quickly, including same-day starts where possible.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
