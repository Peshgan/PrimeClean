"use client";

const STATS = [
  { value: "3 500+", label: "Убранных объектов" },
  { value: "30+", label: "Специалистов в команде" },
  { value: "4.9 ★", label: "Средний рейтинг" },
  { value: "5 лет", label: "На рынке" },
];

const VALUES = [
  { emoji: "🌿", title: "Экологичная химия", text: "Только сертифицированные безопасные средства. Безвредно для детей и домашних животных." },
  { emoji: "✅", title: "Гарантия качества", text: "Не понравился результат — вернёмся и переделаем бесплатно в течение 24 часов. Без споров." },
  { emoji: "🔒", title: "Без предоплаты", text: "Все специалисты проверены. Платите только после приёмки работы — никакого аванса." },
  { emoji: "⚡", title: "Точно в срок", text: "Уборка за 2–4 часа. Приезжаем строго в согласованное время." },
];

const MILESTONES = [
  { year: "2019", text: "Основали компанию. Первые 50 довольных клиентов." },
  { year: "2020", text: "Расширились до 10 специалистов. Запустили офисный клининг." },
  { year: "2022", text: "1 000-й выполненный заказ. Оценка 4.9 на Google." },
  { year: "2024", text: "Команда 30+ специалистов. Более 3 500 убранных объектов." },
];

interface AboutTabProps {
  onBack: () => void;
}

export default function AboutTab({ onBack }: AboutTabProps) {
  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)",
        padding: "20px 16px 28px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -30, left: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        <button
          onClick={onBack}
          style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, color: "white", fontSize: 13, fontWeight: 600, padding: "6px 12px", cursor: "pointer", marginBottom: 18, position: "relative" }}
        >
          ← Назад
        </button>

        <div style={{ textAlign: "center", position: "relative" }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>✨</div>
          <h1 style={{ color: "white", fontSize: 22, fontWeight: 700, margin: "0 0 8px", fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}>
            О компании PrimeClean
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.5, margin: 0 }}>
            С 2019 года делаем дома и офисы Минска чище. Доверяют сотни семей.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ background: "white", borderRadius: 16, padding: "16px", border: "1px solid #E2EDF4", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ color: "#0077B6", fontWeight: 800, fontSize: 22, fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)", lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ color: "#94A3B8", fontSize: 11, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Why us */}
      <div style={{ padding: "20px 16px 0" }}>
        <h2 style={{ color: "#1A2332", fontSize: 18, fontWeight: 700, marginBottom: 12, fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}>
          Почему выбирают нас
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {VALUES.map((v) => (
            <div key={v.title} style={{ background: "white", borderRadius: 14, padding: "14px 16px", border: "1px solid #E2EDF4", display: "flex", gap: 12, alignItems: "flex-start", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize: 24, flexShrink: 0, lineHeight: 1.3 }}>{v.emoji}</span>
              <div>
                <div style={{ color: "#1A2332", fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{v.title}</div>
                <div style={{ color: "#475569", fontSize: 13, lineHeight: 1.5 }}>{v.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div style={{ padding: "20px 16px 0" }}>
        <h2 style={{ color: "#1A2332", fontSize: 18, fontWeight: 700, marginBottom: 12, fontFamily: "var(--font-montserrat,'Montserrat',sans-serif)" }}>
          История компании
        </h2>
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #E2EDF4", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          {MILESTONES.map((m, i) => (
            <div key={m.year} style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: i < MILESTONES.length - 1 ? "1px solid #F1F5F9" : "none", alignItems: "flex-start" }}>
              <div style={{ background: "linear-gradient(135deg, #00B4D8, #0077B6)", color: "white", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap" }}>
                {m.year}
              </div>
              <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.5, margin: 0 }}>{m.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Guarantee card */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ background: "linear-gradient(135deg, #E6FFF9 0%, #F0FDFF 100%)", border: "1.5px solid #00C9A7", borderRadius: 16, padding: "18px 16px" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>🛡️</span>
            <div style={{ color: "#065F46", fontWeight: 700, fontSize: 15 }}>Гарантия качества</div>
          </div>
          <p style={{ color: "#047857", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            Обнаружили недостатки после уборки — вернёмся и бесплатно устраним их в течение 24 часов. Ваша удовлетворённость — наш приоритет.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "16px 16px 0" }}>
        <a
          href="https://t.me/primeclean_bybot"
          target="_blank"
          rel="noreferrer"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)", color: "white", borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}
        >
          <span>✈️</span>
          Написать нам в Telegram
        </a>
      </div>
    </div>
  );
}
