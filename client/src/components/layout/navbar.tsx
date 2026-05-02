import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu, Phone, ChevronDown, ArrowRight } from "lucide-react";
import logoImage from "@/assets/logo.png";

const SERVICES_MENU = [
  {
    href: "/services/short-visits",
    name: "Short Visits",
    desc: "Flexible care visits from one hour upwards, built around your daily routine.",
  },
  {
    href: "/services/supported-living",
    name: "Supported Living",
    desc: "Helping adults live independently with exactly the right level of support.",
  },
  {
    href: "/services/care-24-7",
    name: "24/7 Care",
    desc: "Round-the-clock care for people with complex, high-dependency needs.",
  },
  {
    href: "/services/enablements",
    name: "Enabling",
    desc: "Building independence, not dependency — helping people achieve their own goals.",
  },
  {
    href: "/services/respite",
    name: "Respite Care",
    desc: "Short-term relief for family carers, delivered by our trusted team.",
  },
  {
    href: "/services/live-in-care",
    name: "Live-In Care",
    desc: "Full-time live-in support for people who need constant companionship and care.",
  },
  {
    href: "/services/condition-led-care",
    name: "Condition-Led Care",
    desc: "Specialist care tailored to specific health conditions and complex needs.",
  },
];

const OTHER_NAV = [
  { href: "/about", label: "About Us" },
  { href: "/jobs", label: "Careers" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [location] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    }
    if (servicesOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [servicesOpen]);

  return (
    <>
      <header
        className="fixed left-0 right-0 top-0 z-40"
        style={{ backgroundColor: "white", boxShadow: "0 1px 0 rgba(0,0,0,0.07)" }}
        ref={dropdownRef}
      >
        <div className="px-5 sm:px-8 md:px-12 h-[80px] sm:h-[96px] flex items-center justify-between gap-8">

          <Link href="/" className="shrink-0">
            <img
              src={logoImage}
              alt="Smeaton Healthcare"
              style={{ height: "64px", width: "auto" }}
              className="pl-[50px] pr-[50px]" />
          </Link>

          <div className="hidden md:flex items-center gap-7 ml-auto">

            <button
              onClick={() => setServicesOpen(!servicesOpen)}
              className="flex items-center gap-1 text-sm font-semibold transition-colors duration-200"
              style={{ color: servicesOpen ? "#EF2A86" : "#05163D" }}
            >
              Our Services
              <motion.span animate={{ rotate: servicesOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} strokeWidth={2.5} />
              </motion.span>
            </button>

            {OTHER_NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-semibold transition-colors duration-200"
                style={{ color: location.startsWith(l.href) ? "#EF2A86" : "#05163D" }}
              >
                {l.label}
              </Link>
            ))}

            <a
              href="tel:03301658880"
              className="text-sm font-bold flex items-center gap-1.5 hover:text-[#EF2A86] transition-colors"
              style={{ color: "#265597" }}
            >
              <Phone size={14} />
              0330 165 8880
            </a>

            <Link
              href="/referral"
              className="px-5 py-2.5 text-sm font-bold rounded-lg text-white transition-all hover:opacity-90 hover:scale-105"
              style={{ backgroundColor: "#EF2A86", boxShadow: "0 4px 16px rgba(239,42,134,0.35)" }}
            >
              Free Assessment
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[#05163D]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {servicesOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute left-0 right-0 border-t"
              style={{
                backgroundColor: "white",
                borderColor: "rgba(0,0,0,0.06)",
                boxShadow: "0 24px 48px rgba(5,22,61,0.14)",
              }}
            >
              <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 flex gap-12">

                <div className="w-56 shrink-0 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#EF2A86" }}>
                      Our Services
                    </p>
                    <h3 className="text-xl font-extrabold leading-snug mb-3" style={{ color: "#05163D" }}>
                      Care that fits your life
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Specialist services, designed around the individual — not a one-size-fits-all package.
                    </p>
                  </div>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 text-sm font-bold mt-8 hover:gap-2.5 transition-all"
                    style={{ color: "#EF2A86" }}
                  >
                    View all services <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="w-px shrink-0" style={{ backgroundColor: "rgba(0,0,0,0.07)" }} />

                <div className="flex-1 grid grid-cols-3 gap-4">
                  {SERVICES_MENU.map((s, i) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="group flex flex-col rounded-xl p-4 border hover:border-[#EF2A86] transition-all duration-200 hover:bg-[#FDF7F0]"
                      style={{ borderColor: "rgba(0,0,0,0.08)" }}
                    >
                      <p className="text-sm font-bold mb-1.5" style={{ color: i % 2 === 0 ? "#EF2A86" : "#265597" }}>
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col"
            style={{ backgroundColor: "#05163D" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex items-center justify-between px-5 h-[80px] border-b border-white/10">
              <img
                src={logoImage}
                alt="Smeaton Healthcare"
                className="h-12 w-auto"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <button onClick={() => setMobileOpen(false)} className="p-2 text-white" aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-center px-8 overflow-y-auto">
              <div className="space-y-1">
                <Link href="/" className="block text-2xl font-bold text-white py-3 border-b border-white/10 hover:text-[#EF2A86] transition-colors">Home</Link>
                <Link href="/services" className="block text-2xl font-bold text-white py-3 border-b border-white/10 hover:text-[#EF2A86] transition-colors">Our Services</Link>
                {OTHER_NAV.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="block text-2xl font-bold text-white py-3 border-b border-white/10 hover:text-[#EF2A86] transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link href="/resources" className="block text-2xl font-bold text-white py-3 border-b border-white/10 hover:text-[#EF2A86] transition-colors">Resources</Link>
              </div>
              <div className="mt-10 flex flex-col gap-4">
                <Link
                  href="/referral"
                  className="w-full py-4 text-center text-lg font-bold text-white rounded-xl"
                  style={{ backgroundColor: "#EF2A86" }}
                >
                  Request a Free Assessment
                </Link>
                <a href="tel:03301658880" className="flex items-center justify-center gap-2 py-3 text-white/60 text-base">
                  <Phone size={16} /> 0330 165 8880
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
