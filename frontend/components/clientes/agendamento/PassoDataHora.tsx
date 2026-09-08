"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { horarios, proximosDias, type DiaDisponivel } from "./dados";

type AppointmentWindow = { startAt: string; endAt: string; status: string };

function toLocalDateTime(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function parseIsoDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Data e horário.
 *
 * A data é uma FAIXA HORIZONTAL, não a grade de mês: em 375px a grade de
 * 7 colunas dava células de 42px — abaixo do alvo mínimo de toque, e a
 * pílula "Disponível" de 77px saía cortada (medido antes de trocar).
 * Aqui cada dia tem 64px de largura e rola no eixo X.
 *
 * "Ocupado" é calculado a partir dos agendamentos reais do profissional
 * naquele dia — não existe jornada de trabalho cadastrada ainda, então a
 * janela 08:00–18:00 é um horário comercial padrão, não a disponibilidade
 * real de cada barbeiro.
 */
export function PassoDataHora({
  hoje,
  barberId,
  duracaoMin,
  dia,
  horario,
  onSelecionarDia,
  onSelecionarHorario,
}: {
  /** Data-base vinda do orquestrador, para não divergir na hidratação. */
  hoje: Date;
  barberId: string;
  duracaoMin: number;
  dia: DiaDisponivel | null;
  horario: string | null;
  onSelecionarDia: (d: DiaDisponivel) => void;
  onSelecionarHorario: (h: string) => void;
}) {
  const dias = useMemo(() => proximosDias(hoje, 14), [hoje]);
  const [ocupacoes, setOcupacoes] = useState<AppointmentWindow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!dia) return;
    let ativo = true;
    setLoading(true);
    const from = parseIsoDate(dia.iso);
    const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
    apiFetch<AppointmentWindow[]>(
      `/appointments?${new URLSearchParams({ barberId, from: toLocalDateTime(from), to: toLocalDateTime(to) })}`,
    )
      .then((items) => {
        if (ativo) {
          setOcupacoes(items.filter((a) => a.status !== "CANCELED" && a.status !== "NO_SHOW"));
          setError(undefined);
        }
      })
      .catch((err) => {
        if (ativo) setError(err instanceof ApiError ? err.message : "Não foi possível carregar os horários.");
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });
    return () => {
      ativo = false;
    };
  }, [dia, barberId]);

  function slotOcupado(h: string) {
    if (!dia) return false;
    const [hh, mm] = h.split(":").map(Number);
    const base = parseIsoDate(dia.iso);
    const slotStart = new Date(base.getFullYear(), base.getMonth(), base.getDate(), hh, mm);
    const slotEnd = new Date(slotStart.getTime() + duracaoMin * 60 * 1000);

    return ocupacoes.some((a) => {
      const aStart = new Date(a.startAt);
      const aEnd = new Date(a.endAt);
      return slotStart < aEnd && slotEnd > aStart;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2.5 text-sm font-bold text-[#0d1831]">Escolha o dia</p>
        <div
          role="group"
          aria-label="Dias disponíveis"
          className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
        >
          {dias.map((d) => {
            const ativo = dia?.iso === d.iso;
            return (
              <button
                key={d.iso}
                type="button"
                disabled={d.fechado}
                aria-pressed={ativo}
                onClick={() => onSelecionarDia(d)}
                className={`flex w-16 shrink-0 snap-start flex-col items-center justify-center gap-0.5 rounded-[12px] border py-3 transition ${
                  d.fechado
                    ? "cursor-not-allowed border-[#eef0f3] bg-[#f7f6f2] text-[#98a2b3]"
                    : ativo
                      ? "border-accent bg-accent text-on-accent"
                      : "border-[#e6e4df] bg-white text-[#0d1831] hover:bg-[#f7f6f2]"
                }`}
              >
                <span className="text-[10px] font-bold uppercase opacity-70">{d.diaSemana}</span>
                <span className="text-lg font-bold leading-none">{d.diaMes}</span>
                <span className="text-[10px] uppercase opacity-70">
                  {d.fechado ? "fech." : d.mesCurto}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-sm font-bold text-[#0d1831]">Escolha o horário</p>
        <p className="mb-2.5 -mt-1.5 text-xs text-[#98a2b3]">Horário comercial padrão (08:00–18:00).</p>

        {error && (
          <p className="mb-2.5 rounded-[10px] bg-[#fdecee] px-3 py-2 text-xs text-[#e0333f]">{error}</p>
        )}

        {!dia ? (
          <p className="rounded-[12px] border border-dashed border-[#e6e4df] px-4 py-8 text-center text-sm text-[#98a2b3]">
            Selecione um dia para ver os horários livres.
          </p>
        ) : loading ? (
          <p className="rounded-[12px] border border-dashed border-[#e6e4df] px-4 py-8 text-center text-sm text-[#98a2b3]">
            Carregando horários…
          </p>
        ) : (
          <div
            role="group"
            aria-label="Horários disponíveis"
            className="grid grid-cols-3 gap-2 sm:grid-cols-5"
          >
            {horarios.map((h) => {
              const ocupado = slotOcupado(h);
              const ativo = horario === h;
              return (
                <button
                  key={h}
                  type="button"
                  disabled={ocupado}
                  aria-pressed={ativo}
                  onClick={() => onSelecionarHorario(h)}
                  className={`h-11 rounded-[10px] border text-sm font-medium transition ${
                    ocupado
                      ? "cursor-not-allowed border-[#eef0f3] bg-[#f7f6f2] text-[#c9ccd4] line-through"
                      : ativo
                        ? "border-accent bg-accent text-on-accent"
                        : "border-[#e6e4df] bg-white text-[#0d1831] hover:bg-[#f7f6f2]"
                  }`}
                >
                  {h}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
