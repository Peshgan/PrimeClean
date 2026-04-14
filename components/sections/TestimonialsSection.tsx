"use client";

import StarRating from "@/components/ui/StarRating";
import { reviews } from "@/lib/data/reviews";
import { useState } from "react";

// Split reviews into 3 columns for masonry layout
function splitIntoColumns<T>(arr: T[], cols: number): T[][] {
  const columns: T[][] = Array.from({ length: cols }, () => []);
  arr.forEach((item, i) => columns[i % cols].push(item));
  return columns;
}

function ReviewCard({ review }: { review: (typeof reviews)[0] }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E2EDF4] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 mb-4 break-inside-avoid">
      {/* Stars at top */}
      <div className="mb-3">
        <StarRating rating={review.rating} size={14} />
      </div>

      <p className="text-[#475569] text-sm leading-relaxed mb-4">{review.text}</p>

      <div className="flex items-center gap-3 pt-3 border-t border-[#F0FDFF]">
        <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#00B4D8] to-[#0077B6] flex items-center justify-center text-white font-bold text-xs shrink-0">
          {review.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[#1A2332] text-sm">{review.name}</div>
          <div className="text-xs text-[#94A3B8]">{review.date}</div>
        </div>
        <span className="text-xs font-medium text-[#0077B6] bg-[#E0F7FF] px-2 py-0.5 rounded-full whitespace-nowrap">
          {review.service}
        </span>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [showAll, setShowAll] = useState(false);

  const visibleReviews = showAll ? reviews : reviews.slice(0, 6);

  // 3 columns on desktop, 2 on tablet, 1 on mobile
  const cols3 = splitIntoColumns(visibleReviews, 3);
  const cols2 = splitIntoColumns(visibleReviews, 2);

  return (
    <section className="py-20 lg:py-28 bg-[#F0FDFF]" id="reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-[#00B4D8] font-semibold text-sm uppercase tracking-wider mb-3">
            Отзывы клиентов
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4">
            Что говорят наши клиенты
          </h2>
          <div className="flex items-center justify-center gap-6 text-sm text-[#475569]">
            <span className="flex items-center gap-1.5">
              <span className="text-2xl font-bold text-[#1A2332]">4.9</span>
              <span>/ 5 средняя оценка</span>
            </span>
            <span className="w-px h-5 bg-[#E2EDF4]" />
            <span>127+ отзывов на Google</span>
          </div>
        </div>

        {/* Masonry: 3 columns desktop */}
        <div className="hidden lg:flex gap-4">
          {cols3.map((col, colIdx) => (
            <div key={colIdx} className="flex-1 flex flex-col">
              {col.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ))}
        </div>

        {/* Masonry: 2 columns tablet */}
        <div className="hidden sm:flex lg:hidden gap-4">
          {cols2.map((col, colIdx) => (
            <div key={colIdx} className="flex-1 flex flex-col">
              {col.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ))}
        </div>

        {/* Single column mobile */}
        <div className="flex sm:hidden flex-col gap-4">
          {visibleReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Actions */}
        <div className="text-center mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {!showAll && reviews.length > 6 && (
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#00B4D8] text-white rounded-2xl font-semibold hover:bg-[#0077B6] transition-colors shadow-sm"
            >
              Показать все {reviews.length} отзыва
            </button>
          )}
          <a
            href="/otzyvy"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#00B4D8] text-[#0077B6] rounded-2xl font-semibold hover:bg-white transition-colors"
          >
            Все отзывы на сайте
          </a>
        </div>
      </div>
    </section>
  );
}
