"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";

const WEEKDAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

const BOOKED_APPOINTMENT = { day: 19, month: 7, year: 2026, label: "Corte · 15:30" };

type DayCell = {
  date: Date;
  inCurrentMonth: boolean;
};

function buildMonthGrid(monthDate: Date): DayCell[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return { date, inCurrentMonth: date.getMonth() === month };
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayStatus(date: Date) {
  const isBooked =
    date.getDate() === BOOKED_APPOINTMENT.day &&
    date.getMonth() === BOOKED_APPOINTMENT.month &&
    date.getFullYear() === BOOKED_APPOINTMENT.year;
  if (isBooked) return "booked" as const;
  if (date.getDay() === 0) return "closed" as const;
  return "available" as const;
}

const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

export function AgendamentoPage() {
  const router = useRouter();
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const grid = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);
  const monthLabel = useMemo(() => {
    const label = monthFormatter.format(monthCursor);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [monthCursor]);

  function goToMonth(offset: number) {
    setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function goToToday() {
    const now = new Date();
    setMonthCursor(new Date(now.getFullYear(), now.getMonth(), 1));
  }

  function handleContinue() {
    if (!selectedDate) return;
    router.push("/clientes/historico");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0d1831]">Escolha a data e o horário</h1>
        <p className="mt-1 text-sm text-[#5f6f87]">Selecione um dia disponível para continuar</p>
      </div>

      <div className="flex items-center gap-8 border-b border-[#e6e4df]">
        <span className="flex items-center gap-2 border-b-2 border-[#7247f3] pb-3 text-sm font-medium text-[#7247f3]">
          <CalendarDays size={16} strokeWidth={2} />
          Novo agendamento
        </span>
        <Link
          href="/clientes/historico"
          className="flex items-center gap-2 pb-3 text-sm font-medium text-[#5f6f87] transition hover:text-[#0d1831]"
        >
          <ClipboardList size={16} strokeWidth={2} />
          Meus agendamentos
        </Link>
      </div>

      <div className="rounded-[12px] border border-[#e6e4df] bg-white p-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            aria-label="Mês anterior"
            className="grid size-9 place-items-center rounded-[8px] border border-[#e6e4df] text-[#5f6f87] transition hover:border-[#98a2b3]"
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>

          <p className="text-lg font-semibold text-[#0d1831]">{monthLabel}</p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToMonth(1)}
              aria-label="Próximo mês"
              className="grid size-9 place-items-center rounded-[8px] border border-[#e6e4df] text-[#5f6f87] transition hover:border-[#98a2b3]"
            >
              <ChevronRight size={18} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="rounded-[10px] border border-[#e6e4df] px-3.5 py-2 text-[13px] font-medium text-[#0d1831] transition hover:border-[#98a2b3]"
            >
              Hoje
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-7 border-y border-[#eef0f3] py-2.5">
          {WEEKDAYS.map((weekday) => (
            <p key={weekday} className="text-center text-sm font-semibold text-[#98a2b3]">
              {weekday}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {grid.map(({ date, inCurrentMonth }) => {
            const status = dayStatus(date);
            const selected = selectedDate ? isSameDay(date, selectedDate) : false;
            const clickable = inCurrentMonth && status === "available";

            return (
              <button
                key={date.toISOString()}
                type="button"
                disabled={!clickable}
                onClick={() => clickable && setSelectedDate(date)}
                className={`flex h-[70px] flex-col items-center justify-center gap-1.5 border-b border-r border-[#eef0f3] text-left transition [&:nth-child(7n)]:border-r-0 ${
                  !inCurrentMonth ? "bg-[#f7f6f2]" : "bg-white"
                } ${clickable ? "cursor-pointer hover:bg-[#ede9fd]" : "cursor-default"}`}
              >
                <span
                  className={`text-xs ${
                    inCurrentMonth ? "text-[#0d1831]" : "text-[#98a2b3]"
                  }`}
                >
                  {date.getDate()}
                </span>
                {inCurrentMonth && status === "available" && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                      selected ? "bg-[#7247f3] text-white" : "bg-[#ede9fd] text-[#7247f3]"
                    }`}
                  >
                    Disponível
                  </span>
                )}
                {inCurrentMonth && status === "closed" && (
                  <span className="text-xs text-[#98a2b3]">Fechado</span>
                )}
                {inCurrentMonth && status === "booked" && (
                  <span className="rounded-full bg-[#e8f7f1] px-2.5 py-0.5 text-[12px] font-medium text-[#27865b]">
                    {BOOKED_APPOINTMENT.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link
          href="/clientes/dashboard"
          className="flex items-center gap-2 rounded-[10px] border border-[#e6e4df] px-5 py-3 text-sm font-medium text-[#0d1831] transition hover:border-[#98a2b3]"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Voltar
        </Link>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedDate}
          className="flex items-center gap-2 rounded-[10px] bg-[#7247f3] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#5c2ee0] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continuar
          <ArrowRight size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
