// Dados do painel do cliente.
// Fonte única de verdade: o registro mensal por serviço. Donut, gráfico de
// evolução e totais são todos derivados dele — nada é duplicado à mão.

export const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const brlCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export type ServicoKey = "cabelo" | "barba" | "combo";

export type ServicoMeta = {
  key: ServicoKey;
  name: string;
  subtitle: string;
  color: string;
};

// Paleta categórica LINEUP, revalidada (rebrand §9) via validate_palette.js
// em all-pairs sobre superfície branca: CVD ΔE 9.1 (protan) · visão normal
// ΔE 17.6 · banda de luminosidade e croma OK. Slot 1 é o Signal da marca —
// o violeta antigo saiu inteiro (inclusive o laranja #eb6834, que colidiria
// com o Signal) para não repetir hue com o acento de UI.
export const servicosMeta: ServicoMeta[] = [
  { key: "cabelo", name: "Cabelo", subtitle: "Serviço individual", color: "#ff4a17" },
  { key: "barba", name: "Barba", subtitle: "Serviço individual", color: "#2a78d6" },
  { key: "combo", name: "Cabelo + barba", subtitle: "Serviço combinado", color: "#1baf7a" },
];

export type MesRegistro = {
  mes: string;
  mesCompleto: string;
  cabelo: number;
  barba: number;
  combo: number;
  visitas: number;
};

/** 12 meses, do mais antigo ao mais recente. Preços: corte 50 · barba 35 · combo 85. */
export const registros: MesRegistro[] = [
  { mes: "Set", mesCompleto: "Setembro de 2025", cabelo: 50, barba: 0, combo: 0, visitas: 1 },
  { mes: "Out", mesCompleto: "Outubro de 2025", cabelo: 0, barba: 0, combo: 85, visitas: 1 },
  { mes: "Nov", mesCompleto: "Novembro de 2025", cabelo: 50, barba: 35, combo: 0, visitas: 2 },
  { mes: "Dez", mesCompleto: "Dezembro de 2025", cabelo: 0, barba: 0, combo: 85, visitas: 1 },
  { mes: "Jan", mesCompleto: "Janeiro de 2026", cabelo: 50, barba: 0, combo: 0, visitas: 1 },
  { mes: "Fev", mesCompleto: "Fevereiro de 2026", cabelo: 0, barba: 0, combo: 85, visitas: 1 },
  { mes: "Mar", mesCompleto: "Março de 2026", cabelo: 0, barba: 0, combo: 85, visitas: 1 },
  { mes: "Abr", mesCompleto: "Abril de 2026", cabelo: 50, barba: 0, combo: 85, visitas: 2 },
  { mes: "Mai", mesCompleto: "Maio de 2026", cabelo: 50, barba: 35, combo: 0, visitas: 2 },
  { mes: "Jun", mesCompleto: "Junho de 2026", cabelo: 0, barba: 0, combo: 85, visitas: 1 },
  { mes: "Jul", mesCompleto: "Julho de 2026", cabelo: 50, barba: 0, combo: 0, visitas: 1 },
  { mes: "Ago", mesCompleto: "Agosto de 2026", cabelo: 0, barba: 0, combo: 85, visitas: 1 },
];

export type Periodo = 6 | 12;

export const periodos: { value: Periodo; label: string }[] = [
  { value: 6, label: "6 meses" },
  { value: 12, label: "12 meses" },
];

export function registrosDoPeriodo(periodo: Periodo): MesRegistro[] {
  return registros.slice(-periodo);
}

/** Total gasto no mês (soma dos serviços). */
export function totalDoMes(r: MesRegistro): number {
  return r.cabelo + r.barba + r.combo;
}

export type SerieMensal = {
  mes: string;
  mesCompleto: string;
  gasto: number;
  visitas: number;
};

export function serieMensal(periodo: Periodo): SerieMensal[] {
  return registrosDoPeriodo(periodo).map((r) => ({
    mes: r.mes,
    mesCompleto: r.mesCompleto,
    gasto: totalDoMes(r),
    visitas: r.visitas,
  }));
}

export type FatiaServico = ServicoMeta & { value: number; percent: number };

export function fatiasPorServico(periodo: Periodo): FatiaServico[] {
  const janela = registrosDoPeriodo(periodo);
  const total = janela.reduce((sum, r) => sum + totalDoMes(r), 0);

  return servicosMeta
    .map((meta) => {
      const value = janela.reduce((sum, r) => sum + r[meta.key], 0);
      return { ...meta, value, percent: total === 0 ? 0 : (value / total) * 100 };
    })
    .filter((fatia) => fatia.value > 0);
}

export function totalGasto(periodo: Periodo): number {
  return registrosDoPeriodo(periodo).reduce((sum, r) => sum + totalDoMes(r), 0);
}

export function totalVisitas(periodo: Periodo): number {
  return registrosDoPeriodo(periodo).reduce((sum, r) => sum + r.visitas, 0);
}

export const proximoAgendamento = {
  data: "22 de agosto",
  diaSemana: "Sábado",
  horario: "15:00 — 16:10",
  servico: "Corte de cabelo + Barba",
  detalhe: "2 serviços • 70 min",
  profissional: "João Pereira",
  unidade: "Unidade Centro",
  valor: 85,
};

export const fidelidade = {
  pontos: 920,
  proximaRecompensaEm: 1000,
  recompensa: "R$ 50 de desconto",
  /** Acumulado desde o início do cadastro, não do período filtrado. */
  visitasTotais: 46,
};

export const pontosRestantes = Math.max(
  fidelidade.proximaRecompensaEm - fidelidade.pontos,
  0,
);

export const progressoFidelidade = Math.min(
  (fidelidade.pontos / fidelidade.proximaRecompensaEm) * 100,
  100,
);
