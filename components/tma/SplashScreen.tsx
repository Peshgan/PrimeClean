"use client";

import { useEffect, useState } from "react";

interface SplashScreenProps {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    // Fade in → hold → fade out
    const t1 = setTimeout(() => setPhase("hold"), 300);
    const t2 = setTimeout(() => setPhase("out"), 2000);
    const t3 = setTimeout(onDone, 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.5s ease",
        opacity: phase === "out" ? 0 : 1,
      }}
    >
      {/* Logo circle */}
      <div
        style={{
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          transition: "transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease",
          transform: phase === "in" ? "scale(0.6)" : "scale(1)",
          opacity: phase === "in" ? 0 : 1,
        }}
      >
        {/* Sparkle SVG icon */}
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M28 6C28 6 30 18 36 22C42 26 50 28 50 28C50 28 42 30 36 34C30 38 28 50 28 50C28 50 26 38 20 34C14 30 6 28 6 28C6 28 14 26 20 22C26 18 28 6 28 6Z"
            fill="white"
          />
          <path
            d="M44 10C44 10 44.8 14.4 46.8 15.8C48.8 17.2 52 18 52 18C52 18 48.8 18.8 46.8 20.2C44.8 21.6 44 26 44 26C44 26 43.2 21.6 41.2 20.2C39.2 18.8 36 18 36 18C36 18 39.2 17.2 41.2 15.8C43.2 14.4 44 10 44 10Z"
            fill="rgba(255,255,255,0.7)"
          />
          <path
            d="M12 30C12 30 12.5 32.8 13.8 33.6C15.1 34.4 17 35 17 35C17 35 15.1 35.6 13.8 36.4C12.5 37.2 12 40 12 40C12 40 11.5 37.2 10.2 36.4C8.9 35.6 7 35 7 35C7 35 8.9 34.4 10.2 33.6C11.5 32.8 12 30 12 30Z"
            fill="rgba(255,255,255,0.5)"
          />
        </svg>
      </div>

      {/* Brand name */}
      <div
        style={{
          transition: "transform 0.6s ease 0.1s, opacity 0.4s ease 0.1s",
          transform: phase === "in" ? "translateY(16px)" : "translateY(0)",
          opacity: phase === "in" ? 0 : 1,
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 32,
            fontWeight: 700,
            fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
          }}
        >
          PrimeClean
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 14,
            marginTop: 6,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          Клининг в Минске
        </div>
      </div>

      {/* Loading dots */}
      <div style={{ display: "flex", gap: 6, marginTop: 48 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.6)",
              display: "block",
              animation: `splashDot 1.2s ${i * 0.2}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes splashDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
