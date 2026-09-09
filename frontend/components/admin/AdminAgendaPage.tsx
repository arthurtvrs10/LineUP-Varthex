"use client";

import { useEffect, useMemo, useState } from "react";
import { Toast, useToast } from "@/components/ui/Toast";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { AdminBloquearHorarioModal, AdminNovoAgendamentoModal } from "./modals/AdminAgendaModals";
import { AppointmentDetailModal } from "@/components/ui/AppointmentDetailModal";
import { apiFetch, ApiError } from "@/lib/api";
import { Plus, ChevronLeft, ChevronRight, Search } from "lucide-react";

const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

type AppointmentStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | "NO_SHOW";

type AppointmentResponse = {
  id: string;
  customerId: string;
  barberId: string;
  status: AppointmentStatus;
  channel: string;
  startAt: string;
  endAt: string;
  totalAmount: string;
  notes: string | null;
  items: { serviceId: string; name: string }[];
};

type BarberOption = { id: string; unitId: string; displayName: string };
type CustomerOption = { id: string; fullName: string };
type CustomerPageResponse = { items: CustomerOption[] };
type ServiceOption = { id: string; name: string; durationMinutes: number; price: string };

const statusStyles: Record<AppointmentStatus, { bg: string; border: string; label: string; labelColor: string }> = {
  PENDING: { bg: "bg-[#fdf3e3]", border: "border border-[#d28b27]/30", label: "Pendente", labelColor: "text-[#d28b27]" },
  CONFIRMED: { bg: "bg-accent-subtle", border: "border border-accent/20", label: "Confirmado", labelColor: "text-accent-strong" },
  CHECKED_IN: { bg: "bg-[#e8f7f1]", border: "border border-[#27865b]/20", label: "Check-in", labelColor: "text-[#27865b]" },
  IN_PROGRESS: { bg: "bg-[#e8f7f1]", border: "border border-[#27865b]/20", label: "Em atendimento", labelColor: "text-[#27865b]" },
  COMPLETED: { bg: "bg-[#f0efea]", border: "border border-[#98a2b3]/30", label: "Concluído", labelColor: "text-[#686a73]" },
  CANCELED: { bg: "bg-[#f0efea]", border: "border border-dashed border-[#98a2b3]/40", label: "Cancelado", labelColor: "text-[#98a2b3]" },
  NO_SHOW: { bg: "bg-[#fdecee]", border: "border border-[#e0333f]/30", label: "Falta", labelColor: "text-[#e0333f]" },
};

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

function toLocalDateTime(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function toMinutes(iso: string) {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

export function AdminAgendaPage() {
  const [modalAberto, setModalAberto] = useState<"agendamento" | "bloqueio" | null>(null);
  const [filtroBarbeiro, setFiltroBarbeiro] = useState("Todos os barbeiros");
  const [filtroStatus, setFiltroStatus] = useState("Todos os status");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const toast = useToast();

  const [barbers, setBarbers] = useState<BarberOption[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [detalhe, setDetalhe] = useState<AppointmentResponse | null>(null);

  const customersById = Object.fromEntries(customers.map((c) => [c.id, c.fullName]));
  const barbersById = Object.fromEntries(barbers.map((b) => [b.id, b.displayName]));

  useEffect(() => {
    async function carregarBase() {
      try {
        const [barbersRes, customersRes, servicesRes] = await Promise.all([
          apiFetch<BarberOption[]>("/barbers"),
          apiFetch<CustomerPageResponse>("/customers?page=0&size=200"),
          apiFetch<ServiceOption[]>("/services"),
        ]);
        setBarbers(barbersRes);
        setCustomers(customersRes.items);
        setServices(servicesRes);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Não foi possível carregar os dados da equipe.");
      }
    }
    carregarBase();
  }, []);

  async function carregarAgenda() {
    setLoading(true);
    try {
      const from = toLocalDateTime(date);
      const to = toLocalDateTime(new Date(date.getTime() + 24 * 60 * 60 * 1000));
      const items = await apiFetch<AppointmentResponse[]>(`/appointments?${new URLSearchParams({ from, to })}`);
      setAppointments(items);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar a agenda.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarAgenda();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function executarAcao(appointmentId: string, action: string) {
    try {
      await apiFetch(`/appointments/${appointmentId}/${action}`, { method: "POST" });
      toast.mostrar("Agendamento atualizado.");
      await carregarAgenda();
    } catch (err) {
      toast.mostrar(err instanceof ApiError ? err.message : "Não foi possível atualizar o agendamento.", "erro");
      throw err;
    }
  }

  const barbersFiltrados = useMemo(
    () => (filtroBarbeiro === "Todos os barbeiros" ? barbers : barbers.filter((b) => b.displayName === filtroBarbeiro)),
    [barbers, filtroBarbeiro],
  );

  const statusPorLabel: Record<string, AppointmentStatus> = {
    Pendente: "PENDING",
    Confirmado: "CONFIRMED",
    "Check-in": "CHECKED_IN",
    "Em atendimento": "IN_PROGRESS",
    Concluído: "COMPLETED",
    Cancelado: "CANCELED",
    Falta: "NO_SHOW",
  };

  const appointmentsFiltrados = useMemo(() => {
    return appointments.filter((apt) => {
      if (filtroStatus !== "Todos os status" && apt.status !== statusPorLabel[filtroStatus]) return false;
      if (search.trim()) {
        const nome = (customersById[apt.customerId] ?? "").toLowerCase();
        if (!nome.includes(search.trim().toLowerCase())) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, filtroStatus, search, customersById]);

  function findAppointmentsInHour(hour: string, barberId: string) {
    const hh = Number(hour.split(":")[0]);
    return appointmentsFiltrados.filter((a) => a.barberId === barberId && Math.floor(toMinutes(a.startAt) / 60) === hh);
  }

  const resumo = [
    { label: "Pendente", value: appointmentsFiltrados.filter((a) => a.status === "PENDING").length, bg: statusStyles.PENDING.bg, labelColor: statusStyles.PENDING.labelColor },
    { label: "Confirmado", value: appointmentsFiltrados.filter((a) => a.status === "CONFIRMED").length, bg: statusStyles.CONFIRMED.bg, labelColor: statusStyles.CONFIRMED.labelColor },
    { label: "Em atendimento", value: appointmentsFiltrados.filter((a) => a.status === "IN_PROGRESS" || a.status === "CHECKED_IN").length, bg: statusStyles.IN_PROGRESS.bg, labelColor: statusStyles.IN_PROGRESS.labelColor },
    { label: "Concluído", value: appointmentsFiltrados.filter((a) => a.status === "COMPLETED").length, bg: statusStyles.COMPLETED.bg, labelColor: statusStyles.COMPLETED.labelColor },
  ];

  const concluidos = appointmentsFiltrados.filter((a) => a.status === "COMPLETED");
  const faturamento = concluidos.reduce((sum, a) => sum + Number(a.totalAmount), 0);

  return (
    <div className="flex w-full flex-col items-start">
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="font-['Manrope',sans-serif] text-2xl font-bold tracking-[-0.48px] text-[#0d1831]">Agenda</h1>
          <p className="pt-0.5 text-sm text-[#686a73]">Gerencie todos os agendamentos</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalAberto("bloqueio")}
            className="flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-4 text-sm font-medium text-[#0d1831] transition hover:bg-[#f7f6f2]"
          >
            Bloquear horário
          </button>
          <button
            type="button"
            onClick={() => setModalAberto("agendamento")}
            className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-accent px-4 text-sm font-medium text-on-accent transition hover:bg-accent-hover"
          >
            <Plus size={16} strokeWidth={2} />
            Novo agendamento
          </button>
        </div>
      </div>

      {error && <p className="mt-4 w-full rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">{error}</p>}

      <div className="flex w-full flex-wrap items-center gap-3 pt-6">
        <div className="flex flex-1 items-center gap-2">
          <button
            type="button"
            aria-label="Dia anterior"
            onClick={() => setDate((d) => new Date(d.getTime() - 24 * 60 * 60 * 1000))}
            className="grid size-9 place-items-center rounded-[10px] border border-[#e6e4df] bg-white text-[#686a73] transition hover:bg-[#f7f6f2]"
          >
            <ChevronLeft size={16} strokeWidth={1.8} />
          </button>
          <span className="px-2 text-sm font-medium text-[#0d1831]">{dateFormatter.format(date)}</span>
          <button
            type="button"
            aria-label="Próximo dia"
            onClick={() => setDate((d) => new Date(d.getTime() + 24 * 60 * 60 * 1000))}
            className="grid size-9 place-items-center rounded-[10px] border border-[#e6e4df] bg-white text-[#686a73] transition hover:bg-[#f7f6f2]"
          >
            <ChevronRight size={16} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => {
              const d = new Date();
              d.setHours(0, 0, 0, 0);
              setDate(d);
            }}
            className="rounded-[10px] border border-[#e6e4df] bg-white px-3 py-1.5 text-xs font-medium text-[#0d1831] transition hover:bg-[#f7f6f2]"
          >
            Hoje
          </button>
        </div>

        <div className="flex h-9 w-48 items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-3">
          <Search size={15} strokeWidth={1.8} className="text-[#b0afa8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full bg-transparent text-sm text-[#0d1831] placeholder:text-[#b0afa8] focus:outline-none"
          />
        </div>

        <FilterSelect
          label="Filtrar por barbeiro"
          className="w-[178px]"
          options={["Todos os barbeiros", ...barbers.map((b) => b.displayName)]}
          value={filtroBarbeiro}
          onChange={setFiltroBarbeiro}
        />
        <FilterSelect
          label="Filtrar por status"
          className="w-[164px]"
          options={["Todos os status", "Pendente", "Confirmado", "Check-in", "Em atendimento", "Concluído", "Cancelado", "Falta"]}
          value={filtroStatus}
          onChange={setFiltroStatus}
        />
      </div>

      <div className="grid w-full grid-cols-1 gap-4 pt-6 lg:grid-cols-4">
        <div className="overflow-x-auto rounded-[12px] border border-[#e6e4df] bg-white lg:col-span-3">
          <div className="min-w-[560px]">
            <div
              className="grid border-b border-[#e6e4df] bg-[#f7f6f2]"
              style={{ gridTemplateColumns: `120px repeat(${Math.max(barbersFiltrados.length, 1)}, 1fr)` }}
            >
              <div className="p-3">
                <p className="text-xs text-[#686a73]">Horário</p>
              </div>
              {barbersFiltrados.length === 0 ? (
                <div className="border-l border-[#e6e4df] p-3">
                  <p className="text-xs text-[#98a2b3]">Nenhum barbeiro</p>
                </div>
              ) : (
                barbersFiltrados.map((barber) => (
                  <div key={barber.id} className="flex items-center gap-2 border-l border-[#e6e4df] p-3">
                    <span className="grid size-6 place-items-center rounded-full bg-accent-subtle text-xs font-semibold text-accent-strong">
                      {barber.displayName.slice(0, 2).toUpperCase()}
                    </span>
                    <p className="truncate text-xs font-medium text-[#0d1831]">{barber.displayName}</p>
                  </div>
                ))
              )}
            </div>

            {loading ? (
              <p className="p-6 text-center text-sm text-[#98a2b3]">Carregando agenda…</p>
            ) : (
              HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid min-h-[64px] border-b border-[#e6e4df] last:border-b-0"
                  style={{ gridTemplateColumns: `120px repeat(${Math.max(barbersFiltrados.length, 1)}, 1fr)` }}
                >
                  <div className="border-r border-[#e6e4df] p-3">
                    <p className="text-xs text-[#686a73]">{hour}</p>
                  </div>
                  {barbersFiltrados.map((barber) => {
                    const appts = findAppointmentsInHour(hour, barber.id);
                    return (
                      <div key={barber.id} className="flex flex-col gap-1 border-l border-[#e6e4df] p-1">
                        {appts.map((appt) => {
                          const style = statusStyles[appt.status];
                          return (
                            <button
                              key={appt.id}
                              type="button"
                              onClick={() => setDetalhe(appt)}
                              className={`rounded-[8px] ${style.border} ${style.bg} p-2 text-left transition hover:brightness-95`}
                            >
                              <p className={`text-[9px] font-semibold uppercase ${style.labelColor}`}>
                                {timeFormatter.format(new Date(appt.startAt))} · {style.label}
                              </p>
                              <p className="truncate text-xs font-medium text-[#0d1831]">
                                {customersById[appt.customerId] ?? "Cliente"}
                              </p>
                              <p className="truncate text-[11px] text-[#686a73]">{appt.items.map((i) => i.name).join(" + ")}</p>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-4">
            <h3 className="font-['Manrope',sans-serif] text-sm font-bold tracking-[-0.28px] text-[#0d1831]">Resumo do dia</h3>
            <div className="flex flex-col gap-2 pt-3">
              {resumo.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <p className="text-xs text-[#686a73]">{item.label}</p>
                  <span className={`rounded-full ${item.bg} px-2 py-0.5 text-xs font-medium ${item.labelColor}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-4">
            <h3 className="font-['Manrope',sans-serif] text-sm font-bold tracking-[-0.28px] text-[#0d1831]">Faturamento</h3>
            <p className="pt-3 font-['Manrope',sans-serif] text-2xl font-bold text-[#0d1831]">{brl.format(faturamento)}</p>
            <p className="pt-1 text-xs text-[#686a73]">{concluidos.length} atendimento(s) concluído(s)</p>
          </div>
        </div>
      </div>

      <AdminNovoAgendamentoModal
        open={modalAberto === "agendamento"}
        onClose={() => setModalAberto(null)}
        onConcluir={(msg, tom) => {
          toast.mostrar(msg, tom);
          carregarAgenda();
        }}
        customers={customers}
        services={services}
        barbers={barbers}
      />
      <AdminBloquearHorarioModal
        open={modalAberto === "bloqueio"}
        onClose={() => setModalAberto(null)}
        onConcluir={toast.mostrar}
        barbers={barbers}
      />

      <AppointmentDetailModal
        open={detalhe !== null}
        onClose={() => setDetalhe(null)}
        appointment={
          detalhe && {
            id: detalhe.id,
            status: detalhe.status,
            channel: detalhe.channel,
            startAt: detalhe.startAt,
            endAt: detalhe.endAt,
            totalAmount: detalhe.totalAmount,
            notes: detalhe.notes,
            items: detalhe.items,
            clientName: customersById[detalhe.customerId] ?? "Cliente",
            barberName: barbersById[detalhe.barberId] ?? "Profissional",
          }
        }
        onAction={executarAcao}
      />

      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
