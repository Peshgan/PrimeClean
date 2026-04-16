"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface Story {
  id: number;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  bg: string;
}

const STORIES: Story[] = [
  {
    id: 1,
    emoji: "✨",
    title: "Чистота с заботой",
    subtitle: "О компании",
    description: "PrimeClean — профессиональный клининг в Минске с 2019 года. Опытная команда, современное оборудование, безопасная химия.",
    bg: "linear-gradient(160deg, #0077B6 0%, #00B4D8 100%)",
  },
  {
    id: 2,
    emoji: "🧹",
    title: "Все виды клининга",
    subtitle: "Наши услуги",
    description: "Квартиры, офисы, дома, генеральная уборка, уборка после ремонта, химчистка мебели и ковров — всё в одном месте.",
    bg: "linear-gradient(160deg, #00875A 0%, #00C9A7 100%)",
  },
  {
    id: 3,
    emoji: "💎",
    title: "Гарантия качества",
    subtitle: "Наш стандарт",
    description: "Если что-то не устроит — вернёмся и исправим бесплатно. Работаем честно и с полной ответственностью за результат.",
    bg: "linear-gradient(160deg, #5B21B6 0%, #7C3AED 100%)",
  },
  {
    id: 4,
    emoji: "⭐",
    title: "4.9 — наш рейтинг",
    subtitle: "Отзывы клиентов",
    description: "Более 200 довольных клиентов. Мы дорожим каждым отзывом и постоянно растём вместе с вашими пожеланиями.",
    bg: "linear-gradient(160deg, #B45309 0%, #F59E0B 100%)",
  },
  {
    id: 5,
    emoji: "⚡",
    title: "Быстро и точно",
    subtitle: "Как мы работаем",
    description: "Заявка → подтверждение за 15 минут → выезд в удобное время → сдача работы по чек-листу. Никаких сюрпризов.",
    bg: "linear-gradient(160deg, #DC2626 0%, #F97316 100%)",
  },
];

const STORY_DURATION = 5000;

// ─── Full-screen story viewer ────────────────────────────────────────────────
function StoryViewer({
  stories,
  startIndex,
  onClose,
}: {
  stories: Story[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const rafRef = useRef<number>(0);

  const next = useCallback(() => {
    if (current >= stories.length - 1) {
      onClose();
    } else {
      setCurrent((c) => c + 1);
      setProgress(0);
      startTimeRef.current = Date.now();
    }
  }, [current, stories.length, onClose]);

  const prev = () => {
    if (current > 0) {
      setCurrent((c) => c - 1);
      setProgress(0);
      startTimeRef.current = Date.now();
    }
  };

  useEffect(() => {
    setProgress(0);
    startTimeRef.current = Date.now();
  }, [current]);

  useEffect(() => {
    if (paused) return;
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(elapsed / STORY_DURATION, 1);
      setProgress(pct);
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        next();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [current, paused, next]);

  const story = stories[current];

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, currentTarget } = e;
    const w = currentTarget.getBoundingClientRect().width;
    if (clientX < w * 0.35) prev();
    else next();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: story.bg,
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
        touchAction: "none",
        transition: "background 0.4s ease",
      }}
      onClick={handleTap}
      onMouseDown={() => setPaused(true)}
      onMouseUp={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Progress bars */}
      <div style={{ display: "flex", gap: 4, padding: "14px 16px 0", zIndex: 2 }}>
        {stories.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: "rgba(255,255,255,0.3)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "white",
                borderRadius: 2,
                width: i < current ? "100%" : i === current ? `${progress * 100}%` : "0%",
                transition: i < current ? "none" : undefined,
              }}
            />
          </div>
        ))}
      </div>

      {/* Close */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        style={{
          position: "absolute",
          top: 18,
          right: 16,
          background: "rgba(255,255,255,0.2)",
          border: "none",
          borderRadius: 20,
          color: "white",
          fontSize: 13,
          fontWeight: 600,
          padding: "6px 14px",
          cursor: "pointer",
          backdropFilter: "blur(8px)",
          zIndex: 3,
        }}
      >
        ✕
      </button>

      {/* Content */}
      <div
        key={current}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 32px 0",
          textAlign: "center",
          animation: "storySlideIn 0.3s ease",
        }}
      >
        <style>{`
          @keyframes storySlideIn {
            from { opacity: 0; transform: scale(0.94); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 52,
            marginBottom: 28,
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          }}
        >
          {story.emoji}
        </div>

        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
          {story.subtitle}
        </div>

        <h2 style={{ color: "white", fontSize: 28, fontWeight: 700, marginBottom: 16, lineHeight: 1.2, fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)" }}>
          {story.title}
        </h2>

        <p style={{ color: "rgba(255,255,255,0.88)", fontSize: 16, lineHeight: 1.65, maxWidth: 310 }}>
          {story.description}
        </p>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "28px 24px 52px" }}>
        {stories.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === current ? 22 : 7,
              height: 7,
              borderRadius: 4,
              background: i === current ? "white" : "rgba(255,255,255,0.4)",
              transition: "all 0.25s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Stories strip (home screen) ─────────────────────────────────────────────
export default function HomeStories() {
  const [viewed, setViewed] = useState<Set<number>>(new Set());
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleClick = (idx: number) => {
    setOpenIndex(idx);
  };

  const handleClose = () => {
    if (openIndex !== null) {
      setViewed((prev) => new Set([...prev, STORIES[openIndex].id]));
    }
    setOpenIndex(null);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: "16px 16px 4px",
          overflowX: "auto",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
        }}
      >
        <style>{`
          .stories-strip::-webkit-scrollbar { display: none; }
          @keyframes storyPop {
            from { opacity: 0; transform: scale(0.82); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {STORIES.map((story, i) => {
          const isViewed = viewed.has(story.id);
          return (
            <div
              key={story.id}
              onClick={() => handleClick(i)}
              style={{
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                animation: `storyPop 0.3s ease ${i * 0.06}s both`,
              }}
            >
              {/* Gradient ring */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  padding: 2.5,
                  background: isViewed
                    ? "#E2EDF4"
                    : "linear-gradient(135deg, #00B4D8, #0077B6, #00C9A7)",
                  transition: "background 0.3s",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: story.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    border: "2px solid white",
                    boxSizing: "border-box",
                  }}
                >
                  {story.emoji}
                </div>
              </div>
              {/* Label */}
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: isViewed ? "#94A3B8" : "#1A2332",
                  textAlign: "center",
                  lineHeight: 1.3,
                  maxWidth: 64,
                  transition: "color 0.3s",
                  wordBreak: "break-word",
                }}
              >
                {story.title.split("\n")[0]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-screen viewer */}
      {openIndex !== null && (
        <StoryViewer
          stories={STORIES}
          startIndex={openIndex}
          onClose={handleClose}
        />
      )}
    </>
  );
}
