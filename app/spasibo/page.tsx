import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Phone, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Заявка принята — PrimeClean",
  description: "Ваша заявка на уборку успешно принята. Мы перезвоним в течение 15 минут.",
  robots: { index: false, follow: false },
};

export default function ThanksPage() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0FDFF] to-white pt-20">
      <div className="max-w-lg w-full mx-auto px-4 text-center">
        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00C9A7] to-[#00A887] text-white flex items-center justify-center mx-auto mb-8 shadow-xl shadow-[#00C9A7]/30">
          <CheckCircle size={44} />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4">
          Заявка принята!
        </h1>
        <p className="text-lg text-[#475569] mb-8 leading-relaxed">
          Спасибо за обращение в PrimeClean. Наш менеджер перезвонит вам в течение 15 минут
          в рабочее время.
        </p>

        <div className="bg-white rounded-2xl border border-[#E2EDF4] p-5 mb-8 text-left space-y-3">
          <div className="flex items-center gap-3 text-sm text-[#475569]">
            <Clock size={16} className="text-[#00B4D8] flex-shrink-0" />
            Время работы: Пн–Пт 08:00–20:00, Сб–Вс 09:00–18:00
          </div>
          <div className="flex items-center gap-3 text-sm text-[#475569]">
            <Phone size={16} className="text-[#00B4D8] flex-shrink-0" />
            <span>Или позвоните сами: <a href="tel:+375444789360" className="font-semibold text-[#0077B6] hover:underline">+375 (44) 478-93-60</a></span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#00C9A7] text-white font-semibold px-6 py-3.5 rounded-2xl hover:bg-[#00A887] transition-colors cursor-pointer"
          >
            На главную
          </Link>
          <Link
            href="/uslugi"
            className="inline-flex items-center justify-center gap-2 border-2 border-[#00B4D8] text-[#0077B6] font-semibold px-6 py-3.5 rounded-2xl hover:bg-[#F0FDFF] transition-colors cursor-pointer"
          >
            Все услуги
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
