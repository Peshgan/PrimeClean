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
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B4D8] to-[#0077B6] flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 21l1.5-4.5L18 3l3 3L7.5 19.5 3 21z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 6l3 3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-bold text-xl">
                Prime<span className="text-[#00B4D8]">Clean</span>
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
                href="https://t.me/primeclean_bybot/website"
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
                  <Phone size={15} className="mt-0.5 flex-shrink-0 text-[#00B4D8]" />
                  +375 (44) 478-93-60
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@primeclean.by"
                  className="flex items-start gap-3 text-[#94A3B8] hover:text-white text-sm transition-colors cursor-pointer"
                >
                  <Mail size={15} className="mt-0.5 flex-shrink-0 text-[#00B4D8]" />
                  info@primeclean.by
                </a>
              </li>
              <li className="flex items-start gap-3 text-[#94A3B8] text-sm">
                <MapPin size={15} className="mt-0.5 flex-shrink-0 text-[#00B4D8]" />
                г. Минск, ул. Немига, 5
              </li>
              <li className="flex items-start gap-3 text-[#94A3B8] text-sm">
                <Clock size={15} className="mt-0.5 flex-shrink-0 text-[#00B4D8]" />
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
          <p className="text-[#94A3B8] text-sm">
            © {new Date().getFullYear()} PrimeClean. Все права защищены.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-[#94A3B8] hover:text-white text-sm transition-colors">
              Политика конфиденциальности
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
