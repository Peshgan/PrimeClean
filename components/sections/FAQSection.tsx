"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Сколько стоит уборка квартиры в Минске?",
    a: "Стоимость стандартной уборки начинается от 79 BYN для квартиры до 40 м². Точная цена зависит от площади, типа уборки и дополнительных услуг. Воспользуйтесь калькулятором на сайте или позвоните нам.",
  },
  {
    q: "Как быстро приедет команда?",
    a: "При наличии свободных специалистов — в день обращения. В стандартном режиме — в течение 1–2 рабочих дней. Мы всегда стараемся подстроиться под ваш график.",
  },
  {
    q: "Нужно ли присутствовать при уборке?",
    a: "Нет. Многие клиенты оставляют ключ или используют сейф-замок. Все наши сотрудники проверены и застрахованы. После окончания пришлём фото отчёт.",
  },
  {
    q: "Что делать, если уборка не устроила?",
    a: "Звоните нам сразу — мы вернёмся и исправим всё бесплатно в течение 24 часов. Это наша гарантия качества.",
  },
  {
    q: "Вы используете безопасную химию?",
    a: "Да. Работаем только с сертифицированными экологичными средствами. Они безопасны для детей, домашних животных и людей с аллергией.",
  },
  {
    q: "Как заказать уборку?",
    a: "Заполните форму на сайте, напишите в Telegram или позвоните. Наш менеджер уточнит детали и запишет вас на удобное время.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 lg:py-28 bg-[#F0FDFF]" id="faq">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[#00B4D8] font-semibold text-sm uppercase tracking-wider mb-3">
            Частые вопросы
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2332]">
            Отвечаем на ваши вопросы
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#E2EDF4] overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer hover:bg-[#F0FDFF] transition-colors"
                aria-expanded={open === i}
                aria-controls={`faq-${i}`}
              >
                <span className="font-semibold text-[#1A2332] pr-4">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-[#00B4D8] flex-shrink-0 transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div id={`faq-${i}`} className="px-6 pb-5">
                  <p className="text-[#475569] leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
