import Seo from "@/components/seo";
import Ticker from "@/components/layout/ticker";
import { CheckCircle2, GraduationCap, ShieldCheck, Users, Heart } from "lucide-react";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const TRAINING: string[] = [
  "Basic Life Support Theory",
  "Basic Life Support / First Aid Practical",
  "Care Certificate",
  "CYP Safeguarding Children and Young People",
  "Equality, Diversity and Inclusion",
  "Fire Safety",
  "First Aid Theory",
  "Food Hygiene",
  "GDPR Stage One",
  "Health and Safety",
  "Infection Control",
  "LGBTQ+ Aware for Care",
  "Managing Continence",
  "Medication",
  "Mental Capacity and DoLS",
  "Moving and Handling Practical",
  "Moving and Handling Theory",
  "Oliver McGowan Learning Disabilities",
  "Oral Care",
  "Personal Care",
  "Prevent Extremism and Radicalisation",
  "Safeguarding Adults",
  "Sepsis",
  "Smeaton Induction",
];

const WHY_CARDS = [
  {
    icon: ShieldCheck,
    color: BLUE,
    title: "Built around safety",
    body: "Every module on this list exists for a reason. Whether it is knowing how to respond in an emergency, handling medication correctly, or understanding the principles of safeguarding, these are the foundations that keep the people we support safe.",
  },
  {
    icon: Heart,
    color: PINK,
    title: "Built around people",
    body: "Good care is about far more than tasks. Modules like Equality, Diversity and Inclusion, LGBTQ+ Aware for Care and Oliver McGowan Learning Disabilities are here because the people we support deserve to be understood, respected and celebrated for who they are.",
  },
  {
    icon: Users,
    color: NAVY,
    title: "Built around you",
    body: "We never want anyone to feel thrown in at the deep end. Your induction is designed to give you confidence before you step through a client's door, so you can focus on doing what you came here to do: making a real difference.",
  },
];

export default function Induction() {
  return (
    <div data-testid="induction-page">
      <Seo
        title="Induction and Mandatory Training"
        description="Find out what mandatory training all Smeaton Healthcare team members complete as part of their induction, and why it matters."
        path="/resources/induction"
      />
      <Ticker />

      {/* HERO */}
      <section style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-10 sm:pt-14 sm:pb-14">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>
            New starters
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-1 tracking-tight" style={{ color: BLUE }}>
            Induction and Mandatory Training
          </h1>
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>
            starting well makes all the difference.
          </div>
          <p className="text-gray-500 text-base max-w-2xl leading-relaxed">
            Before you begin supporting clients, every member of the Smeaton Healthcare team completes a structured induction. It is not just a box-ticking exercise. It is how we make sure you feel ready, confident and supported from day one.
          </p>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: PINK }}>Why it matters</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight" style={{ color: BLUE }}>
            There is a purpose behind every module
          </h2>
          <p className="text-gray-500 text-base max-w-2xl leading-relaxed mb-10">
            Mandatory training is a legal and regulatory requirement, but at Smeaton we think of it differently. It is the first chance we get to invest in you, and to make sure you are equipped to do this work with skill and with care.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {WHY_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-2xl p-7 border border-gray-100" style={{ backgroundColor: CREAM }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: card.color }}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-extrabold text-base mb-2 tracking-tight" style={{ color: NAVY }}>{card.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{card.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRAINING LIST */}
      <section className="py-10 sm:py-16" style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: BLUE }}>
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: PINK }}>Required for all care staff</p>
              <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: NAVY }}>Mandatory training modules</h2>
            </div>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-2xl">
            All 24 modules below must be completed as part of your induction. Some are theory-based, some are practical and hands-on. Your manager will walk you through how and when each one is completed.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TRAINING.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 border border-gray-100 bg-white"
              >
                <CheckCircle2 size={15} className="shrink-0" style={{ color: PINK }} />
                <span className="text-sm font-medium text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING NOTE */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="rounded-3xl p-8 sm:p-12 text-center" style={{ backgroundColor: CREAM }}>
            <h3 className="text-xl font-extrabold mb-3 tracking-tight" style={{ color: NAVY }}>
              Questions about your induction?
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-lg mx-auto mb-1">
              Your line manager is always the best first port of call. If you are not sure what you need to complete, or when, just ask. We would rather you ask ten times than feel uncertain about anything.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed max-w-lg mx-auto">
              You can also contact the office on{" "}
              <a href="tel:03301658880" className="font-bold" style={{ color: BLUE }}>0330 165 8880</a> and the team will be happy to help.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
