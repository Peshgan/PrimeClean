import StarRating from "@/components/ui/StarRating";
import { reviews } from "@/lib/data/reviews";

export default function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-white" id="reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-[#00B4D8] font-semibold text-sm uppercase tracking-wider mb-3">
            Отзывы клиентов
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4">
            Что говорят наши клиенты
          </h2>
          <p className="text-[#475569] text-lg">
            Более 127 отзывов на Google. Средняя оценка — 4.9 из 5
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-[#F0FDFF] rounded-3xl p-6 border border-[#E2EDF4] flex flex-col"
            >
              <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00B4D8] to-[#0077B6] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
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

              <p className="text-[#475569] text-sm leading-relaxed flex-1">
                {review.text}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="/otzyvy"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#00B4D8] text-[#0077B6] rounded-2xl font-semibold hover:bg-[#F0FDFF] transition-colors cursor-pointer"
          >
            Все отзывы
          </a>
        </div>
      </div>
    </section>
  );
}
