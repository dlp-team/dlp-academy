import { useState } from "react";

const MailboxIcon = ({ mailCount = 0, onClick, dark = false }) => {
  const isEmpty = mailCount === 0;
  const isMany  = mailCount >= 5;

  const s  = dark ? "rgba(255,255,255,0.88)"  : "rgba(0,0,0,0.82)";
  const m  = dark ? "rgba(255,255,255,0.42)"  : "rgba(0,0,0,0.26)";
  const w  = dark ? "rgba(255,255,255,0.08)"  : "rgba(0,0,0,0.04)";
  const d  = dark ? "rgba(255,255,255,0.04)"  : "rgba(0,0,0,0.09)";
  const hi = dark ? "rgba(255,255,255,0.14)"  : "rgba(255,255,255,0.72)";
  const ef = dark ? "#3A3A3C"                 : "#FFFFFF";
  const br = dark ? "#1C1C1E"                 : "#FFFFFF";

  // Slot line y position — envelope straddles this
  const slotY = 25;
  // Envelope: half above slot (inside box), half below (outside)
  const envTop    = slotY - 5;   // top of envelope (inside box)
  const envBottom = slotY + 5;   // bottom of envelope (peeking out)
  const envX1 = 18;
  const envX2 = 31;

  return (
    <button
      onClick={onClick}
      style={{
        background: "none", border: "none",
        padding: "10px", cursor: "pointer",
        position: "relative",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        borderRadius: "16px", transition: "background 0.18s",
        outline: "none", WebkitTapHighlightColor: "transparent",
      }}
      onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)"}
      onMouseLeave={e => e.currentTarget.style.background = "none"}
      title="Mailbox"
    >
      {/*
        viewBox 44 × 52
        Box:
          Front face : x=8..38,  y=17..32
          Side face  : x=2..8,   y=21..34   (parallelogram, left depth)
          Arch front : half-ellipse top of front face
          Arch side  : smaller curve top of side face
        Post: centered under box (x=19..23)
        Flag: right side, pole at x=34
        Badge: top-LEFT corner
      */}
      <svg viewBox="0 0 44 52" width="40" height="46" fill="none" xmlns="http://www.w3.org/2000/svg">

        {/* ── POST — centered under the box ── */}
        <rect x="19" y="32" width="4.5" height="19" rx="2.25" fill={m} />

        {/* ── FRONT FACE ── */}
        <path
          d="M8 17 L38 17 L38 32 L8 32 Z"
          fill={w} stroke={s} strokeWidth="1.1" strokeLinejoin="round"
        />

        {/* ── ARCH — front (half-ellipse) ── */}
        <path
          d="M8 17 A15 11.5 0 0 1 38 17"
          fill={w} stroke={s} strokeWidth="1.1"
        />

        {/* ── ARCH GLINT ── */}
        <path
          d="M11 15 A13.5 10 0 0 1 35 15"
          stroke={hi} strokeWidth="1" strokeLinecap="round" fill="none"
        />

        {/* ── MAIL SLOT ── */}
        <rect x={envX1} y={slotY - 0.65} width={envX2 - envX1} height="1.3" rx="0.65" fill={s} opacity="0.35" />

        {/* ── ENVELOPE half-in / half-out (isMany only) ── */}
        {isMany && (
          <g>
            {/*
              The envelope rect straddles the slot line.
              The bottom half is BELOW the slot (visible outside).
              The top half would be inside the box — we clip it so it
              appears to go INTO the box, masked by the front face.
              We use clipPath keyed to the front face rect area.
            */}
            <clipPath id="boxFront">
              {/* Only show part of envelope that's outside the box body */}
              <rect x="0" y={slotY} width="44" height="20" />
            </clipPath>
            <clipPath id="boxInside">
              {/* Show the part inside — above slot within front face */}
              <rect x="8" y="17" width="30" height={slotY - 17} />
            </clipPath>

            {/* Bottom half — peeking out below the slot */}
            <g clipPath="url(#boxFront)">
              <rect
                x={envX1} y={envTop}
                width={envX2 - envX1} height={envBottom - envTop}
                rx="1" fill={ef} stroke={s} strokeWidth="0.9"
              />
            </g>

            {/* Top half — inside the box (faint, behind the front face fill) */}
            <g clipPath="url(#boxInside)" opacity="0.35">
              <rect
                x={envX1} y={envTop}
                width={envX2 - envX1} height={envBottom - envTop}
                rx="1" fill={s}
              />
            </g>

            {/* Envelope flap V — on the bottom visible half */}
            <clipPath id="envBottom">
              <rect x={envX1} y={slotY} width={envX2 - envX1} height="10" />
            </clipPath>
            <g clipPath="url(#envBottom)">
              <path
                d={`M${envX1} ${slotY} L${(envX1 + envX2) / 2} ${slotY + 3} L${envX2} ${slotY}`}
                stroke={m} strokeWidth="0.8" fill="none" strokeLinejoin="round"
              />
            </g>
          </g>
        )}

        {/* ── FLAG POLE ── */}
        {isEmpty ? (
          <>
            <line x1="34" y1="17" x2="34" y2="20"
              stroke={m} strokeWidth="1.2" strokeLinecap="round" />
            {/* Flag resting flat on top */}
            <rect x="34" y="13" width="5" height="4" rx="0.6" fill="#FF3B30" />
          </>
        ) : (
          <>
            <line x1="34" y1="4" x2="34" y2="20"
              stroke={m} strokeWidth="1.2" strokeLinecap="round" />
            {/* Flag raised, pointing left */}
            <path d="M34 4 L34 11 L27 11 L27 4 Z" fill="#FF3B30" />
          </>
        )}

        {/* Flag pivot */}
        <circle cx="34" cy="20" r="1.3" fill={m} />

      </svg>

      {/* ── BADGE — top LEFT corner ── */}
      {mailCount > 0 && (
        <span style={{
          position: "absolute",
          top: 3,
          left: 3,          // ← moved to left
          minWidth: 17, height: 17, padding: "0 4px",
          background: "#FF3B30", color: "#fff",
          fontSize: 10, fontWeight: 700,
          fontFamily: '-apple-system, "SF Pro Text", Helvetica, Arial, sans-serif',
          borderRadius: 9,
          display: "flex", alignItems: "center", justifyContent: "center",
          letterSpacing: "-0.3px", lineHeight: 1,
          boxShadow: `0 0 0 1.5px ${br}`,
          pointerEvents: "none",
        }}>
          {mailCount > 99 ? "99+" : mailCount}
        </span>
      )}
    </button>
  );
};

/* ─── Demo ─── */
export default function App() {
  const [dark,  setDark]  = useState(false);
  const [count, setCount] = useState(0);

  const bg   = dark ? "#1C1C1E" : "#F2F2F7";
  const card = dark ? "#2C2C2E" : "#FFFFFF";
  const text = dark ? "#FFFFFF" : "#1C1C1E";
  const sub  = dark ? "rgba(255,255,255,0.4)" : "#8E8E93";
  const sep  = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const cOn  = "#007AFF";
  const cOff = dark ? "#3A3A3C" : "#E5E5EA";
  const ctOn = "#fff";
  const ctOff= dark ? "rgba(255,255,255,0.65)" : "#3C3C43";

  const states = [
    { n: 0, label: "Empty", desc: "Flag down"        },
    { n: 3, label: "Few",   desc: "Flag up"           },
    { n: 8, label: "Many",  desc: "Envelope in slot"  },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 52, transition: "background 0.3s",
      fontFamily: '-apple-system, "SF Pro Display", Helvetica, Arial, sans-serif',
    }}>

      <button onClick={() => setDark(d => !d)} style={{
        position: "fixed", top: 20, right: 20,
        background: card, border: "none", borderRadius: 22,
        padding: "9px 18px", cursor: "pointer",
        color: text, fontSize: 13, fontWeight: 600, fontFamily: "inherit",
        boxShadow: dark ? "0 2px 16px rgba(0,0,0,0.6)" : "0 2px 12px rgba(0,0,0,0.1)",
        transition: "all 0.25s",
        display: "flex", alignItems: "center", gap: 7,
      }}>
        <span>{dark ? "☀️" : "🌙"}</span>
        {dark ? "Light" : "Dark"}
      </button>

      <div style={{ textAlign: "center", userSelect: "none" }}>
        <p style={{ color: sub, fontSize: 11, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", margin: "0 0 6px" }}>
          Icon
        </p>
        <h1 style={{ color: text, fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: "-0.6px" }}>
          Mailbox
        </h1>
      </div>

      <div style={{ display: "flex", gap: 52, alignItems: "flex-end" }}>
        {states.map(s => (
          <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <MailboxIcon mailCount={s.n} dark={dark} onClick={() => {}} />
            <div style={{ textAlign: "center" }}>
              <p style={{ color: text, fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>{s.label}</p>
              <p style={{ color: sub, fontSize: 11, margin: 0 }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: card, borderRadius: 22,
        padding: "28px 32px",
        boxShadow: dark ? "0 4px 40px rgba(0,0,0,0.55)" : "0 1px 0 rgba(0,0,0,0.04), 0 4px 28px rgba(0,0,0,0.08)",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 20, minWidth: 280,
        transition: "background 0.3s",
      }}>
        <MailboxIcon mailCount={count} onClick={() => setCount(0)} dark={dark} />
        <p style={{ color: sub, fontSize: 14, fontWeight: 500, margin: 0, textAlign: "center" }}>
          {count === 0 ? "Inbox empty" : `${count} message${count !== 1 ? "s" : ""} · tap to clear`}
        </p>
        <div style={{ width: "100%", height: 1, background: sep }} />
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1, 3, 8, 25].map(n => (
            <button key={n} onClick={() => setCount(n)} style={{
              padding: "7px 15px", borderRadius: 20, border: "none",
              background: count === n ? cOn : cOff,
              color: count === n ? ctOn : ctOff,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s", fontFamily: "inherit",
            }}>
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}