import { Link } from "wouter";
import Seo from "@/components/seo";
import { Clock, Users, Shield, CheckCircle, ArrowRight, Phone, Heart } from "lucide-react";
import Ticker from "@/components/layout/ticker";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const INCLUDED = [
  { category: "Personal Care", items: ["Help with washing, bathing and getting ready", "Assistance with dressing and grooming", "Medication reminders and prompting", "Support with moving around safely at home"] },
  { category: "Everyday Household Tasks", items: ["Light housekeeping and tidying", "Cooking meals or preparing food", "Shopping, errands and prescription collection", "Laundry and keeping things in order"] },
  { category: "Companionship", items: ["A friendly face and genuine conversation", "Emotional support on harder days", "Company at appointments or social outings", "Encouragement to stay active and engaged"] },
];

const BENEFITS = [
  { icon: Clock, title: "Built Around Your Day", desc: "Visits are scheduled around your existing routine, not ours. From a morning check-in to several visits a day." },
  { icon: Users, title: "Carers You'll Recognise", desc: "We work hard to keep your carers consistent. Familiar faces matter, and good care is built on familiarity." },
  { icon: Shield, title: "Fully Trained and Checked", desc: "Every carer is DBS checked and trained before they ever visit a client. Your safety and comfort come first." },
  { icon: Heart, title: "A Plan That's Yours", desc: "No two care plans look the same. Yours will be built around your actual life, preferences and priorities." },
];

const FAQS = [
  { q: "How long are short visits?", a: "Most visits last between 30 minutes and a couple of hours, but we work around what you actually need. Some clients have a quick morning call, others prefer longer company visits in the afternoon. We'll figure out what works best together." },
  { q: "Will I get the same carer each time?", a: "We make every effort to keep your carers consistent. We know how unsettling it is to have a different face every visit, so continuity is something we genuinely prioritise." },
  { q: "What if my needs change over time?", a: "Care needs evolve, and your plan should too. If you need more visits, fewer, or something different, just speak to your care coordinator and we'll adjust things." },
  { q: "How quickly can care begin?", a: "In most cases we can arrange a free assessment within a day or two, and begin care very shortly after. If things are more urgent, call us directly and we'll do everything we can." },
  { q: "Are your carers DBS checked?", a: "Yes, every single one of them. We also provide thorough training before anyone visits a client, and ongoing development throughout their time with us." },
];

export default function ShortVisits() {
  return (
    <div data-testid="short-visits-page">
      <Seo title="Short Visits Home Care in Plymouth & Cornwall" description="Professional short visit home care providing personal care, medication support, meals and companionship across Devon and Cornwall. Book a free assessment today." path="/services/short-visits" />
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
              <h1 className="text-5xl sm:text-6xl font-extrabold mb-3 tracking-tight leading-[1.05]" style={{ color: BLUE }}>Short Visits</h1>
              <div className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>care when it counts.</div>
              <p className="text-gray-600 text-lg max-w-xl leading-relaxed mb-10">Regular visits from a carer you know and trust, built around your day and your routine. Staying at home, staying independent, staying you.</p>
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
            <p>Regular visits can make a bigger difference than people realise. It's not just about the tasks. It's knowing someone is coming. Someone who knows your routine, how you take your tea, and genuinely cares how you're getting on. That kind of consistency is at the heart of what we do.</p>
            <p>We support people who need a little help getting started in the morning, right through to people who benefit from several visits across the day. Whatever your situation, we build a care plan around your real life, not a generic template. And we do our best to make sure the same familiar faces are the ones walking through your door.</p>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="py-8 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>What's included</p>
          <h2 className="text-3xl font-extrabold mb-5 sm:mb-10 tracking-tight" style={{ color: NAVY }}>Support we can provide when we visit</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {INCLUDED.map((cat) => (
              <div key={cat.category} className="rounded-2xl p-7 border-2 border-gray-100">
                <h3 className="font-extrabold mb-4 text-sm tracking-widest uppercase" style={{ color: BLUE }}>{cat.category}</h3>
                <ul className="space-y-3">
                  {cat.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-600"><CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: PINK }} />{item}</li>
                  ))}
                </ul>
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
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: BLUE }}>Ready to get started?</h2>
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: PINK }}>Let's talk about what you need.</div>
          <p className="text-gray-500 mb-8 leading-relaxed">A free, no-obligation conversation with one of our care coordinators. No pressure, just a proper chat about what would actually help.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/referral" className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-xl hover:scale-105 transition-all" style={{ backgroundColor: PINK, boxShadow: "0 8px 32px rgba(239,42,134,0.4)" }}>Request Free Assessment <ArrowRight size={16} /></Link>
            <a href="tel:03301658880" className="inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold rounded-xl hover:opacity-80 transition-all border-2" style={{ color: NAVY, borderColor: "rgba(5,22,61,0.2)" }}><Phone size={16} /> 0330 165 8880</a>
          </div>
        </div>
      </section>
    </div>
  );
}
