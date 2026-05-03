import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import Seo from "@/components/seo";
import { ArrowRight, CheckCircle2, Phone, ShieldCheck, Award, Clock, Star, Home as HomeIcon, Heart, Zap, RefreshCw, User, Activity } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import Ticker from "@/components/layout/ticker";
import img108 from "@assets/Smeaton-108_1777730894016.jpg";
import img117 from "@assets/Smeaton-117_1777730894016.jpg";
import img124 from "@assets/Smeaton-124_1777730894017.jpg";
import img131 from "@assets/Smeaton-131_1777730894017.jpg";

const SCRIPT = { fontFamily: "'Dancing Script', cursive" };
const CREAM = "#FDF7F0";
const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";

const SERVICES = [
  { icon: Clock, name: "Short Visits", slug: "short-visits", desc: "Personal care, medication, meals and companionship — built around your day, not ours.", color: PINK },
  { icon: HomeIcon, name: "Supported Living", slug: "supported-living", desc: "Specialist support helping adults live independently and confidently.", color: BLUE },
  { icon: Activity, name: "24/7 Care", slug: "care-24-7", desc: "Around-the-clock care for complex needs — consistent, trained, reliable.", color: PINK },
  { icon: Zap, name: "Enabling", slug: "enablements", desc: "Building independence rather than dependency. Care that empowers.", color: BLUE },
  { icon: RefreshCw, name: "Respite Care", slug: "respite", desc: "Trusted short-term cover so family carers can rest and recharge.", color: PINK },
  { icon: User, name: "Live-In Care", slug: "live-in-care", desc: "Full-time live-in support for people who need constant companionship.", color: BLUE },
  { icon: Heart, name: "Condition-Led Care", slug: "condition-led-care", desc: "Specialist care tailored to specific health conditions and complex needs.", color: PINK },
];

const TESTIMONIALS = [
  { quote: "The carers from Smeaton are wonderful — Mum knows them by name and actually looks forward to their visits.", name: "Sarah T.", relation: "Daughter of service user, Plymouth" },
  { quote: "After years of struggling on my own, having the right support has genuinely given me my life back.", name: "Brian M.", relation: "Service user, Cornwall" },
  { quote: "We tried another agency first. The difference with Smeaton was immediate — consistent carers, real warmth.", name: "Rachel K.", relation: "Family carer, Devon" },
];

const COVERAGE = ["Plymouth","Saltash","Liskeard","Tavistock","Ivybridge","Kingsbridge","Totnes","Truro","Falmouth","Penzance","Newquay","Bodmin","Camborne","Redruth","St Austell","Wadebridge","Launceston","Helston","Hayle","St Ives"];

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}


export default function Home() {

  // FAQ data for structured data
  const homeFAQs = [
    { question: "What areas do you cover?", answer: "We provide care services across Devon and Cornwall, including Plymouth, Exeter, Truro, and surrounding areas." },
    { question: "What types of care do you offer?", answer: "We offer live-in care, short visits, respite care, condition-led care, enablement, supported living, and 24/7 care services." },
    { question: "Are your carers trained and qualified?", answer: "Yes, all our carers are fully trained, DBS checked, and receive ongoing professional development to deliver the highest quality care." },
    { question: "How quickly can care start?", answer: "We can often arrange care within 24-48 hours for urgent needs. Contact us for a free assessment." }
  ];

  return (
    <div data-testid="home-page">
      <Seo title="Home Care Services in Devon & Cornwall" description="Smeaton Healthcare provides CQC Rated Good home care across Devon and Cornwall — short visits, live-in care, supported living, respite and 24/7 care. Call 0330 165 8880." path="/" />
      <Ticker />

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ backgroundColor: CREAM }}>
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] lg:min-h-[84vh]">

          <div className="flex flex-col justify-center pt-6 pb-8 sm:pb-16 px-5 sm:px-8 lg:pl-[68px]">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 self-start rounded-full px-4 py-1.5 mb-8"
              style={{ backgroundColor: "#EF2A8618" }}>
              <ShieldCheck size={13} style={{ color: PINK }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: PINK }}>CQC Rated Good · Since 2019</span>
            </motion.div>

            <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="block font-extrabold leading-[0.92] tracking-tight"
              style={{ fontSize: "clamp(28px, 3.8vw, 58px)", color: BLUE }}>
              Home care that
            </motion.span>

            <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="block leading-[1.05]"
              style={{ ...SCRIPT, fontSize: "clamp(40px, 5.2vw, 80px)", color: PINK }}>
              feels like it should.
            </motion.span>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.38 }}
              className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-sm mt-6 mb-8">
              Trusted by families across Devon &amp; Cornwall since 2019. CQC-rated Good, NHS approved.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.48 }}
              className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link href="/referral"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-xl transition-all hover:scale-105"
                style={{ backgroundColor: PINK, boxShadow: "0 12px 40px rgba(239,42,134,0.35)" }}
                data-testid="hero-referral-cta">
                Free Assessment <ArrowRight size={17} />
              </Link>
              <a href="tel:03301658880"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 font-semibold rounded-xl transition-all hover:bg-black/5 border-2"
                style={{ color: NAVY, borderColor: "rgba(5,22,61,0.15)" }}>
                <Phone size={16} /> 0330 165 8880
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.64 }}
              className="flex flex-wrap gap-6 pt-6 border-t border-black/08">
              {[{ icon: ShieldCheck, t: "CQC Rated Good" }, { icon: Award, t: "NHS Approved" }, { icon: Clock, t: "Est. 2019" }].map(({ icon: Icon, t }) => (
                <span key={t} className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <Icon size={14} style={{ color: PINK }} /> {t}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.1 }}
            className="hidden lg:block relative" style={{ marginLeft: "-60px" }}>
            <img src={img124} alt="Smeaton carer and client gardening together"
              className="absolute inset-0 w-full h-full object-cover object-center" />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: `linear-gradient(to right, ${CREAM} 0%, transparent 18%)` }} />
            <div className="absolute bottom-6 right-6 bg-white rounded-2xl px-5 py-4 shadow-2xl">
              <div className="flex gap-0.5 mb-1.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={PINK}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-xs font-extrabold" style={{ color: NAVY }}>CQC Rated Good</p>
              <p className="text-xs text-gray-400 mt-0.5">Plymouth &amp; Cornwall</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="py-10 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <FadeIn>
              <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: PINK }}>Who we are</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-2 tracking-tight" style={{ color: BLUE }}>Care affects more than one person,</h2>
              <div className="mb-8" style={{ ...SCRIPT, fontSize: "clamp(2rem, 4vw, 3.2rem)", color: PINK, lineHeight: 1.1 }}>
                we support you all.
              </div>
              <p className="text-gray-500 text-base leading-relaxed mb-6">
                When you're looking for care for someone you love, you're not looking for ticked boxes. You're looking for people you can trust — who will show up, every time, and treat your family member like a person, not a task. That's what we've built since 2019.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
                {["Consistent carers — familiar faces", "CQC Rated Good — both offices", "No waiting lists for private clients", "Transparent pricing — no surprises"].map((item) => (
                  <span key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 size={14} style={{ color: PINK }} className="shrink-0 mt-0.5" /> {item}
                  </span>
                ))}
              </div>
              <Link href="/about" className="inline-flex items-center gap-2 text-sm font-bold border-b-2 pb-0.5 hover:gap-3 transition-all" style={{ color: NAVY, borderColor: PINK }} data-testid="home-about-link">
                Our story <ArrowRight size={15} />
              </Link>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ aspectRatio: "4/5" }}>
                  <img src={img131} alt="Smeaton carer supporting client in garden"
                    className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl p-5 shadow-xl border border-gray-100">
                  <div className="text-3xl font-extrabold mb-0.5" style={{ color: NAVY }}>Since 2019</div>
                  <div className="text-sm text-gray-400">Serving Devon &amp; Cornwall</div>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white" style={{ backgroundColor: PINK }}>
                  <div className="text-2xl font-extrabold leading-none">7+</div>
                  <div className="text-xs font-semibold opacity-80">Years</div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 sm:py-28" style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <FadeIn className="mb-12">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: PINK }}>What we offer</p>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: PINK }}>Ways we</h2>
              <span style={{ ...SCRIPT, fontSize: "clamp(2.5rem, 5vw, 3.8rem)", color: BLUE }}>can help.</span>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {SERVICES.slice(0, 3).map((s, i) => {
              const Icon = s.icon;
              return (
                <FadeIn key={s.slug} delay={i * 0.08}>
                  <Link href={`/services/${s.slug}`}
                    className="group flex flex-col h-full bg-white rounded-2xl p-7 transition-all hover:shadow-lg hover:-translate-y-0.5"
                    data-testid={`service-card-${s.slug}`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${s.color}18` }}>
                      <Icon size={22} style={{ color: s.color }} />
                    </div>
                    <h3 className="text-lg font-extrabold tracking-tight mb-2 transition-colors group-hover:text-[#275799]" style={{ color: NAVY }}>{s.name}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed flex-1">{s.desc}</p>
                    <div className="flex items-center gap-1.5 mt-5 text-sm font-bold transition-all group-hover:gap-2.5" style={{ color: s.color }}>
                      Learn more <ArrowRight size={14} />
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>

          <FadeIn className="flex justify-center">
            <Link href="/services"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-sm transition-all hover:gap-4 hover:shadow-lg"
              style={{ backgroundColor: BLUE, color: "#fff" }}
              data-testid="home-all-services-link">
              View all our services <ArrowRight size={15} />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* SELF-FUNDED CARE */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <FadeIn>
              <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: PINK }}>Self-funded care</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-2 tracking-tight" style={{ color: BLUE }}>Funding your own</h2>
              <div className="mb-8" style={{ ...SCRIPT, fontSize: "clamp(2rem, 4vw, 3.2rem)", color: PINK, lineHeight: 1.1 }}>
                care, your way.
              </div>
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                Many families choose to fund care privately — no waiting lists, no rigid rotas. We welcome private clients and can usually begin within days of your assessment.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-10">
                {[
                  { num: "No", label: "waiting lists" },
                  { num: "Same", label: "carers every visit" },
                  { num: "Your", label: "hours, your routine" },
                  { num: "Clear", label: "transparent pricing" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: CREAM }}>
                    <div className="text-lg font-extrabold" style={{ color: PINK }}>{s.num}</div>
                    <div className="text-sm font-semibold" style={{ color: NAVY }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <Link href="/referral"
                className="inline-flex items-center gap-2 px-7 py-4 text-white font-bold rounded-xl hover:scale-105 transition-all"
                style={{ backgroundColor: PINK, boxShadow: "0 12px 40px rgba(239,42,134,0.28)" }}
                data-testid="home-private-cta">
                Talk to us about your options <ArrowRight size={16} />
              </Link>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 rounded-3xl overflow-hidden shadow-md" style={{ aspectRatio: "16/8" }}>
                  <img src={img117} alt="Smeaton carer arriving at client home" className="w-full h-full object-cover object-top" />
                </div>
                <div className="rounded-2xl p-7 text-white text-center" style={{ backgroundColor: PINK }}>
                  <div className="text-4xl font-extrabold mb-1">Good</div>
                  <div className="text-xs text-white/70 font-bold uppercase tracking-widest">CQC Rating</div>
                </div>
                <div className="rounded-2xl p-7 text-center bg-white border border-gray-100">
                  <div className="text-4xl font-extrabold mb-1" style={{ color: NAVY }}>7+</div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">Years</div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 sm:py-28" style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <FadeIn className="mb-14">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: PINK }}>In their own words</p>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: PINK }}>Real people.</h2>
              <span style={{ ...SCRIPT, fontSize: "clamp(2.5rem, 5vw, 3.8rem)", color: BLUE }}>Real stories.</span>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className={`rounded-3xl p-8 h-full flex flex-col ${i === 1 ? "" : "bg-white"}`}
                  style={i === 1 ? { backgroundColor: BLUE } : { border: "2px solid rgba(0,0,0,0.04)" }}>
                  <div className="text-[80px] leading-none select-none"
                    style={{ color: i === 1 ? "rgba(239,42,134,0.2)" : "rgba(239,42,134,0.12)", fontFamily: "Georgia, serif", lineHeight: 0.75 }}>"</div>
                  <p className={`text-base leading-relaxed flex-1 italic mt-4 ${i === 1 ? "text-white/80" : "text-gray-600"}`}>{t.quote}</p>
                  <div className={`mt-6 pt-5 border-t ${i === 1 ? "border-white/10" : "border-black/06"}`}>
                    <p className={`text-sm font-extrabold ${i === 1 ? "text-white" : ""}`} style={i !== 1 ? { color: NAVY } : {}}>{t.name}</p>
                    <p className={`text-xs mt-0.5 ${i === 1 ? "text-white/40" : "text-gray-400"}`}>{t.relation}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* COVERAGE */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <FadeIn className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: PINK }}>Where we work</p>
              <h2 className="text-3xl font-extrabold tracking-tight mb-1" style={{ color: NAVY }}>Home care across</h2>
              <div style={{ ...SCRIPT, fontSize: "clamp(2rem, 4vw, 3rem)", color: BLUE }}>Devon &amp; Cornwall</div>
              <p className="text-gray-400 text-sm leading-relaxed mt-4">
                Don't see your town?{" "}
                <a href="tel:03301658880" className="font-bold hover:underline" style={{ color: PINK }}>Call us</a> — we're always expanding.
              </p>
            </div>
            <div className="lg:col-span-2 flex flex-wrap gap-2">
              {COVERAGE.map((town) => (
                <span key={town} className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: CREAM, color: NAVY }}>
                  {town}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24" style={{ backgroundColor: CREAM }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight" style={{ color: BLUE }}>Ready to get started?</h2>
            <div className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(2rem, 4vw, 3rem)", color: PINK }}>We'd love to hear from you.</div>
            <p className="text-gray-500 mb-10 leading-relaxed">Make a referral today. Our team will arrange a free, no-obligation assessment at a time that suits you.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/referral"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl hover:opacity-90 transition-all hover:scale-105"
                style={{ backgroundColor: PINK, color: "#fff", boxShadow: "0 8px 32px rgba(239,42,134,0.3)" }}
                data-testid="home-bottom-cta">
                Request a Free Assessment <ArrowRight size={18} />
              </Link>
              <a href="tel:03301658880"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-xl hover:opacity-80 transition-all border-2"
                style={{ color: NAVY, borderColor: "rgba(5,22,61,0.2)" }}>
                <Phone size={16} /> 0330 165 8880
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
