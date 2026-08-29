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
    pillBg: "bg-accent-subtle",
    pillColor: "text-accent-strong",
    title: "Almoço",
    description: "Seg–sex • 12:00–13:00 • recorrente",
  },
  {
    id: "compromisso",
    kind: "BLOQUEIO",
    pillBg: "bg-[#f0efea]",
    pillColor: "text-[#686a73]",
    title: "Compromisso pessoal",
    description: "20 ago 2026 • 15:00–17:00",
  },
  {
    id: "ausencia",
    kind: "AUSÊNCIA",
    pillBg: "bg-[#fdf3e3]",
    pillColor: "text-[#d28b27]",
    title: "Ausência",
    description: "25 ago 2026 • 09:00–18:00",
  },
  {
    id: "ferias",
    kind: "FÉRIAS",
    pillBg: "bg-[#eaf2fb]",
    pillColor: "text-[#3478c9]",
    title: "Férias programadas",
    description: "01 set 2026 — 05 set 2026",
  },
  {
    id: "feriado",
    kind: "FERIADO",
    pillBg: "bg-[#fdeaea]",
    pillColor: "text-[#c84a4a]",
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
          <h1 className="text-2xl font-semibold text-[#0d1831]">Disponibilidade</h1>
          <p className="mt-1 text-sm text-[#98a2b3]">
            Defina sua jornada e os períodos em que você não pode atender.
          </p>
        </div>
        <button
          type="button"
          className="rounded-[10px] bg-accent px-5 py-2.5 text-sm font-medium text-on-accent transition hover:bg-accent-hover"
        >
          Salvar jornada
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 rounded-[12px] border border-[#e6e4df] bg-white p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">
            Profissional
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-subtle text-xs font-semibold text-accent-strong">
              JP
            </span>
            <div>
              <p className="text-sm font-medium text-[#0d1831]">João Pereira</p>
              <p className="text-xs text-[#98a2b3]">Minha disponibilidade</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">
            Unidade
          </p>
          <p className="mt-2 rounded-[10px] border border-[#e6e4df] px-3 py-2 text-sm text-[#0d1831]">
            Barbearia Estilo Único
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">
            Válida a partir de
          </p>
          <p className="mt-2 rounded-[10px] border border-[#e6e4df] px-3 py-2 text-sm text-[#0d1831]">
            17/08/2026
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">
            Válida até
          </p>
          <p className="mt-2 rounded-[10px] border border-[#e6e4df] px-3 py-2 text-sm text-[#0d1831]">
            Sem data final
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#0d1831]">Jornada semanal</h2>
          <div className="mt-4 flex flex-col divide-y divide-[#eef0f3]">
            {schedule.map((row) => (
              <div key={row.day} className="flex items-center gap-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleDay(row.day)}
                  aria-pressed={row.enabled}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                    row.enabled ? "bg-accent" : "bg-[#e6e4df]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                      row.enabled ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </button>
                <span className="w-32 shrink-0 text-sm font-medium text-[#0d1831]">
                  {row.day}
                </span>
                {row.enabled ? (
                  <div className="flex flex-1 items-center gap-3">
                    <input
                      type="text"
                      value={row.start}
                      onChange={(event) => updateTime(row.day, "start", event.target.value)}
                      className="w-20 rounded-[10px] border border-[#e6e4df] px-2 py-1.5 text-sm text-[#0d1831]"
                    />
                    <span className="text-sm text-[#98a2b3]">até</span>
                    <input
                      type="text"
                      value={row.end}
                      onChange={(event) => updateTime(row.day, "end", event.target.value)}
                      className="w-20 rounded-[10px] border border-[#e6e4df] px-2 py-1.5 text-sm text-[#0d1831]"
                    />
                    <button
                      type="button"
                      className="ml-auto text-sm font-medium text-accent-strong hover:underline"
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

        <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#0d1831]">Exceções</h2>
              <p className="mt-0.5 text-xs text-[#98a2b3]">Pausas e bloqueios.</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1 rounded-[10px] border border-[#e6e4df] px-3 py-1.5 text-xs font-medium text-accent-strong hover:bg-[#f7f6f2]"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {exceptions.map((exception) => (
              <div
                key={exception.id}
                className="rounded-[10px] border border-[#e6e4df] p-3"
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
                    className="text-xs font-medium text-[#c84a4a] hover:underline"
                  >
                    Remover
                  </button>
                </div>
                <p className="mt-2 text-sm font-medium text-[#0d1831]">{exception.title}</p>
                <p className="mt-0.5 text-xs text-[#98a2b3]">{exception.description}</p>
              </div>
            ))}
            {exceptions.length === 0 && (
              <p className="text-sm text-[#98a2b3]">Nenhuma exceção cadastrada.</p>
            )}
          </div>

          <div className="mt-4 rounded-[10px] bg-[#fdf3e3] p-3">
            <p className="text-xs font-semibold text-[#d28b27]">
              Bloqueios não apagam agendamentos.
            </p>
            <p className="mt-1 text-xs text-[#d28b27]">Conflitos exigem resolução explícita.</p>
          </div>
        </div>
      </div>

      <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#0d1831]">Consultar horários disponíveis</h2>
        <p className="mt-0.5 text-xs text-[#98a2b3]">
          O cálculo considera a duração e os buffers do serviço.
        </p>

        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 items-end gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">
              Serviço
            </p>
            <p className="mt-2 rounded-[10px] border border-[#e6e4df] px-3 py-2 text-sm text-[#0d1831]">
              Corte de cabelo • 45 min
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">De</p>
            <p className="mt-2 rounded-[10px] border border-[#e6e4df] px-3 py-2 text-sm text-[#0d1831]">
              17/08/2026
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#98a2b3]">Até</p>
            <p className="mt-2 rounded-[10px] border border-[#e6e4df] px-3 py-2 text-sm text-[#0d1831]">
              17/08/2026
            </p>
          </div>
          <button
            type="button"
            onClick={() => setQueried(true)}
            className="rounded-[10px] bg-accent px-5 py-2.5 text-sm font-medium text-on-accent transition hover:bg-accent-hover"
          >
            Consultar
          </button>
        </div>

        {queried && (
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              className="rounded-[10px] border border-accent px-4 py-2 text-sm font-medium text-accent-strong"
            >
              09:00
            </button>
            <button
              type="button"
              className="rounded-[10px] border border-accent px-4 py-2 text-sm font-medium text-accent-strong"
            >
              10:00
            </button>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-[12px] bg-[#eaf2fb] p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#3478c9]" />
        <p className="text-sm text-[#3478c9]">
          Disponibilidade = jornada − pausas − exceções − bloqueios − agendamentos que
          ocupam a agenda.
        </p>
      </div>
    </div>
  );
}
