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
    tone === "danger" ? "bg-[#c84a4a] hover:bg-[#b13f3f]" : "bg-[#7247f3] hover:bg-[#5c2ee0]";

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
            className={`h-11 rounded-[10px] px-4 text-sm font-bold text-white transition ${cores}`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        {tone === "danger" && (
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#fdeaea] text-[#c84a4a]">
            <AlertTriangle size={18} strokeWidth={2} />
          </span>
        )}
        <div className="min-w-0">
          {description && <p className="text-sm text-[#5f6f87]">{description}</p>}
          {children}
        </div>
      </div>
    </Modal>
  );
}
