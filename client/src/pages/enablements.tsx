import { Link } from "wouter";
import Seo from "@/components/seo";
import { Target, CheckCircle, ArrowRight, Phone, Brain, GraduationCap, Compass } from "lucide-react";
import Ticker from "@/components/layout/ticker";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const INCLUDED = [
  { category: "Building Practical Skills", items: ["Managing personal care and daily routines", "Cooking, meal planning and looking after yourself", "Handling money and everyday finances", "Keeping a home clean and organised independently"] },
  { category: "Growing Confidence", items: ["Setting real, achievable goals together", "Building self-belief through small, steady wins", "Learning to problem-solve and make decisions", "Encouragement from people who genuinely root for you"] },
  { category: "Getting Out and Connected", items: ["Building friendships and social connections", "Growing independence in your community", "Exploring volunteering, employment or education", "Access to activities and experiences that matter to you"] },
];

const BENEFITS = [
  { icon: Target, title: "Goals That Actually Mean Something", desc: "We work with you to set goals that are yours. Things that will genuinely make a difference to your everyday life." },
  { icon: Brain, title: "The Whole Person", desc: "Practical skills are only part of it. We also support your emotional wellbeing, confidence and sense of who you are." },
  { icon: GraduationCap, title: "Carers Who Understand", desc: "Our enablement team are trained to support people in a way that builds independence, not dependency." },
  { icon: Compass, title: "You Set the Direction", desc: "This is your life and your journey. We provide the encouragement, practical support and patience to help you get where you want to go." },
];

const FAQS = [
  { q: "What is enabling care?", a: "Enabling care is a way of supporting people that focuses on building their skills and independence over time, rather than doing everything for them. It is about helping people grow, not just get by." },
  { q: "Who is this kind of support for?", a: "Enabling support works well for people with learning disabilities, mental health needs, acquired brain injuries, or those recovering from illness who want to become more independent. It is suitable for a wide range of situations. The best way to find out if it fits is to have a conversation with us." },
  { q: "How long does an enabling programme last?", a: "There is no fixed timescale. Some people work with us for a few months on specific goals. Others prefer ongoing support over a longer period. We work at the pace that is right for you." },
  { q: "Can my family be part of this?", a: "Yes, if that is what you want. We involve families where it is helpful and welcome. We will always follow the wishes of the person we are supporting." },
  { q: "How is enabling support funded?", a: "It can be funded through local authority social care assessments, personal budgets, or privately. We are happy to help you understand what your options might be." },
];

export default function Enablements() {
  return (
    <div data-testid="enablements-page">
      <Seo title="Enabling Care Services Devon & Cornwall" description="Our enabling care service builds independence, not dependency. Specialist support empowering people to live their best lives across Devon and Cornwall." path="/services/enablements" />
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
              <h1 className="text-5xl sm:text-6xl font-extrabold mb-3 tracking-tight leading-[1.05]" style={{ color: BLUE }}>Enabling</h1>
              <div className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>building your independence.</div>
              <p className="text-gray-600 text-lg max-w-xl leading-relaxed mb-10">Good care should not just maintain things as they are. It should help move them forward. Support that builds real skills, real confidence and a more independent life.</p>
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
          <div className="max-w-3xl space-y-4 text-gray-500 text-base leading-relaxed">
            <p>Good care should not just keep things ticking over. It should help people grow. Our enabling service works with people who want to do more for themselves over time, building the skills and confidence to live a more independent life.</p>
            <p>We do not rush people or set goals on their behalf. We sit down, talk through what matters to them, and figure out together what we are working towards. Progress happens at a pace that is actually sustainable, and we celebrate every step of it.</p>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="py-8 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>What's included</p>
          <h2 className="text-3xl font-extrabold mb-5 sm:mb-10 tracking-tight" style={{ color: NAVY }}>Everything your programme covers</h2>
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
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: BLUE }}>Ready to take the next step?</h2>
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: PINK }}>Let's talk about your goals.</div>
          <p className="text-gray-500 mb-8 leading-relaxed">A free assessment with one of our team to talk through what you want to achieve and how we can help you get there.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/referral" className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-xl hover:scale-105 transition-all" style={{ backgroundColor: PINK, boxShadow: "0 8px 32px rgba(239,42,134,0.4)" }}>Request Free Assessment <ArrowRight size={16} /></Link>
            <a href="tel:03301658880" className="inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold rounded-xl hover:opacity-80 transition-all border-2" style={{ color: NAVY, borderColor: "rgba(5,22,61,0.2)" }}><Phone size={16} /> 0330 165 8880</a>
          </div>
        </div>
      </section>
    </div>
  );
}
