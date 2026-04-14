"use client";

import { useState } from "react";
import { ChevronRight, Calculator as CalcIcon } from "lucide-react";
import Button from "@/components/ui/Button";

type ServiceType = "standard" | "general" | "after-repair" | "office" | "carpet";

const serviceTypes: { value: ServiceType; label: string; basePrice: number; unit: string }[] = [
  { value: "standard", label: "Стандартная уборка", basePrice: 1.8, unit: "BYN/м²" },
  { value: "general", label: "Генеральная уборка", basePrice: 2.8, unit: "BYN/м²" },
  { value: "after-repair", label: "После ремонта", basePrice: 3.5, unit: "BYN/м²" },
  { value: "office", label: "Уборка офиса", basePrice: 1.5, unit: "BYN/м²" },
  { value: "carpet", label: "Химчистка ковров", basePrice: 18, unit: "BYN/м²" },
];

const extras: { value: string; label: string; price: number }[] = [
  { value: "windows", label: "Мойка окон", price: 12 },
  { value: "fridge", label: "Холодильник изнутри", price: 15 },
  { value: "oven", label: "Духовка", price: 12 },
  { value: "balcony", label: "Балкон / лоджия", price: 20 },
  { value: "ironing", label: "Глажка белья (1 час)", price: 18 },
];

function calcPrice(service: ServiceType, area: number, selectedExtras: string[]): number {
  const svc = serviceTypes.find((s) => s.value === service)!;
  const base = Math.max(svc.basePrice * area, 69);
  const extrasTotal = extras
    .filter((e) => selectedExtras.includes(e.value))
    .reduce((sum, e) => sum + e.price, 0);
  return Math.round(base + extrasTotal);
}

interface CalculatorProps {
  onOrder?: (service: string, price: number) => void;
}

export default function Calculator({ onOrder }: CalculatorProps) {
  const [service, setService] = useState<ServiceType>("standard");
  const [area, setArea] = useState(50);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const price = calcPrice(service, area, selectedExtras);

  const toggleExtra = (value: string) => {
    setSelectedExtras((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );
  };

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
                onClick={() => setService(s.value)}
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
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">
            Площадь помещения: <span className="text-[#0077B6] font-bold">{area} м²</span>
          </label>
          <input
            type="range"
            min={20}
            max={300}
            step={5}
            value={area}
            onChange={(e) => setArea(Number(e.target.value))}
            className="w-full h-2 bg-[#E2EDF4] rounded-full appearance-none cursor-pointer accent-[#00B4D8]"
            aria-label="Площадь помещения"
          />
          <div className="flex justify-between text-xs text-[#94A3B8] mt-1">
            <span>20 м²</span>
            <span>300 м²</span>
          </div>
        </div>

        {/* Extras */}
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">
            Дополнительные услуги
          </label>
          <div className="flex flex-wrap gap-2">
            {extras.map((e) => (
              <button
                key={e.value}
                type="button"
                onClick={() => toggleExtra(e.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer ${
                  selectedExtras.includes(e.value)
                    ? "border-[#00C9A7] bg-[#E6FFF9] text-[#00875A]"
                    : "border-[#E2EDF4] text-[#475569] hover:border-[#00B4D8]/50"
                }`}
              >
                {e.label} +{e.price} BYN
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className="bg-gradient-to-r from-[#00B4D8] to-[#0077B6] rounded-2xl p-4 text-white">
          <p className="text-sm opacity-80 mb-1">Примерная стоимость</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{price}</span>
            <span className="text-lg opacity-80">BYN</span>
          </div>
          <p className="text-xs opacity-70 mt-1">Точная цена — после осмотра</p>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={() => onOrder?.(service, price)}
        >
          Заказать за {price} BYN
          <ChevronRight size={18} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}
