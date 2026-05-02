import { useEffect } from "react";
import { Link } from "wouter";
import { Clock, Users, Shield, CheckCircle, ArrowRight, Phone, Heart, Stethoscope, AlertCircle, HeartHandshake } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const INCLUDED = [
  { category: "Round-the-Clock Care", items: ["Carers available to you 24/7", "Night-time monitoring and support", "Emergency response and assistance", "Continuous health monitoring"] },
  { category: "Personal Care", items: ["Assistance with all personal hygiene needs", "Help with mobility and transfers", "Medication support", "Condition-led care"] },
  { category: "Family Support", items: ["Relief for family caregivers", "Regular family communication updates", "Emotional support and companionship", "Coordination with healthcare providers"] },
];

const BENEFITS = [
  { icon: Clock, title: "24/7 Availability", desc: "Round-the-clock care ensures immediate assistance is always available when needed." },
  { icon: Shield, title: "Fully Trained Staff", desc: "All carers are DBS checked, trained, and insured for your complete safety and peace of mind." },
  { icon: AlertCircle, title: "Emergency Response", desc: "Immediate response to any health changes or emergencies at any time of day or night." },
  { icon: HeartHandshake, title: "Family Peace of Mind", desc: "Families can rest easy knowing their loved one is cared for around the clock." },
];

const FAQS = [
  { q: "What does 24/7 care mean in practice?", a: "It means a trained carer is present in or very nearby your home at all times — day, night, and throughout the week. There is always someone available to help." },
  { q: "Is 24/7 care different from live-in care?", a: "Live-in care typically means one carer lives with you. 24/7 care may involve a team of carers working shifts to provide continuous cover around the clock." },
  { q: "How is 24/7 care funded?", a: "It can be funded through NHS Continuing Healthcare, local authority budgets, or privately. We can help guide you through the options." },
  { q: "Can it be arranged urgently?", a: "Yes — in many cases we can arrange emergency 24/7 care within 24–48 hours. Please call us to discuss urgent situations." },
  { q: "What conditions is it suitable for?", a: "24/7 care is suitable for people with complex health needs, advanced dementia, following hospital discharge, or anyone who needs continuous supervision and support." },
];

export default function Care247() {
  useEffect(() => { document.title = "24/7 Care | Smeaton Healthcare"; }, []);

  return (
    <div data-testid="care-247-page">
      <section style={{ backgroundColor: NAVY }} className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          {[0,1,2,3].map(i => <div key={i} className="absolute rounded-full border border-white" style={{ width:`${200+i*150}px`,height:`${200+i*150}px`,top:"50%",left:"50%",transform:"translate(-50%,-50%)" }} />)}
        </div>
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-8 hover:opacity-80 transition-opacity" style={{ color: PINK }}>← All Services</Link>
          <p className="text-xs font-bold tracking-widest uppercase mb-4 text-white/50">Home Care</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight">24/7 Care</h1>
          <h1 className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(2rem, 4vw, 3rem)", color: PINK }}>always there, always safe.</h1>
          <p className="text-white/60 text-lg max-w-2xl leading-relaxed">Round-the-clock professional care and support in the comfort and familiarity of your own home — complete peace of mind for you and your family.</p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/referral" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-white font-bold rounded-xl hover:scale-105 transition-all" style={{ backgroundColor: PINK, boxShadow: "0 8px 24px rgba(239,42,134,0.4)" }}>Request Free Assessment <ArrowRight size={16} /></Link>
            <a href="tel:03301658880" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-xl text-white hover:bg-white/10 transition-all border-2" style={{ borderColor: "rgba(255,255,255,0.25)" }}><Phone size={16} /> 0330 165 8880</a>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>What's included</p>
          <h2 className="text-3xl font-extrabold mb-10 tracking-tight" style={{ color: NAVY }}>Everything your care covers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {INCLUDED.map((cat) => (
              <div key={cat.category} className="rounded-2xl p-7 border-2 border-gray-100">
                <h3 className="font-extrabold mb-4 text-sm tracking-widest uppercase" style={{ color: BLUE }}>{cat.category}</h3>
                <ul className="space-y-3">{cat.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-600"><CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: PINK }} />{item}</li>
                ))}</ul>
              </div>
            ))}
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
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: "rgba(239,42,134,0.9)" }}>Let's talk about your needs.</div>
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
