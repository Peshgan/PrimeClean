"use client";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
  style?: React.CSSProperties;
}

export default function Skeleton({ width = "100%", height = 16, radius = 8, style }: SkeletonProps) {
  return (
    <>
      <style>{`
        @keyframes pcShimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
      `}</style>
      <div
        style={{
          width,
          height,
          borderRadius: radius,
          background:
            "linear-gradient(90deg, #E2EDF4 0%, #F0F7FB 40%, #E2EDF4 80%)",
          backgroundSize: "200px 100%",
          animation: "pcShimmer 1.2s ease-in-out infinite",
          ...style,
        }}
      />
    </>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={i === 0 ? 18 : 12} width={i === 0 ? "60%" : "100%"} />
      ))}
    </div>
  );
}
