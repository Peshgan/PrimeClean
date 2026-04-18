"use client";

const BUBBLES = [
  { size: 32, x: 5,  delay: 0,    dur: 14 },
  { size: 18, x: 12, delay: 2.2,  dur: 11 },
  { size: 46, x: 22, delay: 1,    dur: 17 },
  { size: 14, x: 33, delay: 4,    dur: 10 },
  { size: 26, x: 42, delay: 0.5,  dur: 13 },
  { size: 20, x: 53, delay: 5,    dur: 12 },
  { size: 38, x: 62, delay: 1.8,  dur: 16 },
  { size: 16, x: 70, delay: 6,    dur: 9  },
  { size: 30, x: 78, delay: 1.3,  dur: 14 },
  { size: 22, x: 86, delay: 3,    dur: 11 },
  { size: 42, x: 92, delay: 2.6,  dur: 15 },
  { size: 12, x: 48, delay: 7,    dur: 10 },
  { size: 28, x: 17, delay: 5.5,  dur: 16 },
  { size: 16, x: 96, delay: 0.8,  dur: 12 },
];

export default function TMABubbles() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            bottom: `-${b.size + 10}px`,
            left: `${b.x}%`,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            border: "1.5px solid rgba(0, 119, 182, 0.15)",
            background: "radial-gradient(circle at 35% 35%, rgba(0,180,216,0.1), rgba(0,119,182,0.03))",
            animation: `tma-bubble ${b.dur}s ${b.delay}s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes tma-bubble {
          0%   { transform: translateY(0);       opacity: 0; }
          8%   { opacity: 0.9; }
          92%  { opacity: 0.4; }
          100% { transform: translateY(-110vh);  opacity: 0; }
        }
      `}</style>
    </div>
  );
}
