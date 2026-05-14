import { Printer, Phone, Globe, MapPin, CheckCircle2, Clock, Home as HomeIcon, Heart, Zap, RefreshCw, User, Activity, Star } from "lucide-react";
import logoImage from "@/assets/logo.png";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const SERVICES = [
  { icon: Clock,      name: "Short Visits",        desc: "Personal care, medication and companionship." },
  { icon: User,       name: "Live-In Care",         desc: "Full-time support in the comfort of home." },
  { icon: Activity,   name: "24/7 Care",            desc: "Round-the-clock cover for complex needs." },
  { icon: HomeIcon,   name: "Supported Living",     desc: "Helping adults live independently every day." },
  { icon: RefreshCw,  name: "Respite Care",         desc: "Short-term relief so carers can recharge." },
  { icon: Heart,      name: "Condition-Led Care",   desc: "Specialist care for dementia, MS, Parkinson's and more." },
  { icon: Zap,        name: "Enabling",             desc: "Empowering independence, not dependency." },
];

const TOWNS = [
  "Plymouth","Saltash","Liskeard","Tavistock","Truro","Falmouth",
  "Penzance","Newquay","Bodmin","St Austell","Launceston","Helston",
  "Camborne","Redruth","St Ives","Hayle","Ivybridge","Totnes","Kingsbridge","Wadebridge",
];

export default function Leaflet() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');

        @media print {
          @page { size: A5 landscape; margin: 0; }
          body { margin: 0 !important; padding: 0 !important; }
          .print-hide { display: none !important; }
          .leaflet-side {
            page-break-after: always;
            break-after: page;
            width: 210mm !important;
            height: 148mm !important;
            overflow: hidden;
            box-shadow: none !important;
            display: flex !important;
          }
          .leaflet-side:last-child { page-break-after: avoid; break-after: avoid; }
          .leaflet-wrapper {
            display: block !important;
            padding: 0 !important;
            background: white !important;
          }
          nav, footer, [data-testid="ticker"], .chat-widget { display: none !important; }
          main { padding-top: 0 !important; }
        }

        .leaflet-wrapper {
          background: #d1d5db;
          padding: 48px 24px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 48px;
        }

        .leaflet-side {
          width: 210mm;
          height: 148mm;
          background: white;
          box-shadow: 0 25px 80px rgba(0,0,0,0.25);
          overflow: hidden;
          display: flex;
          flex-direction: row;
          position: relative;
        }
      `}</style>

      {/* Control bar */}
      <div className="print-hide" style={{ background: "#1f2937", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <p style={{ color: CREAM, fontWeight: 700, margin: 0, fontSize: "14px" }}>A5 Landscape Leaflet — Front &amp; Back</p>
          <p style={{ color: "rgba(253,247,240,0.45)", margin: 0, fontSize: "11px" }}>Print → Paper size: A5, Orientation: Landscape, Margins: None, Headers &amp; footers: Off</p>
        </div>
        <button
          onClick={() => window.print()}
          style={{ background: PINK, color: "white", border: "none", borderRadius: "10px", padding: "10px 22px", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 20px rgba(239,42,134,0.4)" }}
        >
          <Printer size={16} /> Print Leaflet
        </button>
      </div>

      <div className="leaflet-wrapper">

        {/* ============================================================
            FRONT — Left pink panel + right cream panel
        ============================================================ */}
        <div className="leaflet-side">

          {/* LEFT: Pink brand panel */}
          <div style={{ width: "38%", background: PINK, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "28px 26px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
            {/* Decorative circle */}
            <div style={{ position: "absolute", bottom: "-60px", right: "-60px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            <div style={{ position: "absolute", top: "-40px", left: "-40px", width: "140px", height: "140px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />

            <div style={{ position: "relative", zIndex: 2 }}>
              {/* Logo */}
              <img src={logoImage} alt="Smeaton Healthcare" style={{ height: "36px", width: "auto", marginBottom: "22px", filter: "brightness(0) invert(1)" }} />

              {/* Tagline */}
              <div style={{ ...SCRIPT, fontSize: "30px", color: "white", lineHeight: 1.2, marginBottom: "14px" }}>
                care that feels<br />like family.
              </div>
              <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "11.5px", lineHeight: 1.6, margin: 0 }}>
                Trusted home care across Devon &amp; Cornwall, helping people live well and independently at home.
              </p>
            </div>

            {/* Bottom contact */}
            <div style={{ position: "relative", zIndex: 2 }}>
              <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: "10px", padding: "12px 14px" }}>
                <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.7)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Call us free</p>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <Phone size={14} style={{ color: "white" }} />
                  <span style={{ color: "white", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.5px" }}>0330 165 8880</span>
                </div>
                <p style={{ margin: "5px 0 0", color: "rgba(255,255,255,0.65)", fontSize: "10px" }}>smeatonhealthcare.co.uk</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Services + trust */}
          <div style={{ flex: 1, background: CREAM, display: "flex", flexDirection: "column", padding: "24px 26px 20px" }}>
            {/* Top strip */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "9px", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: PINK }}>Our Care Services</p>
                <p style={{ margin: "2px 0 0", fontWeight: 800, fontSize: "16px", color: BLUE, letterSpacing: "-0.5px" }}>Everything you need, at home.</p>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <span style={{ background: `${PINK}18`, color: PINK, fontSize: "9px", fontWeight: 800, padding: "4px 9px", borderRadius: "20px", letterSpacing: "0.04em" }}>CQC Rated Good</span>
                <span style={{ background: `${BLUE}12`, color: BLUE, fontSize: "9px", fontWeight: 800, padding: "4px 9px", borderRadius: "20px", letterSpacing: "0.04em" }}>NHS Approved</span>
              </div>
            </div>

            {/* 2-column service list */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px", flex: 1 }}>
              {SERVICES.map((s, i) => (
                <div key={s.name} style={{ display: "flex", alignItems: "flex-start", gap: "9px", background: "white", borderRadius: "8px", padding: "9px 11px", border: `1px solid rgba(39,87,153,0.07)` }}>
                  <div style={{ background: i % 2 === 0 ? `${PINK}15` : `${BLUE}12`, borderRadius: "6px", padding: "5px", flexShrink: 0 }}>
                    <s.icon size={12} style={{ color: i % 2 === 0 ? PINK : BLUE }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: "10.5px", color: NAVY, lineHeight: 1.3 }}>{s.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "9.5px", color: "#6b7280", lineHeight: 1.4 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust bar */}
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(39,87,153,0.1)" }}>
              {[
                { v: "★ 4.9", l: "Google" },
                { v: "★ 4.6", l: "Trustpilot" },
                { v: "Since", l: "2019" },
                { v: "Care", l: "Within 24hrs" },
              ].map((t) => (
                <div key={t.l} style={{ flex: 1, textAlign: "center" }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: "11px", color: BLUE }}>{t.v}</p>
                  <p style={{ margin: 0, fontSize: "8.5px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{t.l}</p>
                </div>
              ))}
              <div style={{ borderLeft: "1px solid rgba(39,87,153,0.1)", paddingLeft: "8px", display: "flex", alignItems: "center" }}>
                <div style={{ background: PINK, borderRadius: "8px", padding: "8px 12px", cursor: "pointer" }}>
                  <p style={{ margin: 0, color: "white", fontWeight: 800, fontSize: "9.5px", lineHeight: 1.3, textAlign: "center" }}>Free<br />Assessment</p>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* ============================================================
            BACK — 3-column layout: why us | quote+areas | contact strip
        ============================================================ */}
        <div className="leaflet-side">

          {/* LEFT: Why choose us */}
          <div style={{ width: "44%", background: "white", padding: "28px 26px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ marginBottom: "16px" }}>
              <p style={{ margin: "0 0 4px", fontSize: "9px", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: PINK }}>Why choose Smeaton</p>
              <div style={{ ...SCRIPT, fontSize: "26px", color: BLUE, lineHeight: 1.2 }}>What makes us different.</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "11px", flex: 1 }}>
              {[
                { title: "The same carers, every visit", detail: "No strangers at the door. You'll build a real relationship with a consistent team." },
                { title: "Trained, checked and insured", detail: "Every carer is fully DBS checked, trained and supervised before your first visit." },
                { title: "Care can start in 24 hours", detail: "Urgent or planned — we work around your timeline, not ours." },
                { title: "All funding types accepted", detail: "Self-funded, direct payments, personal health budgets and local authority funding." },
              ].map((p, i) => (
                <div key={i} style={{ display: "flex", gap: "10px" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: `${PINK}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                    <CheckCircle2 size={12} style={{ color: PINK }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: "11px", color: NAVY }}>{p.title}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "10px", color: "#6b7280", lineHeight: 1.4 }}>{p.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CENTRE: Testimonial + areas */}
          <div style={{ flex: 1, background: CREAM, padding: "28px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {/* Testimonial */}
            <div>
              <div style={{ display: "flex", gap: "1px", marginBottom: "10px" }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={13} fill={PINK} style={{ color: PINK }} />)}
              </div>
              <blockquote style={{ margin: 0, borderLeft: `3px solid ${PINK}`, paddingLeft: "14px" }}>
                <p style={{ margin: "0 0 8px", fontSize: "12px", color: NAVY, fontStyle: "italic", lineHeight: 1.6 }}>
                  "The carers from Smeaton are wonderful — Mum knows them by name and actually looks forward to their visits. I genuinely don't know what we'd do without them."
                </p>
                <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, color: PINK }}>Sarah T., Daughter of service user — Plymouth</p>
              </blockquote>
            </div>

            {/* Areas */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
                <MapPin size={11} style={{ color: BLUE }} />
                <p style={{ margin: 0, fontSize: "9px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: BLUE }}>Areas Covered</p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {TOWNS.slice(0, 16).map(t => (
                  <span key={t} style={{ background: `${BLUE}10`, color: BLUE, fontSize: "9px", fontWeight: 600, padding: "2px 7px", borderRadius: "20px" }}>{t}</span>
                ))}
                <span style={{ color: "#9ca3af", fontSize: "9px", fontWeight: 600, padding: "2px 4px" }}>& more</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Pink CTA panel */}
          <div style={{ width: "26%", background: PINK, padding: "28px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />

            <div style={{ position: "relative", zIndex: 2 }}>
              <img src={logoImage} alt="Smeaton Healthcare" style={{ height: "28px", width: "auto", filter: "brightness(0) invert(1)", marginBottom: "20px" }} />
              <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.75)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Get started today</p>
              <p style={{ margin: "0 0 14px", color: "white", fontWeight: 800, fontSize: "15px", lineHeight: 1.3 }}>Book your free care assessment</p>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: "10px", lineHeight: 1.5 }}>No obligation. We'll discuss your needs and find the right support.</p>
            </div>

            <div style={{ position: "relative", zIndex: 2 }}>
              <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "10px", padding: "12px 14px" }}>
                <p style={{ margin: "0 0 2px", color: "rgba(255,255,255,0.65)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Call us</p>
                <p style={{ margin: "0 0 6px", color: "white", fontWeight: 800, fontSize: "16px" }}>0330 165 8880</p>
                <div style={{ height: "1px", background: "rgba(255,255,255,0.2)", margin: "6px 0" }} />
                <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: "10px" }}>smeatonhealthcare.co.uk</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
