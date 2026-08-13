import { Link } from "wouter";
import Seo from "@/components/seo";
import { FAQSchema } from "@/components/seo/StructuredData";
import { Coffee, Calendar, Smile, CheckCircle, ArrowRight, Phone, Shield, Heart, PoundSterling, Building2 } from "lucide-react";
import Ticker from "@/components/layout/ticker";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const INCLUDED = [
  { category: "Short-Term Cover", items: ["Care from a few hours to several weeks", "Experienced carers briefed fully on your loved one", "Personalised care that respects existing routines", "Emergency respite when it is needed urgently"] },
  { category: "Support for Families", items: ["A genuine, proper break for the main caregiver", "Regular updates so you always know how things are", "The freedom to rest, travel or attend to other needs", "Peace of mind that your loved one is in good hands"] },
  { category: "Flexible Arrangements", items: ["Day respite within your loved one's own home", "Overnight and weekend cover", "Holiday and longer-term absence cover", "Emergency arrangements at short notice"] },
];

const BENEFITS = [
  { icon: Coffee, title: "A Break You Actually Deserve", desc: "Family carers give so much. Respite care exists so you can rest properly, knowing someone else has things covered." },
  { icon: Shield, title: "Carers You Can Trust", desc: "DBS checked and fully trained. We brief every respite carer thoroughly before they visit, so nothing important gets missed." },
  { icon: Calendar, title: "Arrangements That Fit Your Life", desc: "Whether you need a few hours or a few weeks, we work around your schedule and make the arrangements straightforward." },
  { icon: Heart, title: "Familiar Routines, Respected", desc: "We work hard to match carers who complement your loved one's existing preferences and way of doing things." },
];

const FAQS = [
  { q: "What exactly is respite care?", a: "Respite care is temporary, planned care that steps in so a family caregiver can take a break. A trained carer supports your loved one at home while you rest, go on holiday, deal with other commitments, or simply take some time for yourself." },
  { q: "How long can respite care last?", a: "From a few hours to several weeks. There is no fixed duration. We arrange things around what you actually need and how long you need to be away." },
  { q: "Can you arrange respite care quickly?", a: "We can often arrange planned respite within a couple of days. For genuine emergencies, please call us directly and we will do everything we can to help as fast as possible." },
  { q: "Will my loved one have the same carer throughout?", a: "We do our best to keep things consistent. We brief carers thoroughly before they start, sharing everything we know about your loved one's routines, preferences and personality." },
  { q: "How can respite care be funded?", a: "Respite care can be funded through local authority social care budgets, NHS carer support grants, or privately. It is worth asking your local authority what you may be entitled to, and we are happy to help you think through the options." },
];

export default function RespiteCare() {
  return (
    <div data-testid="respite-page">
      <Seo title="Respite Care in Plymouth & Cornwall" description="Professional respite care giving family carers a well-deserved break. Trusted short-term care cover across Devon and Cornwall from Smeaton Healthcare." path="/services/respite" />
      <FAQSchema faqs={FAQS.map(f => ({ question: f.q, answer: f.a }))} />
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
              <h1 className="text-5xl sm:text-6xl font-extrabold mb-3 tracking-tight leading-[1.05]" style={{ color: BLUE }}>Respite Care</h1>
              <div className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>rest well, we've got this.</div>
              <p className="text-gray-600 text-lg max-w-xl leading-relaxed mb-10">For the people who care for someone they love every single day. Professional, compassionate cover so you can take the break you need and actually deserve.</p>
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
            <p>Caring for someone you love is one of the most selfless things a person can do. It is also relentless. Many family carers go months or even years without a proper break, and that takes a real toll. Respite care exists to change that.</p>
            <p>When you hand over to one of our carers, you can actually switch off. Not because you have to trust a stranger, but because you have met them, they have been briefed properly, and you know your loved one is being looked after well. That peace of mind is the whole point.</p>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="py-8 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Supporting you</p>
          <h2 className="text-3xl font-extrabold mb-5 sm:mb-10 tracking-tight" style={{ color: NAVY }}>Support we can provide your loved one</h2>
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

      {/* FUNDING */}
      <section className="py-8 sm:py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Paying for care</p>
          <h2 className="text-3xl font-extrabold mb-1 tracking-tight" style={{ color: BLUE }}>Funding your care</h2>
          <div className="mb-8" style={{ ...SCRIPT, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: PINK }}>there are more options than you might think.</div>
          <div className="grid md:grid-cols-3 gap-5 mb-6">
            {[
              { icon: PoundSterling, title: "Self-funding", desc: "If your assets are above the local authority threshold, or you'd prefer to arrange care privately, you can set things up directly with us. You choose the provider, the plan and the pace.", color: PINK },
              { icon: Building2, title: "Council funding", desc: "If your assets fall below the threshold, your local authority may contribute to or fully cover the cost of your care following a needs and financial assessment.", color: BLUE },
              { icon: Heart, title: "NHS Continuing Healthcare", desc: "If your needs are primarily health-related, you may qualify for care funded entirely by the NHS, regardless of your savings or assets.", color: PINK },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="rounded-2xl p-6 border-2 border-gray-100" style={{ backgroundColor: CREAM }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: item.color }}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <h3 className="font-extrabold text-base mb-2" style={{ color: NAVY }}>{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-gray-400">Not sure which route applies to you? Our team is happy to help talk it through. <Link href="/resources/costings" className="font-bold" style={{ color: BLUE }}>Read our full funding guide</Link></p>
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
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: BLUE }}>Ready to arrange some respite?</h2>
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: PINK }}>You deserve a proper rest.</div>
          <p className="text-gray-500 mb-8 leading-relaxed">Start with a free conversation. We'll talk through what you need, when, and how we can make it happen.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/referral" className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-xl hover:scale-105 transition-all" style={{ backgroundColor: PINK, boxShadow: "0 8px 32px rgba(239,42,134,0.4)" }}>Request Free Assessment <ArrowRight size={16} /></Link>
            <a href="tel:03301658880" className="inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold rounded-xl hover:opacity-80 transition-all border-2" style={{ color: NAVY, borderColor: "rgba(5,22,61,0.2)" }}><Phone size={16} /> 0330 165 8880</a>
          </div>
        </div>
      </section>
    </div>
  );
}
