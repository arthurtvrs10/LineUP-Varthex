"use client";

import { useMemo } from "react";
import { horarios, horariosOcupados, proximosDias, type DiaDisponivel } from "./dados";

/**
 * Data e horário.
 *
 * A data é uma FAIXA HORIZONTAL, não a grade de mês: em 375px a grade de
 * 7 colunas dava células de 42px — abaixo do alvo mínimo de toque, e a
 * pílula "Disponível" de 77px saía cortada (medido antes de trocar).
 * Aqui cada dia tem 64px de largura e rola no eixo X.
 */
export function PassoDataHora({
  hoje,
  dia,
  horario,
  onSelecionarDia,
  onSelecionarHorario,
}: {
  /** Data-base vinda do orquestrador, para não divergir na hidratação. */
  hoje: Date;
  dia: DiaDisponivel | null;
  horario: string | null;
  onSelecionarDia: (d: DiaDisponivel) => void;
  onSelecionarHorario: (h: string) => void;
}) {
  const dias = useMemo(() => proximosDias(hoje, 14), [hoje]);
  const ocupados = dia ? horariosOcupados(dia.iso) : [];

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

        {!dia ? (
          <p className="rounded-[12px] border border-dashed border-[#e6e4df] px-4 py-8 text-center text-sm text-[#98a2b3]">
            Selecione um dia para ver os horários livres.
          </p>
        ) : (
          <div
            role="group"
            aria-label="Horários disponíveis"
            className="grid grid-cols-3 gap-2 sm:grid-cols-5"
          >
            {horarios.map((h) => {
              const ocupado = ocupados.includes(h);
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
