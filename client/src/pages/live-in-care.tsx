import { useEffect } from "react";
import { Link } from "wouter";
import { SiTrustpilot } from "react-icons/si";
import nhsLogoImg from "@assets/nhs_logo.png";
import googleLogoImg from "@assets/google_logo_white.svg";
import { Home, Heart, UserCheck, CheckCircle, ArrowRight, Phone, Shield, Clock, Bed, Users, Clock as TickerClock, Star as TickerStar} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const INCLUDED = [
  { category: "Comprehensive Home Care", items: ["24/7 live-in carer residing in your home", "Assistance with personal care", "Medication management and administration", "Meal planning, preparation and assistance", "Light housekeeping and domestic tasks", "Companionship and social interaction"] },
  { category: "Health & Wellbeing", items: ["Health monitoring and condition management", "Assistance with mobility and transfers", "Appointment coordination and accompaniment", "Emergency response and care coordination", "Communication with family and healthcare providers", "Condition-led care"] },
  { category: "Lifestyle & Independence", items: ["Maintaining familiar routines and environment", "Support with hobbies and personal interests", "Social activities and community engagement", "Support to arrange transportation", "Emotional support and mental wellbeing", "Flexible care that adapts to changing needs"] },
];

const BENEFITS = [
  { icon: Home, title: "Stay in Your Home", desc: "No need to move to a care home — live in the comfort and familiarity of your own home." },
  { icon: UserCheck, title: "Dedicated Carer", desc: "Your live-in carer gets to know you deeply, building a genuine bond and understanding of your needs." },
  { icon: Shield, title: "Fully Vetted", desc: "All live-in carers are DBS checked, trained, and insured for your complete safety and peace of mind." },
  { icon: Heart, title: "Continuity", desc: "Consistent one-to-one care from the same person — no rotating staff or unfamiliar faces." },
];

const FAQS = [
  { q: "How does live-in care work?", a: "A trained carer moves into your home and provides support throughout the day and night. They have their own room and are available whenever you need them." },
  { q: "Is live-in care suitable for couples?", a: "Yes — live-in care can support couples where one or both partners need care, keeping them together at home rather than moving to a care facility." },
  { q: "What happens if my live-in carer is unwell?", a: "We have a team of relief carers who can step in at short notice to ensure your care is never interrupted." },
  { q: "How is live-in care different from 24/7 care?", a: "Live-in care involves one carer living with you full-time, while 24/7 care typically involves a team of carers working in shifts. We can advise which suits you best." },
  { q: "How is live-in care funded?", a: "Live-in care can be funded privately, through NHS Continuing Healthcare, or via a direct payment from your local authority. We can help you understand the options." },
];


function Ticker() {
  return (
    <div style={{ backgroundColor: PINK, padding: "10px 0" }}>
      <div className="w-full flex items-center justify-center flex-nowrap gap-x-8 px-8 overflow-x-auto">
        <span className="inline-flex items-center gap-2 shrink-0">
          <img src={googleLogoImg} alt="Google" style={{ height: "18px", width: "auto" }} />
          <span className="text-white text-sm font-medium">4.9</span>
        </span>
        <span className="text-white/30 shrink-0">|</span>
        <span className="hidden sm:inline-flex items-center gap-2 shrink-0">
          <SiTrustpilot style={{ color: "#00B67A", fontSize: "18px" }} />
          <span className="text-white text-sm font-medium">Trustpilot 4.6</span>
        </span>
        <span className="text-white/30 hidden sm:inline shrink-0">|</span>
        <span className="hidden sm:inline-flex items-center gap-2 shrink-0">
          <img src={nhsLogoImg} alt="NHS" style={{ height: "26px", width: "auto", filter: "brightness(0) invert(1)" }} />
          <span className="text-white text-sm font-medium">Approved Provider</span>
        </span>
        <span className="text-white/30 hidden sm:inline shrink-0">|</span>
        <span className="hidden sm:inline-flex items-center gap-2 shrink-0">
          <span className="text-white text-sm font-medium whitespace-nowrap">CQC Rated Good</span>
        </span>
        <span className="text-white/30 hidden sm:inline shrink-0">|</span>
        <span className="hidden sm:inline-flex items-center gap-2 shrink-0">
          <TickerClock size={15} className="text-white shrink-0" />
          <span className="text-white text-sm font-medium whitespace-nowrap">Care within 24 hours</span>
        </span>
        <span className="text-white/30 hidden sm:inline shrink-0">|</span>
        <span className="hidden sm:inline-flex items-center gap-2 shrink-0">
          <TickerStar size={15} className="text-white shrink-0" />
          <span className="text-white text-sm font-medium whitespace-nowrap">Private Care Available</span>
        </span>
      </div>
    </div>
  );
}

export default function LiveInCare() {
  useEffect(() => { document.title = "Live-In Care | Smeaton Healthcare"; }, []);

  return (
    <div data-testid="live-in-care-page">
      <Ticker />
      <section className="relative overflow-hidden" style={{ backgroundColor: CREAM }}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-[0.15] pointer-events-none" style={{ backgroundColor: PINK }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-[0.08] pointer-events-none" style={{ backgroundColor: BLUE }} />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-20 sm:pt-10 sm:pb-28">
          <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-10 hover:opacity-80 transition-opacity" style={{ color: PINK }}>← All Services</Link>
          <div className="grid lg:grid-cols-[1fr_400px] gap-12 xl:gap-20 items-center">
            <div>
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5 " style={{ color: BLUE, backgroundColor: "rgba(39,87,153,0.09)", border: "1px solid rgba(39,87,153,0.22)" }}>Home Care</div>
              <h1 className="text-5xl sm:text-6xl font-extrabold mb-3 tracking-tight leading-[1.05]" style={{ color: BLUE }}>Live-In Care</h1>
              <div className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>home is where you belong.</div>
              <p className="text-gray-600 text-lg max-w-xl leading-relaxed mb-10">Full-time live-in support for people who need constant companionship and care, without leaving the home they love.</p>
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

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>What's included</p>
          <h2 className="text-3xl font-extrabold mb-10 tracking-tight" style={{ color: NAVY }}>Everything your live-in care covers</h2>
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
          <h2 className="text-3xl font-extrabold mb-10 tracking-tight" style={{ color: BLUE }}>The Smeaton difference</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="bg-white rounded-2xl p-6 border-2 border-gray-100">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${BLUE}15` }}>
                    <Icon size={18} style={{ color: BLUE }} />
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
          <h2 className="text-3xl font-extrabold mb-10 tracking-tight" style={{ color: BLUE }}>Frequently asked questions</h2>
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

      <section className="py-16 sm:py-20" style={{ backgroundColor: CREAM }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: BLUE }}>Ready to get started?</h2>
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: PINK }}>Let's talk about your needs.</div>
          <p className="text-gray-500 mb-8 leading-relaxed">A free, no-obligation assessment with one of our care coordinators. We can usually begin within 24–48 hours.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/referral" className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-xl hover:scale-105 transition-all" style={{ backgroundColor: PINK, boxShadow: "0 8px 32px rgba(239,42,134,0.4)" }}>Request Free Assessment <ArrowRight size={16} /></Link>
            <a href="tel:03301658880" className="inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold rounded-xl hover:opacity-80 transition-all border-2" style={{ color: NAVY, borderColor: "rgba(5,22,61,0.2)" }}><Phone size={16} /> 0330 165 8880</a>
          </div>
        </div>
      </section>
    </div>
  );
}
