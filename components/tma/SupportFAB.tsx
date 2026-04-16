"use client";

export default function SupportFAB() {
  return (
    <>
      <style>{`
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(0,119,182,0.4); }
          50% { box-shadow: 0 4px 32px rgba(0,119,182,0.7); }
        }
        .support-fab:active {
          transform: scale(0.93) !important;
        }
      `}</style>
      <a
        href="https://t.me/primeclean_manager"
        target="_blank"
        rel="noopener noreferrer"
        className="support-fab"
        style={{
          position: "fixed",
          right: 16,
          bottom: 88, // above bottom nav (72px) + gap
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,119,182,0.4)",
          animation: "fabPulse 3s ease-in-out infinite",
          zIndex: 50,
          textDecoration: "none",
          transition: "transform 0.15s ease",
          cursor: "pointer",
        }}
        title="Поддержка 24/7"
      >
        {/* Telegram icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M21.198 2.433a2.242 2.242 0 0 0-2.17.026L2.208 10.697C.986 11.27.978 12.71 2.198 13.3l4.168 1.949 2.127 6.403c.264.798 1.29 1.03 1.88.44l2.358-2.357 4.612 3.397c.653.48 1.571.135 1.766-.647l3.42-16.014c.23-.993-.64-1.896-1.33-2.038zM10 15.5l-.9 3.6-1.8-5.4L17.5 7l-7.5 8.5z"
            fill="white"
          />
        </svg>
        {/* Indicator dot */}
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#22C55E",
            border: "2px solid white",
          }}
        />
      </a>
    </>
  );
}
