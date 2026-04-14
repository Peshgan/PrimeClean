import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { blogPosts } from "@/lib/data/blog";

export const metadata: Metadata = {
  title: "Блог о клининге — полезные статьи | PrimeClean",
  description:
    "Полезные статьи о профессиональной уборке, клининге, выборе средств и лайфхаки для поддержания чистоты в доме и офисе в Минске.",
};

export default function BlogPage() {
  return (
    <>
      <section className="pt-28 pb-16 bg-gradient-to-br from-[#F0FDFF] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Хлебные крошки" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-[#94A3B8]">
              <li><Link href="/" className="hover:text-[#0077B6] transition-colors">Главная</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-[#1A2332] font-medium">Блог</li>
            </ol>
          </nav>
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#1A2332] mb-4">
              Блог о клининге
            </h1>
            <p className="text-xl text-[#475569]">
              Полезные советы, инструкции и лайфхаки для поддержания чистоты
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-[#F0FDFF] rounded-3xl p-6 border border-[#E2EDF4] hover:border-[#00B4D8]/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-[#0077B6] bg-[#E0F7FF] px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-[#94A3B8]">{post.readTime}</span>
                </div>
                <h2 className="font-bold text-[#1A2332] text-lg mb-2 group-hover:text-[#0077B6] transition-colors leading-snug">
                  {post.title}
                </h2>
                <p className="text-[#475569] text-sm leading-relaxed mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">{post.date}</span>
                  <span className="flex items-center gap-1 text-[#00B4D8] text-sm font-medium group-hover:gap-2 transition-all">
                    Читать <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
