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
        <div className="pointer-events-auto flex items-center gap-3 rounded-[10px] border border-fog bg-white px-4 py-3 shadow-popover">
          <span
            className="grid size-6 shrink-0 place-items-center rounded-full"
            style={{
              backgroundColor: tone === "erro" ? "var(--color-danger-subtle)" : "var(--color-success-subtle)",
              color: tone === "erro" ? "var(--color-danger)" : "var(--color-success)",
            }}
          >
            <Check size={13} strokeWidth={2.5} />
          </span>
          <p className="text-sm text-ink">{mensagem}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar aviso"
            className="grid size-7 shrink-0 place-items-center rounded-[6px] text-tertiary transition hover:bg-surface-sunken"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
