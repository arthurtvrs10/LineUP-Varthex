"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

function buildLinePath(values: number[], width: number, height: number) {
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);
  const points = values.map((v, i) => ({
    x: i * step,
    y: height - (v / max) * height,
  }));
  const line = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ");
  return { line, points };
}

const metrics = [
  { label: "MRR atual", value: "R$ 21.400,00", trend: "+13% vs mês ant.", up: true },
  { label: "ARR", value: "R$ 256.800,00", trend: "+13% vs mês ant.", up: true },
  { label: "Barbearias totais", value: "48", trend: "+13% vs mês ant.", up: true },
  { label: "Churn mensal", value: "2,1%", trend: "-0.5% vs mês ant.", up: false },
];

const mrrMonths = ["Mar", "Abr", "Mai", "Jun", "Jul", "Ago"];
const mrrValues = [11000, 13600, 15200, 16400, 18800, 21400];

const novasBarbearias = [
  { label: "Mar", value: 4 },
  { label: "Abr", value: 9 },
  { label: "Mai", value: 7 },
  { label: "Jun", value: 12 },
];

export function SuperAdminMetricasPage() {
  const width = 560;
  const height = 160;
  const { line, points } = buildLinePath(mrrValues, width, height);
  const novasMax = 12;

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="grid w-full grid-cols-4 gap-[5px]">
        {metrics.map((m) => {
          const Icon = m.up ? TrendingUp : TrendingDown;
          return (
            <div key={m.label} className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
              <p className="text-sm text-[#686a73]">{m.label}</p>
              <p className="pt-1 text-2xl font-bold text-[#17181d]">{m.value}</p>
              <div className="flex items-center gap-1 pt-2">
                <Icon size={12} strokeWidth={2} className={m.up ? "text-[#27865b]" : "text-[#c84a4a]"} />
                <span className={`text-xs font-medium ${m.up ? "text-[#27865b]" : "text-[#c84a4a]"}`}>{m.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid w-full grid-cols-[1.4fr_1fr] gap-3">
        <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
          <p className="text-sm font-bold tracking-[-0.28px] text-[#17181d]">Evolução do MRR</p>
          <p className="pt-0.5 text-xs text-[#686a73]">Últimos 6 meses</p>
          <div className="pt-4">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-[200px] w-full" preserveAspectRatio="none">
              <path d={line} fill="none" stroke="#c8a86b" strokeWidth={2.5} />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={4} fill="#c8a86b" />
              ))}
            </svg>
            <div className="flex justify-between pt-2 text-xs text-[#686a73]">
              {mrrMonths.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
          <p className="text-sm font-bold tracking-[-0.28px] text-[#17181d]">Novas barbearias por mês</p>
          <div className="flex h-[216px] items-end gap-6 pt-6">
            {novasBarbearias.map((d) => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full max-w-[70px] rounded-t-[6px] bg-[#6c4cf1]"
                  style={{ height: `${(d.value / novasMax) * 160}px` }}
                />
                <span className="text-xs text-[#686a73]">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
