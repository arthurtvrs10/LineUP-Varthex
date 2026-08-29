"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Modal compartilhado dos painéis.
 *
 * Usa <dialog> nativo de propósito: foco preso, Escape, top-layer e
 * inertização do fundo vêm do browser. Reimplementar isso à mão é a
 * fonte clássica de modal inacessível.
 *
 * Mobile: vira bottom sheet (ancora embaixo, cantos superiores
 * arredondados). Desktop: card centralizado.
 */

export type ModalSize = "sm" | "md" | "lg";

const sizeClasses: Record<ModalSize, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-3xl",
};

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Rodapé de ações. Sem ele, o modal não mostra barra inferior. */
  footer?: ReactNode;
  size?: ModalSize;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  // Abre/fecha o dialog nativo conforme a prop.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  // Escape dispara "cancel": avisamos o pai em vez de deixar o browser
  // fechar sozinho, senão o estado do pai fica dessincronizado.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function handleCancel(event: Event) {
      event.preventDefault();
      onClose();
    }
    el.addEventListener("cancel", handleCancel);
    return () => el.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  // Trava o scroll do fundo enquanto aberto (showModal inertiza o
  // conteúdo, mas não impede o body de rolar).
  useEffect(() => {
    if (!open) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-titulo"
      /* Clique no ::backdrop tem o próprio <dialog> como target. */
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={`m-0 w-full max-w-none bg-transparent p-0 backdrop:bg-ink/40 sm:m-auto ${sizeClasses[size]}
        mt-auto sm:mt-auto`}
      style={{ maxHeight: "100dvh" }}
    >
      <div className="flex max-h-[90dvh] flex-col overflow-hidden rounded-t-[16px] bg-white sm:rounded-[14px]">
        <div className="flex items-start justify-between gap-4 border-b border-fog px-5 py-4">
          <div className="min-w-0">
            <h2 id="modal-titulo" className="text-h3 text-ink">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-xs text-secondary">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-11 shrink-0 place-items-center rounded-[8px] text-tertiary transition hover:bg-surface-sunken hover:text-ink"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-fog bg-surface-sunken px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}

/** Botões padrão do rodapé, para os modais não divergirem entre si. */
export function ModalCancelButton({
  onClick,
  children = "Cancelar",
}: {
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-11 rounded-[10px] border border-fog bg-white px-4 text-sm font-medium text-secondary transition hover:bg-white hover:text-ink"
    >
      {children}
    </button>
  );
}

export function ModalSubmitButton({
  onClick,
  children,
  tone = "accent",
  disabled,
  /** id do <form> no corpo do modal — o rodapé fica fora dele. */
  form,
}: {
  onClick?: () => void;
  children: ReactNode;
  tone?: "accent" | "danger";
  disabled?: boolean;
  form?: string;
}) {
  const cores =
    tone === "danger"
      ? "bg-danger text-white hover:opacity-90"
      : "bg-accent text-on-accent hover:bg-accent-hover";
  return (
    <button
      type="submit"
      form={form}
      onClick={onClick}
      disabled={disabled}
      className={`h-11 rounded-[10px] px-4 text-sm font-bold transition disabled:opacity-50 ${cores}`}
    >
      {children}
    </button>
  );
}
