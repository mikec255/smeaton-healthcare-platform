import { useEffect } from "react";
import { Link } from "wouter";
import Seo from "@/components/seo";
import { PoundSterling, Heart, Building2, FileText, HelpCircle, Clipboard, ArrowRight, Phone, AlertCircle, BookOpen } from "lucide-react";
import Ticker from "@/components/layout/ticker";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const THRESHOLDS = [
  { category: "Self-Funding", threshold: "£23,250+", description: "Assets above this amount means you pay for all social care yourself.", color: "#fef2f2", border: "#fca5a5" },
  { category: "Partial Funding", threshold: "£14,250 – £23,249", description: "You may contribute up to £36 per week from your assets towards care costs.", color: "#fffbeb", border: "#fcd34d" },
  { category: "Full Council Funding", threshold: "Under £14,250", description: "You won't contribute from your assets (means-tested income contribution may still apply).", color: "#f0fdf4", border: "#86efac" },
];

const NHS_FUNDING = [
  { title: "NHS Continuing Healthcare (CHC)", desc: "Free health and social care for complex long-term needs. Based on clinical assessment — no means test.", icon: Heart },
  { title: "Funded Nursing Care (FNC)", desc: "NHS contribution towards nursing home care. NHS pays the nursing element directly.", icon: Clipboard },
  { title: "NHS-Funded Assessments", desc: "Free assessments for anyone with complex health needs who may be eligible for NHS funding.", icon: BookOpen },
];

const LA_STEPS = [
  { step: 1, title: "Contact Your Local Authority", desc: "Request a care needs assessment from your local council's adult social care team." },
  { step: 2, title: "Care Needs Assessment", desc: "Social worker evaluates your care and support needs against national eligibility criteria." },
  { step: 3, title: "Financial Assessment", desc: "If eligible for care, your finances are assessed to determine your contribution." },
  { step: 4, title: "Care Plan Development", desc: "A personalised care and support plan is created based on your assessed needs." },
  { step: 5, title: "NHS Assessment (if applicable)", desc: "Separate assessment for potential NHS Continuing Healthcare or Funded Nursing Care." },
];

const FAQS = [
  { q: "What counts as assets for means testing?", a: "Assets include savings, investments, property (excluding your main home while you live there), and certain insurance policies. Your main home may be included if you move permanently into residential care." },
  { q: "Can I still get help if I have assets over £23,250?", a: "Yes — you may be eligible for NHS Continuing Healthcare or Funded Nursing Care if you meet the health criteria. You can also request NHS-funded assessments regardless of your financial situation." },
  { q: "What is the Personal Expenses Allowance?", a: "For 2024-25, this is £30.15 per week that you're allowed to keep for personal expenses if you're in residential care and receiving council funding." },
  { q: "How often are financial assessments reviewed?", a: "Your financial circumstances are typically reviewed annually, but you should inform the council immediately of any significant changes." },
  { q: "Can family members contribute to top-up care costs?", a: "Yes — family members or friends can make additional payments for enhanced care options, but the basic assessed needs must be met by the agreed funding." },
];

export default function UnderstandingCareFunding() {

  return (
    <div data-testid="costings-page">
      <Seo title="Care Funding & Costs Guide Devon & Cornwall" description="Understand how to fund home care in Devon and Cornwall — council funding, self-funding and NHS continuing healthcare explained. Free guide from Smeaton Healthcare." path="/resources/costings" />
      <Ticker />

      {/* HERO */}
      <section style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-8 sm:pt-14 sm:pb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>UK Care Funding Guide 2024–25</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-1 tracking-tight" style={{ color: BLUE }}>Understanding</h1>
          <div className="mb-4" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>care funding.</div>
          <p className="text-gray-500 text-base max-w-2xl leading-relaxed" data-testid="funding-hero-description">
            We don't provide financial advice, but this guide explains the main funding options available for care in the UK. Your local authority can help with your specific situation.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <a href="https://www.gov.uk/find-local-council" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 text-white font-bold rounded-xl hover:scale-105 transition-all text-sm" style={{ backgroundColor: PINK }}>
              <Building2 size={15} /> Find Your Local Authority <ArrowRight size={14} />
            </a>
            <a href="https://www.nhs.uk/conditions/social-care-and-support-guide/money-work-and-benefits/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 font-bold rounded-xl hover:bg-black/5 transition-all border-2 text-sm" style={{ color: NAVY, borderColor: "rgba(5,22,61,0.15)" }}>
              <FileText size={15} /> NHS Funding Guide
            </a>
          </div>
        </div>
      </section>

      {/* THRESHOLDS */}
      <section className="py-7 sm:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Asset thresholds</p>
          <h2 className="text-2xl font-extrabold mb-3 tracking-tight" style={{ color: BLUE }}>2024–25 Funding thresholds</h2>
          <p className="text-gray-500 text-sm mb-8">Where you fall within these limits determines your contribution to care costs.</p>
          <div className="grid md:grid-cols-3 gap-5">
            {THRESHOLDS.map((t) => (
              <div key={t.category} className="rounded-2xl p-7 border-2" style={{ backgroundColor: t.color, borderColor: t.border }}>
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm">
                  <PoundSterling size={18} style={{ color: NAVY }} />
                </div>
                <h3 className="font-extrabold mb-1 text-base tracking-tight" style={{ color: NAVY }}>{t.category}</h3>
                <div className="text-2xl font-black mb-2" style={{ color: NAVY }}>{t.threshold}</div>
                <p className="text-sm leading-relaxed text-gray-600">{t.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl bg-amber-50 border-2 border-amber-200 text-amber-800">
            <AlertCircle size={14} className="text-amber-500" /> These thresholds have remained unchanged since 2010.
          </div>
        </div>
      </section>

      {/* NHS FUNDING */}
      <section className="py-7 sm:py-14" style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-10">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>NHS funding</p>
              <h2 className="text-2xl font-extrabold mb-6 tracking-tight" style={{ color: BLUE }}>NHS Health Funding</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">Based entirely on health needs — no means test applies.</p>
              <div className="space-y-4">
                {NHS_FUNDING.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-4 p-5 rounded-2xl border-2 bg-white border-gray-100">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${BLUE}15` }}>
                        <Icon size={16} style={{ color: BLUE }} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm mb-1" style={{ color: NAVY }}>{item.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Local authority</p>
              <h2 className="text-2xl font-extrabold mb-6 tracking-tight" style={{ color: BLUE }}>How to Apply for Council Funding</h2>
              <div className="space-y-3">
                {LA_STEPS.map((step) => (
                  <div key={step.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-black text-sm" style={{ backgroundColor: PINK }}>{step.step}</div>
                    <div className="flex-1 pb-3 border-b border-gray-200">
                      <h4 className="font-bold text-sm mb-0.5" style={{ color: NAVY }}>{step.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQS + DISCLAIMER */}
      <section className="py-7 sm:py-14 bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Common questions</p>
          <h2 className="text-2xl font-extrabold mb-4 sm:mb-8 tracking-tight" style={{ color: BLUE }}>Frequently asked questions</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-2 border-gray-100 rounded-2xl px-6 overflow-hidden" style={{ backgroundColor: CREAM }}>
                <AccordionTrigger className="text-left font-bold py-5 hover:no-underline text-sm" style={{ color: NAVY }}>{faq.q}</AccordionTrigger>
                <AccordionContent className="text-gray-500 pb-5 leading-relaxed text-sm">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-8 rounded-2xl p-6 bg-amber-50 border-2 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-900 space-y-2">
                <p className="font-bold">Important: This is a guide only.</p>
                <p>Care funding rules are complex and change over time. For personalised advice about your specific situation, we strongly recommend: seeking independent financial advice, contacting your local authority for a care needs assessment, and consulting Citizens Advice for free guidance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-7 sm:py-14" style={{ backgroundColor: CREAM }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: BLUE }}>Need additional support?</h2>
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>We're here to help.</div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="https://www.gov.uk/find-local-council" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-white font-bold rounded-xl hover:scale-105 transition-all" style={{ backgroundColor: PINK, boxShadow: "0 8px 24px rgba(239,42,134,0.4)" }} data-testid="local-authority-button">
              <Building2 size={15} /> Find Local Authority <ArrowRight size={14} />
            </a>
            <a href="https://www.citizensadvice.org.uk/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-xl hover:opacity-80 transition-all border-2" style={{ color: NAVY, borderColor: "rgba(5,22,61,0.2)" }} data-testid="citizens-advice-button">
              <HelpCircle size={15} /> Citizens Advice
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
