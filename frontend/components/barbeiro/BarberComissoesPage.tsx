"use client";

import { useState } from "react";
import { Calendar, ChevronDown, UserCheck } from "lucide-react";

type PeriodFilter = "Hoje" | "Esta semana" | "Este mês" | "Personalizado";

const periodFilters: PeriodFilter[] = ["Hoje", "Esta semana", "Este mês", "Personalizado"];

const summaryCards = [
  {
    label: "Provisionada",
    description: "Gerada ao concluir o atendimento",
    value: "R$ 1.840,00",
  },
  {
    label: "Aprovada",
    description: "Validada pela política financeira",
    value: "R$ 1.260,00",
  },
  {
    label: "Paga",
    description: "Valor com pagamento registrado",
    value: "R$ 980,00",
  },
];

const periodBreakdown = [
  { label: "HOJE", value: "R$ 85,00", range: "15 ago 2026" },
  { label: "ESTA SEMANA", value: "R$ 428,00", range: "10 — 16 ago" },
  { label: "ESTE MÊS", value: "R$ 1.840,00", range: "01 — 31 ago", highlight: true },
];

export function BarberComissoesPage() {
  const [activeFilter, setActiveFilter] = useState<PeriodFilter>("Este mês");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0d1831]">Comissões</h1>
          <p className="mt-1 text-sm text-[#5f6f87]">
            Consulte suas próprias comissões por período.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-accent-subtle py-3 pl-4 pr-[23px]">
          <UserCheck className="h-4 w-4 text-accent-strong" />
          <span className="text-xs font-bold text-accent-strong">Somente seus dados</span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[12px] border border-[#e6e4df] bg-white px-6 py-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-[#0d1831]">PERÍODO</p>
          <div className="flex items-center gap-2">
            {periodFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-[10px] px-4 py-2 text-xs font-bold transition ${
                  activeFilter === filter
                    ? "bg-accent text-on-accent"
                    : "bg-[#f7f6f2] text-[#5f6f87] hover:bg-[#eef0f3]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="flex items-center gap-8 rounded-[10px] border border-[#e6e4df] bg-[#f7f6f2] px-3 py-3"
        >
          <Calendar className="h-4 w-4 text-[#0d1831]" />
          <span className="text-xs font-bold text-[#0d1831]">01 ago 2026 — 31 ago 2026</span>
          <ChevronDown className="h-3 w-3 text-[#0d1831]" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#0d1831]">Resumo do período</h2>
          <p className="mt-1 text-sm text-[#5f6f87]">
            Acompanhe quanto foi gerado, aprovado e pago.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-[12px] border border-[#e6e4df] bg-white px-6 pb-5 pt-6"
            >
              <div className="flex flex-col gap-3.5">
                <p className="text-[13px] font-bold text-[#5f6f87]">{card.label}</p>
                <p className="text-[11px] text-[#98a2b3]">{card.description}</p>
                <p className="text-[28px] font-bold text-[#0d1831]">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#0d1831]">Comissão provisionada</h2>
          <p className="mt-1 text-sm text-[#5f6f87]">
            Visão diária, semanal e mensal no fuso da unidade.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {periodBreakdown.map((period) => (
            <div
              key={period.label}
              className={`rounded-[12px] px-6 pb-8 pt-[19px] ${
                period.highlight
                  ? "bg-accent"
                  : "border border-[#e6e4df] bg-white"
              }`}
            >
              <p
                className={`text-xs font-bold ${
                  period.highlight ? "text-on-accent/70" : "text-[#98a2b3]"
                }`}
              >
                {period.label}
              </p>
              <div className="mt-3.5 flex items-center justify-between">
                <p
                  className={`text-2xl font-bold ${
                    period.highlight ? "text-on-accent" : "text-[#0d1831]"
                  }`}
                >
                  {period.value}
                </p>
                <p
                  className={`text-[11px] ${
                    period.highlight ? "text-on-accent/70" : "text-[#98a2b3]"
                  }`}
                >
                  {period.range}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
