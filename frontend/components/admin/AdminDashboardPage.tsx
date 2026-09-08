"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AreaTrendChart } from "@/components/ui/TrendCharts";
import { StatCard } from "@/components/ui/StatCard";
import { SaudacaoHeader } from "@/components/layout/SaudacaoHeader";
import { Toast, useToast } from "@/components/ui/Toast";
import { AdminBloquearHorarioModal, AdminNovoAgendamentoModal } from "./modals/AdminAgendaModals";
import {
  NovoBarbeiroModal,
  NovoClienteModal,
  type NovoBarbeiroPayload,
  type NovoClientePayload,
} from "./modals/CadastroModals";
import { apiFetch, ApiError } from "@/lib/api";
import { ChevronRight, Plus, CalendarPlus, UserPlus, UserCog, Clock } from "lucide-react";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const weekdayShort = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });

type DashboardOverview = {
  scheduled: number;
  completed: number;
  canceled: number;
  noShow: number;
  grossAmount: string;
  commissionAmount: string;
};

type AppointmentStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | "NO_SHOW";
type AppointmentResponse = {
  id: string;
  customerId: string;
  barberId: string;
  status: AppointmentStatus;
  startAt: string;
  endAt: string;
  totalAmount: string;
  items: { name: string }[];
};

type CustomerOption = { id: string; fullName: string };
type CustomerPageResponse = { items: CustomerOption[] };
type ServiceOption = { id: string; name: string; durationMinutes: number; price: string };
type BarberOption = { id: string; unitId: string; displayName: string };
type CommissionSummary = { provisionedAmount: string; approvedAmount: string; paidAmount: string };
type TenantResponse = { tradeName: string };

const statusLabels: Record<AppointmentStatus, { label: string; bg: string; text: string; dot: string }> = {
  PENDING: { label: "Pendente", bg: "bg-[#fdf3e3]", text: "text-[#d28b27]", dot: "bg-[#d28b27]" },
  CONFIRMED: { label: "Confirmado", bg: "bg-accent-subtle", text: "text-accent-strong", dot: "bg-accent" },
  CHECKED_IN: { label: "Check-in", bg: "bg-[#e8f7f1]", text: "text-[#27865b]", dot: "bg-[#27865b]" },
  IN_PROGRESS: { label: "Em atendimento", bg: "bg-[#fdf3e3]", text: "text-[#d28b27]", dot: "bg-[#d28b27]" },
  COMPLETED: { label: "Concluído", bg: "bg-[#e8f7f1]", text: "text-[#27865b]", dot: "bg-[#27865b]" },
  CANCELED: { label: "Cancelado", bg: "bg-[#f0efea]", text: "text-[#686a73]", dot: "bg-[#98a2b3]" },
  NO_SHOW: { label: "Falta", bg: "bg-[#fdecee]", text: "text-[#e0333f]", dot: "bg-[#e0333f]" },
};

function toLocalDateTime(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function toIsoDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Qual modal cada ação rápida abre. */
type ModalId = "agendamento" | "cliente" | "barbeiro" | "bloqueio";

const quickActions: { label: string; icon: typeof CalendarPlus; modal: ModalId }[] = [
  { label: "Novo agendamento", icon: CalendarPlus, modal: "agendamento" },
  { label: "Cadastrar cliente", icon: UserPlus, modal: "cliente" },
  { label: "Adicionar barbeiro", icon: UserCog, modal: "barbeiro" },
  { label: "Bloquear horário", icon: Clock, modal: "bloqueio" },
];

export function AdminDashboardPage() {
  const { data: session } = useSession();
  const [modalAberto, setModalAberto] = useState<ModalId | null>(null);
  const toast = useToast();

  const [tenantName, setTenantName] = useState<string>();
  const [overview, setOverview] = useState<DashboardOverview>();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [barbers, setBarbers] = useState<BarberOption[]>([]);
  const [comissaoPorBarbeiro, setComissaoPorBarbeiro] = useState<{ barber: BarberOption; total: number }[]>([]);
  const [chartData, setChartData] = useState<{ label: string; value: number; detalhe: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const customersById = Object.fromEntries(customers.map((c) => [c.id, c.fullName]));
  const barbersById = Object.fromEntries(barbers.map((b) => [b.id, b.displayName]));

  async function carregar() {
    setLoading(true);
    try {
      const today = new Date();
      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      const [tenant, overviewRes, appointmentsRes, customersRes, servicesRes, barbersRes] = await Promise.all([
        apiFetch<TenantResponse>("/tenant"),
        apiFetch<DashboardOverview>(`/dashboard/overview?${new URLSearchParams({ date: toIsoDate(today) })}`),
        apiFetch<AppointmentResponse[]>(
          `/appointments?${new URLSearchParams({ from: toLocalDateTime(todayStart), to: toLocalDateTime(todayEnd) })}`,
        ),
        apiFetch<CustomerPageResponse>("/customers?page=0&size=200"),
        apiFetch<ServiceOption[]>("/services"),
        apiFetch<BarberOption[]>("/barbers"),
      ]);

      setTenantName(tenant.tradeName);
      setOverview(overviewRes);
      setAppointments(appointmentsRes.sort((a, b) => a.startAt.localeCompare(b.startAt)));
      setCustomers(customersRes.items);
      setServices(servicesRes);
      setBarbers(barbersRes);

      // Desempenho da equipe: comissão provisionada+aprovada+paga no mês, por barbeiro.
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const desempenho = await Promise.all(
        barbersRes.map(async (barber) => {
          const summary = await apiFetch<CommissionSummary>(
            `/commissions/summary?${new URLSearchParams({
              barberId: barber.id,
              from: toIsoDate(monthStart),
              to: toIsoDate(monthEnd),
            })}`,
          );
          const total = Number(summary.provisionedAmount) + Number(summary.approvedAmount) + Number(summary.paidAmount);
          return { barber, total };
        }),
      );
      setComissaoPorBarbeiro(desempenho.sort((a, b) => b.total - a.total).slice(0, 5));

      // Agendamentos por dia — semana atual.
      const weekStart = new Date(today);
      const diaSemana = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() + (diaSemana === 0 ? -6 : 1 - diaSemana));
      weekStart.setHours(0, 0, 0, 0);

      const dias = await Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const dia = new Date(weekStart);
          dia.setDate(weekStart.getDate() + i);
          return apiFetch<DashboardOverview>(`/dashboard/overview?${new URLSearchParams({ date: toIsoDate(dia) })}`)
            .then((res) => ({ label: weekdayShort.format(dia).replace(".", ""), value: res.scheduled, detalhe: `${res.scheduled} agendamentos` }));
        }),
      );
      setChartData(dias);

      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar o dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const fechar = () => setModalAberto(null);

  async function criarCliente(payload: NovoClientePayload) {
    await apiFetch("/customers", {
      method: "POST",
      body: {
        fullName: payload.fullName,
        email: payload.email || null,
        phone: payload.phone || null,
        birthDate: payload.birthDate || null,
        notes: payload.notes || null,
        version: 0,
      },
    });
    carregar();
  }

  async function criarBarbeiro(payload: NovoBarbeiroPayload) {
    const unidade = await apiFetch<{ id: string }>("/unit");

    const usuario = await apiFetch<{ id: string }>("/users", {
      method: "POST",
      body: {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: "BARBER",
      },
    });

    await apiFetch("/barbers", {
      method: "POST",
      body: {
        userId: usuario.id,
        unitId: unidade.id,
        displayName: payload.name,
        bio: "",
        defaultCommissionPercent: Number(payload.commission) || 0,
      },
    });
    carregar();
  }

  const metrics = overview
    ? [
        { label: "Faturamento hoje", value: brl.format(Number(overview.grossAmount)), tone: "positivo" as const },
        { label: "Agendamentos", value: String(overview.scheduled), tone: "neutro" as const },
        { label: "Concluídos", value: String(overview.completed), tone: "positivo" as const },
        { label: "Cancelados", value: String(overview.canceled), tone: "negativo" as const },
        { label: "Faltas", value: String(overview.noShow), tone: "atencao" as const },
        { label: "Comissão do dia", value: brl.format(Number(overview.commissionAmount)), tone: "neutro" as const },
      ]
    : [];

  return (
    <div className="flex flex-col gap-5">
      <SaudacaoHeader
        data={weekdayFormatter.format(new Date())}
        nome={session?.user?.name?.split(" ")[0] ?? ""}
        contexto={tenantName ?? ""}
        acoes={
          <button
            type="button"
            onClick={() => setModalAberto("agendamento")}
            className="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-accent px-4 text-sm font-medium text-on-accent transition hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Novo agendamento
          </button>
        }
      />

      {error && <p className="rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(loading ? Array.from({ length: 6 }) : metrics).map((metric, i) => (
          <StatCard
            key={i}
            label={loading ? "…" : (metric as (typeof metrics)[number]).label}
            value={loading ? "…" : (metric as (typeof metrics)[number]).value}
            tone={loading ? "neutro" : (metric as (typeof metrics)[number]).tone}
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
            <Link href="/admin/agenda" className="flex items-center gap-1 text-xs text-accent-strong">
              Ver tudo <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 flex flex-col divide-y divide-[#e6e4df]">
            {loading ? (
              <p className="py-4 text-sm text-[#98a2b3]">Carregando…</p>
            ) : appointments.length === 0 ? (
              <p className="py-4 text-sm text-[#98a2b3]">Nenhum agendamento hoje.</p>
            ) : (
              appointments.map((apt) => {
                const style = statusLabels[apt.status];
                return (
                  <div key={apt.id} className="flex items-center gap-3 py-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f7f6f2] text-xs font-semibold text-[#5f6f87]">
                      {(customersById[apt.customerId] ?? "?").slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-[#0d1831]">{customersById[apt.customerId] ?? "Cliente"}</p>
                        <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                          <span className={`size-1.5 rounded-full ${style.dot}`} />
                          {style.label}
                        </span>
                      </div>
                      <p className="truncate text-xs text-[#686a73]">
                        {apt.items.map((i) => i.name).join(" + ")} · {barbersById[apt.barberId] ?? "Profissional"}
                      </p>
                      <p className="text-xs text-[#686a73]">
                        {timeFormatter.format(new Date(apt.startAt))} – {timeFormatter.format(new Date(apt.endAt))}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-[#0d1831]">{brl.format(Number(apt.totalAmount))}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#e6e4df] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#0d1831]">Desempenho da equipe</h2>
              <p className="text-xs text-[#686a73]">Comissão deste mês</p>
            </div>
            <Link href="/admin/equipe" className="flex items-center gap-1 text-xs text-accent-strong">
              Ver tudo <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {loading ? (
              <p className="text-sm text-[#98a2b3]">Carregando…</p>
            ) : comissaoPorBarbeiro.length === 0 ? (
              <p className="text-sm text-[#98a2b3]">Nenhum barbeiro cadastrado ainda.</p>
            ) : (
              (() => {
                const max = Math.max(...comissaoPorBarbeiro.map((c) => c.total), 1);
                return comissaoPorBarbeiro.map(({ barber, total }) => (
                  <div key={barber.id} className="flex items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e8f7f1] text-xs font-semibold text-[#27865b]">
                      {barber.displayName.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium text-[#0d1831]">{barber.displayName}</p>
                        <p className="text-sm font-semibold text-[#0d1831]">{brl.format(total)}</p>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#f0efea]">
                        <div className="h-1.5 rounded-full bg-accent" style={{ width: `${(total / max) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ));
              })()
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-[#e6e4df] bg-white p-5 lg:col-span-2">
          <h2 className="text-sm font-bold text-[#0d1831]">Agendamentos por dia</h2>
          <p className="text-xs text-[#686a73]">Semana atual</p>
          <div className="mt-4">
            <AreaTrendChart
              data={chartData}
              height={200}
              yWidth={32}
              label={`Agendamentos por dia na semana atual. ${chartData.map((d) => `${d.label}: ${d.value}`).join(", ")}.`}
            />
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
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-subtle">
                  <action.icon className="h-4 w-4 text-accent-strong" />
                </span>
                <span className="flex-1 text-sm text-[#0d1831]">{action.label}</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#686a73]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <AdminNovoAgendamentoModal
        open={modalAberto === "agendamento"}
        onClose={fechar}
        onConcluir={(msg, tom) => {
          toast.mostrar(msg, tom);
          carregar();
        }}
        customers={customers}
        services={services}
        barbers={barbers}
      />
      <NovoClienteModal open={modalAberto === "cliente"} onClose={fechar} onConcluir={toast.mostrar} onCriar={criarCliente} />
      <NovoBarbeiroModal open={modalAberto === "barbeiro"} onClose={fechar} onConcluir={toast.mostrar} onCriar={criarBarbeiro} />
      <AdminBloquearHorarioModal
        open={modalAberto === "bloqueio"}
        onClose={fechar}
        onConcluir={toast.mostrar}
        barbers={barbers}
      />

      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
