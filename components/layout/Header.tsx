"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, ChevronDown } from "lucide-react";

const navLinks = [
  {
    label: "Услуги",
    href: "/uslugi",
    dropdown: [
      { label: "Уборка квартир", href: "/uslugi/uborka-kvartir-minsk" },
      { label: "Клининг офисов", href: "/uslugi/klining-ofisov-minsk" },
      { label: "Генеральная уборка", href: "/uslugi/generalnaya-uborka-minsk" },
      { label: "После ремонта", href: "/uslugi/uborka-posle-remonta-minsk" },
      { label: "Уборка домов", href: "/uslugi/uborka-domov-minsk" },
    ],
  },
  { label: "Цены", href: "/tseny" },
  { label: "О нас", href: "/o-nas" },
  { label: "Отзывы", href: "/otzyvy" },
  { label: "Контакты", href: "/kontakty" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E2EDF4]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B4D8] to-[#0077B6] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 21l1.5-4.5L18 3l3 3L7.5 19.5 3 21z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 6l3 3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-bold text-xl text-[#1A2332]">
                Prime<span className="text-[#00B4D8]">Clean</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Основная навигация">
              {navLinks.map((link) =>
                link.dropdown ? (
                  <div key={link.href} className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl text-[#475569] hover:text-[#0077B6] hover:bg-[#F0FDFF] transition-colors duration-200 font-medium text-sm cursor-pointer"
                      aria-expanded={dropdownOpen}
                      aria-haspopup="true"
                    >
                      {link.label}
                      <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E2EDF4] py-2 z-50">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block px-4 py-2.5 text-sm text-[#475569] hover:text-[#0077B6] hover:bg-[#F0FDFF] transition-colors duration-150"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                      pathname === link.href
                        ? "text-[#0077B6] bg-[#F0FDFF]"
                        : "text-[#475569] hover:text-[#0077B6] hover:bg-[#F0FDFF]"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="tel:+375291234567"
                className="flex items-center gap-2 text-sm font-medium text-[#475569] hover:text-[#0077B6] transition-colors cursor-pointer"
              >
                <Phone size={15} />
                +375 (29) 123-45-67
              </a>
              <Link
                href="#booking"
                className="inline-flex items-center justify-center font-semibold rounded-2xl transition-colors duration-200 cursor-pointer bg-[#00C9A7] text-white hover:bg-[#00A887] shadow-lg shadow-[#00C9A7]/25 px-4 py-2 text-sm"
              >
                Заказать уборку
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl text-[#475569] hover:bg-[#F0FDFF] transition-colors cursor-pointer"
              aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Мобильная навигация"
      >
        <div className="flex items-center justify-between p-4 border-b border-[#E2EDF4]">
          <span className="font-bold text-lg text-[#1A2332]">
            Prime<span className="text-[#00B4D8]">Clean</span>
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl text-[#475569] hover:bg-[#F0FDFF] cursor-pointer"
            aria-label="Закрыть меню"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto" aria-label="Мобильная навигация">
          {navLinks.map((link) =>
            link.dropdown ? (
              <div key={link.href}>
                <p className="px-3 py-2 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                  {link.label}
                </p>
                {link.dropdown.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-2.5 text-sm text-[#475569] hover:text-[#0077B6] hover:bg-[#F0FDFF] rounded-xl transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-[#0077B6] bg-[#F0FDFF]"
                    : "text-[#475569] hover:text-[#0077B6] hover:bg-[#F0FDFF]"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#E2EDF4] space-y-3">
          <a
            href="tel:+375291234567"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#F0FDFF] text-[#0077B6] font-semibold text-sm hover:bg-[#E0F7FF] transition-colors cursor-pointer"
          >
            <Phone size={16} />
            +375 (29) 123-45-67
          </a>
          <Link
            href="#booking"
            className="flex items-center justify-center w-full py-3.5 rounded-2xl bg-[#00C9A7] text-white font-semibold text-sm hover:bg-[#00A887] transition-colors"
          >
            Заказать уборку
          </Link>
        </div>
      </div>
    </>
  );
}
