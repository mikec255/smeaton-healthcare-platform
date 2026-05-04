import { Link } from "wouter";
import Seo from "@/components/seo";
import { Clock, Shield, CheckCircle, ArrowRight, Phone, Heart, AlertCircle, HeartHandshake } from "lucide-react";
import Ticker from "@/components/layout/ticker";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const INCLUDED = [
  { category: "Round-the-Clock Support", items: ["Trained carers present throughout the day and night", "Night-time monitoring and support", "Immediate response if anything changes", "Consistent cover, 365 days a year"] },
  { category: "Personal and Health Care", items: ["Help with all personal care needs", "Safe support with mobility and transfers", "Medication management and prompting", "Condition-specific support where needed"] },
  { category: "Support for Your Family", items: ["Relief and reassurance for family caregivers", "Regular updates so your family stays informed", "Genuine emotional support alongside practical care", "Close coordination with healthcare providers"] },
];

const BENEFITS = [
  { icon: Clock, title: "Always There", desc: "Someone is present at all times, day or night. There is never a gap in care, never a moment when no one is available." },
  { icon: Shield, title: "Fully Trained", desc: "All carers are DBS checked and trained to a high standard. For complex needs, we match carers with the relevant specialist experience." },
  { icon: AlertCircle, title: "Ready for Anything", desc: "If something changes overnight or at any hour, our carers are trained to respond calmly and appropriately, and to escalate when needed." },
  { icon: HeartHandshake, title: "Peace of Mind for Everyone", desc: "For families, knowing someone is always there makes an enormous difference. You can rest, knowing your loved one is safe." },
];

const FAQS = [
  { q: "What does 24/7 care actually look like in practice?", a: "A trained carer is present in or very close to your home at all times, every day of the week. There is always someone available. During the day they provide active support, and at night they are on hand if anything is needed." },
  { q: "How is 24/7 care different from live-in care?", a: "Live-in care typically means one dedicated carer living with you full time. Our 24/7 service involves a team of carers working in shifts, which suits people who need a higher level of support or where continuous overnight cover from multiple trained carers is more appropriate. We will talk through which option makes more sense for your situation." },
  { q: "Can this be arranged urgently?", a: "Yes. We understand that the need for 24/7 care can arise quickly, particularly following a hospital discharge or a change in someone's condition. Please call us directly and we will work as fast as we possibly can." },
  { q: "What kinds of conditions is 24/7 care suitable for?", a: "It is appropriate for people with complex health needs, advanced dementia, significant mobility challenges, or those who need continuous supervision and support. It is also commonly arranged following a period in hospital. If you are unsure whether it is the right level of care, call us and we will help you work it out." },
  { q: "How is 24/7 care funded?", a: "It can be funded through NHS Continuing Healthcare, local authority social care budgets, or privately. Our team can help you navigate the options and understand what might be available to you." },
];

export default function Care247() {
  return (
    <div data-testid="care-247-page">
      <Seo title="24/7 Around-the-Clock Home Care Devon & Cornwall" description="24/7 home care for complex needs across Devon and Cornwall. Our trained carers provide consistent, reliable support day and night. CQC Rated Good." path="/services/care-24-7" />
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
              <h1 className="text-5xl sm:text-6xl font-extrabold mb-3 tracking-tight leading-[1.05]" style={{ color: BLUE }}>24/7 Care</h1>
              <div className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>always there, always safe.</div>
              <p className="text-gray-600 text-lg max-w-xl leading-relaxed mb-10">Some people need support that does not clock off. Round-the-clock care at home, for people with complex needs, from a team that is always present and always prepared.</p>
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
            <p>Some people need support that does not clock off. Whether it is following a hospital discharge, managing a complex health condition, or simply needing the reassurance of someone nearby at all hours, our 24/7 care provides consistent, trained support through the day and night.</p>
            <p>For families, the peace of mind that comes with knowing someone is always present can be enormous. And for the person receiving care, it means never having to wait, never going without, and always having someone there who knows them and knows what to do.</p>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="py-8 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>What's included</p>
          <h2 className="text-3xl font-extrabold mb-5 sm:mb-10 tracking-tight" style={{ color: NAVY }}>Everything your care covers</h2>
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
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: BLUE }}>Need to talk it through?</h2>
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: PINK }}>We're here whenever you need us.</div>
          <p className="text-gray-500 mb-8 leading-relaxed">A free assessment to talk through the level of care that is needed and how we can put the right support in place, quickly.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/referral" className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-xl hover:scale-105 transition-all" style={{ backgroundColor: PINK, boxShadow: "0 8px 32px rgba(239,42,134,0.4)" }}>Request Free Assessment <ArrowRight size={16} /></Link>
            <a href="tel:03301658880" className="inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold rounded-xl hover:opacity-80 transition-all border-2" style={{ color: NAVY, borderColor: "rgba(5,22,61,0.2)" }}><Phone size={16} /> 0330 165 8880</a>
          </div>
        </div>
      </section>
    </div>
  );
}
