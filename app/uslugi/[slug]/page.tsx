import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock, ChevronDown } from "lucide-react";
import { services, getServiceBySlug } from "@/lib/data/services";
import BookingForm from "@/components/forms/BookingForm";
import Calculator from "@/components/forms/Calculator";
import StarRating from "@/components/ui/StarRating";
import { reviews } from "@/lib/data/reviews";

export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `/uslugi/${service.slug}` },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url: `https://primeclean.by/uslugi/${service.slug}`,
      type: "website",
      images: [{ url: service.image, width: 800, alt: service.title }],
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const serviceReviews = reviews.filter(
    (r) => r.service.toLowerCase().includes(service.shortTitle.toLowerCase().split(" ")[0])
  ).slice(0, 3);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: "https://primeclean.by/" },
      { "@type": "ListItem", position: 2, name: "Услуги", item: "https://primeclean.by/uslugi/" },
      { "@type": "ListItem", position: 3, name: service.shortTitle, item: `https://primeclean.by/uslugi/${service.slug}/` },
    ],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.shortTitle,
    name: service.title,
    description: service.metaDescription,
    provider: { "@id": "https://primeclean.by/#business" },
    areaServed: { "@type": "City", name: "Минск" },
    url: `https://primeclean.by/uslugi/${service.slug}`,
    image: service.image,
    offers: service.tiers
      .filter((t) => t.price > 0)
      .map((t) => ({
        "@type": "Offer",
        name: t.name,
        price: String(t.price),
        priceCurrency: "BYN",
        availability: "https://schema.org/InStock",
        url: `https://primeclean.by/uslugi/${service.slug}`,
      })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-[#F0FDFF] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Хлебные крошки" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-[#94A3B8]">
              <li><Link href="/" className="hover:text-[#0077B6] transition-colors">Главная</Link></li>
              <li>/</li>
              <li><Link href="/uslugi" className="hover:text-[#0077B6] transition-colors">Услуги</Link></li>
              <li>/</li>
              <li className="text-[#1A2332] font-medium">{service.shortTitle}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="bg-[#E0F7FF] text-[#0077B6] text-sm font-medium px-3 py-1 rounded-full">
                  {service.duration}
                </span>
                <span className="bg-[#DCFCE7] text-[#16A34A] text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle size={12} />
                  Гарантия качества
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-[#1A2332] leading-tight">
                {service.title}
              </h1>
              <p className="text-lg text-[#475569] leading-relaxed">{service.longDescription}</p>
              <div className="flex items-baseline gap-2">
                {service.priceFrom === 0 ? (
                  <span className="text-3xl font-bold text-[#0077B6]">Договорная</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-[#0077B6]">от {service.priceFrom}</span>
                    <span className="text-xl text-[#475569]">BYN</span>
                  </>
                )}
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-xl aspect-[4/3]">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Includes */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1A2332] mb-6">
                Что входит в услугу
              </h2>
              <ul className="space-y-3">
                {service.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-[#00C9A7] flex-shrink-0 mt-0.5" />
                    <span className="text-[#475569]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tiers */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1A2332] mb-6">
                Тарифы
              </h2>
              <div className="space-y-4">
                {service.tiers.map((tier, i) => (
                  <div
                    key={tier.name}
                    className={`rounded-2xl p-5 border-2 ${
                      i === 1
                        ? "border-[#00B4D8] bg-[#F0FDFF]"
                        : "border-[#E2EDF4] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-bold text-[#1A2332]">{tier.name}</span>
                        {i === 1 && (
                          <span className="ml-2 text-xs bg-[#00B4D8] text-white px-2 py-0.5 rounded-full">
                            Популярный
                          </span>
                        )}
                        <div className="text-sm text-[#94A3B8]">{tier.area}</div>
                      </div>
                      <div className="text-right">
                        {tier.price === 0 ? (
                          <span className="text-xl font-bold text-[#0077B6]">Договорная</span>
                        ) : (
                          <>
                            <span className="text-2xl font-bold text-[#0077B6]">{tier.price}</span>
                            <span className="text-sm text-[#94A3B8] ml-1">BYN</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ul className="flex flex-wrap gap-2">
                      {tier.features.map((f) => (
                        <li key={f} className="text-xs bg-white border border-[#E2EDF4] px-2.5 py-1 rounded-full text-[#475569]">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-[#F0FDFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A2332] mb-10 text-center">
            Как это работает
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.process.map((step) => (
              <div key={step.step} className="relative">
                <div className="bg-white rounded-2xl p-5 border border-[#E2EDF4] h-full">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00B4D8] to-[#0077B6] text-white font-bold text-lg flex items-center justify-center mb-3">
                    {step.step}
                  </div>
                  <h3 className="font-bold text-[#1A2332] mb-2">{step.title}</h3>
                  <p className="text-[#475569] text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator + Form */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-bold text-[#1A2332] mb-6">Рассчитать стоимость</h2>
              <Calculator />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1A2332] mb-6">Оставить заявку</h2>
              <div className="bg-[#F0FDFF] rounded-3xl border border-[#E2EDF4] p-6">
                <BookingForm preselectedService={service.slug} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {service.faq.length > 0 && (
        <section className="py-16 bg-[#F0FDFF]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A2332] mb-8 text-center">
              Частые вопросы
            </h2>
            <div className="space-y-3">
              {service.faq.map((item, i) => (
                <details key={i} className="bg-white rounded-2xl border border-[#E2EDF4] group">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-[#1A2332] hover:bg-[#F0FDFF] rounded-2xl transition-colors list-none">
                    {item.question}
                    <ChevronDown size={18} className="text-[#00B4D8] flex-shrink-0 group-open:rotate-180 transition-transform duration-200" />
                  </summary>
                  <div className="px-6 pb-5">
                    <p className="text-[#475569] leading-relaxed">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews mini */}
      {serviceReviews.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#1A2332] mb-8">Отзывы об этой услуге</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {serviceReviews.map((r) => (
                <div key={r.id} className="bg-[#F0FDFF] rounded-2xl p-5 border border-[#E2EDF4]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00B4D8] to-[#0077B6] text-white text-sm font-bold flex items-center justify-center">
                      {r.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-[#1A2332] text-sm">{r.name}</div>
                      <div className="text-xs text-[#94A3B8]">{r.date}</div>
                    </div>
                    <StarRating rating={r.rating} size={12} />
                  </div>
                  <p className="text-[#475569] text-sm leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
