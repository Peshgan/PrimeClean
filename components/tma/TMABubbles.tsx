"use client";

const BUBBLES = [
  { size: 32, x: 5,  delay: 0,   dur: 8  },
  { size: 18, x: 12, delay: 1.5, dur: 6  },
  { size: 46, x: 22, delay: 0.7, dur: 10 },
  { size: 14, x: 33, delay: 2.8, dur: 7  },
  { size: 26, x: 42, delay: 0.3, dur: 9  },
  { size: 20, x: 53, delay: 3.5, dur: 6.5},
  { size: 38, x: 62, delay: 1.2, dur: 11 },
  { size: 16, x: 70, delay: 4.2, dur: 5.5},
  { size: 30, x: 78, delay: 0.9, dur: 8.5},
  { size: 22, x: 86, delay: 2.1, dur: 7.5},
  { size: 42, x: 92, delay: 1.8, dur: 9.5},
  { size: 12, x: 48, delay: 5,   dur: 6  },
  { size: 28, x: 17, delay: 3.8, dur: 10 },
  { size: 16, x: 96, delay: 0.5, dur: 7  },
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
            bottom: "-70px",
            left: `${b.x}%`,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            border: "1.5px solid rgba(0, 119, 182, 0.18)",
            background: "rgba(0, 180, 216, 0.06)",
            animation: `tma-bubble ${b.dur}s ${b.delay}s ease-in infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes tma-bubble {
          0%   { transform: translateY(0) scale(1) translateX(0);      opacity: 0;   }
          10%  { opacity: 1; }
          50%  { transform: translateY(-52vh) scale(1.1) translateX(12px); }
          90%  { opacity: 0.5; }
          100% { transform: translateY(-108vh) scale(1.2) translateX(-8px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
