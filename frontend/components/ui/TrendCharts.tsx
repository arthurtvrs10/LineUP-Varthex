"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_AXIS, CHART_GRID, ChartContainer, ChartTooltipContent } from "./Chart";

/**
 * Gráficos de tendência de SÉRIE ÚNICA, compartilhados pelos painéis.
 * Uma série = uma cor (slot 1 da paleta): colorir barras por magnitude
 * seria uma rampa de valor sobre categorias, que gasta o canal de cor
 * com informação que o tamanho da barra já mostra.
 */

export type PontoTendencia = {
  label: string;
  value: number;
  /** Linha extra opcional no tooltip (ex.: "3 visitas"). */
  detalhe?: string;
};

/* Cor de série provisória: aguarda a paleta categórica validada (spec §9).
   Não trocar por Signal antes disso — dado e acento de marca não podem ser
   a mesma cor. */
const ACCENT = "#7247f3";

/**
 * O formato é um valor serializável, não uma função: props de client
 * component precisam atravessar a fronteira do servidor, então uma
 * callback aqui obrigaria todo consumidor a virar client component.
 */
export type FormatoValor = "numero" | "moeda" | "moedaCompacta";

const formatadores: Record<FormatoValor, (v: number) => string> = {
  numero: (v) => new Intl.NumberFormat("pt-BR").format(v),
  moeda: (v) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v),
  moedaCompacta: (v) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(v),
};

type TrendProps = {
  data: PontoTendencia[];
  height?: number;
  /** Como formatar o valor no eixo Y e no tooltip. */
  format?: FormatoValor;
  /** Descrição para leitores de tela. */
  label: string;
  /** Largura reservada ao eixo Y. */
  yWidth?: number;
};

function tooltip(formatValue: (value: number) => string) {
  return (
    <ChartTooltipContent
      renderLabel={(_, row) => String(row.label ?? "")}
      renderBody={(row) => (
        <>
          <p className="text-sm font-bold text-ink">
            {formatValue(Number(row.value ?? 0))}
          </p>
          {row.detalhe ? (
            <p className="mt-0.5 text-xs text-secondary">{String(row.detalhe)}</p>
          ) : null}
        </>
      )}
    />
  );
}

export function AreaTrendChart({
  data,
  height = 220,
  format = "numero",
  label,
  yWidth = 52,
}: TrendProps) {
  const formatValue = formatadores[format];
  return (
    <ChartContainer height={height} label={label}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="trendAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.18} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={CHART_GRID} strokeWidth={1} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tick={{ fill: CHART_AXIS, fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={yWidth}
          tick={{ fill: CHART_AXIS, fontSize: 11 }}
          tickFormatter={(v: number) => formatValue(v)}
        />
        <Tooltip cursor={{ stroke: CHART_GRID, strokeWidth: 1 }} offset={12} content={tooltip(formatValue)} />
        <Area
          dataKey="value"
          type="monotone"
          stroke={ACCENT}
          strokeWidth={2}
          fill="url(#trendAreaFill)"
          /* Anel de 2px na cor da superfície separa o ponto do traço. */
          activeDot={{ r: 4, fill: ACCENT, stroke: "#ffffff", strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

export function BarTrendChart({
  data,
  height = 220,
  format = "numero",
  label,
  yWidth = 52,
}: TrendProps) {
  const formatValue = formatadores[format];
  return (
    <ChartContainer height={height} label={label}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <CartesianGrid vertical={false} stroke={CHART_GRID} strokeWidth={1} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tick={{ fill: CHART_AXIS, fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={yWidth}
          tick={{ fill: CHART_AXIS, fontSize: 11 }}
          tickFormatter={(v: number) => formatValue(v)}
        />
        <Tooltip cursor={{ fill: "var(--color-surface-sunken)" }} offset={12} content={tooltip(formatValue)} />
        <Bar
          dataKey="value"
          fill={ACCENT}
          radius={[4, 4, 0, 0]}
          maxBarSize={44}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  );
}
