"use client";

import { useState, useEffect, useCallback } from "react";

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

interface AdminTabProps {
  tgId: string;
}

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

export default function AdminTab({ tgId }: AdminTabProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tma?tgId=${tgId}&action=reviews&filter=${filter}`);
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch {
      setToast("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [tgId, filter]);

  useEffect(() => { load(); }, [load]);

  const act = async (id: number, action: "approve" | "reject") => {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/tma?tgId=${tgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setToast(data.message);
        setReviews((prev) => prev.filter((r) => r.id !== id));
        setTimeout(() => setToast(""), 3000);
      }
    } finally {
      setActionId(null);
    }
  };

  const pendingCount = filter === "pending" ? reviews.length : 0;

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1A2332 0%, #0077B6 100%)",
          padding: "24px 16px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 22 }}>🛡️</span>
          <h1 style={{ color: "white", fontSize: 20, fontWeight: 700, margin: 0, fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}>
            Панель администратора
          </h1>
        </div>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, margin: 0 }}>
          Модерация отзывов
        </p>
      </div>

      <div style={{ padding: "14px 16px 0" }}>
        {/* Filter tabs */}
        <div style={{ display: "flex", background: "white", borderRadius: 12, padding: 4, border: "1px solid #E2EDF4", marginBottom: 14, gap: 4 }}>
          {(["pending", "approved", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flex: 1,
                background: filter === f ? "linear-gradient(135deg, #00B4D8, #0077B6)" : "transparent",
                color: filter === f ? "white" : "#475569",
                border: "none",
                borderRadius: 8,
                padding: "8px 4px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                position: "relative",
              }}
            >
              {f === "pending" ? "На модерации" : f === "approved" ? "Опубликовано" : "Все"}
              {f === "pending" && pendingCount > 0 && filter !== "pending" && (
                <span style={{
                  position: "absolute", top: 2, right: 4,
                  background: "#DC2626", color: "white",
                  borderRadius: "50%", width: 16, height: 16,
                  fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Toast */}
        {toast && (
          <div style={{ background: "#ECFDF5", border: "1px solid #6EE7B7", borderRadius: 10, padding: "10px 14px", color: "#065F46", fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
            ✅ {toast}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            Загрузка...
          </div>
        )}

        {/* Empty */}
        {!loading && reviews.length === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: "#94A3B8" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
            <p style={{ margin: 0, fontWeight: 500 }}>
              {filter === "pending" ? "Нет отзывов на модерации" : "Нет отзывов"}
            </p>
          </div>
        )}

        {/* Reviews */}
        {!loading && reviews.map((review) => (
          <div
            key={review.id}
            style={{
              background: "white",
              borderRadius: 16,
              padding: "16px",
              marginBottom: 12,
              border: `1px solid ${review.is_approved ? "#BBF7D0" : "#E2EDF4"}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {/* Top row */}
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
                <div style={{ fontSize: 10, color: "#94A3B8" }}>{review.created_at.split("T")[0]}</div>
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
              <img
                src={review.photo_url}
                alt="Фото"
                style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 10, border: "1px solid #E2EDF4", marginBottom: 10, display: "block" }}
              />
            )}

            {/* Actions — only for pending */}
            {!review.is_approved && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => act(review.id, "approve")}
                  disabled={actionId === review.id}
                  style={{
                    flex: 1,
                    background: actionId === review.id ? "#94A3B8" : "#00875A",
                    color: "white", border: "none", borderRadius: 10,
                    padding: "11px 0", fontSize: 14, fontWeight: 700,
                    cursor: actionId === review.id ? "not-allowed" : "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  ✅ Опубликовать
                </button>
                <button
                  onClick={() => act(review.id, "reject")}
                  disabled={actionId === review.id}
                  style={{
                    flex: 1,
                    background: actionId === review.id ? "#94A3B8" : "#DC2626",
                    color: "white", border: "none", borderRadius: 10,
                    padding: "11px 0", fontSize: 14, fontWeight: 700,
                    cursor: actionId === review.id ? "not-allowed" : "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  ❌ Удалить
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
