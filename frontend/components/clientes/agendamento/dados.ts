/** Dados do fluxo de agendamento. Fonte única para os quatro passos. */

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

export const servicos: Servico[] = [
  {
    id: "corte",
    nome: "Corte de cabelo",
    descricao: "Máquina, tesoura ou degradê, com finalização.",
    duracaoMin: 45,
    preco: 45,
  },
  {
    id: "barba",
    nome: "Barba",
    descricao: "Toalha quente, navalha e hidratação.",
    duracaoMin: 30,
    preco: 35,
  },
  {
    id: "combo",
    nome: "Corte + barba",
    descricao: "Os dois serviços na mesma sessão, com desconto.",
    duracaoMin: 70,
    preco: 70,
  },
  {
    id: "social",
    nome: "Corte social",
    descricao: "Corte clássico, sem degradê.",
    duracaoMin: 40,
    preco: 40,
  },
];

export type Profissional = {
  id: string;
  nome: string;
  iniciais: string;
  especialidade: string;
  nota: string;
};

/** `qualquer` é a primeira opção: abre mais horários e é a escolha mais comum. */
export const QUALQUER_PROFISSIONAL: Profissional = {
  id: "qualquer",
  nome: "Qualquer profissional",
  iniciais: "★",
  especialidade: "Quem estiver disponível no horário",
  nota: "",
};

export const profissionais: Profissional[] = [
  {
    id: "lucas",
    nome: "Lucas Oliveira",
    iniciais: "LO",
    especialidade: "Degradê, navalhado",
    nota: "4.9",
  },
  {
    id: "gabriel",
    nome: "Gabriel Santos",
    iniciais: "GS",
    especialidade: "Barba, corte clássico",
    nota: "4.7",
  },
  {
    id: "felipe",
    nome: "Felipe Cardoso",
    iniciais: "FC",
    especialidade: "Degradê, social",
    nota: "4.6",
  },
];

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
      iso: d.toISOString().slice(0, 10),
      diaSemana: fmtDiaSemana.format(d).replace(".", "").toUpperCase(),
      diaMes: d.getDate(),
      mesCurto: fmtMes.format(d).replace(".", ""),
      fechado: d.getDay() === 0,
    };
  });
}

/** Horários da grade. `ocupados` simula agenda cheia em alguns deles. */
export const horarios = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

const ocupadosPorDia: Record<string, string[]> = {};

/**
 * Ocupação derivada da data, não aleatória: sorteio a cada render faria
 * os horários mudarem sozinhos entre um clique e outro.
 */
export function horariosOcupados(iso: string): string[] {
  if (!ocupadosPorDia[iso]) {
    const semente = [...iso].reduce((s, c) => s + c.charCodeAt(0), 0);
    ocupadosPorDia[iso] = horarios.filter((_, i) => (semente + i * 7) % 5 === 0);
  }
  return ocupadosPorDia[iso];
}

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
