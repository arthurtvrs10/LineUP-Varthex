"use client";

import { Check, Clock } from "lucide-react";
import { brl, servicos, type Servico } from "./dados";

export function PassoServico({
  selecionado,
  onSelecionar,
}: {
  selecionado: Servico | null;
  onSelecionar: (s: Servico) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="sr-only">Escolha o serviço</legend>

      {servicos.map((s) => {
        const ativo = selecionado?.id === s.id;
        return (
          <button
            key={s.id}
            type="button"
            aria-pressed={ativo}
            onClick={() => onSelecionar(s)}
            className={`flex min-h-[64px] items-center gap-3 rounded-[12px] border p-4 text-left transition ${
              ativo
                ? "border-[#7247f3] bg-[#ede9fd]"
                : "border-[#e6e4df] bg-white hover:bg-[#f7f6f2]"
            }`}
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-[#0d1831]">{s.nome}</span>
              <span className="mt-0.5 block text-xs text-[#5f6f87]">{s.descricao}</span>
              <span className="mt-1.5 flex items-center gap-1 text-[11px] text-[#98a2b3]">
                <Clock size={12} strokeWidth={2} />
                {s.duracaoMin} min
              </span>
            </span>

            <span className="flex shrink-0 items-center gap-2.5">
              <span className="text-sm font-bold text-[#0d1831]">{brl.format(s.preco)}</span>
              <span
                className={`grid size-5 place-items-center rounded-full border ${
                  ativo ? "border-[#7247f3] bg-[#7247f3] text-white" : "border-[#d0d5dd]"
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
