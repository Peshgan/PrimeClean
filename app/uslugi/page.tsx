import type { Metadata } from "next";
import Link from "next/link";
import { Home, Building2, Sparkles, Hammer, Trees, Waves, ArrowRight, Clock } from "lucide-react";
import { services } from "@/lib/data/services";

export const metadata: Metadata = {
  title: "Услуги клининга в Минске — уборка квартир, офисов, домов",
  description:
    "Все услуги клининговой компании PrimeClean в Минске. Уборка квартир, офисов, генеральная уборка, уборка после ремонта, химчистка ковров. Цены и запись онлайн.",
};

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Home, Building2, Sparkles, Hammer, Trees, Waves,
};

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-[#F0FDFF] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Хлебные крошки" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-[#94A3B8]">
              <li><Link href="/" className="hover:text-[#0077B6] transition-colors">Главная</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-[#1A2332] font-medium">Услуги</li>
            </ol>
          </nav>
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#1A2332] mb-4">
              Услуги клининга в Минске
            </h1>
            <p className="text-xl text-[#475569]">
              Профессиональная уборка любой сложности — от квартир до коммерческих объектов
            </p>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const Icon = iconMap[service.icon] ?? Home;
              return (
                <Link
                  key={service.slug}
                  href={`/uslugi/${service.slug}`}
                  className="group flex flex-col bg-[#F0FDFF] rounded-3xl overflow-hidden border border-[#E2EDF4] hover:border-[#00B4D8]/40 hover:shadow-xl hover:shadow-[#00B4D8]/8 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E2EDF4] flex items-center justify-center group-hover:bg-[#00B4D8] group-hover:border-[#00B4D8] transition-all duration-300">
                        <Icon size={18} className="text-[#00B4D8] group-hover:text-white transition-colors duration-300" />
                      </div>
                      <span className="text-xs font-medium text-[#94A3B8] flex items-center gap-1">
                        <Clock size={11} />
                        {service.duration}
                      </span>
                    </div>
                    <h2 className="font-bold text-[#1A2332] text-lg mb-2 group-hover:text-[#0077B6] transition-colors">
                      {service.shortTitle}
                    </h2>
                    <p className="text-[#475569] text-sm leading-relaxed flex-1 mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-bold text-[#0077B6]">от {service.priceFrom} BYN</span>
                      <span className="flex items-center gap-1 text-[#00B4D8] text-sm font-medium group-hover:gap-2 transition-all">
                        Подробнее <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
