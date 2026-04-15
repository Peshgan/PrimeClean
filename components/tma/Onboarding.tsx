"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface OnboardingProps {
  onDone: () => void;
}

const STORIES = [
  {
    id: 1,
    emoji: "✨",
    title: "Чистота с заботой",
    subtitle: "Профессиональный клининг",
    description:
      "PrimeClean — ваш надёжный партнёр по уборке квартир, офисов и домов в Минске. Опытная команда, современное оборудование.",
    bg: "linear-gradient(160deg, #0077B6 0%, #00B4D8 100%)",
    accent: "rgba(255,255,255,0.15)",
  },
  {
    id: 2,
    emoji: "🧹",
    title: "Широкий выбор",
    subtitle: "Все виды клининга",
    description:
      "Стандартная и генеральная уборка, уборка после ремонта, химчистка мебели и ковров, клининг офисов — всё в одном месте.",
    bg: "linear-gradient(160deg, #00875A 0%, #00C9A7 100%)",
    accent: "rgba(255,255,255,0.15)",
  },
  {
    id: 3,
    emoji: "📱",
    title: "Удобный заказ",
    subtitle: "Прямо в Telegram",
    description:
      "Выберите услугу, рассчитайте стоимость в калькуляторе и выберите удобное дату и время — всё без звонков и ожиданий.",
    bg: "linear-gradient(160deg, #5B21B6 0%, #7C3AED 100%)",
    accent: "rgba(255,255,255,0.15)",
  },
  {
    id: 4,
    emoji: "⭐",
    title: "Гарантия качества",
    subtitle: "4.9 — наш рейтинг",
    description:
      "Более 200 довольных клиентов. Если что-то не устроит — вернёмся и исправим бесплатно. Работаем честно и с душой.",
    bg: "linear-gradient(160deg, #B45309 0%, #F59E0B 100%)",
    accent: "rgba(255,255,255,0.15)",
  },
];

const STORY_DURATION = 4000;

export default function Onboarding({ onDone }: OnboardingProps) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const nextStory = useCallback(() => {
    setCurrent((prev) => {
      if (prev >= STORIES.length - 1) {
        onDone();
        return prev;
      }
      return prev + 1;
    });
    setProgress(0);
    startTimeRef.current = Date.now();
  }, [onDone]);

  // Progress ticker
  useEffect(() => {
    if (paused) return;
    startTimeRef.current = Date.now() - progress * STORY_DURATION;
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(elapsed / STORY_DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        nextStory();
      }
    }, 30);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [current, paused, nextStory]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, currentTarget } = e;
    const half = currentTarget.getBoundingClientRect().width / 2;
    if (clientX < half) {
      // Previous story
      setCurrent((prev) => Math.max(0, prev - 1));
      setProgress(0);
    } else {
      nextStory();
    }
  };

  const story = STORIES[current];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: story.bg,
        display: "flex",
        flexDirection: "column",
        transition: "background 0.4s ease",
        userSelect: "none",
        touchAction: "none",
      }}
      onClick={handleTap}
      onMouseDown={() => setPaused(true)}
      onMouseUp={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Progress bars */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "14px 16px 0",
          position: "relative",
          zIndex: 2,
        }}
      >
        {STORIES.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: "rgba(255,255,255,0.35)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "white",
                borderRadius: 2,
                width:
                  i < current
                    ? "100%"
                    : i === current
                    ? `${progress * 100}%`
                    : "0%",
                transition: i === current ? "none" : "width 0.1s",
              }}
            />
          </div>
        ))}
      </div>

      {/* Skip button */}
      <div
        style={{
          position: "absolute",
          top: 24,
          right: 16,
          zIndex: 3,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDone();
          }}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: 20,
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            padding: "6px 14px",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          Пропустить
        </button>
      </div>

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
          animation: "storyIn 0.35s ease",
        }}
      >
        {/* Big emoji in a circle */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: story.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            marginBottom: 32,
            boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          }}
        >
          {story.emoji}
        </div>

        <div
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          {story.subtitle}
        </div>

        <h2
          style={{
            color: "white",
            fontSize: 30,
            fontWeight: 700,
            marginBottom: 16,
            fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
            lineHeight: 1.15,
          }}
        >
          {story.title}
        </h2>

        <p
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: 16,
            lineHeight: 1.6,
            maxWidth: 300,
          }}
        >
          {story.description}
        </p>
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: "32px 24px 48px", textAlign: "center" }}>
        {current === STORIES.length - 1 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDone();
            }}
            style={{
              background: "white",
              color: "#0077B6",
              border: "none",
              borderRadius: 16,
              fontSize: 17,
              fontWeight: 700,
              padding: "16px 40px",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              width: "100%",
              maxWidth: 320,
            }}
          >
            Начать 🚀
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {STORIES.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === current ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === current ? "white" : "rgba(255,255,255,0.4)",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes storyIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
