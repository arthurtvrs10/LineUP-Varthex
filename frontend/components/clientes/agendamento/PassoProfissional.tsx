"use client";

import { Check } from "lucide-react";
import type { Profissional } from "./dados";

export function PassoProfissional({
  profissionais,
  loading,
  selecionado,
  onSelecionar,
}: {
  profissionais: Profissional[];
  loading: boolean;
  selecionado: Profissional | null;
  onSelecionar: (p: Profissional) => void;
}) {
  if (loading) {
    return <p className="text-sm text-[#98a2b3]">Carregando profissionais…</p>;
  }

  if (profissionais.length === 0) {
    return (
      <p className="rounded-[12px] border border-dashed border-[#e6e4df] px-4 py-8 text-center text-sm text-[#98a2b3]">
        Nenhum profissional disponível no momento.
      </p>
    );
  }

  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="sr-only">Escolha o profissional</legend>

      {profissionais.map((p) => {
        const ativo = selecionado?.id === p.id;
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
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-subtle text-sm font-bold text-accent-strong">
              {p.iniciais}
            </span>

            <span className="min-w-0 flex-1">
              <span className="truncate text-sm font-bold text-[#0d1831]">{p.nome}</span>
              {p.especialidade && (
                <span className="mt-0.5 block truncate text-xs text-[#5f6f87]">{p.especialidade}</span>
              )}
            </span>

            <span
              className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                ativo ? "border-accent bg-accent text-on-accent" : "border-[#d0d5dd]"
              }`}
            >
              {ativo && <Check size={12} strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}
