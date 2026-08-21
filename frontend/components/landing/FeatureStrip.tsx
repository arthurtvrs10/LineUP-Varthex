import {
  CalendarDays,
  LineChart,
  Scissors,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";

const items = [
  { icon: CalendarDays, label: "Agenda" },
  { icon: Scissors, label: "Equipe" },
  { icon: UsersRound, label: "Clientes" },
  { icon: WalletCards, label: "Comissões" },
  { icon: LineChart, label: "Indicadores" },
  { icon: ShieldCheck, label: "Multiunidade" },
];

export function FeatureStrip() {
  return (
    <section className="border-y border-[#e2e7f0] bg-[#fafbfc]">
      <div className="mx-auto grid w-full max-w-[1216px] grid-cols-2 gap-x-4 gap-y-6 px-5 py-8 sm:grid-cols-3 sm:px-6 lg:grid-cols-6">
        {items.map(({ icon: Icon, label }) => (
          <div
            className="flex items-center justify-center gap-2 text-center sm:justify-start sm:text-left"
            key={label}
          >
            <Icon className="shrink-0 text-[#7247f3]" size={18} />
            <span className="text-[13px] font-semibold text-[#4e5d73]">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
