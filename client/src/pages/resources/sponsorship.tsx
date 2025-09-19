import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap, Star, CheckCircle, Users } from "lucide-react";

export default function Sponsorship() {

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-primary/20 via-white to-secondary/15 py-12 overflow-hidden">
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
              
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <div className="inline-block">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4 mx-auto shadow-lg">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="py-4">
                    <h1 className="text-4xl lg:text-5xl font-bold overflow-visible" data-testid="sponsorship-title">
                      <span className="inline-block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent [-webkit-text-fill-color:transparent] leading-[1.1] pb-[0.15em]">
                        Skilled Worker Sponsorship
                      </span>
                    </h1>
                  </div>
                  <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto"></div>
                </div>
                <p className="text-lg lg:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium" data-testid="sponsorship-description">
                  At Smeaton Healthcare, we are proud to be a licensed sponsor under the Skilled Worker Health and Social Care route. 
                  This means we can offer eligible overseas applicants the opportunity to join our dedicated care teams here in the UK.
                </p>
                
                {/* Hero Icons & Stats */}
                <div className="flex flex-wrap justify-center items-center gap-8 mt-8 text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Licensed Sponsor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Users className="h-5 w-5 text-secondary" />
                    </div>
                    <span className="text-sm font-medium">Care Teams</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Fair Recruitment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-secondary" />
                    </div>
                    <span className="text-sm font-medium">Full Support</span>
                  </div>
                </div>
              </div>
            </div> {/* close white card */}
          </div> {/* close gradient border */}
        </div> {/* close container */}
      </section>

      {/* High Volume Notice */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8" data-testid="sponsorship-notice">
            <div className="space-y-6">
              <p className="text-foreground leading-relaxed">
                Due to the very high number of sponsorship enquiries we have received, it has become difficult to respond to everyone individually. Please note that we are unable to take telephone enquiries regarding sponsorship.
              </p>
              <p className="text-foreground leading-relaxed">
                You are welcome to email us at <strong><a href="mailto:sponsorship@smeatonhealthcare.co.uk" className="text-red-600 hover:text-red-800 underline">sponsorship@smeatonhealthcare.co.uk</a></strong>; however, we cannot guarantee a response at this time.
              </p>
              <p className="text-foreground leading-relaxed">
                Sponsorship opportunities may only be considered after successful completion of probation, and are never guaranteed. All sponsorships are subject to UKVI/Home Office requirements and Smeaton Healthcare's business needs.
              </p>
              <p className="text-foreground leading-relaxed font-medium">
                Thank you for your understanding and cooperation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is the Skilled Worker Route */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What is the Skilled Worker Route?</h2>
            <p className="text-xl text-muted-foreground">
              The Skilled Worker route allows overseas candidates to apply for a visa to work in the UK, provided they meet Home Office criteria.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-foreground mb-6">In health and social care, this includes roles such as:</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">Care Workers</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary/5 rounded-xl">
                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Star className="h-5 w-5 text-secondary" />
                </div>
                <span className="font-medium text-foreground">Senior Care Workers</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">Homecare Support Staff</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What We Offer</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4 p-6 rounded-2xl border border-slate-200">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground">Genuine Employment</h3>
              <p className="text-muted-foreground text-sm">A permanent job with fair pay and conditions.</p>
            </div>
            <div className="text-center space-y-4 p-6 rounded-2xl border border-slate-200">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground">Training & Development</h3>
              <p className="text-muted-foreground text-sm">Full induction, ongoing training, and support.</p>
            </div>
            <div className="text-center space-y-4 p-6 rounded-2xl border border-slate-200">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Star className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground">Career Progression</h3>
              <p className="text-muted-foreground text-sm">Opportunities to grow within the care sector.</p>
            </div>
            <div className="text-center space-y-4 p-6 rounded-2xl border border-slate-200">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground">Support in the UK</h3>
              <p className="text-muted-foreground text-sm">Guidance as you settle into work and life here.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Important Information */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Important Information</h2>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <p className="text-foreground leading-relaxed">
                  Sponsorship is only available for roles approved under the Skilled Worker Health and Social Care route.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <p className="text-foreground leading-relaxed">
                  All applicants must meet UKVI requirements, including English language and eligibility checks.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <p className="text-foreground leading-relaxed">
                  <strong>Sponsorships are never guaranteed.</strong> While Smeaton Healthcare has sponsored workers in the past and will continue to do so for the right candidates, each decision is based on performance, compliance, and business needs.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <p className="text-foreground leading-relaxed">
                  Immigration rules can change, and all offers remain subject to Home Office approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency & Fair Recruitment */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Transparency & Fair Recruitment</h2>
            <p className="text-xl text-muted-foreground">
              Smeaton Healthcare is committed to ethical recruitment.
            </p>
          </div>
          
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground text-center">No Recruitment Fees</h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  Do not charge recruitment fees to applicants.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Star className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground text-center">Fair Consideration</h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  Consider all applications fairly, in line with UK employment law and Home Office guidance.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground text-center">Clear Information</h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  Provide clear information about the Skilled Worker route so applicants can make informed decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application CTA */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Ready to Join Our UK Care Teams?
              </h2>
              <p className="text-xl text-muted-foreground">
                Explore opportunities with Smeaton Healthcare and take the next step in your healthcare career in the UK.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/jobs">
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="view-positions-button"
                >
                  View Available Positions
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-secondary text-secondary hover:bg-secondary/10"
                  data-testid="contact-sponsorship-button"
                >
                  Contact Us About Sponsorship
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}