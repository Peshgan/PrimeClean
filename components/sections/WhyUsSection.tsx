import { ShieldCheck, Clock, Leaf, Smartphone, Users, Award } from "lucide-react";

const advantages = [
  {
    icon: ShieldCheck,
    title: "Гарантия качества",
    description: "Если что-то не устроит — вернёмся и исправим бесплатно в течение 24 часов. Без вопросов.",
    color: "text-[#00C9A7]",
    bg: "bg-[#E6FFF9]",
  },
  {
    icon: Clock,
    title: "Точно в срок",
    description: "Приезжаем вовремя. При задержке предупреждаем заранее и компенсируем неудобства.",
    color: "text-[#00B4D8]",
    bg: "bg-[#F0FDFF]",
  },
  {
    icon: Leaf,
    title: "Экологичная химия",
    description: "Только сертифицированные средства, безопасные для детей, домашних животных и аллергиков.",
    color: "text-[#22C55E]",
    bg: "bg-[#DCFCE7]",
  },
  {
    icon: Smartphone,
    title: "Онлайн-бронирование",
    description: "Заказывайте уборку в 2 клика — через сайт или мессенджер. Никаких лишних звонков.",
    color: "text-[#8B5CF6]",
    bg: "bg-[#F5F3FF]",
  },
  {
    icon: Users,
    title: "Проверенная команда",
    description: "Все сотрудники прошли обучение и проверку. Работаем только с надёжными специалистами.",
    color: "text-[#F59E0B]",
    bg: "bg-[#FFFBEB]",
  },
  {
    icon: Award,
    title: "5 лет опыта",
    description: "С 2019 года выполнили более 3 500 уборок. Знаем, как навести идеальный порядок.",
    color: "text-[#0077B6]",
    bg: "bg-[#F0FDFF]",
  },
];

export default function WhyUsSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#F0FDFF]" id="why-us">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-[#00B4D8] font-semibold text-sm uppercase tracking-wider mb-3">
            Наши преимущества
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2332] mb-4">
            Почему выбирают PrimeClean
          </h2>
          <p className="text-[#475569] text-lg">
            Мы не просто убираем — мы несём ответственность за результат
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-3xl p-6 border border-[#E2EDF4] hover:shadow-md transition-shadow duration-200"
              >
                <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-4`}>
                  <Icon size={22} className={item.color} />
                </div>
                <h3 className="font-bold text-[#1A2332] text-lg mb-2">{item.title}</h3>
                <p className="text-[#475569] text-sm leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
