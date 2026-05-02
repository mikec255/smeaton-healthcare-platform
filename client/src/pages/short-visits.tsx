import { useEffect } from "react";
import { Link } from "wouter";
import { Clock, Users, Shield, CheckCircle, ArrowRight, Phone, Heart, Home, Activity, Stethoscope, Pill, HandHeart } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const INCLUDED = [
  { category: "Personal Care", items: ["Assistance with washing and bathing", "Help with dressing and grooming", "Medication reminders and support", "Support with mobility and transfers"] },
  { category: "Household Support", items: ["Light housekeeping and cleaning", "Meal preparation and cooking", "Shopping and errands", "Laundry and ironing assistance"] },
  { category: "Companionship", items: ["Social interaction and conversation", "Emotional support and encouragement", "Accompanying to appointments", "Engaging in hobbies and activities"] },
];

const BENEFITS = [
  { icon: Clock, title: "Flexible Scheduling", desc: "Visits scheduled around your routine, from 1 hour to several hours per day." },
  { icon: Users, title: "Consistent Carers", desc: "Familiar, trusted carers who build meaningful relationships with you." },
  { icon: Shield, title: "Peace of Mind", desc: "Fully trained, DBS-checked, and insured care professionals you can trust." },
  { icon: Heart, title: "Personalised Care", desc: "Your care plan is tailored specifically to your individual needs and preferences." },
];

const FAQS = [
  { q: "How long are short visits?", a: "Short visits typically last from 30 minutes to several hours. We'll work with you to determine the right duration and frequency for your needs." },
  { q: "Can I choose my own carer?", a: "We do our best to match you with carers who suit your personality and needs, and we aim to keep consistency so you always have familiar faces." },
  { q: "What if my care needs change?", a: "We review care plans regularly and can adjust your visits at any time. Simply contact your care coordinator and we'll arrange any changes." },
  { q: "How quickly can care start?", a: "In many cases we can begin care within 24–48 hours of an initial assessment. For urgent situations we may be able to act sooner." },
  { q: "Is my carer DBS checked?", a: "Yes — every member of our team is fully DBS checked and receives comprehensive training before visiting clients." },
];

export default function ShortVisits() {
  useEffect(() => { document.title = "Short Visits | Smeaton Healthcare"; }, []);

  return (
    <div data-testid="short-visits-page">
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ backgroundColor: CREAM }}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-[0.15] pointer-events-none" style={{ backgroundColor: PINK }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-[0.08] pointer-events-none" style={{ backgroundColor: PINK }} />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-10 hover:opacity-80 transition-opacity" style={{ color: PINK }}>
            ← All Services
          </Link>
          <div className="grid lg:grid-cols-[1fr_400px] gap-12 xl:gap-20 items-center">
            <div>
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5 " style={{ color: NAVY, backgroundColor: "rgba(5,22,61,0.06)", border: "1px solid rgba(5,22,61,0.15)" }}>
                Home Care
              </div>
              <h1 className="text-5xl sm:text-6xl font-extrabold mb-3 tracking-tight leading-[1.05]" style={{ color: NAVY }}>Short Visits</h1>
              <div className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>care when it counts.</div>
              <p className="text-gray-600 text-lg max-w-xl leading-relaxed mb-10">Regular care visits throughout the day — helping you stay independent and comfortable in the home you love, without needing to move.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/referral" className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-2xl hover:scale-105 transition-all text-base" style={{ backgroundColor: PINK, boxShadow: "0 8px 32px rgba(239,42,134,0.45)" }}>
                  Request Free Assessment <ArrowRight size={17} />
                </Link>
                <a href="tel:03301658880" className="inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold rounded-2xl hover:opacity-80 transition-all text-base" style={{ color: NAVY, border: "2px solid rgba(5,22,61,0.25)" }}>
                  <Phone size={16} /> 0330 165 8880
                </a>
              </div>
            </div>
            <div className="hidden lg:flex flex-col gap-4">
              {BENEFITS.map((b) => (
                <div key={b.title} className="flex items-start gap-4 p-5 rounded-2xl" style={{ backgroundColor: "white", border: "1px solid #e5e7eb", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: PINK }}>
                    <b.icon size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm mb-1" style={{ color: NAVY }}>{b.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>What's included</p>
          <h2 className="text-3xl font-extrabold mb-10 tracking-tight" style={{ color: NAVY }}>Everything your visit covers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {INCLUDED.map((cat) => (
              <div key={cat.category} className="rounded-2xl p-7 border-2 border-gray-100">
                <h3 className="font-extrabold mb-4 text-sm tracking-widest uppercase" style={{ color: BLUE }}>{cat.category}</h3>
                <ul className="space-y-3">
                  {cat.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                      <CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: PINK }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
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

      {/* FAQ */}
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

      {/* CTA */}
      <section style={{ backgroundColor: PINK }} className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Ready to get started?</h2>
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: "rgba(255,255,255,0.9)" }}>Let's talk about your needs.</div>
          <p className="text-white/60 mb-8 leading-relaxed">A free, no-obligation assessment with one of our care coordinators. We can usually begin within 24–48 hours.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/referral" className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-xl hover:scale-105 transition-all" style={{ backgroundColor: PINK, boxShadow: "0 8px 32px rgba(239,42,134,0.4)" }}>
              Request Free Assessment <ArrowRight size={16} />
            </Link>
            <a href="tel:03301658880" className="inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold rounded-xl text-white hover:bg-white/10 transition-all border-2" style={{ borderColor: "rgba(255,255,255,0.3)" }}>
              <Phone size={16} /> 0330 165 8880
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
