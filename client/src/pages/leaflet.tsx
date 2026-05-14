import { Printer, Phone, Globe, MapPin, Star, Shield, CheckCircle2, Clock, Home as HomeIcon, Heart, Zap, RefreshCw, User, Activity } from "lucide-react";
import logoImage from "@/assets/logo.png";

const NAVY = "#05163D";
const BLUE = "#275799";
const PINK = "#EF2A86";
const CREAM = "#FDF7F0";
const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

const SERVICES = [
  { icon: Clock,      name: "Short Visits",        desc: "Personal care, medication and companionship built around your day." },
  { icon: User,       name: "Live-In Care",         desc: "Full-time support at home so your loved one is never alone." },
  { icon: Activity,   name: "24/7 Care",            desc: "Round-the-clock cover for complex needs — consistent and reliable." },
  { icon: HomeIcon,   name: "Supported Living",     desc: "Helping adults live independently with specialist daily support." },
  { icon: RefreshCw,  name: "Respite Care",         desc: "Short-term cover so family carers can rest and recharge." },
  { icon: Heart,      name: "Condition-Led Care",   desc: "Specialist care tailored to dementia, Parkinson's, MS and more." },
  { icon: Zap,        name: "Enabling",             desc: "Building skills and confidence — care that empowers, not depends." },
];

const TOWNS = ["Plymouth", "Saltash", "Liskeard", "Tavistock", "Truro", "Falmouth", "Penzance", "Newquay", "Bodmin", "St Austell", "Launceston", "Helston", "Hayle", "St Ives", "Camborne", "Redruth", "Wadebridge", "Ivybridge", "Kingsbridge", "Totnes"];

export default function Leaflet() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

        @media print {
          @page { size: A5 portrait; margin: 0; }
          body { margin: 0 !important; padding: 0 !important; }
          .print-hide { display: none !important; }
          .leaflet-side { 
            page-break-after: always; 
            break-after: page;
            width: 148mm !important;
            height: 210mm !important;
            overflow: hidden;
            box-shadow: none !important;
          }
          .leaflet-side:last-child { page-break-after: avoid; break-after: avoid; }
          .leaflet-wrapper {
            display: block !important;
            padding: 0 !important;
            background: white !important;
          }
          nav, footer, [data-testid="ticker"] { display: none !important; }
          main { padding-top: 0 !important; }
        }

        .leaflet-wrapper {
          background: #e5e7eb;
          padding: 40px 20px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
        }

        .leaflet-side {
          width: 148mm;
          min-height: 210mm;
          background: white;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          overflow: hidden;
          position: relative;
        }
      `}</style>

      {/* Print controls — hidden when printing */}
      <div className="print-hide" style={{ background: NAVY, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <p style={{ color: CREAM, fontWeight: 700, margin: 0, fontSize: "15px" }}>A5 Leaflet Preview — Front &amp; Back</p>
          <p style={{ color: "rgba(253,247,240,0.55)", margin: 0, fontSize: "12px" }}>Set paper size to A5, disable headers/footers</p>
        </div>
        <button
          onClick={() => window.print()}
          style={{ background: PINK, color: "white", border: "none", borderRadius: "10px", padding: "10px 22px", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Printer size={16} /> Print Leaflet
        </button>
      </div>

      <div className="leaflet-wrapper">

        {/* ===== SIDE 1 — FRONT ===== */}
        <div className="leaflet-side">

          {/* HEADER */}
          <div style={{ background: NAVY, padding: "18px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <img src={logoImage} alt="Smeaton Healthcare" style={{ height: "28px", width: "auto", filter: "brightness(0) invert(1)" }} />
            <div style={{ background: PINK, borderRadius: "20px", padding: "4px 12px", display: "flex", alignItems: "center", gap: "5px" }}>
              <Shield size={11} style={{ color: "white" }} />
              <span style={{ color: "white", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em" }}>CQC RATED GOOD</span>
            </div>
          </div>

          {/* HERO BAND */}
          <div style={{ background: PINK, padding: "22px 20px 18px" }}>
            <div style={{ ...SCRIPT, fontSize: "28px", color: "white", lineHeight: 1.2, marginBottom: "6px" }}>
              care that feels like family.
            </div>
            <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "12px", margin: 0, lineHeight: 1.5 }}>
              Professional home care across Devon &amp; Cornwall — helping you or your loved one live well at home.
            </p>
          </div>

          {/* SERVICES GRID */}
          <div style={{ padding: "16px 20px", background: CREAM }}>
            <p style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", color: PINK, textTransform: "uppercase", margin: "0 0 12px" }}>Our Services</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {SERVICES.map((s) => (
                <div key={s.name} style={{ background: "white", borderRadius: "8px", padding: "10px 11px", display: "flex", alignItems: "flex-start", gap: "9px", border: "1px solid rgba(5,22,61,0.06)" }}>
                  <div style={{ background: `${PINK}18`, borderRadius: "7px", padding: "6px", flexShrink: 0, marginTop: "1px" }}>
                    <s.icon size={13} style={{ color: PINK }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: "11px", color: NAVY, lineHeight: 1.3 }}>{s.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "10px", color: "#6b7280", lineHeight: 1.4 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TRUST STRIP */}
          <div style={{ background: "white", padding: "10px 20px", display: "flex", justifyContent: "space-around", alignItems: "center", borderTop: "1px solid rgba(5,22,61,0.07)", borderBottom: "1px solid rgba(5,22,61,0.07)" }}>
            {[
              { label: "Google", value: "4.9 ★" },
              { label: "Trustpilot", value: "4.6 ★" },
              { label: "NHS", value: "Approved" },
              { label: "Since", value: "2019" },
            ].map((t) => (
              <div key={t.label} style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: "12px", color: BLUE }}>{t.value}</p>
                <p style={{ margin: 0, fontSize: "9px", color: "#9ca3af", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{t.label}</p>
              </div>
            ))}
          </div>

          {/* FOOTER / CTA */}
          <div style={{ background: NAVY, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: "0 0 2px", color: "rgba(253,247,240,0.6)", fontSize: "9px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Free Assessment — No Obligation</p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Phone size={13} style={{ color: PINK }} />
                <span style={{ color: "white", fontWeight: 800, fontSize: "16px" }}>0330 165 8880</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "3px" }}>
                <Globe size={11} style={{ color: "rgba(253,247,240,0.5)" }} />
                <span style={{ color: "rgba(253,247,240,0.65)", fontSize: "10px" }}>smeatonhealthcare.co.uk</span>
              </div>
            </div>
            <div style={{ background: PINK, borderRadius: "10px", padding: "10px 16px", textAlign: "center" }}>
              <p style={{ margin: 0, color: "white", fontWeight: 800, fontSize: "11px", lineHeight: 1.3 }}>Book Your<br />Free Assessment</p>
            </div>
          </div>
        </div>


        {/* ===== SIDE 2 — BACK ===== */}
        <div className="leaflet-side">

          {/* HEADER */}
          <div style={{ background: BLUE, padding: "20px 20px 18px" }}>
            <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.65)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Smeaton Healthcare</p>
            <div style={{ ...SCRIPT, fontSize: "26px", color: "white", lineHeight: 1.2 }}>Why families choose us.</div>
            <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.8)", fontSize: "11px", lineHeight: 1.5 }}>
              A CQC Rated Good care provider with a reputation for consistency, warmth and professionalism across Devon and Cornwall.
            </p>
          </div>

          {/* WHY US — 3 key points */}
          <div style={{ background: CREAM, padding: "14px 20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              {[
                { title: "Consistent Carers", detail: "You get the same familiar faces every visit — no strangers at the door." },
                { title: "Fully Trained & DBS Checked", detail: "All carers are trained, insured and background checked before they step through your door." },
                { title: "Care Within 24 Hours", detail: "We can often arrange a first visit within 24 hours of your call." },
                { title: "Private & NHS Funded", detail: "We accept self-funded, direct payments, personal health budgets and local authority funding." },
              ].map((p) => (
                <div key={p.title} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <CheckCircle2 size={15} style={{ color: PINK, flexShrink: 0, marginTop: "1px" }} />
                  <div>
                    <span style={{ fontWeight: 800, fontSize: "11px", color: NAVY }}>{p.title} — </span>
                    <span style={{ fontSize: "11px", color: "#4b5563", lineHeight: 1.4 }}>{p.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TESTIMONIAL */}
          <div style={{ background: `${PINK}10`, borderLeft: `3px solid ${PINK}`, margin: "0 20px", padding: "11px 14px", borderRadius: "0 8px 8px 0" }}>
            <p style={{ margin: "0 0 6px", fontSize: "11px", color: NAVY, fontStyle: "italic", lineHeight: 1.5 }}>
              "The carers from Smeaton are wonderful — Mum knows them by name and actually looks forward to their visits."
            </p>
            <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, color: PINK }}>Sarah T. — Daughter of service user, Plymouth</p>
          </div>

          {/* AREAS COVERED */}
          <div style={{ padding: "13px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <MapPin size={12} style={{ color: BLUE }} />
              <p style={{ margin: 0, fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", color: BLUE, textTransform: "uppercase" }}>Areas We Cover</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {TOWNS.map((t) => (
                <span key={t} style={{ background: `${BLUE}12`, color: BLUE, fontSize: "9.5px", fontWeight: 600, padding: "3px 8px", borderRadius: "20px" }}>{t}</span>
              ))}
              <span style={{ color: "#9ca3af", fontSize: "9.5px", fontWeight: 600, padding: "3px 4px" }}>& surrounding areas</span>
            </div>
          </div>

          {/* RATING BADGES */}
          <div style={{ padding: "0 20px 12px", display: "flex", gap: "8px" }}>
            {[
              { label: "Google Reviews", value: "★ 4.9", bg: `${BLUE}12`, color: BLUE },
              { label: "Trustpilot", value: "★ 4.6", bg: `${BLUE}12`, color: BLUE },
              { label: "CQC Rated", value: "Good", bg: `${PINK}12`, color: PINK },
              { label: "NHS", value: "Approved", bg: `${PINK}12`, color: PINK },
            ].map((b) => (
              <div key={b.label} style={{ flex: 1, background: b.bg, borderRadius: "8px", padding: "8px 6px", textAlign: "center" }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: "13px", color: b.color }}>{b.value}</p>
                <p style={{ margin: 0, fontSize: "9px", color: "#6b7280", fontWeight: 600 }}>{b.label}</p>
              </div>
            ))}
          </div>

          {/* CONTACT FOOTER */}
          <div style={{ background: NAVY, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
            <img src={logoImage} alt="Smeaton Healthcare" style={{ height: "22px", width: "auto", filter: "brightness(0) invert(1)" }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "5px", marginBottom: "3px" }}>
                <Phone size={11} style={{ color: PINK }} />
                <span style={{ color: "white", fontWeight: 800, fontSize: "13px" }}>0330 165 8880</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "5px" }}>
                <Globe size={11} style={{ color: "rgba(253,247,240,0.5)" }} />
                <span style={{ color: "rgba(253,247,240,0.65)", fontSize: "10px" }}>smeatonhealthcare.co.uk</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
