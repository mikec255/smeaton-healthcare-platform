import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Phone, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const SCRIPT = { fontFamily: "'Dancing Script', cursive" };
const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";

const OFFICES = [
  { name: "Plymouth Office", address: "Smeaton Healthcare, Plymouth, Devon", phone: "0330 165 8880", email: "info@smeatonhealthcare.co.uk", cqc: "CQC Rated Good — April 2022", color: PINK },
  { name: "Cornwall Office", address: "Smeaton Healthcare, Cornwall", phone: "0330 165 8880", email: "info@smeatonhealthcare.co.uk", cqc: "CQC Rated Good — January 2022", color: BLUE },
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

export default function Contact() {
  useEffect(() => { document.title = "Contact Us | Smeaton Healthcare | Devon & Cornwall"; }, []);

  return (
    <div data-testid="contact-page">
      {/* HERO */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute -top-10 -right-10 w-[350px] h-[350px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(38,85,151,0.06) 0%, transparent 70%)" }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: PINK }}>Get in touch</p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-1 leading-tight" style={{ color: NAVY }}>We'd love to</h1>
            <h1 className="text-5xl sm:text-6xl mb-5" style={{ ...SCRIPT, color: PINK }}>hear from you.</h1>
            <p className="text-gray-500 text-lg max-w-xl leading-relaxed">
              Whether you have a question about our services, want to arrange a free assessment, or are interested in joining our team — we're here.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CONTACT CARDS */}
      <section className="py-20" style={{ backgroundColor: "#F4F6FA" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {OFFICES.map((office, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-white rounded-3xl p-8 h-full border-2 border-gray-100 hover:border-gray-200 transition-all">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: office.color }} />
                    <h2 className="text-xl font-bold" style={{ color: NAVY }}>{office.name}</h2>
                  </div>
                  <div className="space-y-5">
                    {[
                      { Icon: MapPin, label: "Address", value: office.address, href: undefined },
                      { Icon: Phone, label: "Phone", value: office.phone, href: `tel:${office.phone.replace(/\s/g, "")}` },
                      { Icon: Mail, label: "Email", value: office.email, href: `mailto:${office.email}` },
                    ].map(({ Icon, label, value, href }) => (
                      <div key={label} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${office.color}15` }}>
                          <Icon size={16} style={{ color: office.color }} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
                          {href ? (
                            <a href={href} className="text-sm font-bold transition-opacity hover:opacity-70" style={{ color: office.color }}>{value}</a>
                          ) : (
                            <p className="text-sm font-medium" style={{ color: NAVY }}>{value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="pt-5 border-t border-gray-100 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: office.color }} />
                      <p className="text-xs font-bold" style={{ color: office.color }}>{office.cqc}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.2}>
            <div className="bg-white rounded-3xl p-8 border border-gray-100">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${PINK}15` }}>
                  <Clock size={20} style={{ color: PINK }} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-5" style={{ color: NAVY }}>Office hours</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { day: "Monday – Friday", hours: "8:00am – 6:00pm", highlight: false },
                      { day: "Saturday", hours: "9:00am – 4:00pm", highlight: false },
                      { day: "Sunday", hours: "On-call only", highlight: false },
                      { day: "Emergencies", hours: "24/7 on-call", highlight: true },
                    ].map((h) => (
                      <div key={h.day}
                        className="flex justify-between items-center px-4 py-3 rounded-xl"
                        style={h.highlight ? { backgroundColor: `${PINK}12` } : { backgroundColor: "#f9fafb" }}>
                        <span className="text-sm text-gray-400">{h.day}</span>
                        <span className="text-sm font-bold" style={h.highlight ? { color: PINK } : { color: NAVY }}>{h.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <FadeIn className="mb-8">
            <h2 className="text-2xl font-bold mb-1" style={{ color: NAVY }}>Other ways we can help</h2>
            <p className="text-gray-400 text-sm">Quick links to our most popular pages</p>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: "/referral", label: "Request a Free Assessment", desc: "Start your care journey today. No obligation, completely free.", color: PINK },
              { href: "/services", label: "Our Services", desc: "Explore the range of care options we offer across Devon & Cornwall.", color: BLUE },
              { href: "/jobs", label: "Join Our Team", desc: "We're always looking for caring, dedicated professionals.", color: NAVY },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <Link href={item.href}
                  className="group flex flex-col justify-between p-7 rounded-2xl bg-white border-2 border-gray-100 hover:border-gray-200 transition-all hover:shadow-md h-full">
                  <div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: item.color }}>{item.label}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                  <ArrowRight size={16} className="mt-5 transition-all group-hover:translate-x-1" style={{ color: item.color }} />
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ backgroundColor: BLUE }} className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl font-extrabold text-white mb-2">Need to speak to someone?</h2>
            <div className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "rgba(239,42,134,0.9)" }}>We're just a call away.</div>
            <a href="tel:03301658880"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 text-white font-bold rounded-xl hover:opacity-90 transition-all hover:scale-105"
              style={{ backgroundColor: PINK, boxShadow: "0 8px 32px rgba(239,42,134,0.4)" }}>
              <Phone size={20} /> 0330 165 8880
            </a>
            <p className="text-white/40 text-sm mt-4">Mon–Fri 8am–6pm · Sat 9am–4pm · 24/7 emergencies</p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
