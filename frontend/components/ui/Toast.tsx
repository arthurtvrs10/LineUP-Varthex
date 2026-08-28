"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

/**
 * Aviso efêmero para ações que não abrem modal (salvar, exportar,
 * atualizar). Vive em `aria-live="polite"` para que leitores de tela
 * anunciem sem roubar o foco de quem está no meio de outra coisa.
 */

export type ToastTone = "sucesso" | "erro";

export function useToast() {
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [tone, setTone] = useState<ToastTone>("sucesso");

  function mostrar(texto: string, t: ToastTone = "sucesso") {
    setTone(t);
    setMensagem(texto);
  }

  return {
    mensagem,
    tone,
    mostrar,
    fechar: () => setMensagem(null),
  };
}

export function Toast({
  mensagem,
  tone = "sucesso",
  onClose,
  duracaoMs = 4000,
}: {
  mensagem: string | null;
  tone?: ToastTone;
  onClose: () => void;
  duracaoMs?: number;
}) {
  useEffect(() => {
    if (!mensagem) return;
    const t = setTimeout(onClose, duracaoMs);
    return () => clearTimeout(t);
  }, [mensagem, duracaoMs, onClose]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
    >
      {mensagem && (
        <div className="pointer-events-auto flex items-center gap-3 rounded-[10px] border border-[#e6e4df] bg-white px-4 py-3 shadow-[0_12px_32px_rgba(13,24,49,0.14)]">
          <span
            className="grid size-6 shrink-0 place-items-center rounded-full"
            style={{
              backgroundColor: tone === "erro" ? "#fdeaea" : "#e8f7f1",
              color: tone === "erro" ? "#c84a4a" : "#27865b",
            }}
          >
            <Check size={13} strokeWidth={2.5} />
          </span>
          <p className="text-sm text-[#0d1831]">{mensagem}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar aviso"
            className="grid size-7 shrink-0 place-items-center rounded-[6px] text-[#98a2b3] transition hover:bg-[#f7f6f2]"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
