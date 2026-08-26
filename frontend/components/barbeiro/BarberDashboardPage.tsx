import Link from "next/link";
import { Calendar, ChevronDown, ChevronRight, Wallet } from "lucide-react";

const metrics = [
  { label: "Agendamentos", value: "12", sub: "No período selecionado" },
  { label: "Concluídos", value: "8", sub: "Atendimentos concluídos" },
  { label: "Cancelados", value: "2", sub: "No período selecionado" },
  { label: "Faltas", value: "1", sub: "Não comparecimento registrado" },
  { label: "Valor bruto", value: "R$ 740,00", sub: "Atendimentos do período" },
  { label: "Minha comissão", value: "R$ 296,00", sub: "Valores provisionados" },
];

const summaryRows = [
  { label: "Agendamentos", value: 12, color: "#4318ff" },
  { label: "Concluídos", value: 8, color: "#159a5b" },
  { label: "Cancelados", value: 2, color: "#d92d20" },
  { label: "Faltas", value: 1, color: "#dc6803" },
];

const shortcuts = [
  {
    href: "/barbeiro/agenda",
    title: "Abrir agenda",
    subtitle: "Ver sua agenda e atendimentos",
    icon: Calendar,
  },
  {
    href: "/barbeiro/comissoes",
    title: "Consultar comissões",
    subtitle: "Ver somente seus lançamentos",
    icon: Wallet,
  },
];

export function BarberDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-[#101828]">Visão geral</h1>
          <p className="mt-1 text-sm text-[#475467]">
            Acompanhe sua operação e comissões no período selecionado.
          </p>
        </div>

        <div className="flex items-end gap-3">
          <div>
            <p className="text-xs text-[#475467]">PERÍODO</p>
            <button
              type="button"
              className="mt-1.5 flex h-11 items-center gap-2 rounded-lg border border-[#d0d5dd] px-3.5 text-sm text-[#101828]"
            >
              <Calendar size={16} strokeWidth={1.8} className="text-[#667085]" />
              11 ago — 17 ago 2026
              <ChevronDown size={14} strokeWidth={2} className="text-[#667085]" />
            </button>
          </div>
          <button
            type="button"
            className="h-11 rounded-lg bg-[#4318ff] px-5 text-sm font-bold text-white transition hover:bg-[#3712d1]"
          >
            Atualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-[#eaecf0] bg-white p-6">
            <p className="text-sm text-[#475467]">{metric.label}</p>
            <p className="mt-4 text-[30px] font-bold text-[#101828]">{metric.value}</p>
            <p className="mt-1 text-xs text-[#475467]">{metric.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 rounded-2xl border border-[#eaecf0] bg-white p-6 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold text-[#101828]">Resumo do período</h2>
          <p className="mt-1 text-sm text-[#475467]">Indicadores da sua agenda no período selecionado.</p>

          <ul className="mt-5 divide-y divide-[#eaecf0] border-t border-[#eaecf0]">
            {summaryRows.map((row) => (
              <li key={row.label} className="flex items-center justify-between py-3.5">
                <span className="flex items-center gap-2.5 text-sm text-[#344054]">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: row.color }}
                    aria-hidden="true"
                  />
                  {row.label}
                </span>
                <span className="text-sm font-bold text-[#101828]">{row.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-[#eaecf0] pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <h2 className="text-xl font-bold text-[#101828]">Acesso rápido</h2>
          <p className="mt-1 text-sm text-[#475467]">Continue nas áreas permitidas para você.</p>

          <div className="mt-5 flex flex-col gap-3">
            {shortcuts.map(({ href, title, subtitle, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl border border-[#eaecf0] px-4 py-3.5 transition hover:border-[#c7cad1] hover:bg-[#f9fafb]"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f2f4f7] text-[#344054]">
                  <Icon size={17} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-[#101828]">{title}</span>
                  <span className="block text-xs text-[#475467]">{subtitle}</span>
                </span>
                <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-[#98a2b3]" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
