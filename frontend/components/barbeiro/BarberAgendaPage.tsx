"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, User } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { Toast, useToast } from "@/components/ui/Toast";
import {
  NovoAgendamentoModal,
  type CustomerOption,
  type NovoAgendamentoPayload,
  type ServiceOption,
} from "./modals/NovoAgendamentoModal";
import { AppointmentDetailModal, type AppointmentDetail } from "@/components/ui/AppointmentDetailModal";

const WEEKDAY_LABELS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const ROW_HEIGHT = 60;
const DAY_START_MINUTES = HOURS[0] * 60;

type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED"
  | "NO_SHOW";

type AppointmentResponse = {
  id: string;
  unitId: string;
  customerId: string;
  barberId: string;
  status: AppointmentStatus;
  channel: string;
  startAt: string;
  endAt: string;
  totalAmount: string;
  notes: string | null;
  items: { id: string; serviceId: string; name: string; durationMinutes: number }[];
  version: number;
};

type BarberMeResponse = { id: string; unitId: string; displayName: string };
type CustomerResponse = { id: string; fullName: string };
type CustomerPageResponse = { items: CustomerResponse[]; page: { totalElements: number } };
type ServiceResponse = { id: string; name: string; durationMinutes: number; price: string };

const statusStyles: Record<
  AppointmentStatus,
  { bg: string; border: string; label: string; labelColor: string }
> = {
  PENDING: { bg: "bg-[#fdf3e3]", border: "border-l-4 border-[#d28b27]", label: "PENDENTE", labelColor: "text-[#d28b27]" },
  CONFIRMED: { bg: "bg-accent-subtle", border: "border-l-4 border-accent", label: "CONFIRMADO", labelColor: "text-accent-strong" },
  CHECKED_IN: { bg: "bg-[#e8f7f1]", border: "border-l-4 border-[#27865b]", label: "CHECK-IN", labelColor: "text-[#27865b]" },
  IN_PROGRESS: { bg: "bg-[#e8f7f1]", border: "border-l-4 border-[#27865b]", label: "EM ATENDIMENTO", labelColor: "text-[#27865b]" },
  COMPLETED: { bg: "bg-[#f0efea]", border: "border-l-4 border-[#686a73]", label: "CONCLUÍDO", labelColor: "text-[#686a73]" },
  CANCELED: { bg: "bg-[#f0efea]", border: "border-l-4 border-[#98a2b3] border-dashed", label: "CANCELADO", labelColor: "text-[#98a2b3]" },
  NO_SHOW: { bg: "bg-[#fdecee]", border: "border-l-4 border-[#e0333f]", label: "FALTA", labelColor: "text-[#e0333f]" },
};

function toMinutes(iso: string) {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function toLocalDateTime(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

const rangeFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const dayLabelFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
const yearFormatter = new Intl.DateTimeFormat("pt-BR", { year: "numeric" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function BarberAgendaPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [view, setView] = useState<"dia" | "semana">("semana");
  const [barber, setBarber] = useState<BarberMeResponse>();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [customersById, setCustomersById] = useState<Record<string, string>>({});
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [novoAberto, setNovoAberto] = useState(false);
  const [detalhe, setDetalhe] = useState<AppointmentResponse | null>(null);
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const toast = useToast();

  const today = useMemo(() => new Date(), []);

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        return date;
      }),
    [weekStart],
  );

  const rangeLabel =
    view === "dia"
      ? dayLabelFormatter.format(selectedDay)
      : `${rangeFormatter.format(weekDays[0])} — ${rangeFormatter.format(weekDays[6])} ${yearFormatter.format(weekDays[6])}`;

  const dayAppointments = useMemo(
    () => appointments.filter((item) => isSameDay(new Date(item.startAt), selectedDay)),
    [appointments, selectedDay],
  );

  useEffect(() => {
    async function carregarBase() {
      try {
        const [me, customerPage, services] = await Promise.all([
          apiFetch<BarberMeResponse>("/barbers/me"),
          apiFetch<CustomerPageResponse>("/customers?page=0&size=200"),
          apiFetch<ServiceResponse[]>("/services"),
        ]);
        setBarber(me);
        setCustomerOptions(customerPage.items.map((c) => ({ id: c.id, fullName: c.fullName })));
        setCustomersById(Object.fromEntries(customerPage.items.map((c) => [c.id, c.fullName])));
        setServiceOptions(services.map((s) => ({ id: s.id, name: s.name, durationMinutes: s.durationMinutes, price: s.price })));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Não foi possível carregar seus dados de barbeiro.");
      }
    }
    carregarBase();
  }, []);

  async function carregarAgenda(barberId: string) {
    setLoading(true);
    try {
      const from = toLocalDateTime(weekDays[0]);
      const to = toLocalDateTime(new Date(weekDays[6].getTime() + 24 * 60 * 60 * 1000));
      const params = new URLSearchParams({ barberId, from, to });
      const items = await apiFetch<AppointmentResponse[]>(`/appointments?${params.toString()}`);
      setAppointments(items);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar a agenda.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (barber) carregarAgenda(barber.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barber, weekStart]);

  async function criarAgendamento(payload: NovoAgendamentoPayload) {
    if (!barber) return;
    const [hours, minutes] = payload.time.split(":").map(Number);
    const [year, month, day] = payload.date.split("-").map(Number);
    const startAt = new Date(year, month - 1, day, hours, minutes, 0);

    await apiFetch("/appointments", {
      method: "POST",
      body: {
        unitId: barber.unitId,
        customerId: payload.customerId,
        barberId: barber.id,
        startAt: toLocalDateTime(startAt),
        channel: "BARBER",
        notes: payload.notes || null,
        items: [{ serviceId: payload.serviceId }],
      },
    });
    await carregarAgenda(barber.id);
  }

  async function executarAcao(appointmentId: string, action: string) {
    try {
      await apiFetch(`/appointments/${appointmentId}/${action}`, { method: "POST" });
      toast.mostrar("Agendamento atualizado.");
      if (barber) await carregarAgenda(barber.id);
    } catch (err) {
      toast.mostrar(err instanceof ApiError ? err.message : "Não foi possível atualizar o agendamento.", "erro");
      throw err;
    }
  }

  function goToWeek(offset: number) {
    setWeekStart((current) => {
      const next = new Date(current);
      next.setDate(current.getDate() + offset * 7);
      return next;
    });
  }

  function goToDay(offset: number) {
    setSelectedDay((current) => {
      const next = new Date(current);
      next.setDate(current.getDate() + offset);
      setWeekStart(startOfWeek(next));
      return next;
    });
  }

  function goToToday() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    setWeekStart(startOfWeek(now));
    setSelectedDay(now);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-[#0d1831]">Agenda</h1>
          <p className="mt-1 text-sm text-[#5f6f87]">Acompanhe seus horários, atendimentos e bloqueios.</p>
        </div>
        <button
          type="button"
          onClick={() => setNovoAberto(true)}
          disabled={!barber}
          className="flex items-center gap-2 rounded-[10px] bg-accent px-5 py-3 text-sm font-bold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={16} strokeWidth={2.5} />
          Novo agendamento
        </button>
      </div>

      {error && (
        <p className="rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 rounded-[12px] border border-[#e6e4df] bg-white p-4">
        <button
          type="button"
          onClick={goToToday}
          className="rounded-[10px] border border-[#e6e4df] px-3.5 py-2 text-sm font-bold text-[#0d1831] transition hover:bg-[#f7f6f2]"
        >
          Hoje
        </button>
        <button
          type="button"
          onClick={() => (view === "dia" ? goToDay(-1) : goToWeek(-1))}
          aria-label={view === "dia" ? "Dia anterior" : "Semana anterior"}
          className="grid size-9 place-items-center rounded-[10px] border border-[#e6e4df] text-[#0d1831] transition hover:bg-[#f7f6f2]"
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => (view === "dia" ? goToDay(1) : goToWeek(1))}
          aria-label={view === "dia" ? "Próximo dia" : "Próxima semana"}
          className="grid size-9 place-items-center rounded-[10px] border border-[#e6e4df] text-[#0d1831] transition hover:bg-[#f7f6f2]"
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
        <p className="text-base font-bold capitalize text-[#0d1831]">{rangeLabel}</p>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 rounded-[10px] border border-[#e6e4df] px-3.5 py-2">
            <span className="grid size-8 place-items-center rounded-full bg-accent-subtle text-accent-strong">
              <User size={15} strokeWidth={2} />
            </span>
            <div className="text-left">
              <p className="text-xs font-bold text-[#0d1831] leading-tight">{barber?.displayName ?? "Carregando…"}</p>
              <p className="text-[10px] text-[#5f6f87] leading-tight">Minha agenda</p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-[10px] border border-[#e6e4df] p-1">
            <button
              type="button"
              onClick={() => setView("dia")}
              className={`rounded-[8px] px-3.5 py-1.5 text-sm font-bold transition ${
                view === "dia" ? "bg-accent text-on-accent" : "text-[#0d1831]"
              }`}
            >
              Dia
            </button>
            <button
              type="button"
              onClick={() => setView("semana")}
              className={`rounded-[8px] px-3.5 py-1.5 text-sm font-bold transition ${
                view === "semana" ? "bg-accent text-on-accent" : "text-[#0d1831]"
              }`}
            >
              Semana
            </button>
          </div>
        </div>
      </div>

      {view === "dia" ? (
        <div className="overflow-x-auto rounded-[12px] border border-[#e6e4df] bg-white">
          <div className="min-w-[420px]">
            <div className="grid grid-cols-[64px_1fr] border-b border-[#e6e4df]">
              <div className="flex items-end justify-center pb-2 text-[11px] text-[#98a2b3]">GMT−3</div>
              <div className="flex flex-col items-center gap-1 border-l border-[#e6e4df] py-3">
                <span className="text-xs font-bold text-[#5f6f87]">{WEEKDAY_LABELS[(selectedDay.getDay() + 6) % 7]}</span>
                <span
                  className={`grid size-8 place-items-center rounded-full text-lg font-bold ${
                    isSameDay(selectedDay, today) ? "bg-accent text-on-accent" : "text-[#0d1831]"
                  }`}
                >
                  {selectedDay.getDate()}
                </span>
                {isSameDay(selectedDay, today) && <span className="text-[10px] font-bold text-accent-strong">HOJE</span>}
              </div>
            </div>

            <div className="grid grid-cols-[64px_1fr]">
              <div>
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    style={{ height: ROW_HEIGHT }}
                    className="flex items-start justify-end border-b border-[#eef0f3] pr-2 text-[11px] text-[#98a2b3]"
                  >
                    {String(hour).padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              <div className="relative border-l border-[#e6e4df]" style={{ height: ROW_HEIGHT * (HOURS.length - 1) }}>
                {HOURS.slice(0, -1).map((hour) => (
                  <div key={hour} className="border-b border-[#eef0f3]" style={{ height: ROW_HEIGHT }} />
                ))}

                {selectedDay.getDay() === 0 && dayAppointments.length === 0 && (
                  <div className="absolute inset-2 grid place-items-center rounded-[10px] bg-[#f7f6f2]">
                    <span className="text-[11px] font-bold text-[#5f6f87]">Fechado</span>
                  </div>
                )}

                {selectedDay.getDay() !== 0 && !loading && dayAppointments.length === 0 && (
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="text-xs text-[#98a2b3]">Nenhum agendamento nesse dia.</span>
                  </div>
                )}

                {dayAppointments.map((item) => {
                  const top = ((toMinutes(item.startAt) - DAY_START_MINUTES) / 60) * ROW_HEIGHT;
                  const height = ((toMinutes(item.endAt) - toMinutes(item.startAt)) / 60) * ROW_HEIGHT;
                  const style = statusStyles[item.status];
                  const clientName = customersById[item.customerId] ?? "Cliente";
                  const serviceNames = item.items.map((i) => i.name).join(" + ");

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDetalhe(item)}
                      className={`absolute inset-x-2 overflow-hidden rounded-md ${style.bg} ${style.border} px-3 py-1.5 text-left transition hover:brightness-95`}
                      style={{ top, height: Math.max(height, 46) }}
                    >
                      <p className={`text-[10px] font-bold ${style.labelColor}`}>
                        {timeFormatter.format(new Date(item.startAt))} • {style.label}
                      </p>
                      <p className="truncate text-xs font-bold text-[#0d1831]">
                        {clientName}
                        {serviceNames && ` • ${serviceNames}`}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 border-t border-[#e6e4df] px-4 py-3 text-xs text-[#5f6f87]">
              <span className="font-bold text-[#5f6f87]">Legenda</span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#d28b27]" /> Pendente
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-accent" /> Confirmado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#27865b]" /> Check-in / Atendimento
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#e0333f]" /> Falta
              </span>
              {loading && <span className="ml-auto text-[#98a2b3]">Carregando…</span>}
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[12px] border border-[#e6e4df] bg-white">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-[#e6e4df]">
              <div className="flex items-end justify-center pb-2 text-[11px] text-[#98a2b3]">GMT−3</div>
              {weekDays.map((date, index) => {
                const isToday = isSameDay(date, today);
                return (
                  <div key={index} className="flex flex-col items-center gap-1 border-l border-[#e6e4df] py-3">
                    <span className="text-xs font-bold text-[#5f6f87]">{WEEKDAY_LABELS[index]}</span>
                    <span
                      className={`grid size-8 place-items-center rounded-full text-lg font-bold ${
                        isToday ? "bg-accent text-on-accent" : "text-[#0d1831]"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {isToday && <span className="text-[10px] font-bold text-accent-strong">HOJE</span>}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-[64px_repeat(7,1fr)]">
              <div>
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    style={{ height: ROW_HEIGHT }}
                    className="flex items-start justify-end border-b border-[#eef0f3] pr-2 text-[11px] text-[#98a2b3]"
                  >
                    {String(hour).padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              {weekDays.map((dayDate, dayIndex) => {
                const isSunday = dayIndex === 6;
                const dayAppointments = appointments.filter((item) => isSameDay(new Date(item.startAt), dayDate));

                return (
                  <div
                    key={dayIndex}
                    className="relative border-l border-[#e6e4df]"
                    style={{ height: ROW_HEIGHT * (HOURS.length - 1) }}
                  >
                    {HOURS.slice(0, -1).map((hour) => (
                      <div key={hour} className="border-b border-[#eef0f3]" style={{ height: ROW_HEIGHT }} />
                    ))}

                    {isSunday && dayAppointments.length === 0 && (
                      <div className="absolute inset-2 grid place-items-center rounded-[10px] bg-[#f7f6f2]">
                        <span className="text-[11px] font-bold text-[#5f6f87]">Fechado</span>
                      </div>
                    )}

                    {dayAppointments.map((item) => {
                      const top = ((toMinutes(item.startAt) - DAY_START_MINUTES) / 60) * ROW_HEIGHT;
                      const height = ((toMinutes(item.endAt) - toMinutes(item.startAt)) / 60) * ROW_HEIGHT;
                      const style = statusStyles[item.status];
                      const clientName = customersById[item.customerId] ?? "Cliente";
                      const serviceNames = item.items.map((i) => i.name).join(" + ");

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setDetalhe(item)}
                          className={`absolute inset-x-1 overflow-hidden rounded-md ${style.bg} ${style.border} px-2 py-1 text-left transition hover:brightness-95`}
                          style={{ top, height: Math.max(height, 46) }}
                        >
                          <p className={`text-[9px] font-bold ${style.labelColor}`}>
                            {timeFormatter.format(new Date(item.startAt))} • {style.label}
                          </p>
                          <p className="truncate text-[11px] font-bold text-[#0d1831]">
                            {clientName}
                            {serviceNames && ` • ${serviceNames}`}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-5 border-t border-[#e6e4df] px-4 py-3 text-xs text-[#5f6f87]">
              <span className="font-bold text-[#5f6f87]">Legenda</span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#d28b27]" /> Pendente
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-accent" /> Confirmado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#27865b]" /> Check-in / Atendimento
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#e0333f]" /> Falta
              </span>
              {loading && <span className="ml-auto text-[#98a2b3]">Carregando…</span>}
            </div>
          </div>
        </div>
      )}

      {barber && (
        <NovoAgendamentoModal
          open={novoAberto}
          onClose={() => setNovoAberto(false)}
          onConcluir={toast.mostrar}
          onCriar={criarAgendamento}
          customers={customerOptions}
          services={serviceOptions}
          barberId={barber.id}
        />
      )}
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
          }
        }
        onAction={executarAcao}
      />

      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
