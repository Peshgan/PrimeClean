"use client";

import { useState } from "react";
import type { TelegramUser } from "@/types/telegram";
import type { TabId } from "@/app/tma/page";
import { services } from "@/lib/data/services";
import HomeStories from "@/components/tma/HomeStories";

interface HomeTabProps {
  user: TelegramUser | null;
  onGoToOrder: (serviceSlug?: string) => void;
  onTabChange: (tab: TabId) => void;
}

type ContactSheet = null | {
  kind: "phone" | "email";
  title: string;
  value: string;
  actions: { icon: string; label: string; href?: string; onClick?: () => void }[];
};

const ICON_MAP: Record<string, string> = {
  Home: "🏠",
  Building2: "🏢",
  Sparkles: "✨",
  Hammer: "🔨",
  Trees: "🌳",
  Waves: "🌊",
  ShieldAlert: "🛡️",
};

const STATS = [
  { value: "200+", label: "Клиентов" },
  { value: "4.9", label: "Рейтинг" },
  { value: "5 лет", label: "На рынке" },
  { value: "7", label: "Услуг" },
];

const POPULAR = services.slice(0, 3);

export default function HomeTab({ user, onGoToOrder, onTabChange }: HomeTabProps) {
  const greeting = user?.first_name ? `Привет, ${user.first_name}! 👋` : "Добро пожаловать! 👋";
  const [sheet, setSheet] = useState<ContactSheet>(null);

  const copy = (txt: string) => {
    try { navigator.clipboard?.writeText(txt); } catch {}
  };

  const openPhoneSheet = () => {
    setSheet({
      kind: "phone",
      title: "Связаться с PrimeClean",
      value: "+375 (44) 478-93-60",
      actions: [
        { icon: "📞", label: "Позвонить", href: "tel:+375444789360" },
        { icon: "💬", label: "Написать в Telegram", href: "https://t.me/primeclean_bybot" },
        { icon: "📋", label: "Скопировать номер", onClick: () => copy("+375444789360") },
      ],
    });
  };

  const openEmailSheet = () => {
    setSheet({
      kind: "email",
      title: "Написать нам",
      value: "info@primeclean.by",
      actions: [
        { icon: "✉️", label: "Открыть почту", href: "mailto:info@primeclean.by" },
        { icon: "📋", label: "Скопировать email", onClick: () => copy("info@primeclean.by") },
      ],
    });
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Header banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)",
          padding: "24px 20px 32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -20,
            left: -20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />

        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, marginBottom: 4 }}>
          {greeting}
        </p>
        <h1
          style={{
            color: "white",
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: 6,
            fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
          }}
        >
          Профессиональный клининг в Минске
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, marginBottom: 20 }}>
          Уборка квартир, офисов и домов — быстро и с гарантией
        </p>

        <button
          onClick={() => onGoToOrder()}
          style={{
            background: "white",
            color: "#0077B6",
            border: "none",
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 700,
            padding: "13px 28px",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}
        >
          Заказать уборку →
        </button>
      </div>

      {/* Stories */}
      <HomeStories />

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          padding: "12px 16px 0",
        }}
      >
        {STATS.map((s) => (
          <div
            key={s.label}
            style={{
              background: "white",
              borderRadius: 14,
              padding: "12px 8px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              border: "1px solid #E2EDF4",
            }}
          >
            <div
              style={{
                color: "#0077B6",
                fontWeight: 700,
                fontSize: 18,
                lineHeight: 1,
                fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
              }}
            >
              {s.value}
            </div>
            <div style={{ color: "#94A3B8", fontSize: 10, marginTop: 3, fontWeight: 500 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Popular services */}
      <div style={{ padding: "20px 16px 0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h2
            style={{
              color: "#1A2332",
              fontSize: 18,
              fontWeight: 700,
              fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
            }}
          >
            Популярные услуги
          </h2>
          <button
            onClick={() => onTabChange("services")}
            style={{
              background: "none",
              border: "none",
              color: "#00B4D8",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Все →
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {POPULAR.map((svc) => (
            <button
              key={svc.slug}
              onClick={() => onGoToOrder(svc.slug)}
              style={{
                background: "white",
                border: "1px solid #E2EDF4",
                borderRadius: 16,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#F0FDFF",
                  border: "1px solid #E2EDF4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {ICON_MAP[svc.icon] ?? "🧹"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: "#1A2332",
                    fontWeight: 600,
                    fontSize: 15,
                    marginBottom: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {svc.shortTitle}
                </div>
                <div
                  style={{
                    color: "#94A3B8",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {svc.duration} · от {svc.priceFrom} BYN
                </div>
              </div>
              <div style={{ color: "#00B4D8", fontSize: 18, flexShrink: 0 }}>›</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick contacts */}
      <div style={{ padding: "20px 16px 0" }}>
        <h2
          style={{
            color: "#1A2332",
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 12,
            fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
          }}
        >
          Контакты
        </h2>
        <div
          style={{
            background: "white",
            borderRadius: 16,
            border: "1px solid #E2EDF4",
            overflow: "hidden",
          }}
        >
          {[
            { icon: "📞", label: "Телефон", value: "+375 (44) 478-93-60", onClick: openPhoneSheet, action: "Связаться" },
            { icon: "✉️", label: "Email", value: "info@primeclean.by", onClick: openEmailSheet, action: "Написать" },
          ].map((c, i, arr) => (
            <button
              key={c.label}
              onClick={c.onClick}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderBottom: i < arr.length - 1 ? "1px solid #F1F5F9" : "none",
                background: "white",
                border: "none",
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              <span style={{ fontSize: 20 }}>{c.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#94A3B8", fontSize: 11, fontWeight: 500 }}>{c.label}</div>
                <div style={{ color: "#1A2332", fontSize: 14, fontWeight: 500 }}>{c.value}</div>
              </div>
              <span style={{ color: "#00B4D8", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{c.action} →</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action sheet for phone/email */}
      {sheet && (
        <>
          <div
            onClick={() => setSheet(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.45)",
              zIndex: 100,
              animation: "fadeIn 0.2s ease",
            }}
          />
          <div
            role="dialog"
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              background: "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: "8px 16px calc(24px + env(safe-area-inset-bottom))",
              zIndex: 101,
              animation: "slideUp 0.25s cubic-bezier(0.4,0,0.2,1)",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ width: 40, height: 4, background: "#E2EDF4", borderRadius: 4, margin: "6px auto 12px" }} />
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ color: "#1A2332", fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{sheet.title}</div>
              <div style={{ color: "#94A3B8", fontSize: 13 }}>{sheet.value}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sheet.actions.map((a) => {
                const isPrimary = a === sheet.actions[0];
                const Comp = a.href ? "a" : "button";
                return (
                  <Comp
                    key={a.label}
                    href={a.href}
                    onClick={() => {
                      a.onClick?.();
                      setTimeout(() => setSheet(null), a.href ? 0 : 400);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 16px",
                      border: `1.5px solid ${isPrimary ? "#00B4D8" : "#E2EDF4"}`,
                      background: isPrimary ? "linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)" : "white",
                      color: isPrimary ? "white" : "#1A2332",
                      fontWeight: 600,
                      fontSize: 15,
                      borderRadius: 14,
                      textDecoration: "none",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left" as const,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{a.icon}</span>
                    <span style={{ flex: 1 }}>{a.label}</span>
                    <span style={{ opacity: 0.6 }}>›</span>
                  </Comp>
                );
              })}
              <button
                onClick={() => setSheet(null)}
                style={{
                  background: "#F1F5F9",
                  border: "none",
                  borderRadius: 14,
                  padding: "13px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#475569",
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                Отмена
              </button>
            </div>
          </div>
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
            @keyframes fadeIn {
              from { opacity: 0; } to { opacity: 1; }
            }
          `}</style>
        </>
      )}

      {/* УНП footer */}
      <div
        style={{
          textAlign: "center",
          padding: "20px 16px 8px",
          color: "#CBD5E1",
          fontSize: 11,
        }}
      >
        УНП ВЕ89624282
      </div>
    </div>
  );
}
