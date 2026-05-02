import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Phone, Mail, MapPin, Clock, ArrowRight, Clock as TickerClock, Star as TickerStar } from "lucide-react";
import { Link } from "wouter";
import { SiTrustpilot } from "react-icons/si";
import nhsLogoImg from "@assets/nhs_logo.png";
import googleLogoImg from "@assets/google_logo_white.svg";

const SCRIPT = { fontFamily: "'Dancing Script', cursive" };
const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";

const OFFICES = [
  {
    name: "Plymouth Office",
    address: "Brunswick House, Floor Two",
    address2: "1 Brunswick Road, Plymouth",
    postcode: "PL4 0NP",
    phone: "0330 165 8880",
    email: "hello@smeatonhealthcare.co.uk",
    cqc: "CQC Rated Good — April 2022",
    color: PINK,
    mapSrc: "https://www.google.com/maps?q=Brunswick+House+1+Brunswick+Road+Plymouth+PL4+0NP&output=embed",
    mapLink: "https://maps.google.com/?q=Brunswick+House+1+Brunswick+Road+Plymouth+PL4+0NP",
  },
  {
    name: "Cornwall Office",
    address: "Office 10, Unit 11, Kerns House",
    address2: "Threemilestone Industrial Estate, Truro",
    postcode: "TR4 9LE",
    phone: "01872 229865",
    email: "hello@smeatonhealthcare.co.uk",
    cqc: "CQC Rated Good — January 2022",
    color: BLUE,
    mapSrc: "https://www.google.com/maps?q=Kerns+House+Threemilestone+Industrial+Estate+Truro+TR4+9LE&output=embed",
    mapLink: "https://maps.google.com/?q=Kerns+House+Threemilestone+Industrial+Estate+Truro+TR4+9LE",
  },
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

export default function Contact() {
  useEffect(() => { document.title = "Contact Us | Smeaton Healthcare | Devon & Cornwall"; }, []);

  return (
    <div data-testid="contact-page">
      <Ticker />

      {/* HERO */}
      <section style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Get in touch</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-1 tracking-tight" style={{ color: BLUE }}>We'd love to</h1>
            <div className="mb-4" style={{ ...SCRIPT, fontSize: "clamp(2rem, 4vw, 3.2rem)", color: PINK }}>hear from you.</div>
            <p className="text-gray-500 text-lg max-w-xl leading-relaxed">
              Whether you have a question about our services, want to arrange a free assessment, or are interested in joining our team — we're here.
            </p>
          </motion.div>
        </div>
      </section>

      {/* OFFICE CARDS + MAPS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <FadeIn className="mb-10">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: PINK }}>Our offices</p>
            <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: BLUE }}>Find us</h2>
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {OFFICES.map((office, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="rounded-3xl overflow-hidden border-2 border-gray-100 hover:border-gray-200 transition-all h-full flex flex-col">
                  {/* Map */}
                  <div className="w-full h-52 relative">
                    <iframe
                      src={office.mapSrc}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Map for ${office.name}`}
                    />
                    <a
                      href={office.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 text-xs font-bold px-3 py-1.5 rounded-lg text-white shadow-md hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: office.color }}
                    >
                      Open in Maps
                    </a>
                  </div>
                  {/* Details */}
                  <div className="p-7 flex-1" style={{ backgroundColor: CREAM }}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-2 h-8 rounded-full" style={{ backgroundColor: office.color }} />
                      <h2 className="text-xl font-extrabold" style={{ color: NAVY }}>{office.name}</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white" style={{ border: `1.5px solid ${office.color}20` }}>
                          <MapPin size={16} style={{ color: office.color }} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Address</p>
                          <p className="text-sm font-semibold leading-relaxed" style={{ color: NAVY }}>
                            {office.address}<br />
                            {office.address2}<br />
                            {office.postcode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white" style={{ border: `1.5px solid ${office.color}20` }}>
                          <Phone size={16} style={{ color: office.color }} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Phone</p>
                          <a href={`tel:${office.phone.replace(/\s/g, "")}`} className="text-sm font-bold hover:opacity-70 transition-opacity" style={{ color: office.color }}>{office.phone}</a>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white" style={{ border: `1.5px solid ${office.color}20` }}>
                          <Mail size={16} style={{ color: office.color }} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Email</p>
                          <a href={`mailto:${office.email}`} className="text-sm font-bold hover:opacity-70 transition-opacity" style={{ color: office.color }}>{office.email}</a>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-200 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: office.color }} />
                        <p className="text-xs font-bold" style={{ color: office.color }}>{office.cqc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* HOURS */}
      <section className="py-14" style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <FadeIn>
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-100 max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${PINK}15` }}>
                  <Clock size={20} style={{ color: PINK }} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-extrabold mb-5" style={{ color: BLUE }}>Office hours</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { day: "Monday – Friday", hours: "8:00am – 4:00pm", highlight: false },
                      { day: "Saturday & Sunday", hours: "Office closed", highlight: false },
                      { day: "Bank Holidays", hours: "Office closed", highlight: false },
                    ].map((h) => (
                      <div key={h.day}
                        className="flex justify-between items-center px-4 py-3 rounded-xl"
                        style={h.highlight ? { backgroundColor: `${PINK}12` } : { backgroundColor: CREAM }}>
                        <span className="text-sm text-gray-500">{h.day}</span>
                        <span className="text-sm font-bold" style={h.highlight ? { color: PINK } : { color: NAVY }}>{h.hours}</span>
                      </div>
                    ))}
                    <div className="col-span-1 sm:col-span-2 mt-1 px-1">
                      <p className="text-xs font-bold leading-relaxed" style={{ color: PINK }}>
                        Need a carer at the weekend? Our team is always on-call — no matter the day, we're here for you.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <FadeIn className="mb-8">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: PINK }}>What's next</p>
            <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: BLUE }}>Other ways we can help</h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: "/referral", label: "Request a Free Assessment", desc: "Start your care journey today. No obligation, completely free.", color: PINK },
              { href: "/services/short-visits", label: "Our Services", desc: "Explore the range of care options we offer across Devon & Cornwall.", color: BLUE },
              { href: "/jobs", label: "Join Our Team", desc: "We're always looking for caring, dedicated professionals.", color: NAVY },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <Link href={item.href}
                  className="group flex flex-col justify-between p-7 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all hover:shadow-md h-full"
                  style={{ backgroundColor: CREAM }}>
                  <div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: item.color }}>{item.label}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                  <ArrowRight size={16} className="mt-5 transition-all group-hover:translate-x-1" style={{ color: item.color }} />
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: CREAM }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl font-extrabold mb-2" style={{ color: BLUE }}>Need to speak to someone?</h2>
            <div className="mb-6" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>We're just a call away.</div>
            <a href="tel:03301658880"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 text-white font-bold rounded-xl hover:opacity-90 transition-all hover:scale-105"
              style={{ backgroundColor: PINK, boxShadow: "0 8px 32px rgba(239,42,134,0.4)" }}>
              <Phone size={20} /> 0330 165 8880
            </a>
            <p className="text-gray-400 text-sm mt-4">Mon–Fri 8am–4pm · Weekends on-call · 24/7 emergencies</p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
