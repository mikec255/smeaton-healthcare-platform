import { Printer, Phone, Globe, MapPin, Check, Star } from "lucide-react";
import logoImage from "@/assets/logo.png";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const SERVICES = [
  "Short Visits",
  "Live-In Care",
  "24/7 Care",
  "Supported Living",
  "Respite Care",
  "Condition-Led Care",
  "Enabling",
];

const TOWNS = [
  "Plymouth","Saltash","Tavistock","Liskeard","Ivybridge",
  "Truro","Falmouth","Penzance","St Ives","Hayle",
  "Newquay","Bodmin","St Austell","Camborne","Redruth",
  "Launceston","Wadebridge","Helston","Totnes","Kingsbridge",
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
            position: relative !important;
          }
          .leaflet-side:last-child { page-break-after: avoid; break-after: avoid; }
          .leaflet-wrapper { display: block !important; padding: 0 !important; background: white !important; }
          nav, footer, [data-testid="ticker"], .chat-widget { display: none !important; }
          main { padding-top: 0 !important; }
        }

        .leaflet-wrapper {
          background: #e2e8f0;
          padding: 48px 24px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 52px;
        }

        .leaflet-side {
          width: 210mm;
          height: 148mm;
          background: ${CREAM};
          box-shadow: 0 30px 80px rgba(0,0,0,0.18);
          overflow: hidden;
          position: relative;
        }
      `}</style>

      {/* Controls */}
      <div className="print-hide" style={{ background: NAVY, padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <p style={{ color: CREAM, fontWeight: 700, margin: 0, fontSize: "14px" }}>A5 Landscape — Front &amp; Back</p>
          <p style={{ color: "rgba(253,247,240,0.4)", margin: 0, fontSize: "11px" }}>Print: A5 · Landscape · Margins: None · Headers &amp; footers: Off</p>
        </div>
        <button onClick={() => window.print()} style={{ background: PINK, color: "white", border: "none", borderRadius: "10px", padding: "10px 22px", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          <Printer size={16} /> Print
        </button>
      </div>

      <div className="leaflet-wrapper">

        {/* ── FRONT ─────────────────────────────────────────────── */}
        <div className="leaflet-side">

          {/* Soft background circles — decorative warmth */}
          <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: `${PINK}0D`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-60px", left: "36%", width: "220px", height: "220px", borderRadius: "50%", background: `${BLUE}08`, pointerEvents: "none" }} />

          {/* TOP NAV */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 28px 0" }}>
            <img src={logoImage} alt="Smeaton Healthcare" style={{ height: "40px", width: "auto" }} />
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.06em" }}>CQC RATED GOOD</span>
              <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#d1d5db" }} />
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.06em" }}>NHS APPROVED</span>
              <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#d1d5db" }} />
              <div style={{ display: "flex", gap: "1px" }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={PINK} style={{ color: PINK }} />)}
              </div>
              <span style={{ fontSize: "10px", fontWeight: 700, color: PINK }}>4.9 on Google</span>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div style={{ display: "flex", padding: "18px 28px 0", gap: "40px", alignItems: "flex-start" }}>

            {/* LEFT: headline + intro + contact */}
            <div style={{ flex: "0 0 52%" }}>
              <div style={{ ...SCRIPT, fontSize: "38px", color: PINK, lineHeight: 1.1, marginBottom: "8px" }}>
                care that feels<br />like family.
              </div>
              <p style={{ fontSize: "12px", color: BLUE, fontWeight: 800, marginBottom: "10px", lineHeight: 1.4 }}>
                Home care across Devon &amp; Cornwall
              </p>
              <p style={{ fontSize: "11px", color: "#4b5563", lineHeight: 1.65, margin: "0 0 18px", maxWidth: "280px" }}>
                We know how hard it is to find care you can truly trust. At Smeaton Healthcare, we match you with consistent, trained carers who get to know your loved one — and genuinely care about their wellbeing.
              </p>

              {/* Soft contact card */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", background: "white", borderRadius: "14px", padding: "12px 18px", boxShadow: "0 4px 20px rgba(239,42,134,0.12)" }}>
                <div style={{ background: `${PINK}15`, borderRadius: "10px", padding: "8px" }}>
                  <Phone size={16} style={{ color: PINK }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "9px", color: "#9ca3af", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Free call — no obligation</p>
                  <p style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: NAVY, letterSpacing: "-0.5px" }}>0330 165 8880</p>
                </div>
              </div>
            </div>

            {/* RIGHT: services soft list */}
            <div style={{ flex: 1, paddingTop: "4px" }}>
              <p style={{ margin: "0 0 12px", fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}>How we can help</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {SERVICES.map((s, i) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                    <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: i % 2 === 0 ? `${PINK}15` : `${BLUE}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Check size={10} style={{ color: i % 2 === 0 ? PINK : BLUE }} />
                    </div>
                    <span style={{ fontSize: "11.5px", fontWeight: 700, color: NAVY }}>{s}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Globe size={11} style={{ color: "#9ca3af" }} />
                  <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: 600 }}>smeatonhealthcare.co.uk</span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM warm strip */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: `${PINK}10`, padding: "9px 28px", display: "flex", alignItems: "center", gap: "6px" }}>
            <MapPin size={11} style={{ color: PINK, flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: "10px", color: "#6b7280", lineHeight: 1.4 }}>
              <span style={{ fontWeight: 700, color: BLUE }}>Covering: </span>
              {TOWNS.slice(0, 12).join(" · ")} <span style={{ color: "#9ca3af" }}>and surrounding areas</span>
            </p>
          </div>
        </div>


        {/* ── BACK ──────────────────────────────────────────────── */}
        <div className="leaflet-side">

          {/* Decorative circles */}
          <div style={{ position: "absolute", top: "-60px", left: "-60px", width: "240px", height: "240px", borderRadius: "50%", background: `${PINK}0A`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-80px", right: "30%", width: "260px", height: "260px", borderRadius: "50%", background: `${BLUE}07`, pointerEvents: "none" }} />

          <div style={{ display: "flex", height: "100%" }}>

            {/* LEFT: Testimonial — big and human */}
            <div style={{ flex: "0 0 48%", padding: "28px 30px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
              <div>
                {/* Stars */}
                <div style={{ display: "flex", gap: "2px", marginBottom: "14px" }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={PINK} style={{ color: PINK }} />)}
                </div>

                {/* Big quote */}
                <div style={{ ...SCRIPT, fontSize: "22px", color: NAVY, lineHeight: 1.4, marginBottom: "14px" }}>
                  "The carers from Smeaton are wonderful. Mum knows them by name and looks forward to every visit."
                </div>
                <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: PINK }}>Sarah T. — Daughter of service user, Plymouth</p>
              </div>

              <div>
                <img src={logoImage} alt="Smeaton Healthcare" style={{ height: "32px", width: "auto", marginBottom: "10px" }} />
                <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                  <Phone size={12} style={{ color: PINK }} />
                  <span style={{ fontSize: "16px", fontWeight: 900, color: NAVY }}>0330 165 8880</span>
                </div>
                <div style={{ display: "flex", gap: "5px", alignItems: "center", marginTop: "4px" }}>
                  <Globe size={11} style={{ color: "#9ca3af" }} />
                  <span style={{ fontSize: "10px", color: "#6b7280", fontWeight: 600 }}>smeatonhealthcare.co.uk</span>
                </div>
              </div>
            </div>

            {/* DIVIDER */}
            <div style={{ width: "1px", background: "rgba(0,0,0,0.07)", margin: "24px 0" }} />

            {/* RIGHT: Why us + areas */}
            <div style={{ flex: 1, padding: "28px 26px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: PINK }}>Why families choose us</p>
                <div style={{ ...SCRIPT, fontSize: "22px", color: BLUE, lineHeight: 1.2, marginBottom: "16px" }}>what makes us different.</div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { title: "The same carers, every time", body: "Familiar faces build real trust — no strangers at the door." },
                    { title: "Care can start within 24 hours", body: "Urgent or planned — we move at your pace, not ours." },
                    { title: "Trained, DBS checked & insured", body: "Every carer is fully vetted before their very first visit." },
                    { title: "All funding types welcome", body: "Self-funded, direct payments, local authority and NHS budgets." },
                  ].map((p) => (
                    <div key={p.title} style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: PINK, flexShrink: 0, marginTop: "5px" }} />
                      <div>
                        <span style={{ fontWeight: 800, fontSize: "11px", color: NAVY }}>{p.title} — </span>
                        <span style={{ fontSize: "11px", color: "#6b7280" }}>{p.body}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Areas */}
              <div style={{ paddingTop: "12px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "7px" }}>
                  <MapPin size={11} style={{ color: BLUE }} />
                  <span style={{ fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: BLUE }}>Areas we cover</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {TOWNS.map(t => (
                    <span key={t} style={{ fontSize: "9px", fontWeight: 600, color: "#6b7280", background: "white", padding: "2px 8px", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.08)" }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
