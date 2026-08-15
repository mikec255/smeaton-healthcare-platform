import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Seo from "@/components/seo";
import careManagementLogo from "@assets/carelogr-care-management-logo.png";
import shiftBookingLogo from "@assets/carelogr-shift-booking-logo.png";

// CareLogr product URLs — update these when known
const CARE_MGMT_URL = "https://carelogr.co.uk";
const SHIFT_BOOKING_URL = "https://carelogr.co.uk";
const CARE_HOME_LOGIN_URL = "https://carelogr.co.uk";
const CARER_LOGIN_URL = "https://carelogr.co.uk";

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Carelogr() {
  return (
    <div>
      <Seo
        title="CareLogr | Smeaton Healthcare's Digital Platform"
        description="CareLogr powers Smeaton Healthcare's care management and agency shift booking. Sign in to manage rotas, care plans, medication, payroll or book agency cover."
        path="/carelogr"
      />

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #05163D 0%, #0a2a5e 60%, #1a3a7a 100%)" }}
      >
        {/* decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #0e9488 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #EF2A86 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
              style={{ color: "#5eead4", backgroundColor: "rgba(94,234,212,0.12)", border: "1px solid rgba(94,234,212,0.25)" }}
            >
              Smeaton Healthcare's Digital Platform
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Powered by{" "}
              <span style={{ color: "#5eead4" }}>Carelogr</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
              Our purpose-built digital platform brings together care management
              for our teams and flexible shift booking for agency staff — all in
              one place.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── TWO PRODUCT CARDS ── */}
      <section style={{ backgroundColor: "#F3F4F6" }} className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">

            {/* ── CARD 1: Care Management ── */}
            <FadeIn delay={0}>
              <div
                className="relative rounded-3xl overflow-hidden flex flex-col min-h-[520px]"
                style={{ background: "linear-gradient(160deg, #134e4a 0%, #0f3d3a 50%, #0a2e2b 100%)" }}
              >
                {/* subtle texture */}
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, #0e9488 0%, transparent 70%)" }}
                  />
                </div>

                <div className="relative flex flex-col flex-1 p-10 sm:p-12">
                  {/* Logo */}
                  <div className="mb-10">
                    <img
                      src={careManagementLogo}
                      alt="Carelogr my Care management system"
                      className="h-20 w-auto object-contain"
                      style={{ filter: "brightness(1.05)" }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                      Care Management<br />System
                    </h2>
                    <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-sm">
                      Rotas, care plans, medication, training and payroll
                      for our care at home teams.
                    </p>

                    <div className="flex flex-col items-start gap-4">
                      <a
                        href={CARE_MGMT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-200 hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: "#0e9488", minWidth: "180px" }}
                      >
                        Sign in
                      </a>
                      <p className="text-white/50 text-sm">
                        For Smeaton Healthcare office staff and carers.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom feature strip */}
                <div
                  className="relative px-10 sm:px-12 py-6 border-t"
                  style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(0,0,0,0.15)" }}
                >
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {["Rotas", "Care Plans", "Medication", "Training", "Payroll"].map((item) => (
                      <span key={item} className="text-sm font-medium" style={{ color: "#5eead4" }}>
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* ── CARD 2: Shift Booking ── */}
            <FadeIn delay={0.1}>
              <div
                className="relative rounded-3xl overflow-hidden flex flex-col min-h-[520px]"
                style={{ background: "linear-gradient(160deg, #1c1a17 0%, #2a1f0e 50%, #1a1208 100%)" }}
              >
                {/* Background photo overlay */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-25"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80')",
                  }}
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(28,26,23,0.85) 0%, rgba(42,31,14,0.9) 100%)" }} />

                {/* orange glow */}
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-15"
                    style={{ background: "radial-gradient(circle, #f97316 0%, transparent 70%)" }}
                  />
                </div>

                <div className="relative flex flex-col flex-1 p-10 sm:p-12">
                  {/* Logo */}
                  <div className="mb-10">
                    <img
                      src={shiftBookingLogo}
                      alt="Carelogr my Shift Booking System"
                      className="h-20 w-auto object-contain"
                      style={{ filter: "brightness(1.05)" }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                      Agency Staffing
                    </h2>
                    <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-sm">
                      Care homes book the cover they need. Carers and nurses
                      pick up the shifts that suit them.
                    </p>

                    <div className="flex flex-col items-start gap-4">
                      <a
                        href={SHIFT_BOOKING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-200 hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: "#ea580c", minWidth: "180px" }}
                      >
                        Take a look
                      </a>
                      <p className="text-white/60 text-sm">
                        Already with us?{" "}
                        <a
                          href={CARE_HOME_LOGIN_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-white transition-colors"
                          style={{ color: "#fb923c" }}
                        >
                          Care home
                        </a>
                        {" · "}
                        <a
                          href={CARER_LOGIN_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-white transition-colors"
                          style={{ color: "#fb923c" }}
                        >
                          Carer
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom feature strip */}
                <div
                  className="relative px-10 sm:px-12 py-6 border-t"
                  style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(0,0,0,0.15)" }}
                >
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {["Shift Booking", "Agency Cover", "Care Homes", "Carers", "Nurses"].map((item) => (
                      <span key={item} className="text-sm font-medium" style={{ color: "#fb923c" }}>
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── INFO STRIP ── */}
      <section className="py-16" style={{ backgroundColor: "#FDF7F0" }}>
        <FadeIn>
          <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
            <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
              CareLogr is Smeaton Healthcare's proprietary digital platform, built to support
              high-quality care delivery across Devon and Cornwall. If you're a member of our
              team or an agency partner and need access, please{" "}
              <a
                href="/contact"
                className="font-semibold underline"
                style={{ color: "#EF2A86" }}
              >
                contact us
              </a>
              .
            </p>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
