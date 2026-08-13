import { Link } from "wouter";
import { Phone } from "lucide-react";
import logoImage from "@/assets/logo.png";

const PINK = "#EF2A86";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: PINK }} className="text-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* Logo + tagline — full width on mobile, 2 cols on desktop */}
          <div className="lg:col-span-2">
            <img
              src={logoImage}
              alt="Smeaton Healthcare"
              className="h-20 w-auto mb-3"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <p className="text-white/70 text-sm leading-relaxed max-w-xs mb-4">
              Home care you can trust, delivered by people who care — across Devon &amp; Cornwall since 2019.
            </p>
            <a href="tel:03301658880" className="inline-flex items-center gap-2 text-white font-bold text-base transition-colors hover:text-white/80">
              <Phone size={16} /> 0330 165 8880
            </a>
          </div>

          {/* Services + Company: side-by-side on mobile, separate cols on desktop */}
          <div className="grid grid-cols-2 gap-6 lg:contents">

            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4 text-white/50">Services</p>
              <ul className="space-y-2.5">
                {[
                  { href: "/services/short-visits",       label: "Short Visits" },
                  { href: "/services/supported-living",   label: "Supported Living" },
                  { href: "/services/care-24-7",          label: "24/7 Care" },
                  { href: "/services/enablements",        label: "Enabling" },
                  { href: "/services/respite",            label: "Respite Care" },
                  { href: "/services/live-in-care",       label: "Live-In Care" },
                  { href: "/services/condition-led-care", label: "Condition-Led Care" },
                ].map((s) => (
                  <li key={s.href}>
                    <Link href={s.href} className="text-white/70 hover:text-white text-sm transition-colors">
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4 text-white/50">Company</p>
              <ul className="space-y-2.5">
                {[
                  { href: "/about",               label: "About Us" },
                  { href: "/referral",            label: "Request Care" },
                  { href: "/jobs",                label: "Careers" },
                  { href: "/resources/blog",      label: "Blog" },
                  { href: "/resources/newsletter",label: "Newsletter" },
                  { href: "/resources/costings",  label: "Care Funding" },
                  { href: "/contact",             label: "Contact" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/70 hover:text-white text-sm transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-white/50 text-sm">© {new Date().getFullYear()} Smeaton Healthcare Ltd. All rights reserved.</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
            <Link href="/privacy" className="text-white/50 hover:text-white/80 text-xs transition-colors">Privacy Notice</Link>
            <p className="text-white/50 text-xs">CQC Rated Good — Plymouth (April 2022) &amp; Cornwall (January 2022)</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
