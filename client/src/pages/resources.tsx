import { useEffect } from "react";
import { Link } from "wouter";
import { BookOpen, Award, Gift, Mail, Calculator, ArrowRight } from "lucide-react";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const RESOURCES = [
  {
    icon: BookOpen,
    title: "Blog",
    description: "Latest insights and news to keep you informed about trends, best practices, and innovations in home care.",
    link: "/resources/blog",
    color: BLUE,
  },
  {
    icon: Award,
    title: "Working at Smeaton",
    description: "Discover what makes Smeaton Healthcare a great place to work — our culture, benefits, and opportunities.",
    link: "/resources/working-at-smeaton",
    color: PINK,
  },
  {
    icon: Gift,
    title: "Sponsorship",
    description: "We're a licensed Skilled Worker sponsor. Find out about our overseas sponsorship opportunities.",
    link: "/resources/sponsorship",
    color: BLUE,
  },
  {
    icon: Mail,
    title: "Newsletter",
    description: "Stay updated with our latest news, job opportunities, industry insights, and company updates.",
    link: "/resources/newsletter",
    color: PINK,
  },
  {
    icon: Calculator,
    title: "Understanding Care Funding",
    description: "Navigate UK care funding options — NHS support, council funding, and self-funding explained clearly.",
    link: "/resources/costings",
    color: BLUE,
  },
];

export default function Resources() {
  useEffect(() => { document.title = "Resources | Smeaton Healthcare"; }, []);

  return (
    <div data-testid="resources-page">
      {/* HERO */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 pb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Resources hub</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 tracking-tight" style={{ color: NAVY }}>Helpful guides</h1>
          <h1 className="text-4xl sm:text-5xl mb-5" style={{ ...SCRIPT, color: PINK }}>and useful reading.</h1>
          <p className="text-gray-500 text-lg max-w-2xl leading-relaxed" data-testid="resources-description">
            From understanding how care is funded to life at Smeaton — everything in one place.
          </p>
        </div>
      </section>

      {/* RESOURCES GRID */}
      <section className="py-16" style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {RESOURCES.map((r) => {
              const Icon = r.icon;
              return (
                <Link
                  key={r.title}
                  href={r.link}
                  className="group flex flex-col bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-gray-200 hover:shadow-md transition-all"
                  data-testid={`resource-card-${r.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: r.color }}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-extrabold mb-3 tracking-tight" style={{ color: NAVY }}>{r.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1">{r.description}</p>
                  <div className="flex items-center gap-1.5 mt-6 font-bold text-sm transition-all group-hover:gap-2.5" style={{ color: r.color }}>
                    Explore <ArrowRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16" data-testid="resources-cta">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: NAVY }}>Need personalised support?</h2>
          <div className="mb-5" style={{ ...SCRIPT, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: BLUE }}>Our team is here to help.</div>
          <p className="text-gray-500 mb-8 leading-relaxed">Whether you're looking for care for yourself or a loved one, our coordinators are ready to talk.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-bold rounded-xl hover:scale-105 transition-all"
              style={{ backgroundColor: PINK, boxShadow: "0 8px 24px rgba(239,42,134,0.35)" }}
              data-testid="resources-contact-button">
              Get in Touch <ArrowRight size={16} />
            </Link>
            <Link href="/jobs"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 font-bold rounded-xl text-[#05163D] hover:bg-black/5 transition-all border-2"
              style={{ borderColor: "rgba(5,22,61,0.15)" }}
              data-testid="resources-jobs-button">
              Browse Careers <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
