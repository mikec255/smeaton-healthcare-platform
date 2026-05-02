import { Link } from "wouter";
import { Phone } from "lucide-react";
import logoImage from "@/assets/logo.png";

const NAVY = "#05163D";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: CREAM }} className="">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <img
              src={logoImage}
              alt="Smeaton Healthcare"
              className="h-12 w-auto mb-4"
            />
            <p className="text-sm leading-relaxed max-w-xs mb-5" style={{ color: `${NAVY}99` }}>
              Home care you can trust, delivered by people who care — across Devon &amp; Cornwall since 2019.
            </p>
            <a href="tel:03301658880" className="inline-flex items-center gap-2 font-bold text-base transition-colors hover:text-[#EF2A86]" style={{ color: NAVY }}>
              <Phone size={16} /> 0330 165 8880
            </a>
          </div>

          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Services</p>
            <ul className="space-y-2.5">
              {[
                { href: "/services/short-visits", label: "Short Visits" },
                { href: "/services/supported-living", label: "Supported Living" },
                { href: "/services/care-24-7", label: "24/7 Care" },
                { href: "/services/enablements", label: "Enabling" },
                { href: "/services/respite", label: "Respite Care" },
                { href: "/services/live-in-care", label: "Live-In Care" },
                { href: "/services/condition-led-care", label: "Condition-Led Care" },
              ].map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-sm transition-colors hover:text-[#EF2A86]" style={{ color: `${NAVY}99` }}>
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Company</p>
            <ul className="space-y-2.5">
              {[
                { href: "/about", label: "About Us" },
                { href: "/referral", label: "Request Care" },
                { href: "/jobs", label: "Careers" },
                { href: "/resources/blog", label: "Blog" },
                { href: "/resources/newsletter", label: "Newsletter" },
                { href: "/resources/costings", label: "Care Funding" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors hover:text-[#EF2A86]" style={{ color: `${NAVY}99` }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ borderTop: `1px solid ${NAVY}15` }}>
          <p className="text-sm" style={{ color: `${NAVY}50` }}>© {new Date().getFullYear()} Smeaton Healthcare Ltd. All rights reserved.</p>
          <p className="text-xs" style={{ color: `${NAVY}50` }}>CQC Rated Good — Plymouth (April 2022) &amp; Cornwall (January 2022)</p>
        </div>
      </div>
    </footer>
  );
}
