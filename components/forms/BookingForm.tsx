"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { createBooking, type BookingFormState } from "@/lib/actions/booking";

const services = [
  { value: "uborka-kvartir", label: "Уборка квартиры" },
  { value: "klining-ofisov", label: "Клининг офиса" },
  { value: "generalnaya-uborka", label: "Генеральная уборка" },
  { value: "uborka-posle-remonta", label: "Уборка после ремонта" },
  { value: "uborka-doma", label: "Уборка дома" },
  { value: "khimchistka", label: "Химчистка" },
  { value: "specializirovannaya-uborka", label: "Спец. уборка" },
];

const initialState: BookingFormState = { success: false, message: "" };

interface BookingFormProps {
  preselectedService?: string;
  compact?: boolean;
}

export default function BookingForm({ preselectedService, compact = false }: BookingFormProps) {
  const [state, formAction, isPending] = useActionState(createBooking, initialState);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setTimeout(() => router.push("/spasibo"), 1500);
    }
  }, [state.success, router]);

  const inputClass =
    "w-full border border-[#E2EDF4] rounded-xl px-4 py-3 text-base text-[#1A2332] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent transition-all duration-200 bg-white";

  const errorClass = "mt-1 text-sm text-[#EF4444] flex items-center gap-1";

  return (
    <form ref={formRef} action={formAction} noValidate>
      <div className={`grid ${compact ? "grid-cols-1 gap-3" : "grid-cols-1 sm:grid-cols-2 gap-4"}`}>
        {/* Name */}
        <div>
          <label htmlFor="booking-name" className="block text-sm font-medium text-[#475569] mb-1.5">
            Ваше имя <span className="text-[#EF4444]">*</span>
          </label>
          <input
            id="booking-name"
            name="name"
            type="text"
            placeholder="Иван Иванов"
            autoComplete="name"
            required
            className={inputClass}
          />
          {state.errors?.name && (
            <p className={errorClass}>
              <AlertCircle size={13} />
              {state.errors?.name?.[0]}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="booking-phone" className="block text-sm font-medium text-[#475569] mb-1.5">
            Телефон <span className="text-[#EF4444]">*</span>
          </label>
          <input
            id="booking-phone"
            name="phone"
            type="tel"
            placeholder="+375 (29) 123-45-67"
            autoComplete="tel"
            required
            className={inputClass}
          />
          {state.errors?.phone && (
            <p className={errorClass}>
              <AlertCircle size={13} />
              {state.errors?.phone?.[0]}
            </p>
          )}
        </div>

        {/* Service */}
        <div className={compact ? "" : "sm:col-span-2"}>
          <label htmlFor="booking-service" className="block text-sm font-medium text-[#475569] mb-1.5">
            Услуга <span className="text-[#EF4444]">*</span>
          </label>
          <select
            id="booking-service"
            name="service"
            required
            defaultValue={preselectedService || ""}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="" disabled>Выберите услугу</option>
            {services.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {state.errors?.service && (
            <p className={errorClass}>
              <AlertCircle size={13} />
              {state.errors?.service?.[0]}
            </p>
          )}
        </div>

        {/* Comment */}
        {!compact && (
          <div className="sm:col-span-2">
            <label htmlFor="booking-comment" className="block text-sm font-medium text-[#475569] mb-1.5">
              Комментарий
            </label>
            <textarea
              id="booking-comment"
              name="comment"
              rows={3}
              placeholder="Площадь помещения, удобное время, пожелания..."
              className={`${inputClass} resize-none`}
            />
          </div>
        )}
      </div>

      {/* Status */}
      {state.message && (
        <div
          className={`mt-4 p-3 rounded-xl flex items-start gap-2 text-sm ${
            state.success
              ? "bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]"
              : "bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]"
          }`}
          role="alert"
        >
          {state.success ? <CheckCircle size={16} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />}
          {state.message}
        </div>
      )}

      <Button
        type="submit"
        loading={isPending}
        className="mt-4 w-full"
        size="lg"
      >
        {isPending ? "Отправляем..." : "Оставить заявку"}
      </Button>

      <p className="mt-3 text-center text-xs text-[#94A3B8]">
        Перезвоним в течение 15 минут в рабочее время
      </p>
    </form>
  );
}
