import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Users, Award, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "О компании PrimeClean — клининг в Минске с 2019 года",
  description:
    "О клининговой компании PrimeClean в Минске. Команда 30+ специалистов, более 3500 убранных объектов, сертифицированная химия и гарантия качества с 2019 года.",
};

const milestones = [
  { year: "2019", event: "Основание компании. Первые 50 клиентов." },
  { year: "2020", event: "Расширение до 10 специалистов. Запуск офисного направления." },
  { year: "2022", event: "1 000-й выполненный заказ. Оценка 4.9 на Google." },
  { year: "2024", event: "Команда 30+ специалистов. Более 3 500 убранных объектов." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-[#F0FDFF] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Хлебные крошки" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-[#94A3B8]">
              <li><Link href="/" className="hover:text-[#0077B6] transition-colors">Главная</Link></li>
              <li>/</li>
              <li className="text-[#1A2332] font-medium">О нас</li>
            </ol>
          </nav>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl font-bold text-[#1A2332]">
                О компании PrimeClean
              </h1>
              <p className="text-lg text-[#475569] leading-relaxed">
                С 2019 года мы делаем дома и офисы Минска чище. За это время выполнили более
                3 500 заказов и завоевали доверие сотен постоянных клиентов.
              </p>
              <p className="text-[#475569] leading-relaxed">
                Наша миссия — освободить ваше время от уборки. Мы берём на себя всю работу,
                используем только безопасные сертифицированные средства и гарантируем результат.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "3 500+", label: "Заказов выполнено" },
                { value: "30+", label: "Специалистов" },
                { value: "4.9★", label: "Средняя оценка" },
                { value: "5 лет", label: "Опыт работы" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-5 border border-[#E2EDF4] text-center">
                  <div className="text-2xl font-bold text-[#0077B6] mb-1">{s.value}</div>
                  <div className="text-sm text-[#94A3B8]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A2332] mb-10 text-center">
            Наши ценности
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle, title: "Качество", text: "Работаем по детальному чек-листу. Гарантируем результат — иначе вернёмся бесплатно.", color: "text-[#00C9A7]", bg: "bg-[#E6FFF9]" },
              { icon: Heart, title: "Забота", text: "Относимся к вашему дому как к своему. Аккуратность и уважение к вашим вещам — наш стандарт.", color: "text-[#F43F5E]", bg: "bg-[#FFF1F3]" },
              { icon: Users, title: "Команда", text: "Все сотрудники проверены, обучены и застрахованы. Мы несём ответственность за каждого.", color: "text-[#00B4D8]", bg: "bg-[#F0FDFF]" },
            ].map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="bg-[#F0FDFF] rounded-3xl p-6 border border-[#E2EDF4]">
                  <div className={`w-12 h-12 rounded-2xl ${v.bg} flex items-center justify-center mb-4`}>
                    <Icon size={22} className={v.color} />
                  </div>
                  <h3 className="font-bold text-[#1A2332] text-lg mb-2">{v.title}</h3>
                  <p className="text-[#475569] text-sm leading-relaxed">{v.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-16 bg-[#F0FDFF]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A2332] mb-10 text-center">
            История компании
          </h2>
          <div className="space-y-6 relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#E2EDF4]" aria-hidden="true" />
            {milestones.map((m) => (
              <div key={m.year} className="flex gap-6 relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00B4D8] to-[#0077B6] text-white font-bold text-sm flex items-center justify-center flex-shrink-0 z-10">
                  {m.year.slice(2)}
                </div>
                <div className="bg-white rounded-2xl p-4 border border-[#E2EDF4] flex-1 mt-1.5">
                  <span className="text-xs font-semibold text-[#00B4D8]">{m.year}</span>
                  <p className="text-[#475569] text-sm mt-1">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#00B4D8] to-[#0077B6] text-white text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Award size={40} className="mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Готовы работать с нами?</h2>
          <p className="text-white/80 mb-6">Оставьте заявку — перезвоним в течение 15 минут</p>
          <Link
            href="#booking"
            className="inline-block bg-white text-[#0077B6] font-bold px-8 py-4 rounded-2xl hover:bg-[#F0FDFF] transition-colors cursor-pointer"
          >
            Заказать уборку
          </Link>
        </div>
      </section>
    </>
  );
}
