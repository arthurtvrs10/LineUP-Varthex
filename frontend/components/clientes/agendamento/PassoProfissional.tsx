"use client";

import { Check, Star } from "lucide-react";
import {
  QUALQUER_PROFISSIONAL,
  profissionais,
  type Profissional,
} from "./dados";

/** "Qualquer profissional" vem primeiro: abre mais horários e é a escolha mais comum. */
const opcoes = [QUALQUER_PROFISSIONAL, ...profissionais];

export function PassoProfissional({
  selecionado,
  onSelecionar,
}: {
  selecionado: Profissional | null;
  onSelecionar: (p: Profissional) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="sr-only">Escolha o profissional</legend>

      {opcoes.map((p) => {
        const ativo = selecionado?.id === p.id;
        const qualquer = p.id === QUALQUER_PROFISSIONAL.id;
        return (
          <button
            key={p.id}
            type="button"
            aria-pressed={ativo}
            onClick={() => onSelecionar(p)}
            className={`flex min-h-[64px] items-center gap-3 rounded-[12px] border p-4 text-left transition ${
              ativo
                ? "border-accent bg-accent-subtle"
                : "border-[#e6e4df] bg-white hover:bg-[#f7f6f2]"
            }`}
          >
            <span
              className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold ${
                qualquer ? "bg-[#fdf3e3] text-[#d28b27]" : "bg-accent-subtle text-accent-strong"
              }`}
            >
              {p.iniciais}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-sm font-bold text-[#0d1831]">{p.nome}</span>
                {qualquer && (
                  <span className="shrink-0 rounded-full bg-[#e8f7f1] px-2 py-0.5 text-[10px] font-bold text-[#27865b]">
                    mais horários
                  </span>
                )}
              </span>
              <span className="mt-0.5 block truncate text-xs text-[#5f6f87]">
                {p.especialidade}
              </span>
            </span>

            <span className="flex shrink-0 items-center gap-2.5">
              {p.nota && (
                <span className="flex items-center gap-1 text-xs font-bold text-[#0d1831]">
                  <Star size={12} strokeWidth={2} className="fill-[#d28b27] text-[#d28b27]" />
                  {p.nota}
                </span>
              )}
              <span
                className={`grid size-5 place-items-center rounded-full border ${
                  ativo ? "border-accent bg-accent text-on-accent" : "border-[#d0d5dd]"
                }`}
              >
                {ativo && <Check size={12} strokeWidth={3} />}
              </span>
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}
