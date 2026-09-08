/** Tipos e utilidades do fluxo de agendamento. Dado real vem de
 * AgendamentoFlow (apiFetch) — este arquivo só guarda formas e helpers
 * puros, sem estado mockado. */

export const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export type Servico = {
  id: string;
  nome: string;
  descricao: string;
  duracaoMin: number;
  preco: number;
};

export type Profissional = {
  id: string;
  nome: string;
  iniciais: string;
  especialidade: string;
  unitId: string;
};

/**
 * Próximos N dias a partir de hoje. Domingo é fechado.
 *
 * Recebe a data-base em vez de chamar `new Date()` internamente: gerar
 * datas na renderização faria servidor e cliente divergirem e quebraria
 * a hidratação.
 */
export type DiaDisponivel = {
  iso: string;
  diaSemana: string;
  diaMes: number;
  mesCurto: string;
  fechado: boolean;
};

const fmtDiaSemana = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const fmtMes = new Intl.DateTimeFormat("pt-BR", { month: "short" });

export function proximosDias(base: Date, quantidade = 14): DiaDisponivel[] {
  return Array.from({ length: quantidade }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    return {
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      diaSemana: fmtDiaSemana.format(d).replace(".", "").toUpperCase(),
      diaMes: d.getDate(),
      mesCurto: fmtMes.format(d).replace(".", ""),
      fechado: d.getDay() === 0,
    };
  });
}

/** Janela fixa de horários — ainda não existe jornada de trabalho real
 * cadastrada por barbeiro, então isto é um horário comercial padrão, não
 * a disponibilidade real de cada profissional. */
export const horarios = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

export type Selecao = {
  servico: Servico | null;
  profissional: Profissional | null;
  dia: DiaDisponivel | null;
  horario: string | null;
};

export const selecaoVazia: Selecao = {
  servico: null,
  profissional: null,
  dia: null,
  horario: null,
};
