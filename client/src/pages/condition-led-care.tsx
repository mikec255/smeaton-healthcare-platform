import { useEffect } from "react";
import { Link } from "wouter";
import { SiTrustpilot } from "react-icons/si";
import nhsLogoImg from "@assets/nhs_logo.png";
import googleLogoImg from "@assets/google_logo_white.svg";
import { Brain, Heart, Shield, CheckCircle, ArrowRight, Phone, Stethoscope, Users, Activity, Eye, Clock as TickerClock, Star as TickerStar} from "lucide-react";
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

export default function ConditionLedCare() {
  useEffect(() => { document.title = "Condition-Led Care | Smeaton Healthcare"; }, []);

  return (
    <div data-testid="condition-led-care-page">
      <Ticker />
      <section className="relative overflow-hidden" style={{ backgroundColor: CREAM }}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-[0.15] pointer-events-none" style={{ backgroundColor: PINK }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-[0.08] pointer-events-none" style={{ backgroundColor: BLUE }} />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-20 sm:pt-10 sm:pb-28">
          <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-10 hover:opacity-80 transition-opacity" style={{ color: PINK }}>← All Services</Link>
          <div className="grid lg:grid-cols-[1fr_400px] gap-12 xl:gap-20 items-center">
            <div>
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5 " style={{ color: BLUE, backgroundColor: "rgba(39,87,153,0.09)", border: "1px solid rgba(39,87,153,0.22)" }}>Home Care</div>
              <h1 className="text-5xl sm:text-6xl font-extrabold mb-3 tracking-tight leading-[1.05]" style={{ color: BLUE }}>Condition-Led Care</h1>
              <div className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>specialist care, truly understood.</div>
              <p className="text-gray-600 text-lg max-w-xl leading-relaxed mb-10">Specialist care tailored to specific health conditions — our carers receive in-depth training to truly understand your or your loved one's needs.</p>
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
          <h2 className="text-3xl font-extrabold mb-10 tracking-tight" style={{ color: BLUE }}>The Smeaton difference</h2>
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
