import { useEffect } from "react";
import { Link } from "wouter";
import { Clock, Home, Clock12, TrendingUp, Coffee, Heart, Stethoscope, ArrowRight, CheckCircle2, Phone } from "lucide-react";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const SERVICES = [
  {
    icon: Clock,
    title: "Short Visits",
    description: "Essential care visits throughout the day, helping you maintain independence while receiving the support you need in your own home.",
    features: ["Personal care assistance", "Medication support", "Companionship services", "Flexible scheduling"],
    color: PINK,
    href: "/services/short-visits",
  },
  {
    icon: Home,
    title: "Supported Living",
    description: "Independent living with personalised support that empowers you to achieve your goals and build the life you want in your community.",
    features: ["Person-centred care plans", "Skills development support", "Community integration", "24/7 emergency support"],
    color: BLUE,
    href: "/services/supported-living",
  },
  {
    icon: Clock12,
    title: "24/7 Care",
    description: "Round-the-clock professional care and support in the comfort and familiarity of your own home, providing complete peace of mind.",
    features: ["Continuous care presence", "Night-time monitoring", "Emergency response", "Complex medical support"],
    color: PINK,
    href: "/services/care-24-7",
  },
  {
    icon: TrendingUp,
    title: "Enabling",
    description: "Build skills, confidence, and independence through personalised support that empowers you to achieve your goals.",
    features: ["Goal-focused approach", "Skill building programs", "Confidence development", "Independence training"],
    color: BLUE,
    href: "/services/enablements",
  },
  {
    icon: Coffee,
    title: "Respite Care",
    description: "Temporary relief for family caregivers — professional, compassionate care so you can take the break you deserve.",
    features: ["Flexible duration options", "Emergency respite available", "Experienced care staff", "Family peace of mind"],
    color: PINK,
    href: "/services/respite",
  },
  {
    icon: Heart,
    title: "Live-In Care",
    description: "Full-time live-in support for people who need constant companionship and care, without leaving the home they love.",
    features: ["24/7 live-in carer", "Full personal care", "Household support", "Companionship & activities"],
    color: BLUE,
    href: "/services/live-in-care",
  },
  {
    icon: Stethoscope,
    title: "Condition-Led Care",
    description: "Specialist care tailored to specific health conditions — our carers receive specialist training to truly understand your needs.",
    features: ["Dementia & Alzheimer's care", "Learning disability support", "Complex medical conditions", "Specialist trained carers"],
    color: PINK,
    href: "/services/condition-led-care",
  },
];

export default function Services() {
  useEffect(() => { document.title = "Our Services | Smeaton Healthcare | Devon & Cornwall"; }, []);

  return (
    <div data-testid="services-page">
      {/* HERO */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 pb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>What we offer</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-1 tracking-tight" style={{ color: NAVY }}>Care built around</h1>
          <h1 className="text-4xl sm:text-5xl mb-5" style={{ ...SCRIPT, color: PINK }}>you, not a rota.</h1>
          <p className="text-gray-500 text-lg max-w-2xl leading-relaxed" data-testid="services-hero-subtitle">
            Comprehensive home care services tailored to individual needs across Devon and Cornwall.
          </p>
        </div>
      </section>

      {/* SERVICE ROWS */}
      <section style={{ backgroundColor: CREAM }} className="py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-1">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.href}
                href={s.href}
                className="group flex items-center gap-6 sm:gap-10 py-5 px-6 sm:px-8 rounded-2xl transition-all hover:shadow-md bg-white"
                data-testid={`service-card-${s.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                  <Icon size={20} style={{ color: s.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-extrabold mb-1 tracking-tight group-hover:text-[#275799] transition-colors" style={{ color: NAVY }}>{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.description}</p>
                </div>
                <div className="hidden sm:flex items-center gap-3 shrink-0">
                  {s.features.slice(0, 2).map((f) => (
                    <span key={f} className="hidden lg:flex items-center gap-1.5 text-xs text-gray-400">
                      <CheckCircle2 size={11} style={{ color: s.color }} /> {f}
                    </span>
                  ))}
                  <ArrowRight size={16} className="transition-all group-hover:translate-x-1 group-hover:text-[#EF2A86]" style={{ color: "#d1d5db" }} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: CREAM }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: BLUE }}>Not sure which service is right?</h2>
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>We'll help you find out.</div>
          <p className="text-gray-500 mb-8 leading-relaxed">Our team can discuss your needs and guide you to the right support. No obligation, completely free.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/referral"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-xl hover:opacity-90 transition-all hover:scale-105"
              style={{ backgroundColor: PINK, boxShadow: "0 8px 32px rgba(239,42,134,0.4)" }}>
              Request a Free Assessment <ArrowRight size={16} />
            </Link>
            <a href="tel:03301658880"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold rounded-xl hover:opacity-80 transition-all border-2"
              style={{ color: NAVY, borderColor: "rgba(5,22,61,0.2)" }}>
              <Phone size={16} /> 0330 165 8880
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
