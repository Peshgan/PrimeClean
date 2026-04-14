import type { Metadata } from "next";
import Link from "next/link";
import StarRating from "@/components/ui/StarRating";
import { reviews } from "@/lib/data/reviews";
import { Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Отзывы о клининговой компании PrimeClean — Минск",
  description:
    "Реальные отзывы клиентов PrimeClean. Средняя оценка 4.9 из 5 по 127 отзывам. Уборка квартир и офисов в Минске — читайте, что говорят наши клиенты.",
};

const reviewsSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "PrimeClean",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "127",
    bestRating: "5",
    worstRating: "1",
  },
  review: reviews.map((r) => ({
    "@type": "Review",
    reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    author: { "@type": "Person", name: r.name },
    datePublished: r.date,
    reviewBody: r.text,
  })),
};

export default function ReviewsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsSchema) }} />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-[#F0FDFF] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Хлебные крошки" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-[#94A3B8]">
              <li><Link href="/" className="hover:text-[#0077B6] transition-colors">Главная</Link></li>
              <li>/</li>
              <li className="text-[#1A2332] font-medium">Отзывы</li>
            </ol>
          </nav>
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#1A2332] mb-4">
              Отзывы клиентов
            </h1>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} size={24} className="fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>
              <span className="text-3xl font-bold text-[#1A2332]">4.9</span>
              <span className="text-[#94A3B8]">из 5 — 127 отзывов</span>
            </div>
            <p className="text-[#475569]">
              Реальные отзывы наших клиентов — без редактирования и накрутки
            </p>
          </div>
        </div>
      </section>

      {/* Reviews grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-[#F0FDFF] rounded-3xl p-6 border border-[#E2EDF4] flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00B4D8] to-[#0077B6] text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {review.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#1A2332] text-sm">{review.name}</div>
                    <div className="text-xs text-[#94A3B8]">{review.date}</div>
                  </div>
                  <StarRating rating={review.rating} size={13} />
                </div>
                <span className="inline-block text-xs font-medium text-[#0077B6] bg-[#E0F7FF] px-2.5 py-1 rounded-full mb-3 self-start">
                  {review.service}
                </span>
                <p className="text-[#475569] text-sm leading-relaxed flex-1">{review.text}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-14 text-center bg-[#F0FDFF] rounded-3xl p-8 border border-[#E2EDF4]">
            <h2 className="text-2xl font-bold text-[#1A2332] mb-3">Хотите стать следующим довольным клиентом?</h2>
            <p className="text-[#475569] mb-6">Закажите уборку и убедитесь в качестве сами</p>
            <Link
              href="/#booking"
              className="inline-block bg-[#00C9A7] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#00A887] transition-colors cursor-pointer"
            >
              Заказать уборку
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
