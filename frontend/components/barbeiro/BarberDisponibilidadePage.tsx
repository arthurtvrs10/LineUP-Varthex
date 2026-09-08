"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { Toast, useToast } from "@/components/ui/Toast";

const WEEKDAY_LABELS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

type WorkScheduleItem = { id?: string; weekday: number; startTime: string; endTime: string };
type ExceptionType = "BLOCK" | "VACATION" | "ABSENCE" | "HOLIDAY";
type ExceptionResponse = { id: string; type: ExceptionType; startsAt: string; endsAt: string; reason: string | null };
type BarberMeResponse = { id: string };

const exceptionTypeLabels: Record<ExceptionType, string> = {
  BLOCK: "Bloqueio pontual",
  VACATION: "Férias",
  ABSENCE: "Ausência",
  HOLIDAY: "Feriado",
};

function toLocalDateTime(date: string, time: string) {
  return `${date}T${time}:00`;
}

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export function BarberDisponibilidadePage() {
  const [barber, setBarber] = useState<BarberMeResponse>();
  const [schedule, setSchedule] = useState<WorkScheduleItem[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [error, setError] = useState<string>();
  const toast = useToast();

  const [novaExcecaoTipo, setNovaExcecaoTipo] = useState<ExceptionType>("BLOCK");
  const [novaExcecaoDataInicio, setNovaExcecaoDataInicio] = useState("");
  const [novaExcecaoHoraInicio, setNovaExcecaoHoraInicio] = useState("08:00");
  const [novaExcecaoDataFim, setNovaExcecaoDataFim] = useState("");
  const [novaExcecaoHoraFim, setNovaExcecaoHoraFim] = useState("18:00");
  const [novaExcecaoMotivo, setNovaExcecaoMotivo] = useState("");
  const [criandoExcecao, setCriandoExcecao] = useState(false);

  useEffect(() => {
    apiFetch<BarberMeResponse>("/barbers/me")
      .then(setBarber)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar seu perfil."));
  }, []);

  async function carregar(barberId: string) {
    setLoading(true);
    try {
      const [scheduleRes, exceptionsRes] = await Promise.all([
        apiFetch<WorkScheduleItem[]>(`/barbers/${barberId}/work-schedules`),
        apiFetch<ExceptionResponse[]>(`/barbers/${barberId}/availability-exceptions`),
      ]);
      setSchedule(scheduleRes);
      setExceptions(exceptionsRes);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar sua disponibilidade.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (barber) carregar(barber.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barber]);

  function adicionarTurno(weekday: number) {
    setSchedule((prev) => [...prev, { weekday, startTime: "09:00", endTime: "18:00" }]);
  }

  function removerTurno(index: number) {
    setSchedule((prev) => prev.filter((_, i) => i !== index));
  }

  function atualizarTurno(index: number, campo: "startTime" | "endTime", valor: string) {
    setSchedule((prev) => prev.map((item, i) => (i === index ? { ...item, [campo]: valor } : item)));
  }

  async function salvarJornada() {
    if (!barber) return;
    setSavingSchedule(true);
    try {
      const payload = schedule.map((s) => ({ weekday: s.weekday, startTime: s.startTime, endTime: s.endTime }));
      const updated = await apiFetch<WorkScheduleItem[]>(`/barbers/${barber.id}/work-schedules`, {
        method: "PUT",
        body: payload,
      });
      setSchedule(updated);
      toast.mostrar("Jornada salva!");
    } catch (err) {
      toast.mostrar(err instanceof ApiError ? err.message : "Não foi possível salvar a jornada.", "erro");
    } finally {
      setSavingSchedule(false);
    }
  }

  async function criarExcecao() {
    if (!barber || !novaExcecaoDataInicio || !novaExcecaoDataFim) {
      toast.mostrar("Preencha as datas de início e fim.", "erro");
      return;
    }
    setCriandoExcecao(true);
    try {
      const created = await apiFetch<ExceptionResponse>(`/barbers/${barber.id}/availability-exceptions`, {
        method: "POST",
        body: {
          type: novaExcecaoTipo,
          startsAt: toLocalDateTime(novaExcecaoDataInicio, novaExcecaoHoraInicio),
          endsAt: toLocalDateTime(novaExcecaoDataFim, novaExcecaoHoraFim),
          reason: novaExcecaoMotivo || null,
        },
      });
      setExceptions((prev) => [...prev, created]);
      setNovaExcecaoDataInicio("");
      setNovaExcecaoDataFim("");
      setNovaExcecaoMotivo("");
      toast.mostrar("Bloqueio criado!");
    } catch (err) {
      toast.mostrar(err instanceof ApiError ? err.message : "Não foi possível criar o bloqueio.", "erro");
    } finally {
      setCriandoExcecao(false);
    }
  }

  async function excluirExcecao(id: string) {
    if (!barber) return;
    try {
      await apiFetch(`/barbers/${barber.id}/availability-exceptions/${id}`, { method: "DELETE" });
      setExceptions((prev) => prev.filter((e) => e.id !== id));
      toast.mostrar("Bloqueio removido.");
    } catch (err) {
      toast.mostrar(err instanceof ApiError ? err.message : "Não foi possível remover.", "erro");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[30px] font-bold text-[#0d1831]">Disponibilidade</h1>
        <p className="mt-1 text-sm text-[#5f6f87]">Configure sua jornada semanal e bloqueios pontuais.</p>
      </div>

      {error && <p className="rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">{error}</p>}

      <section className="rounded-[12px] border border-[#e6e4df] bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0d1831]">Jornada semanal</h2>
            <p className="mt-1 text-sm text-[#5f6f87]">Os horários livres para agendamento saem daqui.</p>
          </div>
          <button
            type="button"
            onClick={salvarJornada}
            disabled={savingSchedule || loading}
            className="rounded-[10px] bg-accent px-5 py-2.5 text-sm font-bold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingSchedule ? "Salvando…" : "Salvar jornada"}
          </button>
        </div>

        <div className="mt-5 flex flex-col divide-y divide-[#eef0f3]">
          {WEEKDAY_LABELS.map((label, weekday) => {
            const turnos = schedule
              .map((s, index) => ({ ...s, index }))
              .filter((s) => s.weekday === weekday);

            return (
              <div key={weekday} className="flex flex-wrap items-start gap-3 py-3">
                <p className="w-24 shrink-0 pt-2 text-sm font-bold text-[#0d1831]">{label}</p>
                <div className="flex flex-1 flex-col gap-2">
                  {turnos.length === 0 && <p className="pt-2 text-xs text-[#98a2b3]">Fechado</p>}
                  {turnos.map((turno) => (
                    <div key={turno.index} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={turno.startTime}
                        onChange={(e) => atualizarTurno(turno.index, "startTime", e.target.value)}
                        className="h-9 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent"
                      />
                      <span className="text-xs text-[#98a2b3]">até</span>
                      <input
                        type="time"
                        value={turno.endTime}
                        onChange={(e) => atualizarTurno(turno.index, "endTime", e.target.value)}
                        className="h-9 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent"
                      />
                      <button
                        type="button"
                        onClick={() => removerTurno(turno.index)}
                        aria-label="Remover turno"
                        className="grid size-8 place-items-center rounded-[8px] text-[#c84a4a] transition hover:bg-[#fdeaea]"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => adicionarTurno(weekday)}
                    className="flex w-fit items-center gap-1 rounded-[8px] px-2 py-1 text-xs font-bold text-accent-strong transition hover:bg-[#f7f6f2]"
                  >
                    <Plus size={12} strokeWidth={2.5} />
                    Adicionar turno
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[12px] border border-[#e6e4df] bg-white p-6">
        <h2 className="text-lg font-bold text-[#0d1831]">Bloqueios e exceções</h2>
        <p className="mt-1 text-sm text-[#5f6f87]">Férias, ausências, feriados ou bloqueios pontuais na sua agenda.</p>

        <div className="mt-5 grid grid-cols-1 gap-3 rounded-[10px] border border-dashed border-[#e6e4df] p-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#5f6f87]">Tipo</label>
            <select
              value={novaExcecaoTipo}
              onChange={(e) => setNovaExcecaoTipo(e.target.value as ExceptionType)}
              className="h-10 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent"
            >
              {Object.entries(exceptionTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#5f6f87]">Início</label>
            <div className="flex gap-1">
              <input
                type="date"
                value={novaExcecaoDataInicio}
                onChange={(e) => setNovaExcecaoDataInicio(e.target.value)}
                className="h-10 min-w-0 flex-1 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent"
              />
              <input
                type="time"
                value={novaExcecaoHoraInicio}
                onChange={(e) => setNovaExcecaoHoraInicio(e.target.value)}
                className="h-10 w-24 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#5f6f87]">Fim</label>
            <div className="flex gap-1">
              <input
                type="date"
                value={novaExcecaoDataFim}
                onChange={(e) => setNovaExcecaoDataFim(e.target.value)}
                className="h-10 min-w-0 flex-1 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent"
              />
              <input
                type="time"
                value={novaExcecaoHoraFim}
                onChange={(e) => setNovaExcecaoHoraFim(e.target.value)}
                className="h-10 w-24 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 lg:col-span-2">
            <label className="text-xs font-bold text-[#5f6f87]">Motivo (opcional)</label>
            <div className="flex gap-2">
              <input
                value={novaExcecaoMotivo}
                onChange={(e) => setNovaExcecaoMotivo(e.target.value)}
                className="h-10 flex-1 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={criarExcecao}
                disabled={criandoExcecao}
                className="shrink-0 rounded-[8px] bg-accent px-4 text-sm font-bold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col divide-y divide-[#eef0f3]">
          {exceptions.length === 0 && !loading && (
            <p className="py-6 text-center text-sm text-[#98a2b3]">Nenhum bloqueio cadastrado.</p>
          )}
          {exceptions.map((exception) => (
            <div key={exception.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-bold text-[#0d1831]">{exceptionTypeLabels[exception.type]}</p>
                <p className="text-xs text-[#5f6f87]">
                  {dateTimeFormatter.format(new Date(exception.startsAt))} — {dateTimeFormatter.format(new Date(exception.endsAt))}
                  {exception.reason && ` · ${exception.reason}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => excluirExcecao(exception.id)}
                aria-label="Remover bloqueio"
                className="grid size-8 shrink-0 place-items-center rounded-[8px] text-[#c84a4a] transition hover:bg-[#fdeaea]"
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
