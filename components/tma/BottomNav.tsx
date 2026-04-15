"use client";

import type { TabId } from "@/app/tma/page";

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "home",
    label: "Главная",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: "services",
    label: "Услуги",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
        <path d="M8 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "order",
    label: "Заказать",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    id: "reviews",
    label: "Отзывы",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Профиль",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "white",
        borderTop: "1px solid #E2EDF4",
        display: "flex",
        height: 72,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
      }}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        const isOrder = tab.id === "order";

        if (isOrder) {
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                gap: 0,
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: "0 4px 16px rgba(0,119,182,0.35)",
                  marginTop: -24,
                  transition: "transform 0.15s ease",
                }}
              >
                {tab.icon}
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#0077B6",
                  marginTop: 2,
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              gap: 3,
              transition: "all 0.15s ease",
              color: isActive ? "#0077B6" : "#94A3B8",
            }}
          >
            {tab.icon}
            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 500,
                lineHeight: 1,
              }}
            >
              {tab.label}
            </span>
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: 32,
                  height: 3,
                  background: "#00B4D8",
                  borderRadius: "3px 3px 0 0",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
