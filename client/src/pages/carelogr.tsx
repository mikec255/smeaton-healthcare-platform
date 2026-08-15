import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Seo from "@/components/seo";
import { ClipboardList, Users, Pill, GraduationCap, PoundSterling, Calendar, Building2, UserCheck, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import careManagementLogo from "@assets/carelogr-care-management-logo.png";
import shiftBookingLogo from "@assets/carelogr-shift-booking-logo.png";

const CARE_MGMT_URL = "https://carelogr.co.uk";
const SHIFT_BOOKING_URL = "https://carelogr.co.uk";

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

const CARE_MGMT_FEATURES = [
  { icon: ClipboardList, label: "Care Plans",       desc: "Detailed, person-centred care plans kept up to date and accessible to the whole team." },
  { icon: Calendar,      label: "Rotas",             desc: "Smart rota scheduling so the right carer is always in the right place at the right time." },
  { icon: Pill,          label: "Medication",        desc: "Digital medication administration records (MARs) to keep residents and service users safe." },
  { icon: GraduationCap, label: "Training",          desc: "Track mandatory and specialist training completions across the entire workforce." },
  { icon: PoundSterling, label: "Payroll",           desc: "Accurate payroll processing linked directly to hours worked and shift records." },
  { icon: ShieldCheck,   label: "Compliance",        desc: "Audit-ready records and alerts to keep the service CQC inspection-ready at all times." },
];

const SHIFT_FEATURES = [
  { icon: Building2,  label: "Care Home Bookings",  desc: "Care homes post the shifts they need covered — quickly and without phone calls." },
  { icon: UserCheck,  label: "Carer Profiles",       desc: "Agency carers and nurses maintain their own profiles, availability and qualifications." },
  { icon: Clock,      label: "Flexible Shifts",      desc: "Staff pick up shifts that fit their schedule — full days, nights, or short covers." },
  { icon: ShieldCheck,label: "Verified Workers",     desc: "Right-to-work checks, DBS, and training records confirmed before any shift begins." },
  { icon: Calendar,   label: "Live Availability",    desc: "Real-time visibility of who is available, reducing last-minute scramble for cover." },
  { icon: PoundSterling, label: "Transparent Pay",   desc: "Clear pay rates displayed upfront — no surprises for carers or care homes." },
];

export default function Carelogr() {
  return (
    <div>
      <Seo
        title="CareLogr | Smeaton Healthcare's Digital Platform"
        description="CareLogr is Smeaton Healthcare's purpose-built digital platform — combining a full care management system with flexible agency shift booking across Devon and Cornwall."
        path="/carelogr"
      />

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #05163D 0%, #0a2a5e 60%, #1a3a7a 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #0e9488 0%, transparent 70%)" }} />
          <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #EF2A86 0%, transparent 70%)" }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Meet <span style={{ color: "#5eead4" }}>Carelogr</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
              Our purpose-built digital platform that powers everything behind the scenes —
              from care planning and medication management, to flexible agency staffing across
              Devon and Cornwall.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CARE MANAGEMENT SYSTEM ── */}
      <section className="py-20 sm:py-28" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">

          {/* Header */}
          <FadeIn className="mb-14">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-12">
              <div className="shrink-0">
                <img src={careManagementLogo} alt="Carelogr Care Management System"
                  className="h-16 sm:h-20 w-auto object-contain" />
              </div>
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3" style={{ color: "#05163D" }}>
                  Care Management System
                </h2>
                <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">
                  A complete digital toolkit for Smeaton Healthcare's office staff and field carers.
                  Everything needed to plan, deliver and evidence great care — in one place.
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Who it's for */}
          <FadeIn delay={0.05} className="mb-14">
            <div className="rounded-2xl p-8 sm:p-10" style={{ backgroundColor: "#f0fdfa", border: "1px solid #99f6e4" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#0e9488" }}>Who it's for</p>
              <div className="flex flex-wrap gap-3">
                {["Office managers", "Care coordinators", "Field carers", "Senior carers", "Compliance leads"].map((role) => (
                  <span key={role} className="px-4 py-2 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: "#ccfbf1", color: "#0f766e" }}>
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {CARE_MGMT_FEATURES.map(({ icon: Icon, label, desc }, i) => (
              <FadeIn key={label} delay={0.05 + i * 0.06}>
                <div className="flex flex-col gap-3 p-7 rounded-2xl border h-full transition-shadow hover:shadow-md"
                  style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#f0fdfa" }}>
                    <Icon size={18} style={{ color: "#0e9488" }} />
                  </div>
                  <p className="font-bold text-base" style={{ color: "#05163D" }}>{label}</p>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Login link — secondary */}
          <FadeIn delay={0.1}>
            <a href={CARE_MGMT_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold transition-colors hover:opacity-75"
              style={{ color: "#0e9488" }}>
              Already a user? Sign in to Carelogr Care Management <ArrowRight size={14} />
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.06)" }} />

      {/* ── SHIFT BOOKING SYSTEM ── */}
      <section className="py-20 sm:py-28" style={{ backgroundColor: "#fffbf7" }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">

          {/* Header */}
          <FadeIn className="mb-14">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-12">
              <div className="shrink-0">
                <img src={shiftBookingLogo} alt="Carelogr Shift Booking System"
                  className="h-16 sm:h-20 w-auto object-contain" />
              </div>
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3" style={{ color: "#05163D" }}>
                  Agency Shift Booking
                </h2>
                <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">
                  A smart matching platform connecting care homes that need cover with experienced
                  carers and nurses who want flexible work — on their own terms.
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Who it's for */}
          <FadeIn delay={0.05} className="mb-14">
            <div className="rounded-2xl p-8 sm:p-10" style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#ea580c" }}>Who it's for</p>
              <div className="flex flex-wrap gap-3">
                {["Care homes", "Nursing homes", "Agency carers", "Agency nurses", "Staffing coordinators"].map((role) => (
                  <span key={role} className="px-4 py-2 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: "#ffedd5", color: "#c2410c" }}>
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {SHIFT_FEATURES.map(({ icon: Icon, label, desc }, i) => (
              <FadeIn key={label} delay={0.05 + i * 0.06}>
                <div className="flex flex-col gap-3 p-7 rounded-2xl border h-full transition-shadow hover:shadow-md"
                  style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#fff7ed" }}>
                    <Icon size={18} style={{ color: "#ea580c" }} />
                  </div>
                  <p className="font-bold text-base" style={{ color: "#05163D" }}>{label}</p>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Login links — secondary */}
          <FadeIn delay={0.1}>
            <div className="flex items-center gap-6 flex-wrap">
              <a href={SHIFT_BOOKING_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold transition-colors hover:opacity-75"
                style={{ color: "#ea580c" }}>
                Already a care home? Sign in <ArrowRight size={14} />
              </a>
              <span className="text-gray-300 hidden sm:inline">·</span>
              <a href={SHIFT_BOOKING_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold transition-colors hover:opacity-75"
                style={{ color: "#ea580c" }}>
                Already a carer? Sign in <ArrowRight size={14} />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CONTACT STRIP ── */}
      <section className="py-16" style={{ backgroundColor: "#05163D" }}>
        <FadeIn>
          <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
            <h3 className="text-2xl font-extrabold text-white mb-3">Want to know more?</h3>
            <p className="text-white/60 text-base leading-relaxed mb-8">
              If you're a Smeaton Healthcare team member, partner care home, or agency worker and
              need access or support, our team is happy to help.
            </p>
            <a href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#EF2A86" }}>
              Get in touch <ArrowRight size={16} />
            </a>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
