import { Link } from "wouter";
import Seo from "@/components/seo";
import { Home, Users, Shield, CheckCircle, ArrowRight, Phone, Target, Heart } from "lucide-react";
import Ticker from "@/components/layout/ticker";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const INCLUDED = [
  { category: "Daily Living Support", items: ["Help with personal care and getting ready", "Meal planning and cooking support", "Medication reminders and management", "Keeping your home clean and comfortable"] },
  { category: "Building Independence", items: ["Learning and practising everyday life skills", "Managing money and household budgets", "Getting out and involved in your community", "Structure and routine that actually works for you"] },
  { category: "Social and Emotional Wellbeing", items: ["Building friendships and social connections", "Emotional support from people who genuinely listen", "Advocacy when you need someone in your corner", "Support during difficult times, not just the easy ones"] },
];

const BENEFITS = [
  { icon: Home, title: "Your Own Space", desc: "Live in your own home with the freedom and dignity that comes with it. Support around you, not instead of you." },
  { icon: Users, title: "Support Designed for You", desc: "Your support plan is built around your goals, your preferences and your life. Not a generic package." },
  { icon: Shield, title: "Available When You Need It", desc: "Support is there when you need it, whether that's daily visits or something more intensive. We adapt as things change." },
  { icon: Target, title: "Moving Forward", desc: "We focus on what you want to achieve. Real goals, real progress, real people supporting you to get there." },
];

const FAQS = [
  { q: "What is supported living?", a: "Supported living is care that helps people with disabilities or complex needs live independently in their own homes. It's designed to give people the right level of support to live the life they want, without doing everything for them." },
  { q: "Who is supported living for?", a: "Supported living works well for adults with learning disabilities, autism, mental health needs, or physical disabilities who want to live independently with the right support around them. Every person's situation is different, and we'll talk through whether it's the right fit." },
  { q: "How is the support plan put together?", a: "We sit down with you and, if you'd like, with family members or other people involved in your life. We talk about what matters to you, what you'd like to be able to do, and what support would actually help. The plan comes from those conversations." },
  { q: "Can my family be involved?", a: "Absolutely. We actively encourage family involvement where the person we support wants that. We'll keep the right people in the loop and welcome family input into care planning." },
  { q: "How is supported living funded?", a: "Supported living can be funded through local authority social care budgets, NHS Continuing Healthcare, or personal budgets. It can also be arranged privately. Our team can help you understand what options might be available to you." },
];

export default function SupportedLiving() {
  return (
    <div data-testid="supported-living-page">
      <Seo title="Supported Living Care Devon & Cornwall" description="Specialist supported living helping adults with disabilities and complex needs live independently with confidence across Devon and Cornwall. CQC Rated Good." path="/services/supported-living" />
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
              <h1 className="text-5xl sm:text-6xl font-extrabold mb-3 tracking-tight leading-[1.05]" style={{ color: BLUE }}>Supported Living</h1>
              <div className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>your life, your way.</div>
              <p className="text-gray-600 text-lg max-w-xl leading-relaxed mb-10">Support that works around you, not the other way around. Helping adults live independently in their own homes, with the right people beside them.</p>
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
            <p>Independence looks different for everyone. For some people it means cooking their own meals. For others it is catching the bus alone, managing their own money, or having a friend round without needing to ask someone first. Our supported living service works alongside people to help them get there, at a pace that suits them.</p>
            <p>We do not believe in doing things for people that they can do themselves. Our role is to be there when it matters, build skills over time, and support people to live the kind of life that feels meaningful to them. That takes patience, consistency and carers who actually care about the outcome.</p>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="py-8 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>What's included</p>
          <h2 className="text-3xl font-extrabold mb-5 sm:mb-10 tracking-tight" style={{ color: NAVY }}>What your support can include</h2>
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
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${BLUE}15` }}><Icon size={18} style={{ color: BLUE }} /></div>
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
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: BLUE }}>Let's talk about what's possible.</h2>
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: PINK }}>We'd love to hear from you.</div>
          <p className="text-gray-500 mb-8 leading-relaxed">A free, no-obligation assessment to talk through what you or your loved one needs and how we might be able to help.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/referral" className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-xl hover:scale-105 transition-all" style={{ backgroundColor: PINK, boxShadow: "0 8px 32px rgba(239,42,134,0.4)" }}>Request Free Assessment <ArrowRight size={16} /></Link>
            <a href="tel:03301658880" className="inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold rounded-xl hover:opacity-80 transition-all border-2" style={{ color: NAVY, borderColor: "rgba(5,22,61,0.2)" }}><Phone size={16} /> 0330 165 8880</a>
          </div>
        </div>
      </section>
    </div>
  );
}
