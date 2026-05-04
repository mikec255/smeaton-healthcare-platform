import { Link } from "wouter";
import Seo from "@/components/seo";
import { Brain, Heart, Shield, CheckCircle, ArrowRight, Phone, Stethoscope, Users } from "lucide-react";
import Ticker from "@/components/layout/ticker";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const INCLUDED = [
  { category: "Dementia and Alzheimer's", items: ["Carers trained specifically in dementia care", "Gentle, consistent routines that reduce anxiety", "Memory-supportive activities and communication", "Keeping families informed and supported"] },
  { category: "Learning Disabilities", items: ["Person-centred planning and support", "Building life skills and independence", "Community involvement and social activities", "Advocacy and rights-based support"] },
  { category: "Complex and Long-Term Conditions", items: ["Specialist support for a wide range of diagnoses", "Medication management and health monitoring", "Close working with GPs and healthcare teams", "Care that adapts as a condition progresses"] },
];

const BENEFITS = [
  { icon: Brain, title: "Genuine Specialist Knowledge", desc: "Carers receive training specific to your condition. They understand the day-to-day reality of living with it, not just the clinical facts." },
  { icon: Stethoscope, title: "Working Alongside Your Medical Team", desc: "We coordinate closely with GPs, district nurses and other professionals to make sure care is joined up and consistent." },
  { icon: Shield, title: "Thoroughly Vetted", desc: "All carers are DBS checked, trained and insured. For specialist care, we match carers based on relevant experience and qualifications." },
  { icon: Heart, title: "The Whole Person Matters", desc: "A diagnosis is never the whole story. We care for people, not conditions. Your wishes, preferences and personality always come first." },
];

const CONDITIONS = [
  "Dementia and Alzheimer's disease",
  "Parkinson's disease",
  "Multiple sclerosis",
  "Stroke recovery",
  "Learning disabilities",
  "Mental health conditions",
  "Physical disabilities",
  "Autism spectrum conditions",
  "Acquired brain injury",
  "Spinal cord injuries",
  "Cerebral palsy",
  "End-of-life care",
];

const FAQS = [
  { q: "What does condition-led care actually mean?", a: "It means the carer supporting you has received specific training in your diagnosis, so they understand not just the practical tasks involved but the lived reality of your condition. It makes for better, more thoughtful care." },
  { q: "Which conditions do you have experience with?", a: "We support a wide range including dementia, Parkinson's, MS, stroke recovery, learning disabilities, mental health conditions and more. If your condition is not listed, please call us. We are more than happy to have a conversation about whether we can help." },
  { q: "Are your carers specifically trained for each condition?", a: "Yes. Beyond our standard induction training, carers supporting clients with specific conditions receive additional specialist training relevant to that diagnosis. We also carefully match carers to clients based on their experience." },
  { q: "Can condition-led care be combined with other services?", a: "Absolutely. Many of our clients receive condition-led care alongside short visits, live-in care or 24/7 support. We will build a package that reflects the full picture of what you need." },
  { q: "How do I know if this is the right option?", a: "If your loved one has a specific diagnosis that shapes their daily life, condition-led care means they are supported by someone who genuinely understands that. Give us a call and we can talk it through properly." },
];

export default function ConditionLedCare() {
  return (
    <div data-testid="condition-led-care-page">
      <Seo title="Condition-Led Specialist Care Devon & Cornwall" description="Specialist home care tailored to your health condition — dementia, Parkinson's, stroke recovery and more. Expert carers across Devon and Cornwall." path="/services/condition-led-care" />
      <Ticker />

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ backgroundColor: CREAM }}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-[0.15] pointer-events-none" style={{ backgroundColor: PINK }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-[0.08] pointer-events-none" style={{ backgroundColor: BLUE }} />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-6 pb-10 sm:pt-10 sm:pb-28">
          <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-5 hover:opacity-80 transition-opacity" style={{ color: PINK }}>← All Services</Link>
          <div className="grid lg:grid-cols-[1fr_400px] gap-12 xl:gap-20 items-center">
            <div>
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ color: BLUE, backgroundColor: "rgba(39,87,153,0.09)", border: "1px solid rgba(39,87,153,0.22)" }}>Home Care</div>
              <h1 className="text-5xl sm:text-6xl font-extrabold mb-3 tracking-tight leading-[1.05]" style={{ color: BLUE }}>Condition-Led Care</h1>
              <div className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>care that truly understands.</div>
              <p className="text-gray-600 text-lg max-w-xl leading-relaxed mb-10">A diagnosis changes things. The care that follows it should reflect that. Specialist support from carers who are trained in your specific condition and understand what it actually means to live with it.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/referral" className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-2xl hover:scale-105 transition-all text-base" style={{ backgroundColor: PINK, boxShadow: "0 8px 32px rgba(239,42,134,0.45)" }}>Request Free Assessment <ArrowRight size={17} /></Link>
                <a href="tel:03301658880" className="inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold rounded-2xl hover:opacity-80 transition-all text-base" style={{ color: BLUE, border: "2px solid rgba(39,87,153,0.35)" }}><Phone size={16} /> 0330 165 8880</a>
              </div>
            </div>
            <div className="hidden lg:flex flex-col gap-4">
              {BENEFITS.map((b) => (
                <div key={b.title} className="flex items-start gap-4 p-5 rounded-2xl" style={{ backgroundColor: "rgba(39,87,153,0.07)", border: "1px solid rgba(39,87,153,0.15)" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: PINK }}><b.icon size={22} className="text-white" /></div>
                  <div><p className="font-bold text-sm mb-1" style={{ color: NAVY }}>{b.title}</p><p className="text-gray-500 text-xs leading-relaxed">{b.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NARRATIVE */}
      <section className="py-10 sm:py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="space-y-4 text-gray-500 text-base leading-relaxed">
            <p>When someone is living with a specific condition, generic care often falls short. The person delivering care needs to understand what the condition actually means on a day-to-day basis, how it affects someone's mood, mobility, communication, or memory, and how to respond in a way that genuinely helps.</p>
            <p>Our condition-led carers receive training that goes beyond the basics. They are matched to clients based on relevant experience and knowledge, and they work alongside families and healthcare professionals to make sure care is consistent, appropriate and genuinely supportive.</p>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="py-8 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Areas we specialise in</p>
          <h2 className="text-3xl font-extrabold mb-5 sm:mb-10 tracking-tight" style={{ color: NAVY }}>Specialist support across many conditions</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {INCLUDED.map((cat) => (
              <div key={cat.category} className="rounded-2xl p-7 border-2 border-gray-100">
                <h3 className="font-extrabold mb-4 text-sm tracking-widest uppercase" style={{ color: BLUE }}>{cat.category}</h3>
                <ul className="space-y-3">{cat.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-600"><CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: PINK }} />{item}</li>
                ))}</ul>
              </div>
            ))}
          </div>
          <div className="rounded-2xl p-7 border-2 border-gray-100">
            <h3 className="font-extrabold mb-5 text-sm tracking-widest uppercase" style={{ color: BLUE }}>Conditions we support</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {CONDITIONS.map((c) => (
                <div key={c} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={13} style={{ color: PINK }} className="shrink-0" /> {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-8 sm:py-20" style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Why choose us</p>
          <h2 className="text-3xl font-extrabold mb-5 sm:mb-10 tracking-tight" style={{ color: BLUE }}>The Smeaton difference</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="bg-white rounded-2xl p-6 border-2 border-gray-100">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${PINK}15` }}><Icon size={18} style={{ color: PINK }} /></div>
                  <h3 className="font-extrabold mb-2 text-base tracking-tight" style={{ color: NAVY }}>{b.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-8 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Common questions</p>
          <h2 className="text-3xl font-extrabold mb-5 sm:mb-10 tracking-tight" style={{ color: BLUE }}>Frequently asked questions</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-2 border-gray-100 rounded-2xl px-6 overflow-hidden">
                <AccordionTrigger className="text-left font-bold py-5 hover:no-underline" style={{ color: NAVY }}>{faq.q}</AccordionTrigger>
                <AccordionContent className="text-gray-500 pb-5 leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 sm:py-20" style={{ backgroundColor: CREAM }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: BLUE }}>Ready to talk it through?</h2>
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: PINK }}>We're here to help.</div>
          <p className="text-gray-500 mb-8 leading-relaxed">A free assessment with one of our team. No pressure, just a proper conversation about your loved one's needs and how we might be able to support them.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/referral" className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-xl hover:scale-105 transition-all" style={{ backgroundColor: PINK, boxShadow: "0 8px 32px rgba(239,42,134,0.4)" }}>Request Free Assessment <ArrowRight size={16} /></Link>
            <a href="tel:03301658880" className="inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold rounded-xl hover:opacity-80 transition-all border-2" style={{ color: NAVY, borderColor: "rgba(5,22,61,0.2)" }}><Phone size={16} /> 0330 165 8880</a>
          </div>
        </div>
      </section>
    </div>
  );
}
