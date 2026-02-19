import React from 'react';

const MailboxIcon = ({ mailCount = 0, onClick, dark = false }) => {
  const isEmpty = mailCount === 0;
  const isMany  = mailCount >= 5;

  // Icon colors: strong contrast for minimalist look
  const s  = dark ? "#f5f5f5" : "#23232a"; // stroke
  const m  = dark ? "#bdbdbd" : "#757575"; // mid-tone
  const w  = dark ? "#23232a" : "#f5f5f5"; // box fill
  const d  = dark ? "#18181b" : "#e0e0e0"; // depth
  const hi = dark ? "#fff" : "#23232a";    // highlight
  const ef = "#fff"; // envelope always white
  const br = dark ? "#18181b" : "#fff";    // badge border

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
        background: "none",
        border: "none",
        padding: "10px",
        cursor: "pointer",
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "16px",
        transition: "background 0.18s",
        outline: "none",
        WebkitTapHighlightColor: "transparent",
        ...(dark
          ? {
              backgroundColor: "#23232a",
              color: "#f5f5f5",
            }
          : {
              backgroundColor: "#f5f5f5",
              color: "#23232a",
            })
      }}
      onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)"}
      onMouseLeave={e => e.currentTarget.style.background = dark ? "#18181b" : "none"}
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
          fill={w}
        />

        {/* ── ARCH — front (half-ellipse) ── */}
        <path
          d="M8 17 A15 11.5 0 0 1 38 17"
          fill={w}
        />

        {/* ── ARCH GLINT ── */}
        <path
          d="M11 15 A13.5 10 0 0 1 35 15"
          fill="none"
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
                rx="1" fill={ef}
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
                fill="none"
              />
            </g>
          </g>
        )}

        {/* ── FLAG POLE ── */}
        {isEmpty ? (
          <>
            <line x1="34" y1="17" x2="34" y2="20" />
            {/* Flag resting flat on top */}
            <rect x="34" y="13" width="5" height="4" rx="0.6" fill="#FF3B30" />
          </>
        ) : (
          <>
            <line x1="34" y1="4" x2="34" y2="20" />
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

export default MailboxIcon;