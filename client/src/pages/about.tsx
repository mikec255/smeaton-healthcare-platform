import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Heart, Users, Star, Award } from "lucide-react";
import img87 from "@assets/Smeaton-87_1777730894015.jpg";
import img108 from "@assets/Smeaton-108_1777730894016.jpg";
import img124 from "@assets/Smeaton-124_1777730894017.jpg";
import img131 from "@assets/Smeaton-131_1777730894017.jpg";

const SCRIPT = { fontFamily: "'Dancing Script', cursive" };
const CREAM = "#FDF7F0";
const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";

const VALUES = [
  { icon: Star,  name: "Innovation",    desc: "We take risks, encourage curiosity and new ideas, learn from our mistakes, and constantly strive to move forward.", color: PINK },
  { icon: Heart, name: "Community",     desc: "We provide a haven of inclusion, trust and support to colleagues, service users, and all stakeholders.", color: BLUE },
  { icon: Users, name: "Collaboration", desc: "We navigate in partnership — listening to one another and working collaboratively to achieve better outcomes.", color: PINK },
  { icon: Award, name: "Excellence",    desc: "We adapt through vigilance and integrity, ensuring every interaction meets the highest standards of care.", color: BLUE },
  { icon: Star,  name: "Leadership",    desc: "We maintain a culture that empowers colleagues to realise the importance of their contribution.", color: PINK },
];

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 22 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

export default function About() {
  useEffect(() => { document.title = "About Us | Smeaton Healthcare | Devon & Cornwall"; }, []);

  return (
    <div data-testid="about-page">
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ backgroundColor: NAVY }}>
        {/* Decorative blobs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.06] pointer-events-none" style={{ backgroundColor: PINK }} />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full opacity-[0.07] pointer-events-none" style={{ backgroundColor: BLUE }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.03] pointer-events-none" style={{ backgroundColor: PINK }} />

        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-16 pb-0 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            {/* Label */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8" style={{ color: PINK, backgroundColor: "rgba(239,42,134,0.12)", border: "1px solid rgba(239,42,134,0.25)" }}>
              About Us
            </div>

            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-white mb-3">
              Built on one
            </h1>
            <div className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(2.8rem, 6vw, 5rem)", color: PINK, lineHeight: 1.1 }}>
              simple belief.
            </div>

            {/* Subtext */}
            <p className="text-white/60 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-12">
              That every person deserves care that genuinely respects who they are — delivered by people who chose this work because they care, not just a paycheque.
            </p>
          </motion.div>

          {/* Stats bar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 border-t border-white/10">
            {[
              { value: "2019", label: "Founded" },
              { value: "CQC Good", label: "Both offices" },
              { value: "2", label: "Devon & Cornwall" },
              { value: "NHS", label: "Approved Provider" },
            ].map((stat, i) => (
              <div key={i} className="py-7 px-4 border-r border-white/10 last:border-r-0">
                <div className="text-2xl font-extrabold mb-0.5" style={{ color: PINK }}>{stat.value}</div>
                <div className="text-xs text-white/50 tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-20 sm:py-24" style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                  <img src={img87} alt="Smeaton carer and client laughing outdoors"
                    className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-5 -right-4 bg-white rounded-2xl px-6 py-5 shadow-2xl border border-gray-100">
                  <div className="text-3xl font-extrabold mb-0.5" style={{ color: NAVY }}>Since 2019</div>
                  <div className="text-sm text-gray-400">Serving Devon &amp; Cornwall</div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Who we are</p>
              <h2 className="text-3xl font-extrabold mb-1 tracking-tight" style={{ color: NAVY }}>Devon &amp; Cornwall's</h2>
              <div className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(2rem, 4.5vw, 3.5rem)", color: PINK }}>trusted homecare provider</div>
              <div className="space-y-4 text-gray-500 leading-relaxed">
                <p>Smeaton Healthcare was founded with a clear purpose: to provide professional, deeply human homecare services to people across Devon &amp; Cornwall. Since 2019, we've grown from a small local team into one of the region's most trusted care providers — with CQC-rated Good offices in both Plymouth and Cornwall.</p>
                <p>We work with elderly people, adults with learning disabilities, those with complex health conditions, and families navigating some of the most difficult moments of their lives.</p>
                <p>Our carers aren't just employees. They're professionals who chose this work because it matters — and we invest heavily in their training, wellbeing, and development.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* OUR APPROACH */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Our approach</p>
              <h2 className="text-3xl font-extrabold mb-1 tracking-tight" style={{ color: NAVY }}>Care that feels like</h2>
              <div className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(2rem, 4.5vw, 3.5rem)", color: BLUE }}>coming home.</div>
              <p className="text-gray-500 leading-relaxed mb-6">
                We believe in consistency. The same carers visiting the same clients builds real relationships — and that's where genuine care happens. Our service users aren't just a name on a schedule; they're people with preferences, routines, and stories that matter to us.
              </p>
              <div className="flex flex-col gap-3">
                {["Matched carers — we consider personalities, not just availability", "Handover notes so every carer knows what matters to you", "Regular reviews to ensure your care plan stays right"].map((item) => (
                  <span key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 size={14} style={{ color: PINK }} className="shrink-0 mt-0.5" /> {item}
                  </span>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
                <img src={img124} alt="Smeaton carer and client gardening"
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,22,61,0.55) 0%, transparent 60%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-6 grid grid-cols-2 gap-3">
                  {[
                    { n: "250k+", l: "care hours" },
                    { n: "300+", l: "professionals" },
                    { n: "98%", l: "satisfaction" },
                    { n: "2", l: "CQC offices" },
                  ].map((s) => (
                    <div key={s.l} className="bg-white/90 backdrop-blur-sm rounded-xl p-3 text-center">
                      <div className="text-xl font-extrabold" style={{ color: NAVY }}>{s.n}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ACCREDITATIONS */}
      <section className="py-20" style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <FadeIn className="mb-12">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: PINK }}>Trusted &amp; regulated</p>
            <h2 className="text-3xl font-extrabold mb-1 tracking-tight" style={{ color: NAVY }}>Professional</h2>
            <div style={{ ...SCRIPT, fontSize: "clamp(2rem, 4.5vw, 3.5rem)", color: BLUE }}>accreditations</div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: "CQC Rated Good", sub: "Plymouth office", detail: "28 April 2022", color: PINK },
              { title: "CQC Rated Good", sub: "Cornwall office", detail: "14 January 2022", color: PINK },
              { title: "NHS Approved", sub: "Pre-Qualification Scheme", detail: "Nationally recognised standard", color: BLUE },
              { title: "Supported Living", sub: "Approved provider", detail: "Accredited framework", color: BLUE },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div className="rounded-2xl p-7 h-full bg-white border-2 border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center" style={{ backgroundColor: item.color }}>
                    <CheckCircle2 size={18} className="text-white" />
                  </div>
                  <h3 className="font-extrabold text-lg mb-1" style={{ color: NAVY }}>{item.title}</h3>
                  <p className="text-sm text-gray-400 mb-1">{item.sub}</p>
                  <p className="text-xs font-bold" style={{ color: item.color }}>{item.detail}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-white py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <FadeIn className="mb-14">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: PINK }}>What drives us</p>
            <h2 className="text-3xl font-extrabold mb-1 tracking-tight" style={{ color: NAVY }}>The values we</h2>
            <div style={{ ...SCRIPT, fontSize: "clamp(2rem, 4.5vw, 3.5rem)", color: BLUE }}>work by every day</div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <FadeIn key={i} delay={i * 0.07} className={i === 4 ? "md:col-span-2 lg:col-span-1" : ""}>
                  <div className="rounded-2xl p-7 h-full border-2 border-gray-100 hover:border-gray-200 transition-colors" style={{ backgroundColor: CREAM }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: v.color }}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <h3 className="text-xl font-extrabold mb-3" style={{ color: NAVY }}>{v.name}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: PINK }} className="relative overflow-hidden py-20 sm:py-24">
        <div className="absolute inset-0 opacity-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{
              width: `${200 + i * 100}px`, height: `${200 + i * 100}px`,
              border: "1px solid white",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
            }} />
          ))}
        </div>
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <FadeIn className="max-w-xl">
            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Ready to find out more?</h2>
            <div className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(2rem, 4vw, 3rem)", color: "rgba(255,255,255,0.9)" }}>We'd love to hear from you.</div>
            <p className="text-white/70 mb-8 leading-relaxed">Whether you're looking for care for yourself or a loved one, or thinking about joining our team.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/referral"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-xl hover:scale-105 transition-all"
                style={{ backgroundColor: PINK, boxShadow: "0 8px 24px rgba(239,42,134,0.4)" }}
                data-testid="about-referral-cta">
                Request a Free Assessment <ArrowRight size={18} />
              </Link>
              <Link href="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 font-bold rounded-xl text-white hover:bg-white/10 transition-all"
                style={{ border: "2px solid rgba(255,255,255,0.4)" }}
                data-testid="about-contact-cta">
                Contact us
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
