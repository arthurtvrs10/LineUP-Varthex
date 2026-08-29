import {
  BarChart3,
  Bell,
  CalendarDays,
  Scissors,
  Search,
  UsersRound,
  WalletCards,
} from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";

type ProductFrameProps = {
  active?: "Visão geral" | "Agenda" | "Clientes" | "Equipe" | "Comissões";
  eyebrow: string;
  title: string;
  action: string;
  children: ReactNode;
  className?: string;
};

const navigation = [
  { label: "Visão geral", icon: BarChart3 },
  { label: "Agenda", icon: CalendarDays },
  { label: "Clientes", icon: UsersRound },
  { label: "Equipe", icon: Scissors },
  { label: "Comissões", icon: WalletCards },
] as const;

export function ProductFrame({
  active = "Visão geral",
  eyebrow,
  title,
  action,
  children,
  className = "",
}: ProductFrameProps) {
  return (
    <div
      className={`relative grid min-h-[540px] w-full overflow-hidden rounded-2xl border border-[#cfd5e2] bg-white font-[var(--font-manrope)] shadow-[0_30px_80px_rgba(34,34,72,0.14),0_4px_12px_rgba(34,34,72,0.06)] md:grid-cols-[180px_1fr] ${className}`}
    >
      <aside className="hidden min-w-0 flex-col border-r border-[#e9ecf2] bg-[#fbfbfd] p-4 text-[#606b7f] md:flex">
        <div className="flex items-center gap-2 text-[13px] text-[#0d1831]">
          <span className="scale-75">
            <Logo variant="symbol" height={24} className="text-ink" />
          </span>
          <strong>LINEUP</strong>
        </div>

        <div className="my-5 flex h-9 items-center gap-2 rounded-lg border border-[#e7eaf0] bg-white px-2.5 text-[10px]">
          <Search size={14} /> Buscar
        </div>

        <span className="mb-2 px-2 text-[8px] font-extrabold tracking-[0.1em] text-[#adb4c1]">
          OPERAÇÃO
        </span>
        <nav className="grid gap-1" aria-label="Demonstração do sistema">
          {navigation.map(({ label, icon: Icon }) => (
            <span
              className={`flex h-9 items-center gap-2 rounded-lg px-2.5 text-[10px] font-semibold ${
                label === active
                  ? "bg-white text-[#0d1831] shadow-[0_2px_8px_rgba(29,34,54,0.06)]"
                  : ""
              }`}
              key={label}
            >
              <Icon size={15} />
              {label}
            </span>
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-2 border-t border-[#e9ecf2] pt-4">
          <span className="grid size-7 place-items-center rounded-full bg-[#eee8ff] text-[8px] font-extrabold text-[#5326d7]">
            AT
          </span>
          <div className="grid gap-0.5">
            <strong className="text-[9px] text-[#0d1831]">Arthur</strong>
            <small className="text-[7px]">Administrador</small>
          </div>
        </div>
      </aside>

      <div className="min-w-0 bg-white p-3.5 sm:p-5">
        <div className="flex min-h-12 items-start justify-between gap-3">
          <div className="grid gap-1">
            <small className="text-[7px] font-extrabold tracking-[0.08em] text-[#9da5b3]">
              {eyebrow}
            </small>
            <strong className="text-sm font-bold sm:text-[15px]">{title}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden size-8 place-items-center rounded-lg border border-[#e5e9f0] bg-white text-[#718096] sm:grid">
              <Bell size={15} />
            </span>
            <button className="min-h-8 rounded-lg bg-[#0d1831] px-3 text-[9px] font-bold text-white">
              {action}
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Avatar({
  initials,
  tone = "violet",
}: {
  initials: string;
  tone?: "violet" | "gold" | "green" | "blue";
}) {
  const colors =
    tone === "gold"
      ? "bg-[#fff0d4] text-[#9a640b]"
      : tone === "green"
        ? "bg-[#e6f7f2] text-[#177a5f]"
        : tone === "blue"
          ? "bg-[#e5efff] text-[#2b60b4]"
          : "bg-[#eee8ff] text-[#5326d7]";

  return (
    <i
      className={`grid size-7 shrink-0 place-items-center rounded-full text-[8px] font-extrabold not-italic ${colors}`}
    >
      {initials}
    </i>
  );
}
