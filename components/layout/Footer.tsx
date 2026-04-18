import Link from "next/link";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

const serviceLinks = [
  { label: "Уборка квартир", href: "/uslugi/uborka-kvartir-minsk" },
  { label: "Клининг офисов", href: "/uslugi/klining-ofisov-minsk" },
  { label: "Генеральная уборка", href: "/uslugi/generalnaya-uborka-minsk" },
  { label: "После ремонта", href: "/uslugi/uborka-posle-remonta-minsk" },
  { label: "Уборка домов", href: "/uslugi/uborka-domov-minsk" },
  { label: "Химчистка", href: "/uslugi/khimchistka-minsk" },
  { label: "Спец. уборка", href: "/uslugi/specializirovannaya-uborka-minsk" },
];

const companyLinks = [
  { label: "О компании", href: "/o-nas" },
  { label: "Цены", href: "/tseny" },
  { label: "Отзывы", href: "/otzyvy" },
  { label: "Блог", href: "/blog" },
  { label: "Контакты", href: "/kontakty" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1A2332] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#F0F8FF] flex items-center justify-center shrink-0 overflow-hidden">
                <svg viewBox="555 275 190 170" width="32" height="32" aria-hidden="true">
                  <path fill="#0781FE" d="M631.315 285.832C633.036 285.532 633.33 285.364 634.929 285.881C634.055 287.333 632.246 288.202 630.757 289.05C598.761 307.073 579.665 352.621 601.968 385.236C618.057 408.764 643.646 413.966 669.07 403.463C658.64 413.027 651.568 416.502 638.53 421.587C635.418 422.494 632.281 423.315 629.122 424.048C604.58 429.577 577.07 421.183 565.097 397.802C546.559 361.599 565.932 318.002 599.053 298.084C609.875 291.576 619.012 288.341 631.315 285.832Z"/>
                  <path fill="#0781FE" d="M612.63 314.974C630.04 300.967 650.809 294.562 673.12 296.724C706.061 299.915 724.937 327.462 721.153 359.58C718.266 382.304 706.507 402.961 688.443 417.044C674.931 427.557 660.148 433.805 643.055 435.242C649.653 431.611 655.1 428.318 660.828 423.371C684.124 403.251 696.105 368.356 680.08 339.956C673.004 327.41 661.202 318.217 647.307 314.427C636.214 311.415 624.405 311.889 613.803 316.452L612.63 314.974Z"/>
                  <path fill="#0099C8" d="M612.63 314.974L613.803 316.452C613.14 316.809 610.461 318.516 609.778 317.935C609.469 317.075 611.991 315.381 612.63 314.974Z"/>
                </svg>
              </div>
              <span className="font-bold text-xl text-[#0781FE]">
                PrimeClean
              </span>
            </div>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              Профессиональный клининг в Минске. Чистота с гарантией с 2019 года.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/primeclean_by"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[#00B4D8] transition-colors cursor-pointer"
                aria-label="Instagram PrimeClean"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a
                href="https://t.me/primeclean_bybot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[#00B4D8] transition-colors cursor-pointer"
                aria-label="Telegram PrimeClean"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-white mb-4">Услуги</h3>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#94A3B8] hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4">Компания</h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#94A3B8] hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="font-semibold text-white mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+375444789360"
                  className="flex items-start gap-3 text-[#94A3B8] hover:text-white text-sm transition-colors cursor-pointer"
                >
                  <Phone size={15} className="mt-0.5 shrink-0 text-[#00B4D8]" />
                  +375 (44) 478-93-60
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@primeclean.by"
                  className="flex items-start gap-3 text-[#94A3B8] hover:text-white text-sm transition-colors cursor-pointer"
                >
                  <Mail size={15} className="mt-0.5 shrink-0 text-[#00B4D8]" />
                  info@primeclean.by
                </a>
              </li>
              <li className="flex items-start gap-3 text-[#94A3B8] text-sm">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#00B4D8]" />
                Минск и Минская область
              </li>
              <li className="flex items-start gap-3 text-[#94A3B8] text-sm">
                <Clock size={15} className="mt-0.5 shrink-0 text-[#00B4D8]" />
                <span>
                  Пн–Пт: 08:00–20:00<br />
                  Сб–Вс: 09:00–18:00
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <p className="text-[#94A3B8] text-sm">
              © {new Date().getFullYear()} PrimeClean. Все права защищены.
            </p>
            <span className="hidden sm:inline text-white/20">·</span>
            <p className="text-[#64748B] text-xs">
              Самозанятый · плательщик НПД · УНП ВЕ89624282
            </p>
          </div>
          <div className="flex flex-wrap gap-5 justify-center">
            <Link href="/oferta" className="text-[#94A3B8] hover:text-white text-sm transition-colors">
              Публичная оферта
            </Link>
            <Link
              href="/politika-konfidencialnosti"
              className="text-[#94A3B8] hover:text-white text-sm transition-colors"
            >
              Политика конфиденциальности
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
