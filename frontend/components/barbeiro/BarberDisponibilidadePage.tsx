"use client";

import { useState } from "react";
import { Info, Plus } from "lucide-react";

type DaySchedule = {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
  unavailableLabel?: string;
};

const initialSchedule: DaySchedule[] = [
  { day: "Segunda-feira", enabled: true, start: "09:00", end: "18:00" },
  { day: "Terça-feira", enabled: true, start: "09:00", end: "18:00" },
  { day: "Quarta-feira", enabled: true, start: "09:00", end: "18:00" },
  { day: "Quinta-feira", enabled: true, start: "09:00", end: "18:00" },
  { day: "Sexta-feira", enabled: true, start: "09:00", end: "18:00" },
  { day: "Sábado", enabled: true, start: "09:00", end: "14:00" },
  { day: "Domingo", enabled: false, start: "", end: "", unavailableLabel: "Sem jornada" },
];

type Exception = {
  id: string;
  kind: "PAUSA" | "BLOQUEIO" | "AUSÊNCIA" | "FÉRIAS" | "FERIADO";
  pillBg: string;
  pillColor: string;
  title: string;
  description: string;
};

const initialExceptions: Exception[] = [
  {
    id: "almoco",
    kind: "PAUSA",
    pillBg: "bg-[#eef1ff]",
    pillColor: "text-[#293aa3]",
    title: "Almoço",
    description: "Seg–sex • 12:00–13:00 • recorrente",
  },
  {
    id: "compromisso",
    kind: "BLOQUEIO",
    pillBg: "bg-[#f2f4f7]",
    pillColor: "text-[#475467]",
    title: "Compromisso pessoal",
    description: "20 ago 2026 • 15:00–17:00",
  },
  {
    id: "ausencia",
    kind: "AUSÊNCIA",
    pillBg: "bg-[#fffaeb]",
    pillColor: "text-[#93370d]",
    title: "Ausência",
    description: "25 ago 2026 • 09:00–18:00",
  },
  {
    id: "ferias",
    kind: "FÉRIAS",
    pillBg: "bg-[#eff8ff]",
    pillColor: "text-[#1849a9]",
    title: "Férias programadas",
    description: "01 set 2026 — 05 set 2026",
  },
  {
    id: "feriado",
    kind: "FERIADO",
    pillBg: "bg-[#fef3f2]",
    pillColor: "text-[#912018]",
    title: "Feriado",
    description: "07 set 2026 • 09:00–18:00",
  },
];

export function BarberDisponibilidadePage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);
  const [exceptions, setExceptions] = useState<Exception[]>(initialExceptions);
  const [queried, setQueried] = useState(false);

  function toggleDay(day: string) {
    setSchedule((prev) =>
      prev.map((row) =>
        row.day === day
          ? {
              ...row,
              enabled: !row.enabled,
              unavailableLabel: row.enabled ? "Sem jornada" : undefined,
            }
          : row
      )
    );
  }

  function updateTime(day: string, field: "start" | "end", value: string) {
    setSchedule((prev) =>
      prev.map((row) => (row.day === day ? { ...row, [field]: value } : row))
    );
  }

  function removeException(id: string) {
    setExceptions((prev) => prev.filter((exception) => exception.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#101828]">Disponibilidade</h1>
          <p className="mt-1 text-sm text-[#667085]">
            Defina sua jornada e os períodos em que você não pode atender.
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-[#3448c5] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2c3aa8]"
        >
          Salvar jornada
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 rounded-xl border border-[#eaecf0] bg-white p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">
            Profissional
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e0e7ff] text-xs font-semibold text-[#3448c5]">
              JP
            </span>
            <div>
              <p className="text-sm font-medium text-[#101828]">João Pereira</p>
              <p className="text-xs text-[#667085]">Minha disponibilidade</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">
            Unidade
          </p>
          <p className="mt-2 rounded-lg border border-[#d0d5dd] px-3 py-2 text-sm text-[#101828]">
            Barbearia Estilo Único
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">
            Válida a partir de
          </p>
          <p className="mt-2 rounded-lg border border-[#d0d5dd] px-3 py-2 text-sm text-[#101828]">
            17/08/2026
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">
            Válida até
          </p>
          <p className="mt-2 rounded-lg border border-[#d0d5dd] px-3 py-2 text-sm text-[#101828]">
            Sem data final
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-6">
        <div className="rounded-xl border border-[#eaecf0] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#101828]">Jornada semanal</h2>
          <div className="mt-4 flex flex-col divide-y divide-[#f2f4f7]">
            {schedule.map((row) => (
              <div key={row.day} className="flex items-center gap-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleDay(row.day)}
                  aria-pressed={row.enabled}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                    row.enabled ? "bg-[#3448c5]" : "bg-[#e4e7ec]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                      row.enabled ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </button>
                <span className="w-32 shrink-0 text-sm font-medium text-[#101828]">
                  {row.day}
                </span>
                {row.enabled ? (
                  <div className="flex flex-1 items-center gap-3">
                    <input
                      type="text"
                      value={row.start}
                      onChange={(event) => updateTime(row.day, "start", event.target.value)}
                      className="w-20 rounded-lg border border-[#d0d5dd] px-2 py-1.5 text-sm text-[#101828]"
                    />
                    <span className="text-sm text-[#667085]">até</span>
                    <input
                      type="text"
                      value={row.end}
                      onChange={(event) => updateTime(row.day, "end", event.target.value)}
                      className="w-20 rounded-lg border border-[#d0d5dd] px-2 py-1.5 text-sm text-[#101828]"
                    />
                    <button
                      type="button"
                      className="ml-auto text-sm font-medium text-[#3448c5] hover:underline"
                    >
                      Adicionar faixa
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center">
                    <span className="text-sm text-[#98a2b3]">Indisponível</span>
                    <span className="ml-auto text-sm text-[#98a2b3]">
                      {row.unavailableLabel}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#eaecf0] bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#101828]">Exceções</h2>
              <p className="mt-0.5 text-xs text-[#667085]">Pausas e bloqueios.</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg border border-[#d0d5dd] px-3 py-1.5 text-xs font-medium text-[#3448c5] hover:bg-[#f8f9fc]"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {exceptions.map((exception) => (
              <div
                key={exception.id}
                className="rounded-lg border border-[#eaecf0] p-3"
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${exception.pillBg} ${exception.pillColor}`}
                  >
                    {exception.kind}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeException(exception.id)}
                    className="text-xs font-medium text-[#b42318] hover:underline"
                  >
                    Remover
                  </button>
                </div>
                <p className="mt-2 text-sm font-medium text-[#101828]">{exception.title}</p>
                <p className="mt-0.5 text-xs text-[#667085]">{exception.description}</p>
              </div>
            ))}
            {exceptions.length === 0 && (
              <p className="text-sm text-[#98a2b3]">Nenhuma exceção cadastrada.</p>
            )}
          </div>

          <div className="mt-4 rounded-lg bg-[#fffaeb] p-3">
            <p className="text-xs font-semibold text-[#93370d]">
              Bloqueios não apagam agendamentos.
            </p>
            <p className="mt-1 text-xs text-[#b54708]">Conflitos exigem resolução explícita.</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#eaecf0] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#101828]">Consultar horários disponíveis</h2>
        <p className="mt-0.5 text-xs text-[#667085]">
          O cálculo considera a duração e os buffers do serviço.
        </p>

        <div className="mt-4 grid grid-cols-4 items-end gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">
              Serviço
            </p>
            <p className="mt-2 rounded-lg border border-[#d0d5dd] px-3 py-2 text-sm text-[#101828]">
              Corte de cabelo • 45 min
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">De</p>
            <p className="mt-2 rounded-lg border border-[#d0d5dd] px-3 py-2 text-sm text-[#101828]">
              17/08/2026
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">Até</p>
            <p className="mt-2 rounded-lg border border-[#d0d5dd] px-3 py-2 text-sm text-[#101828]">
              17/08/2026
            </p>
          </div>
          <button
            type="button"
            onClick={() => setQueried(true)}
            className="rounded-lg bg-[#3448c5] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2c3aa8]"
          >
            Consultar
          </button>
        </div>

        {queried && (
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-[#3448c5] px-4 py-2 text-sm font-medium text-[#3448c5]"
            >
              09:00
            </button>
            <button
              type="button"
              className="rounded-lg border border-[#3448c5] px-4 py-2 text-sm font-medium text-[#3448c5]"
            >
              10:00
            </button>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-[#eff8ff] p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1849a9]" />
        <p className="text-sm text-[#1849a9]">
          Disponibilidade = jornada − pausas − exceções − bloqueios − agendamentos que
          ocupam a agenda.
        </p>
      </div>
    </div>
  );
}
