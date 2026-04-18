"use client";

import { useState, useEffect, useRef } from "react";
import type { TelegramUser } from "@/types/telegram";
import { services } from "@/lib/data/services";

interface ReviewItem {
  id: string | number;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  service: string;
  text: string;
  photo_url?: string | null;
}

const RU_MONTHS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

function formatRuDate(raw: string): string {
  if (!raw) return "";
  // Already human-readable ("15 марта 2025") — keep as is
  if (/^\d+\s+[а-яА-Я]+\s+\d{4}$/.test(raw.trim())) return raw;
  const d = new Date(raw.includes("T") ? raw : `${raw}T00:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return `${d.getDate()} ${RU_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const MAX_PHOTO_MB = 10;
const MAX_PHOTO_BYTES = MAX_PHOTO_MB * 1024 * 1024;

interface ReviewsTabProps {
  user?: TelegramUser | null;
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 2,
            fontSize: 32,
            lineHeight: 1,
            filter: (hover || value) >= star ? "none" : "grayscale(1) opacity(0.3)",
            transform: hover === star ? "scale(1.2)" : "scale(1)",
            transition: "transform 0.15s, filter 0.15s",
          }}
        >
          ⭐
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= rating ? "#F59E0B" : "#E2EDF4"}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

const RATING_COLORS: Record<number, string> = {
  5: "#00B4D8",
  4: "#0077B6",
  3: "#F59E0B",
  2: "#F97316",
  1: "#DC2626",
};

const RATING_LABELS: Record<number, string> = {
  1: "Очень плохо",
  2: "Плохо",
  3: "Нормально",
  4: "Хорошо",
  5: "Отлично!",
};

export default function ReviewsTab({ user }: ReviewsTabProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [authorName, setAuthorName] = useState(user?.first_name ?? "");
  const [serviceName, setServiceName] = useState("");
  const [photos, setPhotos] = useState<{ preview: string; b64: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const MAX_PHOTOS = 5;

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = MAX_PHOTOS - photos.length;
    const toAdd = files.slice(0, remaining);
    const oversized = toAdd.filter((f) => f.size > MAX_PHOTO_BYTES);
    if (oversized.length) {
      setFormError(`Фото не должно превышать ${MAX_PHOTO_MB} МБ`);
      return;
    }
    setFormError("");
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const b64 = ev.target?.result as string;
        setPhotos((prev) => prev.length < MAX_PHOTOS ? [...prev, { preview: b64, b64 }] : prev);
      };
      reader.readAsDataURL(file);
    });
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const removePhoto = (idx: number) => setPhotos((p) => p.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!rating) { setFormError("Выберите оценку"); return; }
    if (text.trim().length < 10) { setFormError("Напишите хотя бы несколько слов"); return; }
    if (!authorName.trim()) { setFormError("Введите ваше имя"); return; }
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: authorName.trim(),
          rating,
          serviceName: serviceName || undefined,
          text: text.trim(),
          photoUrl: photos[0]?.b64 ?? undefined,
          extraPhotos: photos.slice(1).map((p) => p.b64),
          userTelegramId: user?.id ? String(user.id) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка");
      setSubmitted(true);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Ошибка отправки");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0); setText(""); setServiceName(""); setPhotos([]);
    setFormError(""); setSubmitted(false); setShowForm(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1.5px solid #E2EDF4", borderRadius: 12,
    padding: "12px 14px", fontSize: 15, color: "#1A2332",
    background: "white", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", color: "#475569", fontSize: 13,
    fontWeight: 600, marginBottom: 6,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "20px 16px 16px", background: "white", borderBottom: "1px solid #E2EDF4" }}>
        <h1 style={{ color: "#1A2332", fontSize: 22, fontWeight: 700, fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)", marginBottom: 4 }}>
          Отзывы клиентов
        </h1>
        <p style={{ color: "#94A3B8", fontSize: 14 }}>Что говорят наши клиенты</p>
      </div>

      {/* Summary card */}
      {!loading && reviews.length > 0 && (
        <div style={{ padding: "16px 16px 0" }}>
          <div style={{ background: "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)", borderRadius: 18, padding: "20px", color: "white", display: "flex", alignItems: "center", gap: 20, marginBottom: 4 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1, fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}>{avg}</div>
              <div style={{ marginTop: 6 }}><StarDisplay rating={Math.round(Number(avg))} /></div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 4 }}>{reviews.length} отзывов</div>
            </div>
            <div style={{ flex: 1 }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                const pct = (count / reviews.length) * 100;
                return (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, width: 8 }}>{star}</span>
                    <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "white", borderRadius: 3 }} />
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, width: 16 }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Write review button */}
      {!showForm && !submitted && (
        <div style={{ padding: "12px 16px 0" }}>
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #00C9A7 0%, #00875A 100%)",
              color: "white", border: "none", borderRadius: 14,
              fontSize: 15, fontWeight: 700, padding: "13px",
              cursor: "pointer",
            }}
          >
            ✍️ Написать отзыв
          </button>
        </div>
      )}

      {/* Review form */}
      {showForm && !submitted && (
        <div style={{ padding: "16px 16px 0" }}>
          <div style={{ background: "white", borderRadius: 18, border: "1px solid #E2EDF4", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 style={{ color: "#1A2332", fontSize: 18, fontWeight: 700, marginBottom: 18, fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}>
              Ваш отзыв
            </h2>

            {/* Rating */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Оценка *</label>
              <StarPicker value={rating} onChange={setRating} />
              {rating > 0 && (
                <p style={{ color: "#0077B6", fontSize: 13, fontWeight: 600, marginTop: 6 }}>
                  {RATING_LABELS[rating]}
                </p>
              )}
            </div>

            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Ваше имя *</label>
              <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Иван Иванов" style={inputStyle} />
            </div>

            {/* Service dropdown */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Услуга</label>
              <select
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                style={{ ...inputStyle, appearance: "none" as const, backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%2394A3B8' d='M6 8L0 0h12z'/></svg>\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36 }}
              >
                <option value="">— Выберите услугу —</option>
                {services.map((s) => (
                  <option key={s.slug} value={s.shortTitle}>{s.shortTitle}</option>
                ))}
              </select>
            </div>

            {/* Text */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Комментарий *</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Расскажите о вашем опыте..."
                rows={4}
                style={{ ...inputStyle, resize: "none" }}
              />
              <p style={{ color: "#94A3B8", fontSize: 11, marginTop: 3 }}>{text.length}/1000</p>
            </div>

            {/* Photo upload — multiple */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                Фото (необязательно, до {MAX_PHOTOS} шт · до {MAX_PHOTO_MB} МБ каждое)
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhoto}
                style={{ display: "none" }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {photos.map((p, idx) => (
                  <div key={idx} style={{ position: "relative" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.preview}
                      alt={`фото ${idx + 1}`}
                      style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, border: "1.5px solid #E2EDF4", display: "block" }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      style={{
                        position: "absolute", top: -6, right: -6,
                        width: 20, height: 20, borderRadius: "50%",
                        background: "#DC2626", color: "white", border: "none",
                        fontSize: 11, cursor: "pointer", fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        lineHeight: 1,
                      }}
                    >✕</button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    style={{
                      width: 80, height: 80, border: "2px dashed #E2EDF4", borderRadius: 10,
                      background: "#F8FBFF", cursor: "pointer",
                      color: "#94A3B8", fontSize: 22,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                    }}
                  >
                    <span>📷</span>
                    <span style={{ fontSize: 10, fontWeight: 600 }}>+фото</span>
                  </button>
                )}
              </div>
            </div>

            {/* Error */}
            {formError && (
              <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 10, padding: "10px 14px", color: "#DC2626", fontSize: 13, marginBottom: 14 }}>
                {formError}
              </div>
            )}

            {/* Moderation notice */}
            <p style={{ color: "#94A3B8", fontSize: 12, marginBottom: 14, lineHeight: 1.5 }}>
              ℹ️ Отзыв будет опубликован в течение часа
            </p>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={resetForm} style={{ flex: 1, background: "#F1F5F9", border: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  flex: 2,
                  background: submitting ? "#94A3B8" : "linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)",
                  color: "white", border: "none", borderRadius: 12,
                  fontSize: 15, fontWeight: 700, padding: "13px",
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Отправляем..." : "Отправить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {submitted && (
        <div style={{ padding: "16px 16px 0" }}>
          <div style={{ background: "#ECFDF5", border: "1px solid #6EE7B7", borderRadius: 16, padding: "24px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>✅</div>
            <h3 style={{ color: "#065F46", fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Отзыв отправлен!</h3>
            <p style={{ color: "#047857", fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
              Спасибо! Ваш отзыв появится в течение часа.
            </p>
            <button onClick={resetForm} style={{ background: "#00875A", color: "white", border: "none", borderRadius: 12, padding: "11px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div style={{ padding: "16px 16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        {loading && (
          <div style={{ textAlign: "center", padding: 32, color: "#94A3B8" }}>Загрузка...</div>
        )}
        {!loading && reviews.length === 0 && (
          <div style={{ textAlign: "center", padding: 32, color: "#94A3B8" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
            <p>Пока нет отзывов. Будьте первым!</p>
          </div>
        )}
        {reviews.map((review) => (
          <div
            key={review.id}
            style={{ background: "white", borderRadius: 16, padding: "16px", border: "1px solid #E2EDF4", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: RATING_COLORS[review.rating] ?? "#E2EDF4",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 700, fontSize: 14, flexShrink: 0,
                }}
              >
                {review.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#1A2332", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{review.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StarDisplay rating={review.rating} />
                  <span style={{ color: "#94A3B8", fontSize: 11 }}>{formatRuDate(review.date)}</span>
                </div>
              </div>
            </div>

            {review.service && (
              <div style={{ display: "inline-block", background: "#F0FDFF", border: "1px solid #E2EDF4", borderRadius: 8, padding: "3px 10px", fontSize: 11, color: "#0077B6", fontWeight: 500, marginBottom: 8 }}>
                {review.service}
              </div>
            )}

            <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{review.text}</p>

            {review.photo_url && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {[review.photo_url, ...((review as ReviewItem & { extra_photos?: string[] }).extra_photos ?? [])].filter(Boolean).map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`Фото ${i + 1}`}
                    style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 10, border: "1px solid #E2EDF4", display: "block" }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
