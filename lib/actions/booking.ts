"use server";

import { z } from "zod";

const BookingSchema = z.object({
  name: z.string().min(2, "Введите ваше имя").max(100),
  phone: z.string().min(7, "Введите корректный номер телефона").max(20),
  service: z.string().min(1, "Выберите услугу"),
  serviceSlug: z.string().default("unknown"),
  bookingDate: z.string().default("В ближайшее время"),
  bookingTime: z.string().default("Любое время"),
  area: z.string().optional(),
  comment: z.string().max(500).optional(),
  consent: z.string().refine((v) => v === "on" || v === "true", "Необходимо согласие на обработку персональных данных"),
});

export type BookingFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function createBooking(
  prevState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const raw = {
    name: formData.get("name")?.toString() || "",
    phone: formData.get("phone")?.toString() || "",
    service: formData.get("service")?.toString() || "",
    serviceSlug: formData.get("serviceSlug")?.toString() || formData.get("service")?.toString() || "unknown",
    bookingDate: formData.get("bookingDate")?.toString() || "В ближайшее время",
    bookingTime: formData.get("bookingTime")?.toString() || "Любое время",
    area: formData.get("area")?.toString() || undefined,
    comment: formData.get("comment")?.toString() || undefined,
    consent: formData.get("consent")?.toString() || "",
  };

  const parsed = BookingSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Пожалуйста, исправьте ошибки в форме",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const d = parsed.data;
  const backendUrl = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://primeclean-production.up.railway.app";

  try {
    const res = await fetch(`${backendUrl}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: d.name,
        phone: d.phone,
        serviceSlug: d.serviceSlug,
        serviceName: d.service,
        bookingDate: d.bookingDate,
        bookingTime: d.bookingTime,
        area: d.area ? Number(d.area) : undefined,
        comment: d.comment,
        source: "website",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[createBooking] backend error:", res.status, err);
      return { success: false, message: "Ошибка сервера. Попробуйте позже." };
    }

    return { success: true, message: "Заявка принята! Перезвоним в течение 15 минут." };
  } catch (error) {
    console.error("[createBooking] fetch error:", error);
    return { success: false, message: "Не удалось отправить заявку. Попробуйте позже." };
  }
}
