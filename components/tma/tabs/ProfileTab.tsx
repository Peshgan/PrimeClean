"use client";

import { useState, useEffect } from "react";
import type { TelegramUser } from "@/types/telegram";
import type { TelegramWebApp } from "@/types/telegram";

interface ProfileTabProps {
  user: TelegramUser | null;
  webApp: TelegramWebApp | null;
}

interface BookingRecord {
  id: number;
  service_name: string;
  service_slug: string;
  booking_date: string;
  booking_time: string;
  price_estimate: number | null;
  status: string;
  created_at: string;
}

const RU_MONTHS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

function formatRuDate(raw: string, withYear = true): string {
  if (!raw) return "";
  const d = new Date(raw.includes("T") ? raw : `${raw}T00:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return `${d.getDate()} ${RU_MONTHS[d.getMonth()]}${withYear ? ` ${d.getFullYear()}` : ""}`;
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "Новая", color: "#0077B6", bg: "#EFF9FF" },
  confirmed: { label: "Подтверждена", color: "#00875A", bg: "#ECFDF5" },
  in_progress: { label: "В процессе", color: "#B45309", bg: "#FFFBEB" },
  done: { label: "Выполнена", color: "#475569", bg: "#F1F5F9" },
  cancelled: { label: "Отменена", color: "#DC2626", bg: "#FEF2F2" },
};

export default function ProfileTab({ user, webApp }: ProfileTabProps) {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "history">("all");

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/api/bookings?telegramId=${user.id}`)
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const today = new Date().toISOString().split("T")[0];
  const activeStatuses = new Set(["new", "confirmed", "in_progress"]);

  const filtered = bookings.filter((b) => {
    if (filter === "active") return activeStatuses.has(b.status) && b.booking_date >= today;
    if (filter === "history") return !activeStatuses.has(b.status) || b.booking_date < today;
    return true;
  });

  const counts = {
    total: bookings.length,
    active: bookings.filter((b) => activeStatuses.has(b.status) && b.booking_date >= today).length,
    done: bookings.filter((b) => b.status === "done").length,
    spent: bookings
      .filter((b) => b.status === "done")
      .reduce((s, b) => s + (b.price_estimate ?? 0), 0),
  };

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() || "?"
    : "?";

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)",
          padding: "32px 20px 40px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
          }}
        />

        {/* Avatar */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            border: "3px solid rgba(255,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 700,
            color: "white",
            margin: "0 auto 12px",
          }}
        >
          {user?.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photo_url}
              alt={initials}
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            initials
          )}
        </div>

        {user ? (
          <>
            <div style={{ color: "white", fontSize: 20, fontWeight: 700, marginBottom: 2 }}>
              {user.first_name} {user.last_name ?? ""}
            </div>
            {user.username && (
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 14 }}>
                @{user.username}
              </div>
            )}
          </>
        ) : (
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 15 }}>
            Откройте приложение в Telegram для просмотра профиля
          </div>
        )}
      </div>

      {/* Info cards */}
      <div style={{ padding: "16px 16px 0" }}>
        {/* Contact info */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            border: "1px solid #E2EDF4",
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #F1F5F9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#1A2332", fontWeight: 600, fontSize: 15 }}>
              Информация
            </span>
          </div>
          {[
            { label: "Telegram ID", value: user?.id ? `#${user.id}` : "—" },
            { label: "Имя", value: user ? `${user.first_name} ${user.last_name ?? ""}`.trim() : "—" },
            { label: "Username", value: user?.username ? `@${user.username}` : "—" },
            { label: "Premium", value: user?.is_premium ? "✅ Да" : "—" },
          ].map((item, i, arr) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: i < arr.length - 1 ? "1px solid #F1F5F9" : "none",
              }}
            >
              <span style={{ color: "#94A3B8", fontSize: 13 }}>{item.label}</span>
              <span style={{ color: "#1A2332", fontSize: 13, fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Order stats */}
        {user?.id && bookings.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
            <div style={{ background: "white", border: "1px solid #E2EDF4", borderRadius: 12, padding: "10px", textAlign: "center" }}>
              <div style={{ color: "#0077B6", fontSize: 18, fontWeight: 800, fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}>{counts.total}</div>
              <div style={{ color: "#94A3B8", fontSize: 10, marginTop: 2 }}>Всего</div>
            </div>
            <div style={{ background: "white", border: "1px solid #E2EDF4", borderRadius: 12, padding: "10px", textAlign: "center" }}>
              <div style={{ color: "#00875A", fontSize: 18, fontWeight: 800, fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}>{counts.done}</div>
              <div style={{ color: "#94A3B8", fontSize: 10, marginTop: 2 }}>Выполнено</div>
            </div>
            <div style={{ background: "white", border: "1px solid #E2EDF4", borderRadius: 12, padding: "10px", textAlign: "center" }}>
              <div style={{ color: "#B45309", fontSize: 18, fontWeight: 800, fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}>{counts.spent}</div>
              <div style={{ color: "#94A3B8", fontSize: 10, marginTop: 2 }}>BYN</div>
            </div>
          </div>
        )}

        {/* My orders */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2
            style={{
              color: "#1A2332",
              fontSize: 18,
              fontWeight: 700,
              margin: 0,
              fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
            }}
          >
            История заказов
          </h2>
          {bookings.length > 0 && (
            <div style={{ display: "flex", gap: 4, background: "white", border: "1px solid #E2EDF4", borderRadius: 8, padding: 2 }}>
              {([
                { id: "all", label: "Все" },
                { id: "active", label: "Активные" },
                { id: "history", label: "Архив" },
              ] as const).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  style={{
                    background: filter === f.id ? "linear-gradient(135deg,#00B4D8,#0077B6)" : "transparent",
                    color: filter === f.id ? "white" : "#475569",
                    border: "none", borderRadius: 6, padding: "4px 8px",
                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {!user?.id ? (
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #E2EDF4",
              padding: "24px 16px",
              textAlign: "center",
              color: "#94A3B8",
              fontSize: 14,
            }}
          >
            Войдите через Telegram, чтобы увидеть заявки
          </div>
        ) : loading ? (
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #E2EDF4",
              padding: "24px 16px",
              textAlign: "center",
              color: "#94A3B8",
              fontSize: 14,
            }}
          >
            Загрузка...
          </div>
        ) : bookings.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #E2EDF4",
              padding: "32px 16px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ color: "#1A2332", fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
              Заявок пока нет
            </div>
            <div style={{ color: "#94A3B8", fontSize: 13 }}>
              Оформите первый заказ во вкладке «Заказать»
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #E2EDF4", padding: "24px 16px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
            В этой категории пусто
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((b) => {
              const st = STATUS_LABEL[b.status] ?? STATUS_LABEL.new;
              return (
                <div
                  key={b.id}
                  style={{
                    background: "white",
                    borderRadius: 14,
                    border: "1px solid #E2EDF4",
                    padding: "14px 16px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#1A2332", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                        {b.service_name ?? "Услуга"}
                      </div>
                      <div style={{ color: "#94A3B8", fontSize: 12 }}>
                        #{b.id} · {formatRuDate(b.booking_date)} в {b.booking_time}
                      </div>
                    </div>
                    <div
                      style={{
                        background: st.bg,
                        color: st.color,
                        borderRadius: 8,
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        marginLeft: 10,
                      }}
                    >
                      {st.label}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {b.price_estimate ? (
                      <div style={{ color: "#0077B6", fontSize: 13, fontWeight: 700 }}>
                        ~{b.price_estimate} BYN
                      </div>
                    ) : <div />}
                    {b.created_at && (
                      <div style={{ color: "#CBD5E1", fontSize: 10 }}>
                        Создана {formatRuDate(b.created_at)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* App info */}
        <div
          style={{
            marginTop: 24,
            textAlign: "center",
            color: "#94A3B8",
            fontSize: 12,
            paddingBottom: 16,
          }}
        >
          <div style={{ marginBottom: 4 }}>PrimeClean Mini App v1.0</div>
          <a
            href="https://primeclean.by"
            style={{ color: "#00B4D8", textDecoration: "none" }}
            onClick={(e) => {
              e.preventDefault();
              webApp?.openLink("https://primeclean.by");
            }}
          >
            primeclean.by
          </a>
        </div>
      </div>
    </div>
  );
}
