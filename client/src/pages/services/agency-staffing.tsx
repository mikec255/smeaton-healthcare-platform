import { useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import Seo from "@/components/seo";
import { Building2, UserCheck, Clock, ShieldCheck, Calendar, PoundSterling, ArrowRight, Phone, CheckCircle2 } from "lucide-react";
import shiftBookingLogo from "@assets/carelogr-shift-booking-logo.png";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const ORANGE = "#ea580c";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

// TODO: Replace with real registration link when available
const REGISTER_URL = "#";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const HOW_IT_WORKS = [
  { step: "1", title: "Register your organisation", desc: "Create a free account for your care home or nursing home on the Carelogr platform." },
  { step: "2", title: "Post your shifts", desc: "Add the shifts you need covered — date, time, role and any specific requirements." },
  { step: "3", title: "Get matched instantly", desc: "Verified agency carers and nurses in your area are notified and can pick up shifts immediately." },
  { step: "4", title: "Confirm and relax", desc: "You approve the worker, they arrive, the shift is logged — simple as that." },
];

const FEATURES = [
  { icon: Building2,     title: "Built for Care Homes",    desc: "Designed specifically for registered care homes and nursing homes who need flexible, reliable cover without the agency phone call." },
  { icon: UserCheck,     title: "Vetted Workers Only",     desc: "Every carer and nurse on the platform has been through right-to-work checks, DBS verification and training record review before their first shift." },
  { icon: Clock,         title: "Last-Minute Cover",       desc: "Need someone tonight? Post a shift and get responses within minutes. No waiting, no voicemails, no spreadsheets." },
  { icon: ShieldCheck,   title: "Compliance Built In",     desc: "Digital records for every shift — who worked, when, and what qualifications they held. CQC inspection ready." },
  { icon: Calendar,      title: "Plan Ahead Too",          desc: "Not just emergencies. Use Carelogr to plan agency cover weeks in advance across your rota." },
  { icon: PoundSterling, title: "Transparent Pricing",     desc: "Clear rates shown upfront. No hidden fees, no surprise invoices. You know exactly what you're paying before you confirm." },
];

const WHO_ITS_FOR = [
  "Registered care homes",
  "Nursing homes",
  "Supported living providers",
  "Residential settings",
  "Day services",
];

export default function AgencyStaffing() {
  return (
    <div>
      <Seo
        title="Agency Staffing for Care Homes | Carelogr | Smeaton Healthcare"
        description="Carelogr's agency shift booking platform connects care homes with verified carers and nurses across Devon and Cornwall. Register your organisation today."
        path="/services/agency-staffing"
      />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: CREAM }}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-[0.12] pointer-events-none" style={{ backgroundColor: ORANGE }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-[0.07] pointer-events-none" style={{ backgroundColor: BLUE }} />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-6 pb-14 sm:pt-10 sm:pb-24">
          <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-5 hover:opacity-80 transition-opacity" style={{ color: PINK }}>
            ← All Services
          </Link>

          <div className="grid lg:grid-cols-[1fr_420px] gap-12 xl:gap-20 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
                style={{ color: ORANGE, backgroundColor: "rgba(234,88,12,0.09)", border: "1px solid rgba(234,88,12,0.22)" }}>
                Agency Staffing
              </div>

              <h1 className="text-5xl sm:text-6xl font-extrabold mb-3 tracking-tight leading-[1.05]" style={{ color: NAVY }}>
                Agency cover,
              </h1>
              <div className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: ORANGE }}>
                done differently.
              </div>

              <p className="text-gray-600 text-lg max-w-xl leading-relaxed mb-10">
                Care homes book the cover they need. Verified carers and nurses pick up
                the shifts that suit them. Powered by Carelogr — our purpose-built
                shift booking platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={REGISTER_URL}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-2xl hover:scale-105 transition-all text-base"
                  style={{ backgroundColor: ORANGE, boxShadow: "0 8px 32px rgba(234,88,12,0.35)" }}
                >
                  Register your organisation <ArrowRight size={17} />
                </a>
                <a
                  href="tel:03301658880"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold rounded-2xl hover:opacity-80 transition-all text-base"
                  style={{ color: BLUE, border: "2px solid rgba(39,87,153,0.35)" }}
                >
                  <Phone size={16} /> 0330 165 8880
                </a>
              </div>
            </motion.div>

            {/* Right — logo + who it's for */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
              className="hidden lg:flex flex-col gap-5">
              <div className="rounded-3xl p-8 flex flex-col gap-6"
                style={{ background: "#fff7ed", border: "1px solid #fed7aa", boxShadow: "0 16px 48px rgba(234,88,12,0.10)" }}>
                <img src={shiftBookingLogo} alt="Carelogr Shift Booking" className="h-14 w-auto object-contain" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Who it's for</p>
                  <div className="flex flex-col gap-2">
                    {WHO_ITS_FOR.map((w) => (
                      <div key={w} className="flex items-center gap-2.5">
                        <CheckCircle2 size={14} style={{ color: ORANGE }} />
                        <span className="text-sm font-semibold" style={{ color: NAVY }}>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 sm:py-24" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <FadeIn className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>How it works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: NAVY }}>Up and running in four steps</h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <FadeIn key={step} delay={i * 0.08}>
                <div className="relative flex flex-col gap-4 p-7 rounded-2xl h-full"
                  style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa" }}>
                  <span className="text-4xl font-extrabold leading-none" style={{ color: "#fdba74" }}>{step}</span>
                  <p className="font-bold text-base" style={{ color: NAVY }}>{title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 sm:py-24" style={{ backgroundColor: CREAM }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <FadeIn className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>What you get</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: NAVY }}>Everything your team needs</h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <FadeIn key={title} delay={0.04 + i * 0.06}>
                <div className="flex flex-col gap-4 p-7 rounded-2xl border h-full bg-white transition-shadow hover:shadow-md"
                  style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#fff7ed" }}>
                    <Icon size={20} style={{ color: ORANGE }} />
                  </div>
                  <p className="font-bold text-base" style={{ color: NAVY }}>{title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
