const stats = [
  { value: "3 500+", label: "Убранных квартир", sub: "с 2019 года" },
  { value: "30+", label: "Специалистов", sub: "в команде" },
  { value: "4.9 / 5", label: "Средняя оценка", sub: "по 127 отзывам" },
  { value: "100%", label: "Гарантия", sub: "возврат или исправление" },
];

export default function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-[#00B4D8] to-[#0077B6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center text-white">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1">
                {stat.value}
              </div>
              <div className="text-base font-semibold mb-1 opacity-95">{stat.label}</div>
              <div className="text-sm opacity-70">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
