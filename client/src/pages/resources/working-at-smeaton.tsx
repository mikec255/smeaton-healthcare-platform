import { useEffect } from "react";
import { Link } from "wouter";
import Seo from "@/components/seo";
import { SiTrustpilot } from "react-icons/si";
import nhsLogoImg from "@assets/nhs_logo.png";
import googleLogoImg from "@assets/google_logo_white.svg";
import { Heart, Users, Award, Coffee, Target, Shield, ArrowRight, Clock as TickerClock, Star as TickerStar } from "lucide-react";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const BENEFITS = [
  { icon: Heart, title: "Work-Life Balance", description: "Flexible working arrangements and support for your personal wellbeing alongside your professional growth." },
  { icon: Users, title: "Supportive Team", description: "Join a family-like environment where colleagues support each other and celebrate successes together." },
  { icon: Award, title: "Career Development", description: "Ongoing training, mentorship programs, and clear pathways for career progression and skill enhancement." },
  { icon: Coffee, title: "Great Workplace Culture", description: "Enjoy team events, social activities, and a positive workplace atmosphere that makes coming to work a pleasure." },
  { icon: Target, title: "Making a Difference", description: "Your work directly impacts lives across Devon and Cornwall, connecting skilled professionals with the people who need them." },
  { icon: Shield, title: "Job Security", description: "Stable employment with a growing company that values long-term relationships with our team members." },
];

const VALUES = [
  { title: "Our Mission", description: "Founded with a passion for connecting exceptional care professionals with the people who need them most, we bridge the gap between talent and opportunity across the South West." },
  { title: "Local Expertise", description: "With deep roots in Devon and Cornwall, we understand the unique healthcare landscape of our region. Our local knowledge ensures perfect matches between carers and the people they support." },
  { title: "Our Values", description: "Excellence, integrity, and genuine care guide everything we do. We believe that when our team thrives, we can better serve the people who depend on us." },
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

export default function WorkingAtSmeaton() {

  return (
    <div data-testid="working-at-smeaton-page">
      <Seo title="Working at Smeaton Healthcare" description="Discover what it's like to work at Smeaton Healthcare — our culture, values, benefits and career development opportunities across Devon and Cornwall." path="/resources/working-at-smeaton" />
      <Ticker />

      {/* HERO */}
      <section style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Join our team</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-1 tracking-tight" style={{ color: BLUE }}>Working at Smeaton</h1>
          <div className="mb-4" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>more than just a workplace.</div>
          <p className="text-gray-500 text-base max-w-2xl leading-relaxed" data-testid="working-description">
            Discover what makes Smeaton Healthcare a genuinely great place to work — a team built on care, trust, and shared purpose.
          </p>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Why choose us</p>
          <h2 className="text-2xl font-extrabold mb-8 tracking-tight" style={{ color: BLUE }}>Why our team loves working here</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="rounded-2xl p-6 border-2 border-gray-100 hover:shadow-sm transition-all" style={{ backgroundColor: CREAM }} data-testid={`benefit-${i}`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${PINK}15` }}>
                    <Icon size={18} style={{ color: PINK }} />
                  </div>
                  <h3 className="font-extrabold mb-2 text-base tracking-tight" style={{ color: NAVY }}>{b.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{b.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-14" style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>About Smeaton</p>
          <h2 className="text-2xl font-extrabold mb-8 tracking-tight" style={{ color: BLUE }}>The story behind us</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {VALUES.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border-2 border-gray-100">
                <h3 className="font-extrabold mb-3 text-base tracking-tight" style={{ color: BLUE }}>{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: BLUE }}>Ready to join our family?</h2>
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>We'd love to hear from you.</div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/jobs" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-white font-bold rounded-xl hover:scale-105 transition-all" style={{ backgroundColor: PINK, boxShadow: "0 8px 24px rgba(239,42,134,0.4)" }} data-testid="view-jobs-button">
              View Current Opportunities <ArrowRight size={15} />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-xl hover:opacity-80 transition-all border-2" style={{ color: NAVY, borderColor: "rgba(5,22,61,0.2)" }} data-testid="contact-hr-button">
              Contact Our Team <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
