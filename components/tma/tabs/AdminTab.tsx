"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

interface Review {
  id: number;
  author_name: string;
  rating: number;
  service_name: string | null;
  text: string;
  photo_url: string | null;
  is_approved: number;
  created_at: string;
}

interface Booking {
  id: number;
  user_telegram_id: string | null;
  tg_username: string | null;
  name: string;
  phone: string;
  service_name: string | null;
  service_slug: string;
  booking_date: string;
  booking_time: string;
  address: string | null;
  area: number | null;
  extras: string | null;
  price_estimate: number | null;
  price_actual: number | null;
  comment: string | null;
  contact_preference: string | null;
  status: string;
  source: string;
  created_at: string;
}

interface Analytics {
  totalBookings: number;
  totalUsers: number;
  totalReviews: number;
  pendingReviews: number;
  avgRating: number;
  byStatus: { status: string; n: number }[];
  bySource: { source: string; n: number }[];
  topServices: { service_name: string; n: number; revenue: number }[];
  last30: { day: string; n: number }[];
  revenueTotal: number;
  newToday: number;
  upcomingCount: number;
}

interface AdminTabProps {
  tgId: string;
}

type Section = "dashboard" | "bookings" | "reviews" | "promo";

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "Новая", color: "#0077B6", bg: "#EFF9FF" },
  confirmed: { label: "Подтверждена", color: "#00875A", bg: "#ECFDF5" },
  in_progress: { label: "В работе", color: "#B45309", bg: "#FFFBEB" },
  done: { label: "Выполнена", color: "#475569", bg: "#F1F5F9" },
  cancelled: { label: "Отменена", color: "#DC2626", bg: "#FEF2F2" },
};

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= rating ? "#F59E0B" : "#E2EDF4"} style={{ display: "inline" }}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

const RU_MONTHS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

function formatRuDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.split("T")[0];
  return `${d.getDate()} ${RU_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function StatCard({ label, value, hint, color = "#0077B6" }: { label: string; value: string | number; hint?: string; color?: string }) {
  return (
    <div style={{
      background: "white",
      border: "1px solid #E2EDF4",
      borderRadius: 14,
      padding: "14px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    }}>
      <div style={{ color: "#94A3B8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</div>
      <div style={{ color, fontSize: 22, fontWeight: 800, fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)", marginTop: 4, lineHeight: 1 }}>
        {value}
      </div>
      {hint && <div style={{ color: "#94A3B8", fontSize: 11, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function Sparkline({ points }: { points: { day: string; n: number }[] }) {
  if (!points.length) {
    return <div style={{ color: "#94A3B8", fontSize: 12 }}>Нет данных</div>;
  }
  const max = Math.max(1, ...points.map((p) => p.n));
  const w = 100;
  const h = 32;
  const step = points.length > 1 ? w / (points.length - 1) : 0;
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(2)} ${(h - (p.n / max) * h).toFixed(2)}`)
    .join(" ");
  const areaPath = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: 40 }}>
      <defs>
        <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#00B4D8" stopOpacity="0.4" />
          <stop offset="1" stopColor="#00B4D8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#spark)" />
      <path d={path} fill="none" stroke="#00B4D8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AdminTab({ tgId }: AdminTabProps) {
  const [section, setSection] = useState<Section>("dashboard");
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }, []);

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1A2332 0%, #0077B6 100%)",
          padding: "24px 16px 22px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 22 }}>🛡️</span>
          <h1 style={{ color: "white", fontSize: 20, fontWeight: 700, margin: 0, fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}>
            Панель администратора
          </h1>
        </div>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, margin: 0 }}>
          Управление заявками, отзывами и аналитика
        </p>
      </div>

      {/* Section switcher */}
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ display: "flex", background: "white", borderRadius: 12, padding: 4, border: "1px solid #E2EDF4", gap: 4, overflowX: "auto" }}>
          {([
            { id: "dashboard", label: "📊 Дашборд" },
            { id: "bookings", label: "📋 Заявки" },
            { id: "reviews", label: "💬 Отзывы" },
            { id: "promo", label: "🎫 Промо" },
          ] as const).map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              style={{
                flex: 1,
                background: section === s.id ? "linear-gradient(135deg, #00B4D8, #0077B6)" : "transparent",
                color: section === s.id ? "white" : "#475569",
                border: "none",
                borderRadius: 8,
                padding: "9px 4px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ padding: "8px 16px 0" }}>
          <div style={{
            background: "#ECFDF5", border: "1px solid #6EE7B7", borderRadius: 10,
            padding: "9px 14px", color: "#065F46", fontSize: 13, fontWeight: 500,
            animation: "fadeIn 0.2s ease",
          }}>
            ✅ {toast}
          </div>
        </div>
      )}

      <div style={{ padding: "14px 16px 0" }}>
        {section === "dashboard" && <Dashboard tgId={tgId} />}
        {section === "bookings" && <BookingsSection tgId={tgId} onToast={showToast} />}
        {section === "reviews" && <ReviewsSection tgId={tgId} onToast={showToast} />}
        {section === "promo" && <PromoSection tgId={tgId} />}
      </div>
    </div>
  );
}

// --- Dashboard ---
function Dashboard({ tgId }: { tgId: string }) {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/tma?tgId=${tgId}&action=analytics`)
      .then((r) => r.json())
      .then((d) => setData(d.analytics ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tgId]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>⏳ Загрузка…</div>;
  }
  if (!data) {
    return <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>Нет данных</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Stat grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
        <StatCard label="Всего заявок" value={data.totalBookings} hint={`Сегодня: +${data.newToday}`} />
        <StatCard label="Предстоящих" value={data.upcomingCount} color="#00875A" hint="Активные заказы" />
        <StatCard label="Клиентов" value={data.totalUsers} color="#6B5CF6" />
        <StatCard label="Рейтинг" value={data.avgRating.toFixed(1)} color="#F59E0B" hint={`${data.totalReviews} отзывов`} />
        <StatCard label="На модерации" value={data.pendingReviews} color="#DC2626" hint="Ожидают проверки" />
        <StatCard label="Оборот" value={`${data.revenueTotal} BYN`} color="#0077B6" hint="Подтверждённые" />
      </div>

      {/* Chart */}
      <div style={{ background: "white", border: "1px solid #E2EDF4", borderRadius: 14, padding: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ color: "#1A2332", fontWeight: 700, fontSize: 14 }}>Заявки за 30 дней</div>
          <div style={{ color: "#00875A", fontSize: 12, fontWeight: 600 }}>
            {data.last30.reduce((s, p) => s + p.n, 0)} шт
          </div>
        </div>
        <Sparkline points={data.last30} />
      </div>

      {/* Top services */}
      <div style={{ background: "white", border: "1px solid #E2EDF4", borderRadius: 14, padding: "14px" }}>
        <div style={{ color: "#1A2332", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Топ услуг</div>
        {data.topServices.length === 0 && (
          <div style={{ color: "#94A3B8", fontSize: 13 }}>Нет данных</div>
        )}
        {data.topServices.map((s, i) => {
          const max = data.topServices[0].n || 1;
          const pct = (s.n / max) * 100;
          return (
            <div key={s.service_name + i} style={{ marginBottom: i < data.topServices.length - 1 ? 10 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#1A2332", marginBottom: 4 }}>
                <span style={{ fontWeight: 500, maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.service_name}</span>
                <span style={{ color: "#475569", fontWeight: 600 }}>{s.n} · {Math.round(s.revenue)} BYN</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "#F1F5F9", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#00B4D8,#0077B6)" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Status breakdown */}
      <div style={{ background: "white", border: "1px solid #E2EDF4", borderRadius: 14, padding: "14px" }}>
        <div style={{ color: "#1A2332", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Статусы заявок</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {data.byStatus.length === 0 && <span style={{ color: "#94A3B8", fontSize: 13 }}>Нет данных</span>}
          {data.byStatus.map((s) => {
            const m = STATUS_META[s.status] ?? { label: s.status, color: "#475569", bg: "#F1F5F9" };
            return (
              <div key={s.status} style={{
                background: m.bg, color: m.color, padding: "6px 10px",
                borderRadius: 10, fontSize: 12, fontWeight: 600,
              }}>
                {m.label}: {s.n}
              </div>
            );
          })}
        </div>
      </div>

      {/* Source breakdown */}
      <div style={{ background: "white", border: "1px solid #E2EDF4", borderRadius: 14, padding: "14px" }}>
        <div style={{ color: "#1A2332", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Источники заказов</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {data.bySource.length === 0 && <span style={{ color: "#94A3B8", fontSize: 13 }}>Нет данных</span>}
          {data.bySource.map((s) => (
            <div key={s.source} style={{
              background: s.source === "telegram" ? "#EFF9FF" : "#ECFDF5",
              color: s.source === "telegram" ? "#0077B6" : "#00875A",
              padding: "6px 10px", borderRadius: 10, fontSize: 12, fontWeight: 600,
            }}>
              {s.source === "telegram" ? "📲 Telegram" : "🌐 Сайт"}: {s.n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Bookings ---
function BookingsSection({ tgId, onToast }: { tgId: string; onToast: (s: string) => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"upcoming" | "past" | "all">("upcoming");
  const [status, setStatus] = useState<string>("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [reschedule, setReschedule] = useState<{ id: number; date: string; time: string } | null>(null);
  const [doneModal, setDoneModal] = useState<{ id: number; estimate: number | null } | null>(null);
  const [donePrice, setDonePrice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tma?tgId=${tgId}&action=bookings&status=${status}&period=${period}`);
      const data = await res.json();
      setBookings(data.bookings ?? []);
    } catch {
      onToast("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [tgId, period, status, onToast]);

  useEffect(() => { load(); }, [load]);

  const submitReschedule = async () => {
    if (!reschedule) return;
    setBusy(reschedule.id);
    try {
      const res = await fetch(`/api/admin/tma?tgId=${tgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: "booking", id: reschedule.id, action: "reschedule", booking_date: reschedule.date, booking_time: reschedule.time }),
      });
      const data = await res.json();
      if (res.ok) {
        onToast(data.message);
        setBookings((p) => p.map((b) => b.id === reschedule.id ? { ...b, booking_date: reschedule.date, booking_time: reschedule.time } : b));
        setReschedule(null);
      }
    } finally {
      setBusy(null);
    }
  };

  const act = async (id: number, patch: { action?: string; status?: string; price_actual?: number }) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/tma?tgId=${tgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: "booking", id, ...patch }),
      });
      const data = await res.json();
      if (res.ok) {
        onToast(data.message);
        if (patch.action === "delete") {
          setBookings((p) => p.filter((b) => b.id !== id));
        } else if (patch.status) {
          setBookings((p) => p.map((b) => (b.id === id ? { ...b, status: patch.status! } : b)));
        }
      }
    } finally {
      setBusy(null);
    }
  };

  const submitDone = async () => {
    if (!doneModal) return;
    const price = parseFloat(donePrice);
    await act(doneModal.id, { status: "done", price_actual: isNaN(price) ? undefined : price });
    setDoneModal(null);
    setDonePrice("");
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>
        {([
          { id: "upcoming", label: "Предстоящие" },
          { id: "past", label: "Прошедшие" },
          { id: "all", label: "Все" },
        ] as const).map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            style={{
              background: period === p.id ? "#0077B6" : "white",
              color: period === p.id ? "white" : "#475569",
              border: `1.5px solid ${period === p.id ? "#0077B6" : "#E2EDF4"}`,
              borderRadius: 10, padding: "7px 14px",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {["all", "new", "confirmed", "in_progress", "done", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              background: status === s ? "#ECFDF5" : "white",
              color: status === s ? "#00875A" : "#475569",
              border: `1.5px solid ${status === s ? "#00C9A7" : "#E2EDF4"}`,
              borderRadius: 8, padding: "5px 10px",
              fontSize: 11, fontWeight: 600, cursor: "pointer",
            }}
          >
            {s === "all" ? "Все статусы" : STATUS_META[s]?.label ?? s}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: "center", padding: 32, color: "#94A3B8" }}>⏳ Загрузка…</div>}
      {!loading && bookings.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: "#94A3B8" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
          <p style={{ margin: 0, fontWeight: 500 }}>Заявок нет</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {bookings.map((b) => {
          const meta = STATUS_META[b.status] ?? STATUS_META.new;
          const isOpen = expanded === b.id;
          const dateObj = new Date(b.booking_date + "T00:00:00");
          const dateNice = Number.isNaN(dateObj.getTime())
            ? b.booking_date
            : `${dateObj.getDate()} ${RU_MONTHS[dateObj.getMonth()]}`;
          let extrasStr = "";
          try {
            const obj = b.extras ? (JSON.parse(b.extras) as Record<string, number>) : null;
            if (obj) {
              extrasStr = Object.entries(obj).filter(([, q]) => q > 0).map(([k, q]) => (q > 1 ? `${k}×${q}` : k)).join(", ");
            }
          } catch {}
          return (
            <div key={b.id} style={{
              background: "white", borderRadius: 14, border: "1px solid #E2EDF4",
              overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}>
              <button
                onClick={() => setExpanded(isOpen ? null : b.id)}
                style={{
                  width: "100%", textAlign: "left", background: "white", border: "none",
                  padding: "12px 14px", cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{ color: "#94A3B8", fontSize: 11, fontWeight: 600 }}>#{b.id}</span>
                      <span style={{ color: "#1A2332", fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {b.name}
                      </span>
                    </div>
                    <div style={{ color: "#475569", fontSize: 12, marginBottom: 3 }}>
                      {b.service_name ?? b.service_slug}
                    </div>
                    <div style={{ color: "#0077B6", fontSize: 12, fontWeight: 600 }}>
                      📅 {dateNice}, {b.booking_time}
                      {b.price_actual != null
                        ? <span style={{ marginLeft: 8, color: "#00875A", fontWeight: 700 }}>✓ {b.price_actual} BYN</span>
                        : b.price_estimate != null && <span style={{ marginLeft: 8, color: "#94A3B8" }}>~{b.price_estimate} BYN</span>
                      }
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{
                      background: meta.bg, color: meta.color,
                      padding: "3px 9px", borderRadius: 8,
                      fontSize: 10, fontWeight: 700,
                    }}>{meta.label}</div>
                    <div style={{ color: "#CBD5E1", fontSize: 16, marginTop: 6 }}>{isOpen ? "˄" : "˅"}</div>
                  </div>
                </div>
              </button>

              {!isOpen && (
                <div style={{ padding: "0 14px 10px", display: "flex", gap: 8 }}>
                  <a
                    href={`tel:${b.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#EFF9FF", color: "#0077B6", border: "1px solid #BAE6FD", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 600, textDecoration: "none" }}
                  >
                    📞 Позвонить
                  </a>
                  {b.tg_username && (
                    <a
                      href={`https://t.me/${b.tg_username}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#F0FDFF", color: "#0077B6", border: "1px solid #BAE6FD", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 600, textDecoration: "none" }}
                    >
                      ✈️ Telegram
                    </a>
                  )}
                </div>
              )}

              {isOpen && (
                <div style={{
                  padding: "4px 14px 14px", borderTop: "1px solid #F1F5F9",
                  animation: "fadeIn 0.2s ease",
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 10px", fontSize: 12, color: "#1A2332", margin: "10px 0" }}>
                    <span style={{ color: "#94A3B8" }}>Телефон</span><a href={`tel:${b.phone}`} style={{ color: "#0077B6", fontWeight: 600, textDecoration: "none" }}>{b.phone}</a>
                    {b.price_estimate != null && (<><span style={{ color: "#94A3B8" }}>Оценка</span><span style={{ color: "#475569" }}>~{b.price_estimate} BYN</span></>)}
                    {b.price_actual != null && (<><span style={{ color: "#94A3B8" }}>Итого</span><span style={{ color: "#00875A", fontWeight: 700 }}>✓ {b.price_actual} BYN</span></>)}
                    {b.tg_username && (<><span style={{ color: "#94A3B8" }}>Telegram</span><a href={`https://t.me/${b.tg_username}`} target="_blank" rel="noreferrer" style={{ color: "#0077B6", textDecoration: "none" }}>@{b.tg_username}</a></>)}
                    {b.address && (<><span style={{ color: "#94A3B8" }}>Адрес</span><span>{b.address}</span></>)}
                    {b.area && (<><span style={{ color: "#94A3B8" }}>Площадь</span><span>{b.area} м²</span></>)}
                    {extrasStr && (<><span style={{ color: "#94A3B8" }}>Доп.</span><span>{extrasStr}</span></>)}
                    {b.comment && (<><span style={{ color: "#94A3B8" }}>Коммент.</span><span>{b.comment}</span></>)}
                    {b.contact_preference && (<><span style={{ color: "#94A3B8" }}>Связь</span><span>{b.contact_preference === "chat" ? "💬 Telegram" : "📞 Звонок"}</span></>)}
                    <span style={{ color: "#94A3B8" }}>Источник</span><span>{b.source === "telegram" ? "📲 TMA" : "🌐 Сайт"}</span>
                    <span style={{ color: "#94A3B8" }}>Создана</span><span>{formatRuDate(b.created_at)}</span>
                  </div>

                  {/* Reschedule inline form */}
                  {reschedule?.id === b.id ? (
                    <div style={{ marginTop: 10, background: "#F0FDFF", borderRadius: 10, padding: "12px", border: "1px solid #E2EDF4" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#0077B6", marginBottom: 8 }}>🗓 Перенос заявки</div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <input
                          type="date"
                          value={reschedule.date}
                          onChange={(e) => setReschedule((r) => r ? { ...r, date: e.target.value } : r)}
                          style={{ flex: 1, border: "1.5px solid #E2EDF4", borderRadius: 8, padding: "8px 10px", fontSize: 13, color: "#1A2332", background: "white" }}
                        />
                        <input
                          type="time"
                          value={reschedule.time}
                          onChange={(e) => setReschedule((r) => r ? { ...r, time: e.target.value } : r)}
                          style={{ width: 110, border: "1.5px solid #E2EDF4", borderRadius: 8, padding: "8px 10px", fontSize: 13, color: "#1A2332", background: "white" }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => setReschedule(null)}
                          style={{ flex: 1, background: "#F1F5F9", border: "none", borderRadius: 8, padding: "8px", fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer" }}
                        >Отмена</button>
                        <button
                          onClick={submitReschedule}
                          disabled={!reschedule.date || !reschedule.time || busy === b.id}
                          style={{ flex: 2, background: "#0077B6", border: "none", borderRadius: 8, padding: "8px", fontSize: 12, fontWeight: 700, color: "white", cursor: "pointer", opacity: busy === b.id ? 0.5 : 1 }}
                        >✓ Сохранить</button>
                      </div>
                    </div>
                  ) : null}

                  {/* Done price modal */}
                  {doneModal?.id === b.id && (
                    <div style={{ marginTop: 10, background: "#F0FFF4", borderRadius: 10, padding: 12, border: "1px solid #BBF7D0" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#00875A", marginBottom: 8 }}>💰 Сумма выполнения</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder={doneModal.estimate != null ? `~${doneModal.estimate} BYN` : "Сумма BYN"}
                          value={donePrice}
                          onChange={(e) => setDonePrice(e.target.value)}
                          style={{ flex: 1, border: "1.5px solid #BBF7D0", borderRadius: 8, padding: "8px 10px", fontSize: 14, color: "#1A2332", background: "white" }}
                        />
                        <button
                          onClick={() => { setDoneModal(null); setDonePrice(""); }}
                          style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer" }}
                        >✕</button>
                        <button
                          onClick={submitDone}
                          disabled={busy === b.id}
                          style={{ background: "#00875A", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: "white", cursor: "pointer" }}
                        >✓ Готово</button>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    {["new", "confirmed", "in_progress", "done", "cancelled"]
                      .filter((s) => s !== b.status)
                      .map((s) => {
                        const m = STATUS_META[s];
                        return (
                          <button
                            key={s}
                            disabled={busy === b.id}
                            onClick={() => {
                              if (s === "done") {
                                setDoneModal({ id: b.id, estimate: b.price_estimate });
                                setDonePrice(b.price_estimate != null ? String(b.price_estimate) : "");
                              } else {
                                act(b.id, { status: s });
                              }
                            }}
                            style={{
                              background: m.bg, color: m.color,
                              border: `1px solid ${m.color}33`,
                              borderRadius: 8, padding: "6px 10px",
                              fontSize: 11, fontWeight: 600, cursor: "pointer",
                              opacity: busy === b.id ? 0.5 : 1,
                            }}
                          >
                            → {m.label}
                          </button>
                        );
                      })}
                    <button
                      disabled={busy === b.id}
                      onClick={() => setReschedule({ id: b.id, date: b.booking_date, time: b.booking_time })}
                      style={{
                        background: "#EFF9FF", color: "#0077B6",
                        border: "1px solid #BAE6FD",
                        borderRadius: 8, padding: "6px 10px",
                        fontSize: 11, fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      📅 Перенести
                    </button>
                    <button
                      disabled={busy === b.id}
                      onClick={() => {
                        if (confirm(`Удалить заявку #${b.id}?`)) act(b.id, { action: "delete" });
                      }}
                      style={{
                        background: "#FEF2F2", color: "#DC2626",
                        border: "1px solid #FCA5A5",
                        borderRadius: 8, padding: "6px 10px",
                        fontSize: 11, fontWeight: 600, cursor: "pointer",
                        marginLeft: "auto",
                      }}
                    >
                      🗑 Удалить
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Promo Codes ---
function PromoSection({ tgId }: { tgId: string }) {
  const [codes, setCodes] = useState<{ code: string; percent: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/tma?tgId=${tgId}&action=promos`)
      .then((r) => r.json())
      .then((d) => setCodes(d.codes ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tgId]);

  return (
    <div>
      <div style={{ background: "#F0FDFF", border: "1px solid #BAE6FD", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ color: "#0077B6", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Как добавить промокод</div>
        <div style={{ color: "#475569", fontSize: 12, lineHeight: 1.6 }}>
          В Vercel → Settings → Environment Variables добавьте или обновите:<br />
          <code style={{ background: "white", border: "1px solid #E2EDF4", borderRadius: 6, padding: "2px 6px", fontSize: 11 }}>
            PROMO_CODES=КОД1:10,КОД2:15,КОД3:20
          </code><br />
          Формат: <b>КОД:ПРОЦЕНТ</b>. После сохранения — передеплой.
        </div>
      </div>

      <div style={{ fontWeight: 700, color: "#1A2332", fontSize: 15, marginBottom: 10 }}>Активные промокоды</div>

      {loading && <div style={{ textAlign: "center", padding: 32, color: "#94A3B8" }}>⏳ Загрузка…</div>}

      {!loading && codes.length === 0 && (
        <div style={{ textAlign: "center", padding: 32, color: "#94A3B8" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎫</div>
          <p style={{ margin: 0, fontSize: 13 }}>Промокоды не настроены.<br />Добавьте их через переменную PROMO_CODES.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {codes.map((c) => (
          <div key={c.code} style={{ background: "white", borderRadius: 14, border: "1px solid #E2EDF4", padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 24 }}>🎫</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0077B6", letterSpacing: 1 }}>{c.code}</div>
              <div style={{ color: "#94A3B8", fontSize: 12, marginTop: 2 }}>Скидка для клиента</div>
            </div>
            <div style={{ background: "#ECFDF5", color: "#00875A", borderRadius: 10, padding: "6px 14px", fontWeight: 800, fontSize: 18 }}>
              −{c.percent}%
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, background: "white", borderRadius: 14, border: "1px solid #E2EDF4", padding: "14px 16px" }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#1A2332", marginBottom: 8 }}>💡 Идеи для промокодов</div>
        {[
          { code: "FIRST10", desc: "−10% для новых клиентов" },
          { code: "FRIENDS15", desc: "−15% по реферальной программе" },
          { code: "SPRING20", desc: "−20% сезонная акция" },
          { code: "VIP25", desc: "−25% для постоянных клиентов" },
        ].map((tip) => (
          <div key={tip.code} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #F1F5F9" }}>
            <code style={{ fontSize: 13, fontWeight: 700, color: "#0077B6" }}>{tip.code}</code>
            <span style={{ color: "#475569", fontSize: 12 }}>{tip.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Reviews ---
function ReviewsSection({ tgId, onToast }: { tgId: string; onToast: (s: string) => void }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tma?tgId=${tgId}&action=reviews&filter=${filter}`);
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch {
      onToast("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [tgId, filter, onToast]);

  useEffect(() => { load(); }, [load]);

  const pendingCount = useMemo(
    () => reviews.filter((r) => !r.is_approved).length,
    [reviews]
  );

  const act = async (id: number, action: "approve" | "delete") => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/tma?tgId=${tgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: "review", id, action }),
      });
      const data = await res.json();
      if (res.ok) {
        onToast(data.message);
        setReviews((p) => {
          if (action === "delete") return p.filter((r) => r.id !== id);
          if (filter === "pending") return p.filter((r) => r.id !== id);
          return p.map((r) => (r.id === id ? { ...r, is_approved: 1 } : r));
        });
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", background: "white", borderRadius: 12, padding: 4, border: "1px solid #E2EDF4", marginBottom: 14, gap: 4 }}>
        {(["pending", "approved", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              flex: 1,
              background: filter === f ? "linear-gradient(135deg, #00B4D8, #0077B6)" : "transparent",
              color: filter === f ? "white" : "#475569",
              border: "none", borderRadius: 8, padding: "8px 4px",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              position: "relative",
            }}
          >
            {f === "pending" ? "Модерация" : f === "approved" ? "Опубликовано" : "Все"}
            {f === "pending" && pendingCount > 0 && filter !== "pending" && (
              <span style={{
                position: "absolute", top: 2, right: 4,
                background: "#DC2626", color: "white",
                borderRadius: "50%", width: 16, height: 16,
                fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>⏳ Загрузка…</div>}

      {!loading && reviews.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: "#94A3B8" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
          <p style={{ margin: 0, fontWeight: 500 }}>
            {filter === "pending" ? "Нет отзывов на модерации" : "Нет отзывов"}
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {!loading && reviews.map((review) => (
          <div
            key={review.id}
            style={{
              background: "white",
              borderRadius: 16,
              padding: "14px",
              border: `1px solid ${review.is_approved ? "#BBF7D0" : "#E2EDF4"}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1A2332" }}>{review.author_name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                  <Stars rating={review.rating} />
                  {review.service_name && (
                    <span style={{ background: "#F0FDFF", border: "1px solid #E2EDF4", borderRadius: 6, padding: "1px 7px", fontSize: 10, color: "#0077B6", fontWeight: 500 }}>
                      {review.service_name}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "#94A3B8" }}>{formatRuDate(review.created_at)}</div>
                <div style={{
                  marginTop: 4, fontSize: 10, fontWeight: 600,
                  color: review.is_approved ? "#065F46" : "#92400E",
                  background: review.is_approved ? "#ECFDF5" : "#FFFBEB",
                  padding: "2px 7px", borderRadius: 6,
                }}>
                  {review.is_approved ? "✓ Опубликован" : "⏳ Ожидает"}
                </div>
              </div>
            </div>

            <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.55, margin: "0 0 10px" }}>{review.text}</p>

            {review.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={review.photo_url} alt="Фото" style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 10, border: "1px solid #E2EDF4", marginBottom: 10, display: "block" }} />
            )}

            <div style={{ display: "flex", gap: 8 }}>
              {!review.is_approved && (
                <button
                  onClick={() => act(review.id, "approve")}
                  disabled={busy === review.id}
                  style={{
                    flex: 1, background: busy === review.id ? "#94A3B8" : "#00875A",
                    color: "white", border: "none", borderRadius: 10,
                    padding: "10px 0", fontSize: 13, fontWeight: 700,
                    cursor: busy === review.id ? "not-allowed" : "pointer",
                  }}
                >
                  ✅ Опубликовать
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm("Удалить отзыв безвозвратно?")) act(review.id, "delete");
                }}
                disabled={busy === review.id}
                style={{
                  flex: 1,
                  background: busy === review.id ? "#94A3B8" : "#DC2626",
                  color: "white", border: "none", borderRadius: 10,
                  padding: "10px 0", fontSize: 13, fontWeight: 700,
                  cursor: busy === review.id ? "not-allowed" : "pointer",
                }}
              >
                🗑 Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
