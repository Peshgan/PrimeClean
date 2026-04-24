"use client";

import { useState } from "react";
import { ChevronRight, Calculator as CalcIcon } from "lucide-react";
import Button from "@/components/ui/Button";

type ServiceType = "standard" | "general" | "after-repair" | "office" | "dry-cleaning" | "specialized";
type ExtrasMap = Record<string, number>;

const serviceTypes: { value: ServiceType; label: string; basePrice: number; unit: string }[] = [
  { value: "standard", label: "Стандартная уборка", basePrice: 2, unit: "2 BYN/м²" },
  { value: "general", label: "Генеральная уборка", basePrice: 6, unit: "6 BYN/м²" },
  { value: "after-repair", label: "После ремонта", basePrice: 9, unit: "9 BYN/м²" },
  { value: "office", label: "Уборка офиса", basePrice: 1.8, unit: "1.8 BYN/м²" },
  { value: "dry-cleaning", label: "Химчистка", basePrice: 7, unit: "BYN/м²" },
  { value: "specialized", label: "Спец. уборка", basePrice: 0, unit: "индивидуально" },
];

const cleaningExtras: { value: string; label: string; price: number; hasQty?: boolean }[] = [
  { value: "windows", label: "Мойка окон", price: 15, hasQty: true },
  { value: "balcony", label: "Балкон / лоджия", price: 30, hasQty: true },
  { value: "cabinet", label: "Кухонный шкафчик", price: 3, hasQty: true },
  { value: "wardrobe", label: "Шкаф", price: 10, hasQty: true },
  { value: "hood", label: "Вытяжка", price: 15 },
  { value: "fridge", label: "Холодильник изнутри", price: 23 },
  { value: "oven", label: "Духовка", price: 25 },
  { value: "microwave", label: "Микроволновка", price: 20 },
  { value: "ironing", label: "Глажка белья (1 час)", price: 27 },
];

const dryCleaningExtras: { value: string; label: string; price: number; hasQty?: boolean }[] = [
  { value: "sofa2", label: "Диван двухместный", price: 90, hasQty: true },
  { value: "sofa3", label: "Трехместный", price: 113, hasQty: true },
  { value: "sofa4", label: "Четырехместный (угловой)", price: 128, hasQty: true },
  { value: "sofa5", label: "5-6 местный угловой", price: 150, hasQty: true },
  { value: "mat1_1", label: "Матрас 1-сп (1 сторона)", price: 53, hasQty: true },
  { value: "mat1_2", label: "Матрас 1-сп (2 стороны)", price: 90, hasQty: true },
  { value: "mat2_1", label: "Матрас 2-сп (1 сторона)", price: 75, hasQty: true },
  { value: "mat2_2", label: "Матрас 2-сп (2 стороны)", price: 150, hasQty: true },
  { value: "chair", label: "Кресло", price: 53, hasQty: true },
  { value: "stool", label: "Стул, табурет", price: 18, hasQty: true },
  { value: "comp_chair", label: "Стул компьютерный", price: 23, hasQty: true },
  { value: "headboard", label: "Изголовье кровати", price: 75, hasQty: true },
  { value: "pouf", label: "Пуф", price: 23, hasQty: true },
  { value: "kitchen", label: "Кухонный уголок", price: 75, hasQty: true },
];

function calcPrice(service: ServiceType, area: number, extras: ExtrasMap): number {
  if (service === "specialized") return 0;

  const svc = serviceTypes.find((s) => s.value === service)!;
  let base = svc.basePrice * area;

  if (service !== "dry-cleaning") {
    base = Math.max(base, 69);
  }

  const currentExtras = service === "dry-cleaning" ? dryCleaningExtras : cleaningExtras;
  const extrasTotal = currentExtras.reduce((sum, e) => {
    const qty = extras[e.value] ?? 0;
    return sum + e.price * qty;
  }, 0);

  return Math.round(base + extrasTotal);
}

interface CalculatorProps {
  onOrder?: (service: string, price: number) => void;
}

export default function Calculator({ onOrder }: CalculatorProps) {
  const [service, setService] = useState<ServiceType>("standard");
  const [area, setArea] = useState(50);
  const [extras, setExtras] = useState<ExtrasMap>({});

  const price = calcPrice(service, area, extras);

  const setQty = (key: string, qty: number) => {
    setExtras((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[key];
      } else {
        next[key] = qty;
      }
      return next;
    });
  };

  const currentExtras = service === "dry-cleaning" ? dryCleaningExtras : cleaningExtras;

  return (
    <div className="bg-white rounded-3xl border border-[#E2EDF4] shadow-lg p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-[#F0FDFF] flex items-center justify-center">
          <CalcIcon size={20} className="text-[#00B4D8]" />
        </div>
        <div>
          <h3 className="font-bold text-[#1A2332] text-lg">Калькулятор стоимости</h3>
          <p className="text-[#94A3B8] text-sm">Рассчитайте цену за 30 секунд</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Service type */}
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">
            Тип уборки
          </label>
          <div className="grid grid-cols-1 gap-2">
            {serviceTypes.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => {
                  if (s.value === "dry-cleaning" && area === 50) setArea(0);
                  if (s.value !== "dry-cleaning" && area === 0) setArea(50);
                  setService(s.value);
                  setExtras({});
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 cursor-pointer text-left ${
                  service === s.value
                    ? "border-[#00B4D8] bg-[#F0FDFF] text-[#0077B6]"
                    : "border-[#E2EDF4] text-[#475569] hover:border-[#00B4D8]/50 hover:bg-[#F0FDFF]/50"
                }`}
              >
                <span>{s.label}</span>
                <span className="text-xs text-[#94A3B8]">{s.unit}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Area */}
        {service !== "specialized" && (
          <div>
            <label className="block text-sm font-medium text-[#475569] mb-2">
              {service === "dry-cleaning" ? "Площадь ковров" : "Площадь помещения"}:{" "}
              <span className="text-[#0077B6] font-bold">{area} м²</span>
            </label>
            <input
              type="range"
              min={service === "dry-cleaning" ? 0 : 20}
              max={300}
              step={5}
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full h-2 bg-[#E2EDF4] rounded-full appearance-none cursor-pointer accent-[#00B4D8]"
              aria-label={service === "dry-cleaning" ? "Площадь ковров" : "Площадь помещения"}
            />
            <div className="flex justify-between text-xs text-[#94A3B8] mt-1">
              <span>{service === "dry-cleaning" ? "0 м²" : "20 м²"}</span>
              <span>300 м²</span>
            </div>
          </div>
        )}

        {/* Extras with quantity */}
        {service !== "specialized" && (
          <div>
            <label className="block text-sm font-medium text-[#475569] mb-3">
              {service === "dry-cleaning" ? "Предметы для химчистки" : "Дополнительные услуги"}
            </label>
            <div className="space-y-2">
              {currentExtras.map((e) => {
                const qty = extras[e.value] ?? 0;
                const active = qty > 0;
                return e.hasQty ? (
                  /* Stepper row for countable items */
                  <div
                    key={e.value}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                      active
                        ? "border-[#00C9A7] bg-[#E6FFF9]"
                        : "border-[#E2EDF4] bg-white"
                    }`}
                  >
                    <span className={`text-sm flex-1 ${active ? "font-semibold text-[#00875A]" : "text-[#475569]"}`}>
                      {e.label}
                      <span className={`text-xs ml-1 ${active ? "text-[#00875A]" : "text-[#94A3B8]"}`}>
                        +{e.price} BYN{qty > 1 ? ` × ${qty} = ${e.price * qty} BYN` : ""}
                      </span>
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setQty(e.value, qty - 1)}
                        disabled={qty === 0}
                        className={`w-7 h-7 rounded-lg border-2 font-bold text-base flex items-center justify-center transition-colors cursor-pointer ${
                          qty > 0
                            ? "border-[#00C9A7] bg-white text-[#00875A] hover:bg-[#E6FFF9]"
                            : "border-[#E2EDF4] bg-white text-[#CBD5E1] cursor-not-allowed"
                        }`}
                      >
                        −
                      </button>
                      <span className={`w-5 text-center font-bold text-sm ${active ? "text-[#00875A]" : "text-[#CBD5E1]"}`}>
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(e.value, qty + 1)}
                        className={`w-7 h-7 rounded-lg border-2 font-bold text-base flex items-center justify-center transition-all cursor-pointer ${
                          active
                            ? "border-[#00B4D8] bg-[#00B4D8] text-white hover:bg-[#0096B4]"
                            : "border-[#00B4D8] bg-white text-[#00B4D8] hover:bg-[#F0FDFF]"
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Simple toggle for non-countable items */
                  <button
                    key={e.value}
                    type="button"
                    onClick={() => setQty(e.value, active ? 0 : 1)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 text-sm transition-all duration-200 cursor-pointer ${
                      active
                        ? "border-[#00C9A7] bg-[#E6FFF9] text-[#00875A] font-semibold"
                        : "border-[#E2EDF4] text-[#475569] hover:border-[#00B4D8]/50"
                    }`}
                  >
                    <span>{e.label}</span>
                    <span className={`text-xs ${active ? "text-[#00875A]" : "text-[#94A3B8]"}`}>
                      +{e.price} BYN
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Result */}
        <div className="bg-linear-to-r from-[#00B4D8] to-[#0077B6] rounded-2xl p-4 text-white">
          <p className="text-sm opacity-80 mb-1">Примерная стоимость</p>
          {service === "specialized" ? (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">Договорная</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{price}</span>
              <span className="text-lg opacity-80">BYN</span>
            </div>
          )}
          <p className="text-xs opacity-70 mt-1">Точная цена — после осмотра</p>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={() => {
            onOrder?.(service, price);
            document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Заказать
          <ChevronRight size={18} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}
