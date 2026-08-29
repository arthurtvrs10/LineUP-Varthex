"use client";

import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal, ModalCancelButton } from "./Modal";

/**
 * Confirmação de ação consequente (bloquear, cancelar, remover).
 *
 * O botão de confirmar NÃO é `type="submit"` de um form: aqui não há
 * dados a enviar, só uma decisão. O rótulo diz o que vai acontecer
 * ("Bloquear barbearia"), nunca um "OK" genérico — o usuário deve
 * conseguir decidir lendo apenas o botão.
 */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  tone = "danger",
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel: string;
  tone?: "danger" | "accent";
  children?: ReactNode;
}) {
  const cores =
    tone === "danger"
      ? "bg-danger text-white hover:opacity-90"
      : "bg-accent text-on-accent hover:bg-accent-hover";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <ModalCancelButton onClick={onClose} />
          <button
            type="button"
            onClick={onConfirm}
            className={`h-11 rounded-[10px] px-4 text-sm font-bold transition ${cores}`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        {tone === "danger" && (
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-danger-subtle text-danger">
            <AlertTriangle size={18} strokeWidth={2} />
          </span>
        )}
        <div className="min-w-0">
          {description && <p className="text-sm text-secondary">{description}</p>}
          {children}
        </div>
      </div>
    </Modal>
  );
}
