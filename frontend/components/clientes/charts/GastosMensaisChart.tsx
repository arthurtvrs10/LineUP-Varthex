"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_AXIS, CHART_GRID, ChartContainer, ChartTooltipContent } from "@/components/ui/Chart";
import { brl, brlCompact, type SerieMensal } from "../dashboardData";

/**
 * Série única (gasto por mês) — uma cor só, o slot 1 da paleta.
 * As visitas aparecem no tooltip, nunca como segundo eixo: dois eixos Y
 * num mesmo plot inventam uma correlação que não existe nos dados.
 */
export function GastosMensaisChart({ data }: { data: SerieMensal[] }) {
  const resumo = data.map((d) => `${d.mes}: ${brl.format(d.gasto)}`).join(", ");

  return (
    <ChartContainer height={248} label={`Gasto por mês. ${resumo}.`}>
      <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
        <CartesianGrid vertical={false} stroke={CHART_GRID} strokeWidth={1} />
        <XAxis
          dataKey="mes"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tick={{ fill: CHART_AXIS, fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={64}
          tick={{ fill: CHART_AXIS, fontSize: 11 }}
          tickFormatter={(value: number) => brlCompact.format(value)}
        />
        <Tooltip
          cursor={{ fill: "#f7f6f2" }}
          offset={12}
          content={
            <ChartTooltipContent
              renderLabel={(_, row) => String(row.mesCompleto ?? "")}
              renderBody={(row) => (
                <>
                  <p className="text-sm font-bold text-[#0d1831]">
                    {brl.format(Number(row.gasto ?? 0))}
                  </p>
                  <p className="mt-0.5 text-xs text-[#5f6f87]">
                    {Number(row.visitas ?? 0)}{" "}
                    {Number(row.visitas ?? 0) === 1 ? "visita" : "visitas"}
                  </p>
                </>
              )}
            />
          }
        />
        <Bar
          dataKey="gasto"
          name="Gasto"
          fill="#ff4a17"
          radius={[4, 4, 0, 0]}
          maxBarSize={44}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  );
}
