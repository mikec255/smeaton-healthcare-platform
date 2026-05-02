import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Heart, Users, Award, Coffee, Target, Shield, ArrowRight } from "lucide-react";

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

export default function WorkingAtSmeaton() {
  useEffect(() => { document.title = "Working at Smeaton | Smeaton Healthcare"; }, []);

  return (
    <div data-testid="working-at-smeaton-page">
      {/* HERO */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 pb-10">
          <Link href="/resources" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-8 hover:opacity-80 transition-opacity" style={{ color: PINK }}>
            <ArrowLeft size={14} /> Back to Resources
          </Link>
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Join our team</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-1 tracking-tight" style={{ color: NAVY }}>Working at Smeaton</h1>
          <div className="mb-4" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>more than just a workplace.</div>
          <p className="text-gray-500 text-base max-w-2xl leading-relaxed" data-testid="working-description">
            Discover what makes Smeaton Healthcare a genuinely great place to work — a team built on care, trust, and shared purpose.
          </p>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-14" style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Why choose us</p>
          <h2 className="text-2xl font-extrabold mb-8 tracking-tight" style={{ color: NAVY }}>Why our team loves working here</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:shadow-sm transition-all" data-testid={`benefit-${i}`}>
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
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>About Smeaton</p>
          <h2 className="text-2xl font-extrabold mb-8 tracking-tight" style={{ color: NAVY }}>The story behind us</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {VALUES.map((v, i) => (
              <div key={i} className="rounded-2xl p-6 border-2 border-gray-100">
                <h3 className="font-extrabold mb-3 text-base tracking-tight" style={{ color: BLUE }}>{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: BLUE }} className="py-14">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Ready to join our family?</h2>
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "rgba(239,42,134,0.9)" }}>We'd love to hear from you.</div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/jobs" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-white font-bold rounded-xl hover:scale-105 transition-all" style={{ backgroundColor: PINK, boxShadow: "0 8px 24px rgba(239,42,134,0.4)" }} data-testid="view-jobs-button">
              View Current Opportunities <ArrowRight size={15} />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-xl text-white hover:bg-white/10 transition-all border-2" style={{ borderColor: "rgba(255,255,255,0.3)" }} data-testid="contact-hr-button">
              Contact Our Team <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
