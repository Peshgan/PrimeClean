"use client";

import { services } from "@/lib/data/services";

interface ServicesTabProps {
  onGoToOrder: (serviceSlug: string) => void;
}

const ICON_MAP: Record<string, string> = {
  Home: "🏠",
  Building2: "🏢",
  Sparkles: "✨",
  Hammer: "🔨",
  Trees: "🌳",
  Waves: "🌊",
  ShieldAlert: "🛡️",
};

export default function ServicesTab({ onGoToOrder }: ServicesTabProps) {
  return (
    <div>
      {/* Header */}
      <div
        style={{
          padding: "20px 16px 16px",
          background: "white",
          borderBottom: "1px solid #E2EDF4",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <h1
          style={{
            color: "#1A2332",
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
            marginBottom: 4,
          }}
        >
          Наши услуги
        </h1>
        <p style={{ color: "#94A3B8", fontSize: 14 }}>
          Профессиональный клининг для любых задач
        </p>
      </div>

      {/* Services list */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {services.map((svc) => (
          <div
            key={svc.slug}
            style={{
              background: "white",
              borderRadius: 18,
              border: "1px solid #E2EDF4",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {/* Card header */}
            <div style={{ padding: "16px 16px 12px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "#F0FDFF",
                    border: "1px solid #E2EDF4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    flexShrink: 0,
                  }}
                >
                  {ICON_MAP[svc.icon] ?? "🧹"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      color: "#1A2332",
                      fontWeight: 700,
                      fontSize: 16,
                      marginBottom: 4,
                    }}
                  >
                    {svc.shortTitle}
                  </div>
                  <div style={{ color: "#475569", fontSize: 13, lineHeight: 1.5 }}>
                    {svc.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Meta row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 16px",
                background: "#F8FBFF",
                borderTop: "1px solid #F1F5F9",
                gap: 16,
              }}
            >
              <div>
                <span style={{ color: "#94A3B8", fontSize: 11 }}>от </span>
                <span style={{ color: "#0077B6", fontWeight: 700, fontSize: 16 }}>
                  {svc.priceFrom > 0 ? `${svc.priceFrom} BYN` : "По запросу"}
                </span>
              </div>
              <div style={{ color: "#94A3B8", fontSize: 12 }}>⏱ {svc.duration}</div>
              <button
                onClick={() => onGoToOrder(svc.slug)}
                style={{
                  marginLeft: "auto",
                  background: "linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "9px 18px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Заказать
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom padding */}
      <div style={{ height: 16 }} />
    </div>
  );
}
