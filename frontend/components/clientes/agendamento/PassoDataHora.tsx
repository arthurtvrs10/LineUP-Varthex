"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { proximosDias, type DiaDisponivel } from "./dados";

type AvailabilitySlot = { startAt: string; endAt: string };

function timeLabel(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Data e horário.
 *
 * A data é uma FAIXA HORIZONTAL, não a grade de mês: em 375px a grade de
 * 7 colunas dava células de 42px — abaixo do alvo mínimo de toque, e a
 * pílula "Disponível" de 77px saía cortada (medido antes de trocar).
 * Aqui cada dia tem 64px de largura e rola no eixo X.
 *
 * Os horários vêm de GET /barbers/{id}/availability — jornada real do
 * profissional menos exceções (folgas/bloqueios) menos agendamentos já
 * existentes, considerando a duração do serviço escolhido.
 */
export function PassoDataHora({
  hoje,
  barberId,
  serviceId,
  dia,
  horario,
  onSelecionarDia,
  onSelecionarHorario,
}: {
  /** Data-base vinda do orquestrador, para não divergir na hidratação. */
  hoje: Date;
  barberId: string;
  serviceId: string;
  dia: DiaDisponivel | null;
  horario: string | null;
  onSelecionarDia: (d: DiaDisponivel) => void;
  onSelecionarHorario: (h: string) => void;
}) {
  const dias = useMemo(() => proximosDias(hoje, 14), [hoje]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!dia) return;
    let ativo = true;
    setLoading(true);
    apiFetch<AvailabilitySlot[]>(
      `/barbers/${barberId}/availability?${new URLSearchParams({ date: dia.iso, serviceId })}`,
    )
      .then((items) => {
        if (ativo) {
          setSlots(items);
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
  }, [dia, barberId, serviceId]);

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
                aria-pressed={ativo}
                onClick={() => onSelecionarDia(d)}
                className={`flex w-16 shrink-0 snap-start flex-col items-center justify-center gap-0.5 rounded-[12px] border py-3 transition ${
                  ativo
                    ? "border-accent bg-accent text-on-accent"
                    : "border-[#e6e4df] bg-white text-[#0d1831] hover:bg-[#f7f6f2]"
                }`}
              >
                <span className="text-[10px] font-bold uppercase opacity-70">{d.diaSemana}</span>
                <span className="text-lg font-bold leading-none">{d.diaMes}</span>
                <span className="text-[10px] uppercase opacity-70">{d.mesCurto}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-sm font-bold text-[#0d1831]">Escolha o horário</p>

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
        ) : slots.length === 0 ? (
          <p className="rounded-[12px] border border-dashed border-[#e6e4df] px-4 py-8 text-center text-sm text-[#98a2b3]">
            Sem horários livres nesse dia. Escolha outra data.
          </p>
        ) : (
          <div
            role="group"
            aria-label="Horários disponíveis"
            className="grid grid-cols-3 gap-2 sm:grid-cols-5"
          >
            {slots.map((slot) => {
              const h = timeLabel(slot.startAt);
              const ativo = horario === h;
              return (
                <button
                  key={slot.startAt}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => onSelecionarHorario(h)}
                  className={`h-11 rounded-[10px] border text-sm font-medium transition ${
                    ativo
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
