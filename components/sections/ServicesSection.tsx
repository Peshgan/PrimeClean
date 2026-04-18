import Link from "next/link";
import { Home, Building2, Sparkles, Trees, ArrowRight } from "lucide-react";
import { services } from "@/lib/data/services";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Home,
  Building2,
  Sparkles,
  Trees,
};

const imageIconMap: Record<string, string> = {
  Hammer: "/images/remont.png",
  Waves: "/images/himshistka.png",
  ShieldAlert: "/images/spec_clean.png",
};

export default function ServicesSection() {
  return (
    <section className="py-20 lg:py-28 bg-white" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-[#00B4D8] font-semibold text-sm uppercase tracking-wider mb-3">
            Что мы делаем
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4">
            Наши услуги
          </h2>
          <p className="text-[#475569] text-lg">
            Профессиональный клининг для квартир, домов и коммерческих помещений в Минске
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = iconMap[service.icon];
            const imgSrc = imageIconMap[service.icon];
            return (
              <Link
                key={service.slug}
                href={`/uslugi/${service.slug}`}
                className="group bg-[#F0FDFF] rounded-3xl p-6 border border-[#E2EDF4] hover:border-[#00B4D8]/40 hover:shadow-lg hover:shadow-[#00B4D8]/8 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2EDF4] flex items-center justify-center mb-4 group-hover:bg-[#00B4D8] group-hover:border-[#00B4D8] transition-all duration-300 overflow-hidden">
                  {imgSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgSrc} alt={service.shortTitle} className="w-7 h-7 object-contain" />
                  ) : Icon ? (
                    <Icon size={22} className="text-[#00B4D8] group-hover:text-white transition-colors duration-300" />
                  ) : (
                    <Home size={22} className="text-[#00B4D8] group-hover:text-white transition-colors duration-300" />
                  )}
                </div>

                <h3 className="font-bold text-[#1A2332] text-lg mb-2 group-hover:text-[#0077B6] transition-colors">
                  {service.shortTitle}
                </h3>

                <p className="text-[#475569] text-sm leading-relaxed mb-4">
                  {service.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-[#0077B6] font-semibold text-sm">
                    от {service.priceFrom} BYN
                  </span>
                  <span className="flex items-center gap-1 text-[#00B4D8] text-sm font-medium group-hover:gap-2 transition-all">
                    Подробнее
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/uslugi"
            className="inline-flex items-center gap-2 text-[#0077B6] font-semibold hover:text-[#00B4D8] transition-colors"
          >
            Все услуги
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
