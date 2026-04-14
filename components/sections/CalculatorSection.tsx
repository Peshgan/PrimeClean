import Calculator from "@/components/forms/Calculator";

export default function CalculatorSection() {
  return (
    <section className="py-20 lg:py-28 bg-white" id="calculator">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div className="space-y-6">
            <div>
              <p className="text-[#00B4D8] font-semibold text-sm uppercase tracking-wider mb-3">
                Прозрачные цены
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4">
                Рассчитайте стоимость уборки
              </h2>
              <p className="text-[#475569] text-lg leading-relaxed">
                Никаких скрытых платежей. Выберите тип уборки, укажите площадь — и получите ориентировочную цену мгновенно.
              </p>
            </div>

            <ul className="space-y-3">
              {[
                "Цена фиксируется при оформлении заявки",
                "Без предоплаты — платите только после уборки",
                "Дополнительные работы — только с вашего согласия",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[#475569]">
                  <span className="mt-1 w-5 h-5 rounded-full bg-[#00C9A7]/15 flex items-center justify-center flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#00C9A7]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="bg-[#F0FDFF] rounded-2xl p-5 border border-[#E2EDF4]">
              <p className="text-sm text-[#475569]">
                <span className="font-semibold text-[#1A2332]">Нужна точная цена?</span>{" "}
                Позвоните нам или оставьте заявку — менеджер рассчитает стоимость под вашу ситуацию.
              </p>
            </div>
          </div>

          {/* Right: Calculator */}
          <div>
            <Calculator />
          </div>
        </div>
      </div>
    </section>
  );
}
