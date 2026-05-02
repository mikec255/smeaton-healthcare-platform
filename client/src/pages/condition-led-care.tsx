import { useEffect } from "react";
import { Link } from "wouter";
import { Brain, Heart, Shield, CheckCircle, ArrowRight, Phone, Stethoscope, Users, Activity, Eye } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const INCLUDED = [
  { category: "Dementia & Alzheimer's Care", items: ["Specialised dementia care training and techniques", "Memory stimulation and cognitive activities", "Safe environment management and monitoring", "Family communication and support guidance"] },
  { category: "Learning Disabilities Support", items: ["Person-centred care planning and delivery", "Life skills development and independence training", "Community integration and social activities", "Advocacy and rights-based support"] },
  { category: "Complex Medical Conditions", items: ["Specialised nursing care and medical support", "Medication management and administration", "Health monitoring and condition management", "Coordination with healthcare professionals"] },
];

const BENEFITS = [
  { icon: Brain, title: "Specialist Expertise", desc: "Carers trained specifically in your condition with deep understanding of your care needs." },
  { icon: Stethoscope, title: "Clinical Knowledge", desc: "Our team works closely with healthcare professionals to deliver clinically appropriate care." },
  { icon: Shield, title: "Fully Vetted", desc: "All carers are DBS checked, trained, and insured for your complete safety." },
  { icon: Heart, title: "Person-Centred", desc: "Care that respects the whole person, not just the diagnosis — your wishes always come first." },
];

const CONDITIONS = [
  "Dementia & Alzheimer's disease",
  "Parkinson's disease",
  "Multiple sclerosis (MS)",
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
  { q: "What is condition-led care?", a: "Condition-led care means our carers receive specialist training relevant to your specific health condition, so they understand your unique needs, risks, and best practices for your care." },
  { q: "Which conditions do you support?", a: "We support a wide range of conditions including dementia, Parkinson's, MS, stroke recovery, learning disabilities, mental health conditions, and many more. Please contact us to discuss your specific needs." },
  { q: "Are your carers specifically trained?", a: "Yes — beyond our standard training, carers working with clients with specific conditions receive additional specialist training. We match carers to clients based on their experience and qualifications." },
  { q: "Can condition-led care be combined with other services?", a: "Absolutely. Condition-led care can be combined with short visits, live-in care, 24/7 care, or any of our other services depending on your needs." },
  { q: "How do I know if condition-led care is right for me?", a: "If your loved one has a specific diagnosis that affects their daily life, condition-led care ensures they receive support from someone trained in that condition. Call us for a free chat to discuss whether it's suitable." },
];

export default function ConditionLedCare() {
  useEffect(() => { document.title = "Condition-Led Care | Smeaton Healthcare"; }, []);

  return (
    <div data-testid="condition-led-care-page">
      <section style={{ backgroundColor: BLUE }} className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          {[0,1,2,3].map(i => <div key={i} className="absolute rounded-full border border-white" style={{ width:`${200+i*150}px`,height:`${200+i*150}px`,top:"50%",left:"50%",transform:"translate(-50%,-50%)" }} />)}
        </div>
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-8 hover:opacity-80 transition-opacity" style={{ color: PINK }}>← All Services</Link>
          <p className="text-xs font-bold tracking-widest uppercase mb-4 text-white/50">Home Care</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight">Condition-Led Care</h1>
          <h1 className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(2rem, 4vw, 3rem)", color: PINK }}>specialist care, truly understood.</h1>
          <p className="text-white/60 text-lg max-w-2xl leading-relaxed">Specialist care tailored to specific health conditions — our carers receive in-depth training to truly understand your or your loved one's needs.</p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/referral" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-white font-bold rounded-xl hover:scale-105 transition-all" style={{ backgroundColor: PINK, boxShadow: "0 8px 24px rgba(239,42,134,0.4)" }}>Request Free Assessment <ArrowRight size={16} /></Link>
            <a href="tel:03301658880" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-xl text-white hover:bg-white/10 transition-all border-2" style={{ borderColor: "rgba(255,255,255,0.25)" }}><Phone size={16} /> 0330 165 8880</a>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>What's included</p>
          <h2 className="text-3xl font-extrabold mb-10 tracking-tight" style={{ color: NAVY }}>Areas we specialise in</h2>
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

      <section className="py-16 sm:py-20" style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Why choose us</p>
          <h2 className="text-3xl font-extrabold mb-10 tracking-tight" style={{ color: NAVY }}>The Smeaton difference</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="bg-white rounded-2xl p-6 border-2 border-gray-100">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${PINK}15` }}>
                    <Icon size={18} style={{ color: PINK }} />
                  </div>
                  <h3 className="font-extrabold mb-2 text-base tracking-tight" style={{ color: NAVY }}>{b.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Common questions</p>
          <h2 className="text-3xl font-extrabold mb-10 tracking-tight" style={{ color: NAVY }}>Frequently asked questions</h2>
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

      <section style={{ backgroundColor: PINK }} className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Ready to get started?</h2>
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: "#275799" }}>Let's talk about your needs.</div>
          <p className="text-white/60 mb-8 leading-relaxed">A free, no-obligation assessment with one of our care coordinators. We can usually begin within 24–48 hours.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/referral" className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-xl hover:scale-105 transition-all" style={{ backgroundColor: PINK, boxShadow: "0 8px 32px rgba(239,42,134,0.4)" }}>Request Free Assessment <ArrowRight size={16} /></Link>
            <a href="tel:03301658880" className="inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold rounded-xl text-white hover:bg-white/10 transition-all border-2" style={{ borderColor: "rgba(255,255,255,0.3)" }}><Phone size={16} /> 0330 165 8880</a>
          </div>
        </div>
      </section>
    </div>
  );
}
