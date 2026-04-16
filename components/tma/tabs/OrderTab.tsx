"use client";

import { useState, useCallback, useEffect } from "react";
import type { TelegramUser } from "@/types/telegram";
import { services } from "@/lib/data/services";
import AddressPicker from "@/components/tma/AddressPicker";

interface OrderTabProps {
  user: TelegramUser | null;
  preselectedService: string;
  onServiceChange: (slug: string) => void;
}

type Step = "calc" | "form" | "success";
type ServiceType = "standard" | "general" | "after-repair" | "office" | "dry-cleaning" | "specialized";
type ContactPreference = "callback" | "chat" | "";

const SERVICE_TYPES = [
  { value: "standard" as ServiceType, label: "Стандартная уборка", basePrice: 1.8 },
  { value: "general" as ServiceType, label: "Генеральная уборка", basePrice: 2.8 },
  { value: "after-repair" as ServiceType, label: "После ремонта", basePrice: 3.5 },
  { value: "office" as ServiceType, label: "Уборка офиса", basePrice: 1.5 },
  { value: "dry-cleaning" as ServiceType, label: "Химчистка", basePrice: 7 },
  { value: "specialized" as ServiceType, label: "Спец. уборка", basePrice: 0 },
];

// Extras that support quantity > 1
const EXTRAS_CLEANING: { value: string; label: string; price: number; hasQty?: boolean }[] = [
  { value: "windows", label: "Мойка окон", price: 18, hasQty: true },
  { value: "fridge", label: "Холодильник изнутри", price: 23 },
  { value: "oven", label: "Духовка", price: 18 },
  { value: "balcony", label: "Балкон", price: 30, hasQty: true },
  { value: "ironing", label: "Глажка (1 ч)", price: 27 },
];

const EXTRAS_DRY: { value: string; label: string; price: number; hasQty?: boolean }[] = [
  { value: "sofa2", label: "Диван 2-местный", price: 75, hasQty: true },
  { value: "sofa3", label: "Диван 3-местный", price: 95, hasQty: true },
  { value: "sofa_corner", label: "Угловой диван", price: 120, hasQty: true },
  { value: "mat1_1", label: "Матрас 1-сп (1 ст.)", price: 60, hasQty: true },
  { value: "mat2_1", label: "Матрас 2-сп (1 ст.)", price: 90, hasQty: true },
  { value: "chair", label: "Кресло", price: 45, hasQty: true },
  { value: "stool", label: "Стул", price: 18, hasQty: true },
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

type ExtrasMap = Record<string, number>;

function calcPrice(service: ServiceType, area: number, extras: ExtrasMap): number {
  if (service === "specialized") return 0;
  const svc = SERVICE_TYPES.find((s) => s.value === service)!;
  const base = Math.max(svc.basePrice * area, service === "dry-cleaning" ? 0 : 69);
  const list = service === "dry-cleaning" ? EXTRAS_DRY : EXTRAS_CLEANING;
  const extrasTotal = list.reduce((sum, e) => {
    const qty = extras[e.value] ?? 0;
    return sum + e.price * qty;
  }, 0);
  return Math.round(base + extrasTotal);
}

function slugToServiceType(slug: string): ServiceType {
  if (slug.includes("generalnaya")) return "general";
  if (slug.includes("remont")) return "after-repair";
  if (slug.includes("ofis")) return "office";
  if (slug.includes("khim")) return "dry-cleaning";
  if (slug.includes("specializirovannaya") || slug.includes("spets") || slug.includes("spet")) return "specialized";
  return "standard";
}

// Quantity stepper for extras
function QtyStepper({
  qty,
  onChange,
  label,
  price,
}: {
  qty: number;
  onChange: (n: number) => void;
  label: string;
  price: number;
}) {
  const active = qty > 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: active ? "#ECFDF5" : "white",
        border: `1.5px solid ${active ? "#00C9A7" : "#E2EDF4"}`,
        borderRadius: 10,
        padding: "7px 10px",
        gap: 8,
        transition: "all 0.15s",
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: active ? 600 : 400,
          color: active ? "#00875A" : "#475569",
          flex: 1,
        }}
      >
        {label} +{price} BYN
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {active && (
          <>
            <button
              onClick={() => onChange(Math.max(0, qty - 1))}
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                border: "1.5px solid #00C9A7",
                background: "white",
                color: "#00875A",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              −
            </button>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#00875A", minWidth: 16, textAlign: "center" }}>
              {qty}
            </span>
          </>
        )}
        <button
          onClick={() => onChange(qty + 1)}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            border: "1.5px solid #00B4D8",
            background: active ? "#00B4D8" : "white",
            color: active ? "white" : "#00B4D8",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

// Simple toggle for extras without qty
function ExtraToggle({
  active,
  onToggle,
  label,
  price,
}: {
  active: boolean;
  onToggle: () => void;
  label: string;
  price: number;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        background: active ? "#ECFDF5" : "white",
        border: `1.5px solid ${active ? "#00C9A7" : "#E2EDF4"}`,
        borderRadius: 10,
        padding: "7px 12px",
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        color: active ? "#00875A" : "#475569",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {label} +{price} BYN
    </button>
  );
}

export default function OrderTab({ user, preselectedService, onServiceChange }: OrderTabProps) {
  const [step, setStep] = useState<Step>("calc");

  // Calculator state
  const [serviceType, setServiceType] = useState<ServiceType>(
    preselectedService ? slugToServiceType(preselectedService) : "standard"
  );
  const [area, setArea] = useState(50);
  const [extrasMap, setExtrasMap] = useState<ExtrasMap>({});

  // Form state
  const [name, setName] = useState(user?.first_name ?? "");
  const [phone, setPhone] = useState("");
  const [contactPreference, setContactPreference] = useState<ContactPreference>("");
  const [serviceSlug, setServiceSlug] = useState(preselectedService || "uborka-kvartir-minsk");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [phoneRequested, setPhoneRequested] = useState(false);

  const price = calcPrice(serviceType, area, extrasMap);

  // Telegram fires "contactRequested" event after user approves requestContact()
  // eventData: { status: 'sent'|'cancelled', contact?: { phone_number, first_name, ... } }
  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any)?.Telegram?.WebApp;
    if (!tg?.onEvent) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (eventData: any) => {
      if (eventData?.status !== "sent") return;
      const rawPhone: string | undefined =
        eventData?.contact?.phone_number ??   // standard path
        eventData?.phone_number;              // fallback
      if (rawPhone) {
        const formatted = rawPhone.startsWith("+") ? rawPhone : `+${rawPhone}`;
        setPhone(formatted);
        setPhoneRequested(true);
      }
    };

    tg.onEvent("contactRequested", handler);
    return () => tg.offEvent?.("contactRequested", handler);
  }, []);

  const requestContact = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any)?.Telegram?.WebApp;
    if (!tg) return;

    if (typeof tg.requestContact === "function") {
      // Bot API 6.9+ — opens native share-contact dialog.
      // The callback receives (sent: boolean, data?: { contact: { phone_number, ... } })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tg.requestContact((sent: boolean, data?: any) => {
        if (!sent) return;
        // Try callback data first (most reliable path)
        const rawPhone: string | undefined =
          data?.contact?.phone_number ??
          data?.phone_number;
        if (rawPhone) {
          setPhone(rawPhone.startsWith("+") ? rawPhone : `+${rawPhone}`);
          setPhoneRequested(true);
        }
        // If no data in callback, the "contactRequested" useEffect will catch it
      });
    }
  };

  const setExtraQty = useCallback((key: string, qty: number) => {
    setExtrasMap((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[key];
      } else {
        next[key] = qty;
      }
      return next;
    });
  }, []);

  const toggleExtra = useCallback((key: string) => {
    setExtrasMap((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = 1;
      }
      return next;
    });
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("Введите имя и номер телефона");
      return;
    }
    if (!bookingDate) {
      setError("Выберите дату");
      return;
    }
    if (!bookingTime) {
      setError("Выберите время");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const svc = services.find((s) => s.slug === serviceSlug);

      // Get TG user info
      const tgUser = user;
      const tgUsername = tgUser?.username ?? undefined;
      const tgUserId = tgUser?.id ? String(tgUser.id) : undefined;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          serviceSlug,
          serviceName: svc?.shortTitle ?? serviceSlug,
          bookingDate,
          bookingTime,
          address: address.trim() || undefined,
          area,
          extras: extrasMap,
          priceEstimate: price > 0 ? price : undefined,
          comment: comment.trim() || undefined,
          userTelegramId: tgUserId,
          tgUsername,
          tgUserId,
          contactPreference: contactPreference || "callback",
          source: "telegram",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка");
      setStep("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка при отправке");
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const extrasListForType = serviceType === "dry-cleaning" ? EXTRAS_DRY : EXTRAS_CLEANING;

  // --- Success screen ---
  if (step === "success") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          padding: "24px 24px",
          textAlign: "center",
          animation: "fadeUp 0.4s ease",
        }}
      >
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes tabIn {
            from { opacity: 0; transform: translateX(12px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
        <div style={{ fontSize: 72, marginBottom: 20 }}>✅</div>
        <h2
          style={{
            color: "#1A2332",
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 12,
            fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
          }}
        >
          Заявка принята!
        </h2>
        <p style={{ color: "#475569", fontSize: 16, lineHeight: 1.6, marginBottom: 8 }}>
          Мы свяжемся с вами в течение 15 минут в рабочее время, чтобы подтвердить заказ.
        </p>
        <p style={{ color: "#94A3B8", fontSize: 13, marginBottom: 32 }}>
          Способ связи: {contactPreference === "chat" ? "💬 Чат в Telegram" : "📞 Звонок"}
        </p>
        <button
          onClick={() => {
            setStep("calc");
            setBookingDate("");
            setBookingTime("");
            setComment("");
            setAddress("");
            setExtrasMap({});
            setContactPreference("");
          }}
          style={{
            background: "linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)",
            color: "white",
            border: "none",
            borderRadius: 16,
            fontSize: 16,
            fontWeight: 700,
            padding: "15px 32px",
            cursor: "pointer",
            width: "100%",
            maxWidth: 300,
          }}
        >
          Новый заказ
        </button>
      </div>
    );
  }

  return (
    <div style={{ animation: "tabIn 0.3s ease" }}>
      <style>{`
        @keyframes tabIn {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* Header */}
      <div
        style={{
          padding: "20px 16px 0",
          background: "white",
          borderBottom: "1px solid #E2EDF4",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <h1
          style={{
            color: "#1A2332",
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)",
            marginBottom: 12,
          }}
        >
          Заказать уборку
        </h1>

        {/* Step tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #E2EDF4" }}>
          {(["calc", "form"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                borderBottom: step === s ? "2px solid #00B4D8" : "2px solid transparent",
                marginBottom: "-2px",
                padding: "10px 0",
                fontSize: 14,
                fontWeight: step === s ? 700 : 500,
                color: step === s ? "#0077B6" : "#94A3B8",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {s === "calc" ? "🧮 Калькулятор" : "📝 Форма заказа"}
            </button>
          ))}
        </div>
      </div>

      {/* CALCULATOR */}
      {step === "calc" && (
        <div style={{ padding: "16px 16px 24px" }}>
          {/* Service type */}
          <label style={labelStyle}>Тип услуги</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {SERVICE_TYPES.map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  setServiceType(s.value);
                  setExtrasMap({});
                  if (s.value === "dry-cleaning") setArea(0);
                  else if (area === 0) setArea(50);
                }}
                style={{
                  background: serviceType === s.value ? "#EFF9FF" : "white",
                  border: `2px solid ${serviceType === s.value ? "#00B4D8" : "#E2EDF4"}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  color: serviceType === s.value ? "#0077B6" : "#475569",
                  fontWeight: serviceType === s.value ? 600 : 400,
                  fontSize: 14,
                  transition: "all 0.15s",
                }}
              >
                {s.label}
                {s.basePrice > 0 && (
                  <span style={{ float: "right", color: "#94A3B8", fontSize: 12, fontWeight: 400 }}>
                    {s.basePrice} BYN/м²
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Area slider */}
          {serviceType !== "specialized" && (
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>
                {serviceType === "dry-cleaning" ? "Площадь ковров" : "Площадь помещения"}:{" "}
                <span style={{ color: "#0077B6", fontWeight: 700 }}>{area} м²</span>
              </label>
              <input
                type="range"
                min={serviceType === "dry-cleaning" ? 0 : 20}
                max={300}
                step={5}
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#00B4D8" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", color: "#94A3B8", fontSize: 11 }}>
                <span>{serviceType === "dry-cleaning" ? "0" : "20"} м²</span>
                <span>300 м²</span>
              </div>
            </div>
          )}

          {/* Extras with quantity */}
          {serviceType !== "specialized" && (
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>
                {serviceType === "dry-cleaning" ? "Предметы" : "Дополнительно"}
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {extrasListForType.map((e) =>
                  e.hasQty ? (
                    <QtyStepper
                      key={e.value}
                      qty={extrasMap[e.value] ?? 0}
                      onChange={(n) => setExtraQty(e.value, n)}
                      label={e.label}
                      price={e.price}
                    />
                  ) : (
                    <ExtraToggle
                      key={e.value}
                      active={(extrasMap[e.value] ?? 0) > 0}
                      onToggle={() => toggleExtra(e.value)}
                      label={e.label}
                      price={e.price}
                    />
                  )
                )}
              </div>
            </div>
          )}

          {/* Price result */}
          <div
            style={{
              background: "linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)",
              borderRadius: 16,
              padding: "20px",
              marginBottom: 16,
              color: "white",
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Примерная стоимость</div>
            {serviceType === "specialized" ? (
              <div style={{ fontSize: 28, fontWeight: 700 }}>Договорная</div>
            ) : (
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 40, fontWeight: 700, fontFamily: "var(--font-montserrat, 'Montserrat', sans-serif)" }}>
                  {price}
                </span>
                <span style={{ fontSize: 18, opacity: 0.85 }}>BYN</span>
              </div>
            )}
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>Точная цена — после осмотра</div>
          </div>

          <button
            onClick={() => setStep("form")}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #00C9A7 0%, #00875A 100%)",
              color: "white",
              border: "none",
              borderRadius: 16,
              fontSize: 16,
              fontWeight: 700,
              padding: "15px",
              cursor: "pointer",
            }}
          >
            Оформить заказ →
          </button>
        </div>
      )}

      {/* BOOKING FORM */}
      {step === "form" && (
        <div style={{ padding: "16px 16px 24px" }}>
          {/* Service select */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Услуга</label>
            <select
              value={serviceSlug}
              onChange={(e) => {
                setServiceSlug(e.target.value);
                onServiceChange(e.target.value);
              }}
              style={inputStyle}
            >
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.shortTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Ваше имя *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Иванов"
              style={inputStyle}
            />
          </div>

          {/* Phone with Telegram request_contact */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Телефон *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+375 (44) 478-93-60"
                style={{ ...inputStyle, flex: 1 }}
              />
              {!phoneRequested && (
                <button
                  onClick={requestContact}
                  title="Поделиться номером из Telegram"
                  style={{
                    background: "#EFF9FF",
                    border: "1.5px solid #00B4D8",
                    borderRadius: 12,
                    padding: "0 12px",
                    cursor: "pointer",
                    flexShrink: 0,
                    fontSize: 18,
                    color: "#0077B6",
                  }}
                >
                  📲
                </button>
              )}
              {phoneRequested && (
                <div
                  style={{
                    background: "#ECFDF5",
                    border: "1.5px solid #00C9A7",
                    borderRadius: 12,
                    padding: "0 12px",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                    fontSize: 14,
                    color: "#00875A",
                    fontWeight: 600,
                  }}
                >
                  ✓
                </div>
              )}
            </div>
            <p style={{ color: "#94A3B8", fontSize: 11, marginTop: 4 }}>
              📲 Нажмите на иконку, чтобы вставить номер из Telegram
            </p>
          </div>

          {/* Contact preference */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Способ связи</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { value: "callback" as const, label: "📞 Перезвонить мне", desc: "Менеджер перезвонит вам" },
                { value: "chat" as const, label: "💬 Чат в Telegram", desc: "Напишем в Telegram" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setContactPreference(opt.value)}
                  style={{
                    background: contactPreference === opt.value ? "#EFF9FF" : "white",
                    border: `2px solid ${contactPreference === opt.value ? "#00B4D8" : "#E2EDF4"}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    transition: "all 0.15s",
                  }}
                >
                  {/* Radio circle */}
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: `2px solid ${contactPreference === opt.value ? "#00B4D8" : "#CBD5E1"}`,
                      background: contactPreference === opt.value ? "#00B4D8" : "white",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                  >
                    {contactPreference === opt.value && (
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: contactPreference === opt.value ? 600 : 400, color: contactPreference === opt.value ? "#0077B6" : "#1A2332" }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>{opt.desc}</div>
                  </div>
                </button>
              ))}
              {/* Empty = will call anyway hint */}
              {contactPreference === "" && (
                <p style={{ color: "#94A3B8", fontSize: 11, margin: "2px 0 0 2px" }}>
                  Если не выбрано — менеджер перезвонит по умолчанию
                </p>
              )}
            </div>
          </div>

          {/* Date */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Дата *</label>
            <input
              type="date"
              value={bookingDate}
              min={todayStr}
              onChange={(e) => setBookingDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Time slots */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Время *</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  onClick={() => setBookingTime(t)}
                  style={{
                    background: bookingTime === t ? "#EFF9FF" : "white",
                    border: `1.5px solid ${bookingTime === t ? "#00B4D8" : "#E2EDF4"}`,
                    borderRadius: 10,
                    padding: "8px 14px",
                    fontSize: 14,
                    fontWeight: bookingTime === t ? 700 : 400,
                    color: bookingTime === t ? "#0077B6" : "#475569",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Address with GPS picker */}
          <AddressPicker value={address} onChange={setAddress} />

          {/* Comment */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Комментарий</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Площадь, особые пожелания, код домофона..."
              rows={3}
              style={{ ...inputStyle, resize: "none" as const }}
            />
          </div>

          {/* Price summary */}
          {price > 0 && (
            <div
              style={{
                background: "#F0FDFF",
                border: "1px solid #E2EDF4",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#475569", fontSize: 14 }}>Примерная стоимость</span>
              <span style={{ color: "#0077B6", fontSize: 18, fontWeight: 700 }}>{price} BYN</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                background: "#FEE2E2",
                border: "1px solid #FCA5A5",
                borderRadius: 10,
                padding: "10px 14px",
                color: "#DC2626",
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              width: "100%",
              background: isSubmitting
                ? "#94A3B8"
                : "linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)",
              color: "white",
              border: "none",
              borderRadius: 16,
              fontSize: 16,
              fontWeight: 700,
              padding: "15px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {isSubmitting ? "Отправляем..." : "Отправить заявку"}
          </button>

          <p style={{ textAlign: "center", color: "#94A3B8", fontSize: 12, marginTop: 10 }}>
            Перезвоним в течение 15 минут в рабочее время
          </p>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#475569",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid #E2EDF4",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 15,
  color: "#1A2332",
  background: "white",
  outline: "none",
  boxSizing: "border-box",
};
