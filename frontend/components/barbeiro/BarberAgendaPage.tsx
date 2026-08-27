"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Plus, User } from "lucide-react";

const WEEKDAY_LABELS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const ROW_HEIGHT = 60;
const DAY_START_MINUTES = HOURS[0] * 60;

type Status = "pendente" | "confirmado" | "atendimento" | "bloqueio";

type Appointment = {
  weekday: number; // 0 = segunda ... 6 = domingo
  start: string;
  end: string;
  client: string;
  service: string;
  status: Status;
};

const appointments: Appointment[] = [
  { weekday: 0, start: "09:00", end: "10:00", client: "Carlos", service: "Corte", status: "confirmado" },
  { weekday: 1, start: "09:30", end: "10:30", client: "Gabriel", service: "Barba", status: "confirmado" },
  { weekday: 2, start: "12:00", end: "13:00", client: "Almoço", service: "", status: "bloqueio" },
  { weekday: 4, start: "13:00", end: "14:30", client: "Paulo", service: "Corte + Barba", status: "atendimento" },
  { weekday: 5, start: "10:00", end: "11:30", client: "Marcos", service: "Corte + Barba", status: "pendente" },
];

const statusStyles: Record<Status, { bg: string; border: string; label: string; labelColor: string }> = {
  pendente: { bg: "bg-[#fdf3e3]", border: "border-l-4 border-[#d28b27]", label: "PENDENTE", labelColor: "text-[#d28b27]" },
  confirmado: { bg: "bg-[#ede9fd]", border: "border-l-4 border-[#7247f3]", label: "CONFIRMADO", labelColor: "text-[#7247f3]" },
  atendimento: { bg: "bg-[#e8f7f1]", border: "border-l-4 border-[#27865b]", label: "EM ATENDIMENTO", labelColor: "text-[#27865b]" },
  bloqueio: { bg: "bg-[#f0efea]", border: "border-l-4 border-[#98a2b3] border-dashed", label: "BLOQUEIO", labelColor: "text-[#686a73]" },
};

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
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

const rangeFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const yearFormatter = new Intl.DateTimeFormat("pt-BR", { year: "numeric" });

export function BarberAgendaPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [view, setView] = useState<"dia" | "semana">("semana");

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

  const rangeLabel = `${rangeFormatter.format(weekDays[0])} — ${rangeFormatter.format(weekDays[6])} ${yearFormatter.format(weekDays[6])}`;

  function goToWeek(offset: number) {
    setWeekStart((current) => {
      const next = new Date(current);
      next.setDate(current.getDate() + offset * 7);
      return next;
    });
  }

  function goToToday() {
    setWeekStart(startOfWeek(new Date()));
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
          className="flex items-center gap-2 rounded-[10px] bg-[#7247f3] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#5c2ee0]"
        >
          <Plus size={16} strokeWidth={2.5} />
          Novo agendamento
        </button>
      </div>

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
          onClick={() => goToWeek(-1)}
          aria-label="Semana anterior"
          className="grid size-9 place-items-center rounded-[10px] border border-[#e6e4df] text-[#0d1831] transition hover:bg-[#f7f6f2]"
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => goToWeek(1)}
          aria-label="Próxima semana"
          className="grid size-9 place-items-center rounded-[10px] border border-[#e6e4df] text-[#0d1831] transition hover:bg-[#f7f6f2]"
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
        <p className="text-base font-bold text-[#0d1831]">{rangeLabel}</p>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 rounded-[10px] border border-[#e6e4df] px-3.5 py-2">
            <span className="grid size-8 place-items-center rounded-full bg-[#ede9fd] text-[#7247f3]">
              <User size={15} strokeWidth={2} />
            </span>
            <div className="text-left">
              <p className="text-xs font-bold text-[#0d1831] leading-tight">João Pereira</p>
              <p className="text-[10px] text-[#5f6f87] leading-tight">Minha agenda</p>
            </div>
          </div>

          <div className="rounded-[10px] border border-[#e6e4df] px-3.5 py-2">
            <p className="text-[10px] text-[#5f6f87]">STATUS</p>
            <p className="flex items-center gap-1 text-xs font-bold text-[#0d1831]">
              Todos
              <ChevronDown size={12} strokeWidth={2} />
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-[10px] border border-[#e6e4df] p-1">
            <button
              type="button"
              onClick={() => setView("dia")}
              className={`rounded-[8px] px-3.5 py-1.5 text-sm font-bold transition ${
                view === "dia" ? "bg-[#7247f3] text-white" : "text-[#0d1831]"
              }`}
            >
              Dia
            </button>
            <button
              type="button"
              onClick={() => setView("semana")}
              className={`rounded-[8px] px-3.5 py-1.5 text-sm font-bold transition ${
                view === "semana" ? "bg-[#7247f3] text-white" : "text-[#0d1831]"
              }`}
            >
              Semana
            </button>
          </div>
        </div>
      </div>

      {view === "dia" ? (
        <div className="grid place-items-center rounded-[12px] border border-[#e6e4df] bg-white p-16 text-center">
          <p className="text-sm text-[#98a2b3]">A visualização por dia chega em breve. Use a visualização Semana por enquanto.</p>
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
                        isToday ? "bg-[#7247f3] text-white" : "text-[#0d1831]"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {isToday && <span className="text-[10px] font-bold text-[#7247f3]">HOJE</span>}
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
                    className="flex items-start justify-end border-b border-[#eef0f3] pr-2 pt-[-8px] text-[11px] text-[#98a2b3]"
                  >
                    {String(hour).padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              {WEEKDAY_LABELS.map((_, dayIndex) => {
                const isSunday = dayIndex === 6;
                const dayAppointments = appointments.filter((item) => item.weekday === dayIndex);

                return (
                  <div
                    key={dayIndex}
                    className="relative border-l border-[#e6e4df]"
                    style={{ height: ROW_HEIGHT * (HOURS.length - 1) }}
                  >
                    {HOURS.slice(0, -1).map((hour) => (
                      <div
                        key={hour}
                        className="border-b border-[#eef0f3]"
                        style={{ height: ROW_HEIGHT }}
                      />
                    ))}

                    {isSunday && (
                      <div className="absolute inset-2 grid place-items-center rounded-[10px] bg-[#f7f6f2]">
                        <span className="text-[11px] font-bold text-[#5f6f87]">Fechado</span>
                      </div>
                    )}

                    {dayAppointments.map((item) => {
                      const top = ((toMinutes(item.start) - DAY_START_MINUTES) / 60) * ROW_HEIGHT;
                      const height = ((toMinutes(item.end) - toMinutes(item.start)) / 60) * ROW_HEIGHT;
                      const style = statusStyles[item.status];
                      return (
                        <div
                          key={`${item.weekday}-${item.start}`}
                          className={`absolute inset-x-1 overflow-hidden rounded-md ${style.bg} ${style.border} px-2 py-1`}
                          style={{ top, height: Math.max(height, 32) }}
                        >
                          <p className={`text-[9px] font-bold ${style.labelColor}`}>
                            {item.start} • {style.label}
                          </p>
                          <p className="truncate text-[11px] font-bold text-[#0d1831]">
                            {item.client}
                            {item.service && ` • ${item.service}`}
                          </p>
                          <p className="text-[9px] text-[#5f6f87]">até {item.end}</p>
                        </div>
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
                <span className="size-2.5 rounded-full bg-[#7247f3]" /> Confirmado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#27865b]" /> Em atendimento
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded border border-dashed border-[#98a2b3]" /> Bloqueio
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
