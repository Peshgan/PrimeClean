"use server";

import { z } from "zod";
import { getDb } from "@/lib/db";

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

async function notifyAdmin(id: number, d: z.infer<typeof BookingSchema>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chat) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chat,
      parse_mode: "HTML",
      text: `📋 <b>Новая заявка #${id}</b> (сайт)\n\n👤 ${d.name} | <code>${d.phone}</code>\n🧹 ${d.service}\n📅 ${d.bookingDate} в ${d.bookingTime}${d.area ? `\n📐 ${d.area} м²` : ""}${d.comment ? `\n💬 ${d.comment}` : ""}\n🔌 website`,
    }),
  }).catch(() => {});
}

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
    const d = parsed.data;
    const sql = await getDb();
    const [row] = await sql`
      INSERT INTO bookings (name, phone, service_slug, service_name, booking_date, booking_time, area, comment, source)
      VALUES (
        ${d.name}, ${d.phone}, ${d.serviceSlug}, ${d.service},
        ${d.bookingDate}, ${d.bookingTime},
        ${d.area ? Number(d.area) : null}, ${d.comment ?? null}, 'website'
      )
      RETURNING id
    `;
    await notifyAdmin(row.id, d);
    return { success: true, message: "Заявка принята! Перезвоним в течение 15 минут." };
  } catch (error) {
    console.error("Ошибка при отправке заявки:", error);
    return { success: false, message: "Не удалось отправить заявку. Попробуйте позже." };
  }
}
