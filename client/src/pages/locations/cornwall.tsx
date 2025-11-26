import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin, Phone, Clock, Home, Heart, Users, CheckCircle, ArrowRight } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";
import { OrganisationSchema } from "@/components/seo/StructuredData";

export default function CornwallPage() {
  const services = [
    {
      title: "Live-in Care",
      description: "24/7 live-in care across Cornwall, providing continuous support and companionship in your own home.",
      href: "/services/live-in-care"
    },
    {
      title: "Short Visits",
      description: "Flexible daily care visits for personal care, medication, and companionship throughout Cornwall.",
      href: "/services/short-visits"
    },
    {
      title: "Respite Care",
      description: "Give family carers across Cornwall a well-deserved break with professional respite care.",
      href: "/services/respite"
    },
    {
      title: "24/7 Care",
      description: "Round-the-clock care for complex needs with experienced Cornwall-based carers.",
      href: "/services/care-24-7"
    },
    {
      title: "Supported Living",
      description: "Supporting independent living across Cornish communities with personalised care packages.",
      href: "/services/supported-living"
    },
    {
      title: "Condition-Led Care",
      description: "Specialist dementia, Parkinson's and stroke care from trained carers across Cornwall.",
      href: "/services/condition-led-care"
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

  return (
    <div data-testid="cornwall-location-page">
      <PageSEO
        title="Homecare in Cornwall - Quality Home Care Services | Smeaton Healthcare"
        description="Professional home care services across Cornwall. Live-in care, short visits, respite care and 24/7 support. CQC rated Good. Trusted local carers in Truro, Falmouth, Newquay, St Austell, Penzance and across Cornwall."
        keywords={[
          "homecare in Cornwall",
          "home care Cornwall",
          "care services Cornwall",
          "live-in care Cornwall",
          "domiciliary care Cornwall",
          "carers in Cornwall",
          "elderly care Cornwall",
          "respite care Cornwall",
          "Cornwall care agency",
          "home help Cornwall",
          "Truro care services",
          "Falmouth home care",
          "Newquay care agency"
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
      <section className="relative min-h-[35vh] overflow-hidden bg-gradient-to-r from-primary/10 via-background to-secondary/10">
        <div className="relative min-h-[35vh] flex items-center">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
            <div className="flex items-center gap-2 text-primary mb-4">
              <MapPin className="h-5 w-5" />
              <span className="text-lg font-medium">Cornwall</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4" data-testid="cornwall-hero-title">
              Homecare in Cornwall
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mb-8" data-testid="cornwall-hero-subtitle">
              Compassionate home care services across Cornwall. Our CQC-rated Good team understands the unique needs of Cornish communities, delivering personalised care that helps you stay independent at home.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <Button size="lg" className="gap-2" data-testid="cornwall-contact-btn">
                  <Phone className="h-5 w-5" />
                  Get in Touch
                </Button>
              </Link>
              <Link href="/referral">
                <Button size="lg" variant="outline" className="gap-2" data-testid="cornwall-referral-btn">
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
            <h2 className="text-3xl font-bold mb-4">Our Home Care Services Across Cornwall</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From daily visits to live-in care, we provide flexible care solutions tailored to your needs throughout Cornwall.
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
              <h2 className="text-3xl font-bold mb-6">Why Choose Smeaton Healthcare in Cornwall?</h2>
              <div className="space-y-4">
                {[
                  "Local Cornwall-based team who understand rural and coastal communities",
                  "CQC rated Good for quality, safety, and effectiveness",
                  "Flexible care from 1-hour visits to 24/7 live-in care",
                  "Fully trained, DBS-checked carers with local knowledge",
                  "NHS approved supplier serving all of Cornwall",
                  "No long-term contracts - care that adapts to your needs",
                  "Free home assessments anywhere in Cornwall"
                ].map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-primary/5 rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-4">Towns We Cover in Cornwall</h3>
              <div className="grid grid-cols-2 gap-2">
                {areas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{area}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                We cover most of Cornwall including rural areas. Contact us to confirm.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Home Care in Cornwall?</h2>
          <p className="text-lg opacity-90 mb-8">
            From the tip of Land's End to the Tamar, our friendly team provides quality care across Cornwall. 
            Get in touch for a free, no-obligation chat about your care needs.
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
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions About Home Care in Cornwall</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Do you provide care in rural Cornwall?</h3>
              <p className="text-muted-foreground">
                Yes, we understand Cornwall has many rural communities with unique care needs. Our local team 
                provides care across the county, including remote villages and coastal areas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Which Cornwall towns do you cover?</h3>
              <p className="text-muted-foreground">
                We provide home care across Cornwall including Truro, Falmouth, Newquay, St Austell, Penzance, 
                Bodmin, Redruth, Camborne, Bude, Helston, St Ives, Launceston, and surrounding areas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Is Smeaton Healthcare CQC registered in Cornwall?</h3>
              <p className="text-muted-foreground">
                Yes, Smeaton Healthcare Cornwall is CQC registered and rated Good. We maintain high standards 
                with fully trained and supervised carers across the county.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">How much does home care cost in Cornwall?</h3>
              <p className="text-muted-foreground">
                Costs depend on the type and level of care needed. We offer competitive rates for short visits, 
                live-in care, and all services in between. Contact us for a personalised quote.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
