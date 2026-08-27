"use client";

import type { ReactElement, ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

/**
 * Primitivas de gráfico no estilo shadcn/chart, adaptadas a este repo
 * (sem CLI do shadcn, sem Radix, sem `cn()` — template literals como no resto).
 *
 * Tokens de chrome seguem a paleta do app:
 *   grade/hairline #eef0f3 · eixo/rótulo #98a2b3 · texto #0d1831 / #5f6f87
 */

export const CHART_GRID = "#eef0f3";
export const CHART_AXIS = "#98a2b3";
export const CHART_SURFACE = "#ffffff";

export type ChartConfig = Record<string, { label: string; color?: string }>;

type ChartContainerProps = {
  /** Altura total do container, já incluindo a faixa do eixo X. */
  height: number;
  children: ReactElement;
  className?: string;
  /** Descrição para leitores de tela — o gráfico em si é aria-hidden. */
  label?: string;
};

export function ChartContainer({ height, children, className = "", label }: ChartContainerProps) {
  return (
    <div
      // `min-w-0` é obrigatório: sem ele o item de grid/flex herda
      // `min-width:auto` e o gráfico empurra a coluna além da viewport.
      className={`w-full min-w-0 ${className}`}
      style={{ height }}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export type TooltipEntry = {
  name?: string | number;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
};

type ChartTooltipContentProps = {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  /** Título do tooltip. Recebe o label bruto e a linha de dados. */
  renderLabel?: (label: string | number | undefined, row: Record<string, unknown>) => ReactNode;
  /** Linhas do corpo. Se omitido, lista cada série com seu swatch e valor. */
  renderBody?: (row: Record<string, unknown>) => ReactNode;
  /** Formata o valor de cada série na listagem padrão. */
  formatValue?: (value: number | string | undefined) => string;
};

export function ChartTooltipContent({
  active,
  payload,
  label,
  renderLabel,
  renderBody,
  formatValue,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;

  const row = (payload[0]?.payload ?? {}) as Record<string, unknown>;

  return (
    <div className="rounded-[10px] border border-[#e6e4df] bg-white px-3 py-2 shadow-[0_8px_24px_rgba(13,24,49,0.08)]">
      <p className="text-[11px] font-bold tracking-wide text-[#98a2b3]">
        {renderLabel ? renderLabel(label, row) : label}
      </p>

      {renderBody ? (
        <div className="mt-1.5">{renderBody(row)}</div>
      ) : (
        <ul className="mt-1.5 flex flex-col gap-1">
          {payload.map((entry, i) => (
            <li key={`${entry.dataKey ?? entry.name ?? i}`} className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
                aria-hidden="true"
              />
              <span className="text-xs text-[#5f6f87]">{entry.name}</span>
              <span className="ml-auto text-xs font-bold text-[#0d1831]">
                {formatValue ? formatValue(entry.value) : entry.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
