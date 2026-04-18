"use client";

import type { TabId } from "@/app/tma/page";

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  isAdmin?: boolean;
}

type TabDef = { id: TabId; label: string; icon: React.ReactNode; adminOnly?: boolean };

const TABS: TabDef[] = [
  {
    id: "home",
    label: "Главная",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-5h-6v5H4a1 1 0 01-1-1V10.5z" />
      </svg>
    ),
  },
  {
    id: "services",
    label: "Услуги",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
      </svg>
    ),
  },
  {
    id: "order",
    label: "Заказать",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="17" rx="2.5" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="12" y1="14" x2="12" y2="18" />
        <line x1="10" y1="16" x2="14" y2="16" />
      </svg>
    ),
  },
  {
    id: "reviews",
    label: "Отзывы",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        <path d="M12 7l.7 2.2 2.3.03-1.85 1.35.7 2.17L12 11.5l-1.85 1.22.7-2.17L9 9.23l2.3-.03z" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Профиль",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-3.87 3.58-7 8-7s8 3.13 8 7" />
      </svg>
    ),
  },
  {
    id: "admin",
    label: "Админ",
    adminOnly: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
];

export default function BottomNav({ active, onChange, isAdmin = false }: BottomNavProps) {
  const visibleTabs = TABS.filter((t) => !t.adminOnly || isAdmin);

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
      {visibleTabs.map((tab) => {
        const isActive = active === tab.id;
        const isOrder = tab.id === "order";
        const isAdminTab = tab.id === "admin";

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
              <span style={{ fontSize: 10, fontWeight: 600, color: "#0077B6", marginTop: 2 }}>
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
              color: isActive
                ? isAdminTab ? "#7C3AED" : "#0077B6"
                : "#94A3B8",
              position: "relative",
            }}
          >
            {/* Admin tab gets a special purple tint */}
            {isAdminTab && isActive && (
              <div style={{
                position: "absolute",
                inset: "4px 2px",
                borderRadius: 10,
                background: "rgba(124,58,237,0.08)",
              }} />
            )}
            {tab.icon}
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, lineHeight: 1, position: "relative" }}>
              {tab.label}
            </span>
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: 28,
                  height: 3,
                  background: isAdminTab ? "#7C3AED" : "#00B4D8",
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
