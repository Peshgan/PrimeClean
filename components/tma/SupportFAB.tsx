"use client";

export default function SupportFAB() {
  return (
    <>
      <style>{`
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 3px 14px rgba(0,119,182,0.45); }
          50% { box-shadow: 0 3px 22px rgba(0,119,182,0.72); }
        }
        .support-fab:active { transform: scale(0.9) !important; }
      `}</style>
      <a
        href="https://t.me/primeclean_manager"
        target="_blank"
        rel="noopener noreferrer"
        className="support-fab"
        title="Поддержка 24/7"
        style={{
          position: "fixed",
          right: 14,
          bottom: 86,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 3px 14px rgba(0,119,182,0.45)",
          animation: "fabPulse 3s ease-in-out infinite",
          zIndex: 50,
          textDecoration: "none",
          transition: "transform 0.15s ease",
          cursor: "pointer",
        }}
      >
        {/* Headset icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
          <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
        {/* Online dot */}
        <div
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: "#22C55E",
            border: "2px solid white",
          }}
        />
      </a>
    </>
  );
}
