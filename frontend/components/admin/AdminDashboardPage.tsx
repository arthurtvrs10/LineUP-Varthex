"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
  Star,
  Plus,
  CalendarPlus,
  UserPlus,
  UserCog,
  DollarSign,
  Clock,
  Package,
} from "lucide-react";

type Period = "Hoje" | "Semana" | "Mês";

type Metric = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
};

const metrics: Metric[] = [
  { label: "Faturamento hoje", value: "R$ 45,00", delta: "+12% vs ontem", trend: "up" },
  { label: "Agendamentos", value: "5", delta: "+5% vs ontem", trend: "up" },
  { label: "Ticket médio", value: "R$ 45,00", delta: "+3% vs ontem", trend: "up" },
  { label: "Ocupação", value: "25%", delta: "-2% vs ontem", trend: "down" },
  { label: "Cancelamentos", value: "0", delta: "0% vs ontem", trend: "flat" },
  { label: "Clientes novos", value: "3", delta: "+50% vs ontem", trend: "up" },
];

type Appointment = {
  initials: string;
  avatarBg: string;
  avatarColor: string;
  name: string;
  service: string;
  time: string;
  price: string;
  status: string;
  statusBg: string;
  statusColor: string;
  dotColor: string;
};

const appointments: Appointment[] = [
  {
    initials: "JS",
    avatarBg: "bg-[#fbf4e8]",
    avatarColor: "text-[#c8a86b]",
    name: "João Silva",
    service: "Corte + barba · Lucas Oliveira",
    time: "09:00 – 10:10",
    price: "R$ 70,00",
    status: "Confirmado",
    statusBg: "bg-[#ede9fd]",
    statusColor: "text-[#6c4cf1]",
    dotColor: "bg-[#6c4cf1]",
  },
  {
    initials: "RC",
    avatarBg: "bg-[#fdf3e3]",
    avatarColor: "text-[#d28b27]",
    name: "Rafael Costa",
    service: "Corte degradê · Lucas Oliveira",
    time: "10:30 – 11:15",
    price: "R$ 45,00",
    status: "Agendado",
    statusBg: "bg-[#eaf2fb]",
    statusColor: "text-[#3478c9]",
    dotColor: "bg-[#3478c9]",
  },
  {
    initials: "MR",
    avatarBg: "bg-[#fdf3e3]",
    avatarColor: "text-[#d28b27]",
    name: "Mateus Rodrigues",
    service: "Barba completa · Gabriel Santos",
    time: "09:30 – 10:00",
    price: "R$ 35,00",
    status: "Em atendimento",
    statusBg: "bg-[#fdf3e3]",
    statusColor: "text-[#d28b27]",
    dotColor: "bg-[#d28b27]",
  },
  {
    initials: "TP",
    avatarBg: "bg-[#fbf4e8]",
    avatarColor: "text-[#c8a86b]",
    name: "Thiago Pereira",
    service: "Corte social · Gabriel Santos",
    time: "11:00 – 11:40",
    price: "R$ 40,00",
    status: "Agendado",
    statusBg: "bg-[#eaf2fb]",
    statusColor: "text-[#3478c9]",
    dotColor: "bg-[#3478c9]",
  },
  {
    initials: "DM",
    avatarBg: "bg-[#eaf2fb]",
    avatarColor: "text-[#3478c9]",
    name: "Diego Martins",
    service: "Corte degradê · Felipe Cardoso",
    time: "08:30 – 09:15",
    price: "R$ 45,00",
    status: "Concluído",
    statusBg: "bg-[#e8f7f1]",
    statusColor: "text-[#27865b]",
    dotColor: "bg-[#27865b]",
  },
];

const teamPerformance = [
  { initials: "LO", name: "Lucas Oliveira", value: "R$ 12.400,00", rating: "4.9", progress: 82 },
  { initials: "GS", name: "Gabriel Santos", value: "R$ 9.800,00", rating: "4.7", progress: 65 },
  { initials: "FC", name: "Felipe Cardoso", value: "R$ 7.200,00", rating: "4.6", progress: 48 },
];

const reviews = [
  {
    initials: "JS",
    name: "João Silva",
    stars: 5,
    text: "Serviço impecável, como sempre. Lucas é muito habilidoso e atencioso.",
  },
  {
    initials: "TP",
    name: "Thiago Pereira",
    stars: 4,
    text: "Ótimo atendimento, o ambiente é muito agradável. Recomendo!",
  },
  {
    initials: "RC",
    name: "Rafael Costa",
    stars: 5,
    text: "Sempre saio daqui satisfeito. Melhor barbearia da região!",
  },
];

const lowStock = [
  { name: "Óleo para barba", detail: "3 un · mínimo 5" },
  { name: "Cera de acabamento mate", detail: "2 un · mínimo 5" },
];

const quickActions = [
  { label: "Novo agendamento", icon: CalendarPlus },
  { label: "Cadastrar cliente", icon: UserPlus },
  { label: "Adicionar barbeiro", icon: UserCog },
  { label: "Registrar despesa", icon: DollarSign },
  { label: "Bloquear horário", icon: Clock },
];

const chartDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const chartValues = [11, 12, 8, 15, 18, 25, 0];
const chartMax = 28;

function buildAreaPath(values: number[], width: number, height: number, max: number) {
  const step = width / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - (v / max) * height;
    return [x, y];
  });
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  return { line, area };
}

function TrendIcon({ trend }: { trend: Metric["trend"] }) {
  if (trend === "up") return <ArrowUpRight className="h-3 w-3 text-[#27865b]" />;
  if (trend === "down") return <ArrowDownRight className="h-3 w-3 text-[#c84a4a]" />;
  return <Minus className="h-3 w-3 text-[#686a73]" />;
}

export function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>("Hoje");
  const { line, area } = buildAreaPath(chartValues, 620, 120, chartMax);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm capitalize text-[#686a73]">sexta-feira, 14 de agosto</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#17181d]">Olá, Rafael 👋</h1>
          <p className="text-sm text-[#686a73]">Barbearia Estilo Único</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-[10px] border border-[#e6e4df] bg-white p-1">
            {(["Hoje", "Semana", "Mês"] as Period[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-[8px] px-3 py-1.5 text-xs font-medium transition ${
                  period === p ? "bg-[#6c4cf1] text-white" : "text-[#686a73] hover:bg-[#f4f5f7]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-[10px] bg-[#6c4cf1] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#5b3fe0]"
          >
            <Plus className="h-4 w-4" />
            Novo agendamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2.5">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-[#e6e4df] bg-white p-5">
            <p className="text-sm text-[#686a73]">{metric.label}</p>
            <p className="mt-1 text-2xl font-bold text-[#17181d]">{metric.value}</p>
            <div className="mt-2 flex items-center gap-1">
              <TrendIcon trend={metric.trend} />
              <span
                className={`text-xs font-medium ${
                  metric.trend === "up"
                    ? "text-[#27865b]"
                    : metric.trend === "down"
                    ? "text-[#c84a4a]"
                    : "text-[#686a73]"
                }`}
              >
                {metric.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-[#e6e4df] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#17181d]">Agenda de hoje</h2>
              <p className="text-xs text-[#686a73]">{appointments.length} atendimentos</p>
            </div>
            <button type="button" className="flex items-center gap-1 text-xs text-[#6c4cf1]">
              Ver tudo <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="mt-4 flex flex-col divide-y divide-[#f2f1ec]">
            {appointments.map((apt) => (
              <div key={apt.name} className="flex items-center gap-3 py-3">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${apt.avatarBg} ${apt.avatarColor}`}
                >
                  {apt.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-[#17181d]">{apt.name}</p>
                    <span
                      className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${apt.statusBg} ${apt.statusColor}`}
                    >
                      <span className={`size-1.5 rounded-full ${apt.dotColor}`} />
                      {apt.status}
                    </span>
                  </div>
                  <p className="truncate text-xs text-[#686a73]">{apt.service}</p>
                  <p className="text-xs text-[#686a73]">{apt.time}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-[#17181d]">{apt.price}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#e6e4df] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#17181d]">Desempenho da equipe</h2>
              <p className="text-xs text-[#686a73]">Este mês</p>
            </div>
            <button type="button" className="flex items-center gap-1 text-xs text-[#6c4cf1]">
              Ver tudo <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {teamPerformance.map((member) => (
              <div key={member.name} className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e8f7f1] text-xs font-semibold text-[#27865b]">
                  {member.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-[#17181d]">{member.name}</p>
                    <p className="text-sm font-semibold text-[#17181d]">{member.value}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0efea]">
                      <div className="h-1.5 rounded-full bg-[#6c4cf1]" style={{ width: `${member.progress}%` }} />
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-[#686a73]">
                      <Star className="h-2.5 w-2.5 fill-[#d28b27] text-[#d28b27]" />
                      {member.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-[#e6e4df] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#17181d]">Avaliações recentes</h2>
            <button type="button" className="flex items-center gap-1 text-xs text-[#6c4cf1]">
              Ver tudo <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {reviews.map((review) => (
              <div key={review.name} className="flex gap-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#fbf4e8] text-[10px] font-semibold text-[#c8a86b]">
                  {review.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-[#17181d]">{review.name}</p>
                    <div className="flex items-center gap-px">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-2.5 w-2.5 ${
                            i < review.stars ? "fill-[#d28b27] text-[#d28b27]" : "text-[#e6e4df]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-[#686a73]">{review.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#e6e4df] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#17181d]">Estoque baixo</h2>
            <button type="button" className="flex items-center gap-1 text-xs text-[#6c4cf1]">
              Ver tudo <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {lowStock.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#fdf3e3]">
                  <Package className="h-4 w-4 text-[#d28b27]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#17181d]">{item.name}</p>
                  <p className="text-xs text-[#686a73]">{item.detail}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#fdf3e3] px-2 py-0.5 text-xs font-medium text-[#d28b27]">
                  Baixo
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#e6e4df] bg-white p-5">
          <h2 className="text-sm font-bold text-[#17181d]">Ações rápidas</h2>
          <div className="mt-4 flex flex-col">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className="flex items-center gap-3 rounded-[10px] p-2.5 text-left transition hover:bg-[#f4f5f7]"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#ede9fd]">
                  <action.icon className="h-4 w-4 text-[#6c4cf1]" />
                </span>
                <span className="flex-1 text-sm text-[#17181d]">{action.label}</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#a0a5b1]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#e6e4df] bg-white p-5">
        <h2 className="text-sm font-bold text-[#17181d]">Agendamentos por dia</h2>
        <p className="text-xs text-[#686a73]">Semana atual</p>
        <div className="mt-4 overflow-x-auto">
          <svg viewBox="0 0 620 140" className="w-full min-w-[480px]" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6c4cf1" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#6c4cf1" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#areaFill)" />
            <path d={line} fill="none" stroke="#6c4cf1" strokeWidth="2" />
            {chartDays.map((day, i) => (
              <text
                key={day}
                x={(620 / (chartDays.length - 1)) * i}
                y={135}
                fontSize="11"
                fill="#686a73"
                textAnchor={i === 0 ? "start" : i === chartDays.length - 1 ? "end" : "middle"}
              >
                {day}
              </text>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
