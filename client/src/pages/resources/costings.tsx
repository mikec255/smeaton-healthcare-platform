import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  PoundSterling, 
  Heart, 
  Building2, 
  CheckCircle, 
  FileText, 
  HelpCircle, 
  Info, 
  Shield, 
  Clipboard, 
  ArrowRight,
  Phone,
  Mail,
  Calculator,
  Users,
  Target,
  AlertCircle,
  BookOpen
} from "lucide-react";

type FundingItem = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  meta?: { label: string; value: string }[];
};

function FundingItemCard({ item }: { item: FundingItem }) {
  return (
    <div className="bg-muted/40 rounded-lg p-6 space-y-3" data-testid="card-item">
      <div className="flex items-start gap-3">
        {item.icon && <div className="text-primary mt-0.5">{item.icon}</div>}
        <div className="space-y-2">
          <h4 className="font-bold text-foreground" data-testid="item-title">{item.title}</h4>
          <p className="text-muted-foreground text-sm" data-testid="item-description">{item.description}</p>
        </div>
      </div>
      {item.meta?.length ? (
        <div className="grid md:grid-cols-2 gap-4 text-sm" data-testid="item-meta">
          {item.meta.map((m, i) => (
            <div key={i}>
              <span className="font-semibold">{m.label}:</span>
              <p className="text-muted-foreground">{m.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function UnderstandingCareFunding() {
  const fundingThresholds = [
    {
      category: "Self-Funding",
      threshold: "£23,250+",
      description: "Assets above this amount means you pay for all social care yourself",
      color: "border-red-200 bg-red-50",
      iconColor: "text-red-600"
    },
    {
      category: "Partial Funding",
      threshold: "£14,250 - £23,249",
      description: "You may contribute up to £36 per week from your assets towards care costs",
      color: "border-amber-200 bg-amber-50",
      iconColor: "text-amber-600"
    },
    {
      category: "Full Council Funding",
      threshold: "Under £14,250",
      description: "You won't contribute to care costs from your assets (means-tested income contribution may apply)",
      color: "border-green-200 bg-green-50",
      iconColor: "text-green-600"
    }
  ];

  const nhsFundingItems: FundingItem[] = [
    {
      title: "NHS Continuing Healthcare (CHC)",
      description: "Free health and social care for complex long-term needs",
      icon: <Heart className="h-5 w-5" />,
      meta: [
        { label: "Eligibility", value: "Based on clinical assessment - no means test" },
        { label: "Coverage", value: "All care costs covered by NHS" }
      ]
    },
    {
      title: "Funded Nursing Care (FNC)",
      description: "NHS contribution for nursing home care", 
      icon: <Clipboard className="h-5 w-5" />,
      meta: [
        { label: "Eligibility", value: "Assessed nursing needs in a care home" },
        { label: "Coverage", value: "Nursing element paid directly to care home" }
      ]
    },
    {
      title: "NHS-funded assessments",
      description: "Free assessments for potential NHS funding",
      icon: <BookOpen className="h-5 w-5" />,
      meta: [
        { label: "Eligibility", value: "Anyone with complex health needs" },
        { label: "Coverage", value: "Assessment costs covered by NHS" }
      ]
    }
  ];

  const localAuthorityItems: FundingItem[] = [
    {
      title: "Care Assessment Required",
      description: "Must meet national eligibility criteria for care and support needs",
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      title: "Financial Means Test",
      description: "Assets and income assessed against current thresholds",
      icon: <PoundSterling className="h-5 w-5" />
    },
    {
      title: "Personal Budget",
      description: "Allocated funding amount based on assessed needs",
      icon: <Users className="h-5 w-5" />
    },
    {
      title: "Top-up Payments",
      description: "Additional private funding allowed for enhanced care options",
      icon: <Shield className="h-5 w-5" />
    }
  ];

  const applicationSteps = [
    {
      step: 1,
      title: "Contact Your Local Authority",
      description: "Request a care needs assessment from your local council's adult social care team"
    },
    {
      step: 2,
      title: "Care Needs Assessment", 
      description: "Social worker evaluates your care and support needs against national eligibility criteria"
    },
    {
      step: 3,
      title: "Financial Assessment",
      description: "If eligible for care, your finances are assessed to determine your contribution"
    },
    {
      step: 4,
      title: "Care Plan Development",
      description: "A personalized care and support plan is created based on your assessed needs"
    },
    {
      step: 5,
      title: "NHS Assessment (if applicable)",
      description: "Separate assessment for potential NHS Continuing Healthcare or Funded Nursing Care"
    }
  ];

  const faqs = [
    {
      question: "What counts as assets for means testing?",
      answer: "Assets include savings, investments, property (excluding your main home while you live there), and certain insurance policies. Your main home may be included if you move permanently into residential care."
    },
    {
      question: "Can I still get help if I have assets over £23,250?",
      answer: "Yes, you may be eligible for NHS Continuing Healthcare or Funded Nursing Care if you meet the health criteria. You can also request NHS-funded assessments regardless of your financial situation."
    },
    {
      question: "What is the Personal Expenses Allowance?",
      answer: "For 2024-25, this is £30.15 per week that you're allowed to keep for personal expenses if you're in residential care and receiving council funding."
    },
    {
      question: "How often are financial assessments reviewed?",
      answer: "Your financial circumstances are typically reviewed annually, but you should inform the council immediately of any significant changes to your finances."
    },
    {
      question: "Can family members contribute to top-up care costs?",
      answer: "Yes, family members or friends can make additional payments for enhanced care options, but the basic assessed needs must be met by the agreed funding."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/20 via-white to-secondary/15 py-6 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-[1px]" style={{
            background: 'linear-gradient(90deg, #EF2587, #275799, #EF2587)'
          }}>
            <div className="rounded-3xl bg-white/90 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/resources">
              <Button variant="ghost" size="sm" className="hover:bg-white/80 backdrop-blur-sm" data-testid="back-to-resources">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Resources
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm text-primary font-semibold mb-4">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></div>
                  UK Care Funding Guide 2024-25
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold overflow-visible" data-testid="funding-hero-title">
                  <span className="inline-block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent [-webkit-text-fill-color:transparent] leading-[1.1] pb-[0.15em]">
                    Care Funding Information
                  </span>
                </h1>
                
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full lg:mx-0 mx-auto"></div>
                
                <p className="text-lg lg:text-xl text-slate-600 leading-relaxed font-medium max-w-2xl" data-testid="funding-hero-description">
                  We don't provide financial advice, but your local authority can help you understand what funding options may be available. This guide provides general information about care funding in the UK.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://www.gov.uk/find-local-council" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="modern-button-primary hover:scale-105 transition-all duration-300 shadow-xl font-semibold text-lg px-8 py-4">
                    <Building2 className="mr-2 h-5 w-5" />
                    Find Your Local Authority
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href="https://www.nhs.uk/conditions/social-care-and-support-guide/money-work-and-benefits/" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-slate-300 text-slate-600 hover:bg-slate-50 hover:scale-105 transition-all duration-300 shadow-xl font-semibold text-lg px-8 py-4">
                    <FileText className="mr-2 h-5 w-5" />
                    NHS Funding Guide
                  </Button>
                </a>
              </div>
            </div>

            <div className="relative lg:ml-8">
              {/* Modern Stats Card */}
              <Card className="p-8 bg-white shadow-2xl border-0 transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-0">
                  <div className="text-center space-y-6">
                    <div className="space-y-2">
                      <div className="text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        £23,250
                      </div>
                      <div className="text-muted-foreground font-semibold">Current upper asset limit</div>
                    </div>
                    
                    <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                    
                    <div className="space-y-2">
                      <div className="text-4xl font-black bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                        15 years
                      </div>
                      <div className="text-muted-foreground font-semibold">Since limits last increased</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funding Thresholds Section */}
      <section className="py-10 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              2024-25 Funding Thresholds
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Understanding where you fall within the current asset limits determines your contribution to care costs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {fundingThresholds.map((threshold, index) => (
              <Card key={index} className={`${threshold.color} border-2 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <PoundSterling className={`h-8 w-8 ${threshold.iconColor}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">{threshold.category}</h3>
                    <div className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {threshold.threshold}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{threshold.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-amber-50 border border-amber-200 rounded-full">
              <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
              <span className="text-amber-800 font-medium">
                These thresholds have remained unchanged since 2010
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* NHS vs Local Authority Comparison */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              NHS vs Local Authority Funding
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Two distinct funding pathways with different eligibility criteria and coverage
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* NHS Funding */}
            <Card className="border-l-4 border-l-secondary shadow-lg h-full">
              <CardContent className="p-8">
                <div className="flex items-center mb-8">
                  <div className="bg-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mr-6">
                    <Heart className="h-8 w-8 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground">NHS Health Funding</h3>
                    <p className="text-muted-foreground">Based on health needs only</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {nhsFundingItems.map((item, index) => (
                    <FundingItemCard key={index} item={item} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Local Authority Funding */}
            <Card className="border-l-4 border-l-primary shadow-lg h-full">
              <CardContent className="p-8">
                <div className="flex items-center mb-8">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mr-6">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground">Local Authority Social Care</h3>
                    <p className="text-muted-foreground">Means-tested support</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {localAuthorityItems.map((item, index) => (
                    <FundingItemCard key={index} item={item} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Apply Section */}
      <section className="py-10 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              How to Apply for Care Funding
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A step-by-step guide to accessing the right funding for your care needs
            </p>
          </div>

          <div className="space-y-8">
            {applicationSteps.map((step, index) => (
              <div key={step.step} className="flex items-start gap-6">
                <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {step.step}
                </div>
                <Card className="flex-1 shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Common questions about care funding eligibility and processes
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <HelpCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-foreground">{faq.question}</h3>
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Important Disclaimer */}
      <section className="py-8 bg-amber-50 border-y border-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white shadow-lg border border-amber-300">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-8 w-8 text-amber-600 flex-shrink-0 mt-1" />
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-foreground">Important Information</h3>
                  <div className="text-muted-foreground space-y-3 leading-relaxed">
                    <p>
                      Care funding rules can be complex and change over time. This information is based on 
                      current UK legislation for 2024-25 and should be used as a guide only.
                    </p>
                    <p>
                      For personalized advice about your specific situation, we strongly recommend:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Seeking independent financial advice from a qualified advisor</li>
                      <li>Contacting your local authority for a care needs assessment</li>
                      <li>Consulting with legal professionals for complex cases</li>
                      <li>Speaking with Citizens Advice for free guidance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Helpful Resources CTA */}
      <section className="py-10 bg-gradient-to-br from-primary/10 via-white to-secondary/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
                Need Additional Support?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                For specific advice about your situation, contact your local authority or seek independent financial advice from qualified professionals.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a href="https://www.gov.uk/find-local-council" target="_blank" rel="noopener noreferrer">
                <Button 
                  size="lg" 
                  className="modern-button-primary group text-lg px-10 py-4"
                  data-testid="local-authority-button"
                >
                  <Building2 className="mr-2 h-5 w-5" />
                  Find Local Authority
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              
              <a href="https://www.citizensadvice.org.uk/" target="_blank" rel="noopener noreferrer">
                <Button 
                  size="lg" 
                  className="bg-secondary text-white hover:bg-secondary/90 group text-lg px-10 py-4"
                  data-testid="citizens-advice-button"
                >
                  <HelpCircle className="mr-2 h-5 w-5" />
                  Citizens Advice
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}