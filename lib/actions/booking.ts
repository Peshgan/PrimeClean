"use server";

import { z } from "zod";

const BookingSchema = z.object({
  name: z.string().min(2, "Введите ваше имя").max(100),
  phone: z
    .string()
    .min(7, "Введите корректный номер телефона")
    .max(20, "Слишком длинный номер"),
  service: z.string().min(1, "Выберите услугу"),
  area: z.string().optional(),
  comment: z.string().max(500).optional(),
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
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    service: formData.get("service") as string,
    area: formData.get("area") as string | undefined,
    comment: formData.get("comment") as string | undefined,
  };

  const parsed = BookingSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "Пожалуйста, исправьте ошибки в форме",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // В продакшене: отправить email через Resend и сохранить в БД
  // Для демо — симулируем успех
  await new Promise((resolve) => setTimeout(resolve, 800));

  console.log("New booking:", parsed.data);

  return {
    success: true,
    message: "Заявка принята! Перезвоним в течение 15 минут.",
  };
}
