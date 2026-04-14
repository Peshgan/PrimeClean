import Link from "next/link";
import { CheckCircle, Star, Phone } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#F0FDFF] via-white to-[#E8F8FF] pt-20">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#00B4D8]/8 blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-80 h-80 rounded-full bg-[#00C9A7]/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00B4D8]/4 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div className="space-y-6 lg:space-y-8">
            {/* Trust chips */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white border border-[#E2EDF4] px-3 py-1.5 rounded-full text-sm font-medium text-[#475569] shadow-sm">
                <span className="flex items-center gap-1 text-[#F59E0B]">
                  <Star size={13} className="fill-[#F59E0B]" />
                  <Star size={13} className="fill-[#F59E0B]" />
                  <Star size={13} className="fill-[#F59E0B]" />
                  <Star size={13} className="fill-[#F59E0B]" />
                  <Star size={13} className="fill-[#F59E0B]" />
                </span>
                4.9 / 5 — 127 отзывов
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#DCFCE7] text-[#16A34A] px-3 py-1.5 rounded-full text-sm font-medium">
                <CheckCircle size={13} />
                Гарантия качества
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A2332] leading-tight">
              Профессиональная{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4D8] to-[#0077B6]">
                уборка в Минске
              </span>{" "}
              с гарантией
            </h1>

            <p className="text-lg text-[#475569] leading-relaxed max-w-xl">
              Команда 30+ специалистов. Экологичная химия. Уборка за 2–4 часа.
              Если что-то не понравится — вернёмся и исправим бесплатно.
            </p>

            {/* Benefits list */}
            <ul className="space-y-3">
              {[
                "Работаем с 08:00 до 20:00, включая выходные",
                "Уборка квартиры от 79 BYN",
                "Без предоплаты — платите после приёмки",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[#475569]">
                  <CheckCircle size={18} className="text-[#00C9A7] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="#booking"
                className="inline-flex items-center justify-center font-semibold rounded-2xl transition-colors duration-200 cursor-pointer bg-[#00C9A7] text-white hover:bg-[#00A887] shadow-lg shadow-[#00C9A7]/25 px-8 py-4 text-lg"
              >
                Заказать уборку
              </Link>
              <Link
                href="#calculator"
                className="inline-flex items-center justify-center font-semibold rounded-2xl transition-colors duration-200 cursor-pointer border-2 border-[#00B4D8] text-[#0077B6] hover:bg-[#F0FDFF] px-8 py-4 text-lg"
              >
                Рассчитать стоимость
              </Link>
            </div>

            {/* Phone */}
            <a
              href="tel:+375291234567"
              className="inline-flex items-center gap-2 text-[#0077B6] font-semibold hover:text-[#00B4D8] transition-colors cursor-pointer"
            >
              <Phone size={18} />
              +375 (29) 123-45-67
            </a>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] lg:aspect-[3/4]">
              <img
                src="https://res.cloudinary.com/dkbltmyul/image/upload/v1776190522/uborka_kvartir_v_minske_primeclean_vuldhk.jpg"
                alt="Профессиональная уборка квартиры в Минске — PrimeClean"
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0077B6]/20 to-transparent" />
            </div>

            {/* Floating stats */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-[#E2EDF4]">
              <div className="text-2xl font-bold text-[#1A2332]">3 500+</div>
              <div className="text-sm text-[#94A3B8]">убранных квартир</div>
            </div>

            <div className="absolute -top-4 -right-4 bg-[#00C9A7] rounded-2xl shadow-xl p-4 text-white">
              <div className="text-2xl font-bold">5 лет</div>
              <div className="text-sm opacity-90">на рынке</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
