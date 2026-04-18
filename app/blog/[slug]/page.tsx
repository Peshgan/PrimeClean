import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { blogPosts, getPostBySlug } from "@/lib/data/blog";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

const RU_MONTHS: Record<string, string> = {
  "января": "01", "февраля": "02", "марта": "03", "апреля": "04",
  "мая": "05", "июня": "06", "июля": "07", "августа": "08",
  "сентября": "09", "октября": "10", "ноября": "11", "декабря": "12",
};

function toIsoDate(ruDate: string): string {
  const m = ruDate.toLowerCase().match(/(\d{1,2})\s+([а-я]+)\s+(\d{4})/);
  if (!m) return new Date().toISOString().slice(0, 10);
  const day = m[1].padStart(2, "0");
  const month = RU_MONTHS[m[2]] ?? "01";
  return `${m[3]}-${month}-${day}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const iso = toIsoDate(post.date);
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://primeclean.by/blog/${post.slug}`,
      type: "article",
      publishedTime: iso,
      authors: ["PrimeClean"],
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const iso = toIsoDate(post.date);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: iso,
    dateModified: iso,
    author: { "@type": "Organization", name: "PrimeClean", url: "https://primeclean.by" },
    publisher: {
      "@type": "Organization",
      name: "PrimeClean",
      logo: { "@type": "ImageObject", url: "https://primeclean.by/og-image.jpg" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://primeclean.by/blog/${post.slug}` },
    inLanguage: "ru-BY",
    articleSection: post.category,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: "https://primeclean.by/" },
      { "@type": "ListItem", position: 2, name: "Блог", item: "https://primeclean.by/blog/" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://primeclean.by/blog/${post.slug}/` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="pt-28 pb-10 bg-gradient-to-br from-[#F0FDFF] to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Хлебные крошки" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-[#94A3B8]">
              <li><Link href="/" className="hover:text-[#0077B6] transition-colors">Главная</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/blog" className="hover:text-[#0077B6] transition-colors">Блог</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-[#1A2332] font-medium truncate max-w-[200px]">{post.title}</li>
            </ol>
          </nav>

          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-medium text-[#0077B6] bg-[#E0F7FF] px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-xs text-[#94A3B8]">{post.date}</span>
            <span className="text-xs text-[#94A3B8]">· {post.readTime} чтения</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A2332] leading-tight mb-6">
            {post.title}
          </h1>
          <p className="text-lg text-[#475569] leading-relaxed">{post.excerpt}</p>
        </div>
      </section>

      {/* Article body */}
      <section className="py-10 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="prose-article"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* CTA block */}
          <div className="mt-12 bg-gradient-to-br from-[#00B4D8] to-[#0077B6] rounded-3xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">Нужна профессиональная уборка?</h3>
            <p className="text-white/80 mb-6">
              Закажите уборку в PrimeClean — работаем в Минске с гарантией качества
            </p>
            <Link
              href="/#booking"
              className="inline-flex items-center gap-2 bg-white text-[#0077B6] font-bold px-8 py-3 rounded-2xl hover:bg-[#F0FDFF] transition-colors shadow-lg"
            >
              Заказать уборку
            </Link>
          </div>

          {/* Back link */}
          <div className="mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[#0077B6] font-semibold hover:text-[#00B4D8] transition-colors"
            >
              <ArrowLeft size={16} />
              Все статьи блога
            </Link>
          </div>
        </div>
      </section>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="py-16 bg-[#F0FDFF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#1A2332] mb-8">Читайте также</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group bg-white rounded-3xl p-6 border border-[#E2EDF4] hover:border-[#00B4D8]/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-[#0077B6] bg-[#E0F7FF] px-3 py-1 rounded-full">
                      {p.category}
                    </span>
                    <span className="text-xs text-[#94A3B8]">{p.readTime}</span>
                  </div>
                  <h3 className="font-bold text-[#1A2332] mb-2 group-hover:text-[#0077B6] transition-colors leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-sm text-[#475569] line-clamp-2">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
