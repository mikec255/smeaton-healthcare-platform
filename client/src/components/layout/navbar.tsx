import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu, Phone, ChevronDown, ArrowRight, BookOpen, PoundSterling, Mail, Users, Globe } from "lucide-react";
import logoImage from "@/assets/logo.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type NavItem = {
  id: string;
  label: string;
  href?: string;
  dropdown?: { href: string; label: string }[];
  priority: number;
  isButton?: boolean;
  isPrimary?: boolean;
  isPhone?: boolean;
};

const callbackRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  service: z.string().min(1, "Please select a service"),
  preferredTime: z.string().optional(),
});

type CallbackRequest = z.infer<typeof callbackRequestSchema>;

const SERVICES_MENU = [
  { href: "/services/short-visits", name: "Short Visits", desc: "Flexible care visits from one hour upwards, built around your daily routine." },
  { href: "/services/supported-living", name: "Supported Living", desc: "Helping adults live independently with exactly the right level of support." },
  { href: "/services/care-24-7", name: "24/7 Care", desc: "Round-the-clock care for people with complex, high-dependency needs." },
  { href: "/services/enablements", name: "Enabling", desc: "Building independence, not dependency — helping people achieve their own goals." },
  { href: "/services/respite", name: "Respite Care", desc: "Short-term relief for family carers, delivered by our trusted team." },
  { href: "/services/live-in-care", name: "Live-In Care", desc: "Full-time live-in support for people who need constant companionship and care." },
  { href: "/services/condition-led-care", name: "Condition-Led Care", desc: "Specialist care tailored to specific health conditions and complex needs." },
];

const RESOURCES_MENU = [
  { href: "/resources/blog", name: "Blog", desc: "Insights, guidance and stories from the Smeaton Healthcare team.", icon: BookOpen },
  { href: "/resources/costings", name: "Care Funding", desc: "Understand your funding options and what support may be available.", icon: PoundSterling },
  { href: "/resources/newsletter", name: "Newsletter", desc: "Stay up to date with our latest news and opportunities.", icon: Mail },
  { href: "/resources/working-at-smeaton", name: "Working at Smeaton", desc: "Discover what makes us a great place to work.", icon: Users },
  { href: "/resources/sponsorship", name: "Sponsorship", desc: "Information about our Skilled Worker sponsorship route.", icon: Globe },
];

const OTHER_NAV = [
  { href: "/about", label: "About Us" },
  { href: "/jobs", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

function MobileAccordion({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-xl font-bold text-white py-3.5 hover:text-[#EF2A86] transition-colors"
      >
        {label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} strokeWidth={2.5} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pl-3 pb-3 flex flex-col">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [location] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
    setResourcesOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
        setResourcesOpen(false);
      }
    }
    if (servicesOpen || resourcesOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [servicesOpen, resourcesOpen]);

  const handleServicesClick = () => {
    setResourcesOpen(false);
    setServicesOpen(!servicesOpen);
  };

  const handleResourcesClick = () => {
    setServicesOpen(false);
    setResourcesOpen(!resourcesOpen);
  };

  return (
    <>
      <header
        className="fixed left-0 right-0 top-0 z-50 overflow-visible"
        style={{ backgroundColor: "#FDF7F0", boxShadow: "0 1px 0 rgba(0,0,0,0.07)" }}
        ref={dropdownRef}
      >
        <div className="px-5 sm:px-8 md:px-12 h-[80px] sm:h-[96px] flex items-center justify-between gap-6">

          <Link href="/" className="shrink-0 -ml-[28px] sm:ml-0">
            <img src={logoImage} alt="Smeaton Healthcare" style={{ height: "64px", width: "auto", transform: "scale(2.5) translateX(4px)", transformOrigin: "left center" }} />
          </Link>

          {/* Nav links — left side, next to logo */}
          <div className="hidden md:flex items-center gap-6" style={{ marginLeft: "105px" }}>
            <button
              onClick={handleServicesClick}
              className="flex items-center gap-1 text-sm font-semibold transition-colors duration-200"
              style={{ color: servicesOpen ? "#EF2A86" : "#05163D" }}
            >
              Our Services
              <motion.span animate={{ rotate: servicesOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} strokeWidth={2.5} />
              </motion.span>
            </button>

            <button
              onClick={handleResourcesClick}
              className="flex items-center gap-1 text-sm font-semibold transition-colors duration-200"
              style={{ color: resourcesOpen || location.startsWith("/resources") ? "#EF2A86" : "#05163D" }}
            >
              Resources
              <motion.span animate={{ rotate: resourcesOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
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
          </div>

          {/* CTA — right side */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
            <a
              href="tel:03301658880"
              className="text-sm font-bold flex items-center gap-1.5 hover:text-[#EF2A86] transition-colors"
              style={{ color: "#275799" }}
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

        {/* Services Dropdown */}
        <AnimatePresence>
          {servicesOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute left-0 right-0 border-t"
              style={{ backgroundColor: "white", borderColor: "rgba(0,0,0,0.06)", boxShadow: "0 24px 48px rgba(5,22,61,0.14)" }}
            >
              <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 flex gap-12">
                <div className="w-56 shrink-0 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#EF2A86" }}>Our Services</p>
                    <h3 className="text-xl font-extrabold leading-snug mb-3" style={{ color: "#05163D" }}>Care that fits your life</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">Specialist services, designed around the individual — not a one-size-fits-all package.</p>
                  </div>
                  <div className="mt-8" />
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
                      <p className="text-sm font-bold mb-1.5" style={{ color: i % 2 === 0 ? "#EF2A86" : "#275799" }}>{s.name}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resources Dropdown */}
        <AnimatePresence>
          {resourcesOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute left-0 right-0 border-t"
              style={{ backgroundColor: "white", borderColor: "rgba(0,0,0,0.06)", boxShadow: "0 24px 48px rgba(5,22,61,0.14)" }}
            >
              <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 flex gap-12">
                <div className="w-56 shrink-0 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#EF2A86" }}>Resources</p>
                    <h3 className="text-xl font-extrabold leading-snug mb-3" style={{ color: "#05163D" }}>Helpful guides & information</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">Funding guidance, career insights, and the latest from the Smeaton Healthcare team.</p>
                  </div>
                  <div className="mt-8" />
                </div>
                <div className="w-px shrink-0" style={{ backgroundColor: "rgba(0,0,0,0.07)" }} />
                <div className="flex-1 grid grid-cols-3 gap-4">
                  {RESOURCES_MENU.map((r, i) => {
                    const Icon = r.icon;
                    return (
                      <Link
                        key={r.href}
                        href={r.href}
                        className="group flex flex-col rounded-xl p-4 border hover:border-[#EF2A86] transition-all duration-200 hover:bg-[#FDF7F0]"
                        style={{ borderColor: "rgba(0,0,0,0.08)" }}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon size={13} style={{ color: i % 2 === 0 ? "#EF2A86" : "#275799" }} />
                          <p className="text-sm font-bold" style={{ color: i % 2 === 0 ? "#EF2A86" : "#275799" }}>{r.name}</p>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{r.desc}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col"
            style={{ backgroundColor: "#05163D" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex items-center justify-between px-5 h-[80px] border-b border-white/10 shrink-0">
              <img src={logoImage} alt="Smeaton Healthcare" className="h-24 w-auto" style={{ filter: "brightness(0) invert(1)" }} />
              <button onClick={() => setMobileOpen(false)} className="p-2 text-white" aria-label="Close menu">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-10">

              {/* Home */}
              <Link href="/" className="block text-xl font-bold text-white py-3.5 border-b border-white/10 hover:text-[#EF2A86] transition-colors">
                Home
              </Link>

              {/* Services accordion */}
              <MobileAccordion label="Our Services">
                {SERVICES_MENU.map((s) => (
                  <Link key={s.href} href={s.href} className="block py-2.5 text-base font-semibold text-white/80 hover:text-[#EF2A86] transition-colors">
                    {s.name}
                  </Link>
                ))}
                <Link href="/services" className="inline-block mt-1 text-xs font-bold uppercase tracking-widest text-[#EF2A86] hover:opacity-80">
                  All Services →
                </Link>
              </MobileAccordion>

              {/* Resources accordion */}
              <MobileAccordion label="Resources">
                {RESOURCES_MENU.map((r) => (
                  <Link key={r.href} href={r.href} className="block py-2.5 text-base font-semibold text-white/80 hover:text-[#EF2A86] transition-colors">
                    {r.name}
                  </Link>
                ))}
              </MobileAccordion>

              {/* Other links */}
              <Link href="/about" className="block text-xl font-bold text-white py-3.5 border-b border-white/10 hover:text-[#EF2A86] transition-colors">
                About Us
              </Link>
              <Link href="/jobs" className="block text-xl font-bold text-white py-3.5 border-b border-white/10 hover:text-[#EF2A86] transition-colors">
                Careers
              </Link>
              <Link href="/contact" className="block text-xl font-bold text-white py-3.5 border-b border-white/10 hover:text-[#EF2A86] transition-colors">
                Contact
              </Link>

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-4">
                <Link href="/referral" className="w-full py-4 text-center text-lg font-bold text-white rounded-xl" style={{ backgroundColor: "#EF2A86" }}>
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
