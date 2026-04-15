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
  booking_date: string;
  booking_time: string;
  price_estimate: number | null;
  status: string;
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

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/api/bookings?telegramId=${user.id}`)
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

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

        {/* My orders */}
        <h2
          style={{
            color: "#1A2332",
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 12,
            fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
          }}
        >
          Мои заявки
        </h2>

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
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {bookings.map((b) => {
              const st = STATUS_LABEL[b.status] ?? STATUS_LABEL.new;
              return (
                <div
                  key={b.id}
                  style={{
                    background: "white",
                    borderRadius: 14,
                    border: "1px solid #E2EDF4",
                    padding: "14px 16px",
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
                    <div>
                      <div style={{ color: "#1A2332", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                        {b.service_name ?? "Услуга"}
                      </div>
                      <div style={{ color: "#94A3B8", fontSize: 12 }}>
                        #{b.id} · {b.booking_date} в {b.booking_time}
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
                      }}
                    >
                      {st.label}
                    </div>
                  </div>
                  {b.price_estimate && (
                    <div style={{ color: "#0077B6", fontSize: 13, fontWeight: 600 }}>
                      ~{b.price_estimate} BYN
                    </div>
                  )}
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
