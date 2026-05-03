import { Clock, Star } from "lucide-react";
import { SiTrustpilot } from "react-icons/si";
import nhsLogoImg from "@assets/nhs_logo.png";
import googleLogoImg from "@assets/google_logo_white.svg";

const PINK = "#EF2A86";

const ITEMS = [
  { content: <><img src={googleLogoImg} alt="Google" style={{ height: "16px", width: "auto" }} /><span className="text-white text-xs font-medium">Google 4.9</span></> },
  { content: <><SiTrustpilot style={{ color: "#00B67A", fontSize: "15px" }} /><span className="text-white text-xs font-medium">Trustpilot 4.6</span></> },
  { content: <><img src={nhsLogoImg} alt="NHS" style={{ height: "20px", width: "auto", filter: "brightness(0) invert(1)" }} /><span className="text-white text-xs font-medium">Approved Provider</span></> },
  { content: <><span className="text-white text-xs font-medium whitespace-nowrap">CQC Rated Good</span></> },
  { content: <><Clock size={13} className="text-white shrink-0" /><span className="text-white text-xs font-medium whitespace-nowrap">Care within 24 hours</span></> },
  { content: <><Star size={13} className="text-white shrink-0" /><span className="text-white text-xs font-medium whitespace-nowrap">Private Care Available</span></> },
];

export default function Ticker() {
  return (
    <div style={{ backgroundColor: PINK, padding: "9px 0", overflow: "hidden" }}>

      {/* Mobile: auto-scrolling marquee so all items are always visible */}
      <div className="sm:hidden relative w-full overflow-hidden">
        <style>{`
          @keyframes ticker-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .ticker-track {
            display: inline-flex;
            animation: ticker-scroll 18s linear infinite;
            white-space: nowrap;
          }
        `}</style>
        <div className="ticker-track">
          {[...ITEMS, ...ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 mx-5 shrink-0">
              {item.content}
              <span className="text-white/30 ml-5">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* Desktop: static centred row */}
      <div className="hidden sm:flex w-full items-center justify-center flex-nowrap gap-x-8 px-8">
        {ITEMS.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 shrink-0">
            {item.content}
            {i < ITEMS.length - 1 && <span className="text-white/30 ml-8">|</span>}
          </span>
        ))}
      </div>

    </div>
  );
}
