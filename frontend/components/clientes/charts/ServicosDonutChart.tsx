"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/Chart";
import { brl, brlCompact, type FatiaServico } from "../dashboardData";

export function ServicosDonutChart({
  data,
  total,
}: {
  data: FatiaServico[];
  total: number;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const resumo = data
    .map((d) => `${d.name}: ${brl.format(d.value)}`)
    .join(", ");

  return (
    <div className="relative">
      <ChartContainer
        height={232}
        label={`Distribuição de gastos por serviço. Total ${brl.format(total)}. ${resumo}.`}
      >
        <PieChart>
          <Tooltip
            cursor={false}
            offset={12}
            content={
              <ChartTooltipContent
                renderLabel={(_, row) => String(row.name ?? "")}
                renderBody={(row) => (
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-[#0d1831]">
                      {brl.format(Number(row.value ?? 0))}
                    </span>
                    <span className="text-xs text-[#5f6f87]">
                      {Number(row.percent ?? 0).toFixed(0)}% do total
                    </span>
                  </div>
                )}
              />
            }
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            /* Vão de 2px na cor da superfície separa as fatias — sem borda desenhada. */
            stroke="#ffffff"
            strokeWidth={2}
            isAnimationActive={false}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((fatia, index) => (
              <Cell
                key={fatia.name}
                fill={fatia.color}
                opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                style={{ transition: "opacity 150ms", outline: "none" }}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[11px] text-[#98a2b3]">Total gasto</p>
        <p className="text-[26px] font-bold leading-tight text-[#0d1831]">
          {brlCompact.format(total)}
        </p>
        <p className="text-[11px] text-[#98a2b3]">
          {data.length} serviços
        </p>
      </div>
    </div>
  );
}
