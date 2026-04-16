"use client";

import { useRef, useState } from "react";

interface Story {
  id: number;
  emoji: string;
  title: string;
  bg: string;
}

const STORIES: Story[] = [
  { id: 1, emoji: "✨", title: "Чистота\nс заботой", bg: "linear-gradient(135deg, #0077B6, #00B4D8)" },
  { id: 2, emoji: "🧹", title: "Все виды\nклининга", bg: "linear-gradient(135deg, #00875A, #00C9A7)" },
  { id: 3, emoji: "💎", title: "Гарантия\nкачества", bg: "linear-gradient(135deg, #5B21B6, #7C3AED)" },
  { id: 4, emoji: "⭐", title: "4.9 —\nнаш рейтинг", bg: "linear-gradient(135deg, #B45309, #F59E0B)" },
  { id: 5, emoji: "⚡", title: "Быстро\nи точно", bg: "linear-gradient(135deg, #DC2626, #F97316)" },
];

interface HomeStoriesProps {
  onStoryClick?: (story: Story) => void;
}

export default function HomeStories({ onStoryClick }: HomeStoriesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewed, setViewed] = useState<Set<number>>(new Set());

  const handleClick = (story: Story) => {
    setViewed((prev) => new Set([...prev, story.id]));
    onStoryClick?.(story);
  };

  return (
    <div
      ref={scrollRef}
      style={{
        display: "flex",
        gap: 12,
        padding: "16px 16px 4px",
        overflowX: "auto",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <style>{`
        div::-webkit-scrollbar { display: none; }
        @keyframes storyPop {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      {STORIES.map((story, i) => {
        const isViewed = viewed.has(story.id);
        return (
          <div
            key={story.id}
            onClick={() => handleClick(story)}
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
            {/* Ring + avatar */}
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
            {/* Title */}
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: isViewed ? "#94A3B8" : "#1A2332",
                textAlign: "center",
                lineHeight: 1.3,
                whiteSpace: "pre-line",
                maxWidth: 64,
                transition: "color 0.3s",
              }}
            >
              {story.title}
            </div>
          </div>
        );
      })}
    </div>
  );
}
