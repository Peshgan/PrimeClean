"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

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

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#F59E0B", fontSize: 14 }}>
      {"⭐".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?filter=${filter}`);
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch {
      setToast("Ошибка загрузки отзывов");
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/reviews", {
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
    } catch {
      setToast("Ошибка");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin");
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1A2332", margin: 0 }}>
            Модерация отзывов
          </h1>
          <p style={{ color: "#94A3B8", fontSize: 14, marginTop: 4 }}>
            Панель администратора PrimeClean
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: "#F1F5F9",
            border: "none",
            borderRadius: 10,
            padding: "8px 16px",
            fontSize: 13,
            color: "#475569",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Выйти
        </button>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          background: "white",
          borderRadius: 12,
          padding: 6,
          border: "1px solid #E2EDF4",
        }}
      >
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
              padding: "8px 12px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {f === "pending" ? "На модерации" : f === "approved" ? "Опубликованные" : "Все"}
          </button>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            background: "#ECFDF5",
            border: "1px solid #6EE7B7",
            borderRadius: 10,
            padding: "12px 16px",
            color: "#065F46",
            fontSize: 14,
            marginBottom: 16,
            fontWeight: 500,
          }}
        >
          ✅ {toast}
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>
          Загрузка...
        </div>
      ) : reviews.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "#94A3B8",
            background: "white",
            borderRadius: 16,
            border: "1px solid #E2EDF4",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p style={{ margin: 0, fontSize: 16 }}>Отзывов нет</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                background: "white",
                borderRadius: 16,
                padding: "20px",
                border: `1px solid ${review.is_approved ? "#6EE7B7" : "#E2EDF4"}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#1A2332" }}>
                    {review.author_name}
                  </div>
                  <StarRating rating={review.rating} />
                  {review.service_name && (
                    <div
                      style={{
                        display: "inline-block",
                        background: "#F0FDFF",
                        border: "1px solid #E2EDF4",
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: 11,
                        color: "#0077B6",
                        marginTop: 4,
                        marginLeft: 8,
                      }}
                    >
                      {review.service_name}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>
                    {review.created_at.split("T")[0]}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      color: review.is_approved ? "#065F46" : "#B45309",
                      background: review.is_approved ? "#ECFDF5" : "#FFFBEB",
                      padding: "2px 8px",
                      borderRadius: 6,
                    }}
                  >
                    {review.is_approved ? "Опубликован" : "На модерации"}
                  </div>
                </div>
              </div>

              <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.6, margin: "0 0 16px" }}>
                {review.text}
              </p>

              {review.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={review.photo_url}
                  alt="Фото к отзыву"
                  style={{
                    maxWidth: 200,
                    borderRadius: 10,
                    marginBottom: 16,
                    border: "1px solid #E2EDF4",
                  }}
                />
              )}

              {/* Actions */}
              {!review.is_approved && (
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => handleAction(review.id, "approve")}
                    disabled={actionLoading === review.id}
                    style={{
                      flex: 1,
                      background: actionLoading === review.id ? "#94A3B8" : "#00875A",
                      color: "white",
                      border: "none",
                      borderRadius: 10,
                      padding: "10px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: actionLoading === review.id ? "not-allowed" : "pointer",
                    }}
                  >
                    ✅ Опубликовать
                  </button>
                  <button
                    onClick={() => handleAction(review.id, "reject")}
                    disabled={actionLoading === review.id}
                    style={{
                      flex: 1,
                      background: actionLoading === review.id ? "#94A3B8" : "#DC2626",
                      color: "white",
                      border: "none",
                      borderRadius: 10,
                      padding: "10px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: actionLoading === review.id ? "not-allowed" : "pointer",
                    }}
                  >
                    ❌ Удалить
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
