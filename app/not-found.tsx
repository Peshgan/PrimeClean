import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0FDFF] to-white pt-20">
      <div className="max-w-lg w-full mx-auto px-4 text-center">
        <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00B4D8] to-[#0077B6] mb-4">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A2332] mb-4">
          Страница не найдена
        </h1>
        <p className="text-[#475569] mb-8">
          Похоже, эта страница не существует или была перемещена.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#00C9A7] text-white font-semibold px-6 py-3.5 rounded-2xl hover:bg-[#00A887] transition-colors"
          >
            На главную
          </Link>
          <Link
            href="/uslugi"
            className="inline-flex items-center justify-center gap-2 border-2 border-[#00B4D8] text-[#0077B6] font-semibold px-6 py-3.5 rounded-2xl hover:bg-[#F0FDFF] transition-colors"
          >
            Услуги <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
