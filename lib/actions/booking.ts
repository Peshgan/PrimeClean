"use server";

import { z } from "zod";

const BookingSchema = z.object({
  name: z.string().min(2, "Введите ваше имя").max(100),
  phone: z
    .string()
    .min(7, "Введите корректный номер телефона")
    .max(20, "Слишком длинный номер"),
  service: z.string().min(1, "Выберите услугу"),
  serviceSlug: z.string().default("unknown"),
  bookingDate: z.string().default("В ближайшее время"),
  bookingTime: z.string().default("Любое время"),
  area: z.string().optional(),
  comment: z.string().max(500).optional(),
  consent: z
    .string()
    .refine((v) => v === "on" || v === "true", "Необходимо согласие на обработку персональных данных"),
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

  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BACKEND_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Backend error ${res.status}: ${errorText}`);
    }

    return {
      success: true,
      message: "Заявка принята! Перезвоним в течение 15 минут.",
    };
  } catch (error) {
    console.error("Ошибка при отправке заявки:", error);
    return {
      success: false,
      message: "Не удалось отправить заявку. Попробуйте позже.",
    };
  }
}
