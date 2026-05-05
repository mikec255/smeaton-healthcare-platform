import Seo from "@/components/seo";
import Ticker from "@/components/layout/ticker";
import { CheckCircle2, GraduationCap, Star } from "lucide-react";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const ALL_STAFF: string[] = [
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

const TEAM_LEADERS: string[] = [
  "Accessible Information",
  "Care Planning",
  "GDPR Stage Two",
  "Information Governance",
  "Recording Information",
  "Wellbeing in the Workplace",
];

export default function Induction() {
  return (
    <div data-testid="induction-page">
      <Seo
        title="Mandatory Training and Induction"
        description="Everything new Smeaton Healthcare team members need to know about mandatory induction training, including all required modules for care staff and team leaders."
        path="/resources/induction"
      />
      <Ticker />

      {/* HERO */}
      <section style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-8 sm:pt-14 sm:pb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>
            New starters
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-1 tracking-tight" style={{ color: BLUE }}>
            Mandatory Training
          </h1>
          <div className="mb-4" style={{ ...SCRIPT, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: PINK }}>
            your induction journey starts here.
          </div>
          <p className="text-gray-500 text-base max-w-2xl leading-relaxed">
            All Smeaton Healthcare team members are required to complete the following training modules as part of their induction. These ensure every member of our team is equipped, confident and safe before working with the people we support.
          </p>
        </div>
      </section>

      {/* ALL STAFF */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: BLUE }}>
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: PINK }}>Required for everyone</p>
              <h2 className="text-2xl font-extrabold tracking-tight leading-tight" style={{ color: NAVY }}>All Care Staff</h2>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {ALL_STAFF.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 border border-gray-100"
                style={{ backgroundColor: CREAM }}
              >
                <CheckCircle2 size={16} className="shrink-0" style={{ color: PINK }} />
                <span className="text-sm font-medium text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM LEADERS */}
      <section className="py-10 sm:py-16" style={{ backgroundColor: CREAM }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: PINK }}>
              <Star size={22} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: PINK }}>In addition to the above</p>
              <h2 className="text-2xl font-extrabold tracking-tight leading-tight" style={{ color: NAVY }}>Team Leaders</h2>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {TEAM_LEADERS.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 border border-gray-100 bg-white"
              >
                <CheckCircle2 size={16} className="shrink-0" style={{ color: BLUE }} />
                <span className="text-sm font-medium text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER NOTE */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-sm text-gray-400 leading-relaxed max-w-xl mx-auto">
            Training requirements may be updated from time to time. If you have any questions about your induction, please speak to your line manager or contact the office.
          </p>
        </div>
      </section>
    </div>
  );
}
