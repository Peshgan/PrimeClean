import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import BookingForm from "@/components/forms/BookingForm";

export const metadata: Metadata = {
  title: "Контакты PrimeClean — клининг в Минске",
  description:
    "Контакты клининговой компании PrimeClean в Минске. Телефон, адрес, время работы, мессенджеры. Заказать уборку онлайн или по телефону.",
};

export default function ContactsPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-[#F0FDFF] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Хлебные крошки" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-[#94A3B8]">
              <li><Link href="/" className="hover:text-[#0077B6] transition-colors">Главная</Link></li>
              <li>/</li>
              <li className="text-[#1A2332] font-medium">Контакты</li>
            </ol>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1A2332] mb-4">
            Контакты
          </h1>
          <p className="text-xl text-[#475569]">
            Свяжитесь с нами любым удобным способом
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Contact info */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#1A2332]">Как с нами связаться</h2>

              <div className="space-y-4">
                <a href="tel:+375291234567" className="flex items-start gap-4 p-4 bg-[#F0FDFF] rounded-2xl border border-[#E2EDF4] hover:border-[#00B4D8]/40 transition-colors cursor-pointer group">
                  <div className="w-11 h-11 rounded-xl bg-white border border-[#E2EDF4] flex items-center justify-center flex-shrink-0 group-hover:bg-[#00B4D8] group-hover:border-[#00B4D8] transition-all">
                    <Phone size={18} className="text-[#00B4D8] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1A2332]">+375 (29) 123-45-67</div>
                    <div className="text-sm text-[#94A3B8]">Звоните в любой день</div>
                  </div>
                </a>

                <a href="mailto:info@primeclean.by" className="flex items-start gap-4 p-4 bg-[#F0FDFF] rounded-2xl border border-[#E2EDF4] hover:border-[#00B4D8]/40 transition-colors cursor-pointer group">
                  <div className="w-11 h-11 rounded-xl bg-white border border-[#E2EDF4] flex items-center justify-center flex-shrink-0 group-hover:bg-[#00B4D8] group-hover:border-[#00B4D8] transition-all">
                    <Mail size={18} className="text-[#00B4D8] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1A2332]">info@primeclean.by</div>
                    <div className="text-sm text-[#94A3B8]">Ответим в течение часа</div>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 bg-[#F0FDFF] rounded-2xl border border-[#E2EDF4]">
                  <div className="w-11 h-11 rounded-xl bg-white border border-[#E2EDF4] flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} className="text-[#00B4D8]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1A2332]">г. Минск, ул. Немига, 5</div>
                    <div className="text-sm text-[#94A3B8]">Офис для встреч (по записи)</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-[#F0FDFF] rounded-2xl border border-[#E2EDF4]">
                  <div className="w-11 h-11 rounded-xl bg-white border border-[#E2EDF4] flex items-center justify-center flex-shrink-0">
                    <Clock size={18} className="text-[#00B4D8]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1A2332]">Время работы</div>
                    <div className="text-sm text-[#94A3B8]">Пн–Пт: 08:00–20:00</div>
                    <div className="text-sm text-[#94A3B8]">Сб–Вс: 09:00–18:00</div>
                  </div>
                </div>
              </div>

              {/* Messengers */}
              <div>
                <h3 className="font-semibold text-[#1A2332] mb-3">Мессенджеры</h3>
                <div className="flex gap-3">
                  {[
                    { label: "Telegram", icon: Send, href: "https://t.me/primeclean_by" },
                    { label: "Viber", icon: Phone, href: "viber://chat?number=%2B375291234567" },
                    { label: "WhatsApp", icon: MessageCircle, href: "https://wa.me/375291234567" },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <a
                        key={m.label}
                        href={m.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#F0FDFF] border border-[#E2EDF4] rounded-xl text-sm font-medium text-[#475569] hover:border-[#00B4D8]/40 hover:text-[#0077B6] transition-colors cursor-pointer"
                      >
                        <Icon size={15} className="text-[#00B4D8]" />
                        {m.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold text-[#1A2332] mb-6">Оставить заявку</h2>
              <div className="bg-[#F0FDFF] rounded-3xl border border-[#E2EDF4] p-6">
                <BookingForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
