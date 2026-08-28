"use client";

import Link from "next/link";
import { useState } from "react";
import { AreaTrendChart } from "@/components/ui/TrendCharts";
import { StatCard } from "@/components/ui/StatCard";
import { SaudacaoHeader } from "@/components/layout/SaudacaoHeader";
import { Toast, useToast } from "@/components/ui/Toast";
import { BloquearHorarioModal, NovoAgendamentoModal } from "./modals/AgendaModals";
import {
  NovoBarbeiroModal,
  NovoClienteModal,
  RegistrarDespesaModal,
} from "./modals/CadastroModals";
import {
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
    statusColor: "text-[#7247f3]",
    dotColor: "bg-[#7247f3]",
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

/** Qual modal cada ação rápida abre. */
type ModalId =
  | "agendamento"
  | "cliente"
  | "barbeiro"
  | "despesa"
  | "bloqueio";

const quickActions: { label: string; icon: typeof CalendarPlus; modal: ModalId }[] = [
  { label: "Novo agendamento", icon: CalendarPlus, modal: "agendamento" },
  { label: "Cadastrar cliente", icon: UserPlus, modal: "cliente" },
  { label: "Adicionar barbeiro", icon: UserCog, modal: "barbeiro" },
  { label: "Registrar despesa", icon: DollarSign, modal: "despesa" },
  { label: "Bloquear horário", icon: Clock, modal: "bloqueio" },
];

const chartDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const chartValues = [11, 12, 8, 15, 18, 25, 0];

const chartData = chartDays.map((label, i) => ({
  label,
  value: chartValues[i],
  detalhe: `${chartValues[i]} ${chartValues[i] === 1 ? "agendamento" : "agendamentos"}`,
}));

export function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>("Hoje");
  /** null = nenhum modal aberto. */
  const [modalAberto, setModalAberto] = useState<ModalId | null>(null);
  const toast = useToast();

  const fechar = () => setModalAberto(null);

  return (
    <div className="flex flex-col gap-5">
      <SaudacaoHeader
        data="Sexta-feira, 14 de agosto"
        nome="Rafael"
        contexto="Barbearia Estilo Único · Unidade Centro"
        acoes={
          <>
            <div className="flex h-11 items-center gap-1 rounded-[10px] border border-[#e6e4df] bg-white p-1">
              {(["Hoje", "Semana", "Mês"] as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`rounded-[8px] px-3 py-1.5 text-xs font-medium transition ${
                    period === p ? "bg-[#7247f3] text-white" : "text-[#686a73] hover:bg-[#f7f6f2]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setModalAberto("agendamento")}
              className="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#7247f3] px-4 text-sm font-medium text-white transition hover:bg-[#5c2ee0]"
            >
              <Plus className="h-4 w-4" />
              Novo agendamento
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            hint={metric.delta}
            tone={
              metric.trend === "up" ? "positivo" : metric.trend === "down" ? "negativo" : "neutro"
            }
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-[#e6e4df] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#0d1831]">Agenda de hoje</h2>
              <p className="text-xs text-[#686a73]">{appointments.length} atendimentos</p>
            </div>
            <Link href="/admin/agenda" className="flex items-center gap-1 text-xs text-[#7247f3]">
              Ver tudo <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 flex flex-col divide-y divide-[#e6e4df]">
            {appointments.map((apt) => (
              <div key={apt.name} className="flex items-center gap-3 py-3">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${apt.avatarBg} ${apt.avatarColor}`}
                >
                  {apt.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-[#0d1831]">{apt.name}</p>
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
                <p className="shrink-0 text-sm font-semibold text-[#0d1831]">{apt.price}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#e6e4df] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#0d1831]">Desempenho da equipe</h2>
              <p className="text-xs text-[#686a73]">Este mês</p>
            </div>
            <Link href="/admin/equipe" className="flex items-center gap-1 text-xs text-[#7247f3]">
              Ver tudo <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {teamPerformance.map((member) => (
              <div key={member.name} className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e8f7f1] text-xs font-semibold text-[#27865b]">
                  {member.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-[#0d1831]">{member.name}</p>
                    <p className="text-sm font-semibold text-[#0d1831]">{member.value}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0efea]">
                      <div className="h-1.5 rounded-full bg-[#7247f3]" style={{ width: `${member.progress}%` }} />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-[#e6e4df] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0d1831]">Avaliações recentes</h2>
            <Link href="/admin/avaliacoes" className="flex items-center gap-1 text-xs text-[#7247f3]">
              Ver tudo <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {reviews.map((review) => (
              <div key={review.name} className="flex gap-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#fbf4e8] text-[10px] font-semibold text-[#c8a86b]">
                  {review.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-[#0d1831]">{review.name}</p>
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
            <h2 className="text-sm font-bold text-[#0d1831]">Estoque baixo</h2>
            <Link href="/admin/estoque" className="flex items-center gap-1 text-xs text-[#7247f3]">
              Ver tudo <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {lowStock.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#fdf3e3]">
                  <Package className="h-4 w-4 text-[#d28b27]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#0d1831]">{item.name}</p>
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
          <h2 className="text-sm font-bold text-[#0d1831]">Ações rápidas</h2>
          <div className="mt-4 flex flex-col">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => setModalAberto(action.modal)}
                className="flex items-center gap-3 rounded-[10px] p-2.5 text-left transition hover:bg-[#f7f6f2]"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#ede9fd]">
                  <action.icon className="h-4 w-4 text-[#7247f3]" />
                </span>
                <span className="flex-1 text-sm text-[#0d1831]">{action.label}</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#686a73]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#e6e4df] bg-white p-5">
        <h2 className="text-sm font-bold text-[#0d1831]">Agendamentos por dia</h2>
        <p className="text-xs text-[#686a73]">Semana atual</p>
        <div className="mt-4">
          <AreaTrendChart
            data={chartData}
            height={200}
            yWidth={32}
            label={`Agendamentos por dia na semana atual. ${chartData
              .map((d) => `${d.label}: ${d.value}`)
              .join(", ")}.`}
          />
        </div>
      </div>

      <NovoAgendamentoModal
        open={modalAberto === "agendamento"}
        onClose={fechar}
        onConcluir={toast.mostrar}
      />
      <NovoClienteModal
        open={modalAberto === "cliente"}
        onClose={fechar}
        onConcluir={toast.mostrar}
      />
      <NovoBarbeiroModal
        open={modalAberto === "barbeiro"}
        onClose={fechar}
        onConcluir={toast.mostrar}
      />
      <RegistrarDespesaModal
        open={modalAberto === "despesa"}
        onClose={fechar}
        onConcluir={toast.mostrar}
      />
      <BloquearHorarioModal
        open={modalAberto === "bloqueio"}
        onClose={fechar}
        onConcluir={toast.mostrar}
      />

      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
