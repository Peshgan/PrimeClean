import BookingForm from "@/components/forms/BookingForm";
import { Phone, MessageCircle, Clock } from "lucide-react";

export default function BookingSection() {
  return (
    <section className="py-20 lg:py-28 bg-white" id="booking">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left */}
          <div className="space-y-6">
            <div>
              <p className="text-[#00B4D8] font-semibold text-sm uppercase tracking-wider mb-3">
                Заказать уборку
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4">
                Готовы навести чистоту?
              </h2>
              <p className="text-[#475569] text-lg leading-relaxed">
                Оставьте заявку — перезвоним в течение 15 минут в рабочее время и подберём удобный для вас день.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F0FDFF] flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-[#00B4D8]" />
                </div>
                <div>
                  <div className="font-semibold text-[#1A2332] text-sm">Отвечаем быстро</div>
                  <div className="text-[#94A3B8] text-sm">Перезвоним в течение 15 минут</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F0FDFF] flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-[#00B4D8]" />
                </div>
                <div>
                  <a href="tel:+375444789360" className="font-semibold text-[#1A2332] text-sm hover:text-[#0077B6] transition-colors cursor-pointer">
                    +375 (44) 478-93-60
                  </a>
                  <div className="text-[#94A3B8] text-sm">Пн–Пт 08:00–20:00, Сб–Вс 09:00–18:00</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F0FDFF] flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={18} className="text-[#00B4D8]" />
                </div>
                <div>
                  <div className="font-semibold text-[#1A2332] text-sm">Мессенджеры</div>
                  <div className="text-[#94A3B8] text-sm">Telegram, Viber, WhatsApp</div>
                </div>
              </div>
            </div>

            {/* Trust */}
            <div className="bg-[#F0FDFF] rounded-2xl p-5 border border-[#E2EDF4]">
              <p className="text-sm font-semibold text-[#1A2332] mb-1">Без предоплаты</p>
              <p className="text-sm text-[#475569]">
                Оплата только после приёмки работы. Если что-то не устроит — вернёмся бесплатно.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-[#F0FDFF] rounded-3xl border border-[#E2EDF4] p-6 lg:p-8">
            <h3 className="font-bold text-[#1A2332] text-xl mb-6">Оставить заявку</h3>
            <BookingForm />
          </div>
        </div>
      </div>
    </section>
  );
}
