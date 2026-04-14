import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { services } from "@/lib/data/services";
import Calculator from "@/components/forms/Calculator";

export const metadata: Metadata = {
  title: "Цены на уборку в Минске — прозрачный прайс-лист | PrimeClean",
  description:
    "Стоимость уборки квартир и офисов в Минске от PrimeClean. Прозрачные цены без скрытых платежей. Уборка квартиры от 79 BYN. Калькулятор стоимости онлайн.",
};

export default function PricesPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-[#F0FDFF] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Хлебные крошки" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-[#94A3B8]">
              <li><Link href="/" className="hover:text-[#0077B6] transition-colors">Главная</Link></li>
              <li>/</li>
              <li className="text-[#1A2332] font-medium">Цены</li>
            </ol>
          </nav>
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#1A2332] mb-4">
              Стоимость уборки в Минске
            </h1>
            <p className="text-xl text-[#475569] mb-6">
              Прозрачные цены без скрытых платежей. Оплата только после приёмки работы.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Без предоплаты", "Фиксированная цена", "Гарантия качества"].map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5 bg-white border border-[#E2EDF4] px-4 py-2 rounded-full text-sm font-medium text-[#475569]">
                  <CheckCircle size={14} className="text-[#00C9A7]" />
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Price cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A2332] mb-10">
            Прайс-лист
          </h2>
          <div className="space-y-8">
            {services.map((service) => (
              <div key={service.slug} className="bg-[#F0FDFF] rounded-3xl border border-[#E2EDF4] p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#1A2332]">{service.shortTitle}</h3>
                    <p className="text-[#475569] text-sm mt-1">{service.description}</p>
                  </div>
                  <Link
                    href={`/uslugi/${service.slug}`}
                    className="flex-shrink-0 text-sm font-semibold text-[#0077B6] hover:text-[#00B4D8] transition-colors"
                  >
                    Подробнее →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {service.tiers.map((tier, i) => (
                    <div
                      key={tier.name}
                      className={`rounded-2xl p-4 border-2 ${
                        i === 1
                          ? "border-[#00B4D8] bg-white"
                          : "border-[#E2EDF4] bg-white/60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-[#1A2332]">{tier.name}</span>
                        {i === 1 && (
                          <span className="text-xs bg-[#00B4D8] text-white px-2 py-0.5 rounded-full">Хит</span>
                        )}
                      </div>
                      <div className="text-sm text-[#94A3B8] mb-3">{tier.area}</div>
                      <div className="text-2xl font-bold text-[#0077B6] mb-3">
                        {tier.price === 0 ? "Договорная" : (
                          <>от {tier.price} <span className="text-sm font-normal text-[#94A3B8]">BYN</span></>
                        )}
                      </div>
                      <ul className="space-y-1">
                        {tier.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-[#475569]">
                            <CheckCircle size={11} className="text-[#00C9A7] flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-16 bg-[#F0FDFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1A2332] mb-4">
                Калькулятор стоимости
              </h2>
              <p className="text-[#475569] mb-6">
                Введите параметры — получите ориентировочную цену мгновенно. Точная стоимость фиксируется при оформлении заявки.
              </p>
              <div className="space-y-3 text-sm text-[#475569]">
                <p>📋 Цена включает все работы по чек-листу</p>
                <p>🧴 Профессиональная химия — в стоимости</p>
                <p>🔧 Инвентарь и оборудование — в стоимости</p>
              </div>
            </div>
            <Calculator />
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F0FDFF] rounded-2xl p-6 border border-[#E2EDF4]">
            <h2 className="font-bold text-[#1A2332] mb-3">Что влияет на цену</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#475569]">
              {[
                "Площадь помещения",
                "Тип уборки (стандартная / генеральная / после ремонта)",
                "Количество комнат и санузлов",
                "Дополнительные услуги (окна, химчистка и др.)",
                "Степень загрязнения",
                "Срочность выезда",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
