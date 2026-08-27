"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { AreaTrendChart, BarTrendChart } from "@/components/ui/TrendCharts";

const mrrCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

const metrics = [
  { label: "MRR atual", value: "R$ 21.400,00", trend: "+13% vs mês ant.", up: true },
  { label: "ARR", value: "R$ 256.800,00", trend: "+13% vs mês ant.", up: true },
  { label: "Barbearias totais", value: "48", trend: "+13% vs mês ant.", up: true },
  { label: "Churn mensal", value: "2,1%", trend: "-0.5% vs mês ant.", up: false },
];

const mrrMonths = ["Mar", "Abr", "Mai", "Jun", "Jul", "Ago"];
const mrrValues = [11000, 13600, 15200, 16400, 18800, 21400];

const mrrData = mrrMonths.map((label, i) => ({ label, value: mrrValues[i] }));

const novasBarbearias = [
  { label: "Mar", value: 4 },
  { label: "Abr", value: 9 },
  { label: "Mai", value: 7 },
  { label: "Jun", value: 12 },
];

export function SuperAdminMetricasPage() {

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="grid w-full grid-cols-2 lg:grid-cols-4 gap-[5px]">
        {metrics.map((m) => {
          const Icon = m.up ? TrendingUp : TrendingDown;
          return (
            <div key={m.label} className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
              <p className="text-sm text-[#686a73]">{m.label}</p>
              <p className="pt-1 text-2xl font-bold text-[#0d1831]">{m.value}</p>
              <div className="flex items-center gap-1 pt-2">
                <Icon size={12} strokeWidth={2} className={m.up ? "text-[#27865b]" : "text-[#c84a4a]"} />
                <span className={`text-xs font-medium ${m.up ? "text-[#27865b]" : "text-[#c84a4a]"}`}>{m.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid w-full grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-3">
        <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
          <p className="text-sm font-bold tracking-[-0.28px] text-[#0d1831]">Evolução do MRR</p>
          <p className="pt-0.5 text-xs text-[#686a73]">Últimos 6 meses</p>
          <div className="pt-4">
            <AreaTrendChart
              data={mrrData}
              height={216}
              yWidth={60}
              format="moedaCompacta"
              label={`Evolução do MRR nos últimos 6 meses. ${mrrData
                .map((d) => `${d.label}: ${mrrCompact.format(d.value)}`)
                .join(", ")}.`}
            />
          </div>
        </div>

        <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
          <p className="text-sm font-bold tracking-[-0.28px] text-[#0d1831]">Novas barbearias por mês</p>
          <div className="pt-4">
            <BarTrendChart
              data={novasBarbearias}
              height={216}
              yWidth={32}
              label={`Novas barbearias por mês. ${novasBarbearias
                .map((d) => `${d.label}: ${d.value}`)
                .join(", ")}.`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
