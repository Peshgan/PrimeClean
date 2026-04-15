"use client";

import { reviews } from "@/lib/data/reviews";

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i <= rating ? "#F59E0B" : "#E2EDF4"}
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

const RATING_COLORS: Record<string, string> = {
  "5": "#00B4D8",
  "4": "#0077B6",
  "3": "#F59E0B",
};

export default function ReviewsTab() {
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          padding: "20px 16px 16px",
          background: "white",
          borderBottom: "1px solid #E2EDF4",
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
          Отзывы клиентов
        </h1>
        <p style={{ color: "#94A3B8", fontSize: 14 }}>Что говорят наши клиенты</p>
      </div>

      {/* Summary card */}
      <div style={{ padding: "16px 16px 0" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)",
            borderRadius: 18,
            padding: "20px",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 16,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
                lineHeight: 1,
              }}
            >
              {avg}
            </div>
            <div style={{ marginTop: 6 }}>
              <StarRating rating={Math.round(Number(avg))} />
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 4 }}>
              {reviews.length} отзывов
            </div>
          </div>

          <div style={{ flex: 1 }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const pct = (count / reviews.length) * 100;
              return (
                <div
                  key={star}
                  style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}
                >
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, width: 8 }}>
                    {star}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: "white",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, width: 16 }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div style={{ padding: "0 16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        {reviews.map((review) => (
          <div
            key={review.id}
            style={{
              background: "white",
              borderRadius: 16,
              padding: "16px",
              border: "1px solid #E2EDF4",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {/* Author row */}
            <div
              style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: RATING_COLORS[String(review.rating)] ?? "#E2EDF4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {review.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: "#1A2332",
                    fontWeight: 600,
                    fontSize: 14,
                    marginBottom: 2,
                  }}
                >
                  {review.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StarRating rating={review.rating} />
                  <span style={{ color: "#94A3B8", fontSize: 11 }}>{review.date}</span>
                </div>
              </div>
            </div>

            {/* Service badge */}
            <div
              style={{
                display: "inline-block",
                background: "#F0FDFF",
                border: "1px solid #E2EDF4",
                borderRadius: 8,
                padding: "3px 10px",
                fontSize: 11,
                color: "#0077B6",
                fontWeight: 500,
                marginBottom: 8,
              }}
            >
              {review.service}
            </div>

            {/* Text */}
            <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              {review.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
