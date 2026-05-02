import { useEffect } from "react";
import { Link } from "wouter";
import { SiTrustpilot } from "react-icons/si";
import nhsLogoImg from "@assets/nhs_logo.png";
import googleLogoImg from "@assets/google_logo_white.svg";
import { GraduationCap, CheckCircle, Users, ArrowRight, AlertCircle, Mail, Clock as TickerClock, Star as TickerStar } from "lucide-react";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const OFFERS = [
  { title: "Genuine Employment", desc: "A permanent role with fair pay and conditions in an established care provider." },
  { title: "Training & Development", desc: "Full induction, ongoing training, and the support you need to grow." },
  { title: "Career Progression", desc: "Clear opportunities to advance within the care sector over time." },
  { title: "Support in the UK", desc: "Practical guidance to help you settle into work and life in the UK." },
];

const IMPORTANT = [
  "Sponsorship is only available for roles approved under the Skilled Worker Health and Social Care route.",
  "All applicants must meet UKVI requirements, including English language and eligibility checks.",
  "Sponsorships are never guaranteed. Each decision is based on performance, compliance, and business needs.",
  "Immigration rules can change, and all offers remain subject to Home Office approval.",
];

const FAIR_RECRUITMENT = [
  { title: "No Recruitment Fees", desc: "We do not charge recruitment fees to applicants under any circumstances.", color: "#16a34a" },
  { title: "Fair Consideration", desc: "All applications are considered fairly, in line with UK employment law and Home Office guidance.", color: BLUE },
  { title: "Clear Information", desc: "We provide clear and accurate information about the Skilled Worker route so applicants can make informed decisions.", color: PINK },
];

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

export default function Sponsorship() {
  useEffect(() => { document.title = "Skilled Worker Sponsorship | Smeaton Healthcare"; }, []);

  return (
    <div data-testid="sponsorship-page">
      <Ticker />

      {/* HERO */}
      <section style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Skilled Worker Route</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-1 tracking-tight" style={{ color: BLUE }}>Sponsorship</h1>
          <div className="mb-4" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>joining us from overseas.</div>
          <p className="text-gray-500 text-base max-w-2xl leading-relaxed" data-testid="sponsorship-description">
            Smeaton Healthcare is a licensed Skilled Worker sponsor. We can offer eligible overseas applicants the opportunity to join our dedicated care teams here in the UK.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            {["Licensed Sponsor", "Fair Recruitment", "No Agency Fees"].map((badge) => (
              <div key={badge} className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full bg-white border border-gray-200" style={{ color: NAVY }}>
                <CheckCircle size={14} style={{ color: PINK }} /> {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HIGH VOLUME NOTICE */}
      <section className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="rounded-2xl p-6 border-2 border-red-200 bg-red-50" data-testid="sponsorship-notice">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <div className="text-sm text-red-800 space-y-2">
                <p>Due to the very high number of sponsorship enquiries we receive, we are <strong>unable to take telephone enquiries regarding sponsorship</strong>.</p>
                <p>You are welcome to email us at <a href="mailto:sponsorship@smeatonhealthcare.co.uk" className="underline font-semibold hover:text-red-900">sponsorship@smeatonhealthcare.co.uk</a> — however, we cannot guarantee a response at this time.</p>
                <p>Sponsorship opportunities may only be considered after successful completion of probation and are never guaranteed. All sponsorships are subject to UKVI/Home Office requirements and our business needs. Thank you for your understanding.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS THE SKILLED WORKER ROUTE */}
      <section className="py-14" style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>About the route</p>
          <h2 className="text-2xl font-extrabold mb-3 tracking-tight" style={{ color: BLUE }}>What is the Skilled Worker route?</h2>
          <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-3xl">
            The Skilled Worker route allows overseas candidates to apply for a visa to work in the UK, provided they meet Home Office criteria. In health and social care, this includes roles such as:
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {["Care Workers", "Senior Care Workers", "Homecare Support Staff"].map((role, i) => (
              <div key={role} className="bg-white rounded-xl p-5 border-2 border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: i % 2 === 0 ? `${PINK}15` : `${BLUE}15` }}>
                  <Users size={14} style={{ color: i % 2 === 0 ? PINK : BLUE }} />
                </div>
                <span className="font-bold text-sm" style={{ color: NAVY }}>{role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE OFFER */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>What you get</p>
          <h2 className="text-2xl font-extrabold mb-8 tracking-tight" style={{ color: BLUE }}>What we offer sponsored workers</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {OFFERS.map((o, i) => (
              <div key={i} className="rounded-2xl p-6 border-2 border-gray-100" style={{ backgroundColor: CREAM }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: i % 2 === 0 ? `${PINK}15` : `${BLUE}15` }}>
                  <GraduationCap size={18} style={{ color: i % 2 === 0 ? PINK : BLUE }} />
                </div>
                <h3 className="font-extrabold mb-2 text-base tracking-tight" style={{ color: NAVY }}>{o.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPORTANT INFORMATION */}
      <section className="py-14" style={{ backgroundColor: CREAM }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Please note</p>
          <h2 className="text-2xl font-extrabold mb-8 tracking-tight" style={{ color: BLUE }}>Important information</h2>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 space-y-4">
            {IMPORTANT.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-amber-400">
                  <CheckCircle size={13} className="text-white" />
                </div>
                <p className="text-amber-900 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAIR RECRUITMENT */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Our commitment</p>
          <h2 className="text-2xl font-extrabold mb-8 tracking-tight" style={{ color: BLUE }}>Transparency & fair recruitment</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {FAIR_RECRUITMENT.map((item, i) => (
              <div key={i} className="rounded-2xl p-6 border-2 border-gray-100 text-center" style={{ backgroundColor: CREAM }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${item.color}15` }}>
                  <CheckCircle size={18} style={{ color: item.color }} />
                </div>
                <h3 className="font-extrabold mb-2 text-base tracking-tight" style={{ color: NAVY }}>{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14" style={{ backgroundColor: CREAM }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: BLUE }}>Ready to join our UK care teams?</h2>
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>We'd love to hear from you.</div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/jobs" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-white font-bold rounded-xl hover:scale-105 transition-all" style={{ backgroundColor: PINK, boxShadow: "0 8px 24px rgba(239,42,134,0.4)" }} data-testid="view-positions-button">
              View Available Positions <ArrowRight size={15} />
            </Link>
            <a href="mailto:sponsorship@smeatonhealthcare.co.uk" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-xl hover:opacity-80 transition-all border-2" style={{ color: NAVY, borderColor: "rgba(5,22,61,0.2)" }} data-testid="contact-sponsorship-button">
              <Mail size={15} /> Email About Sponsorship
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
