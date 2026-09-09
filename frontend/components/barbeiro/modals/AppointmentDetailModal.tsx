"use client";

import { useState } from "react";
import { Calendar, Clock, MessageSquare, Tag, User, Wallet } from "lucide-react";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/ui/Modal";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED"
  | "NO_SHOW";

export type AppointmentDetail = {
  id: string;
  status: AppointmentStatus;
  channel: string;
  startAt: string;
  endAt: string;
  totalAmount: string;
  notes: string | null;
  items: { name: string }[];
  clientName: string;
};

const statusStyles: Record<AppointmentStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-[#fdf3e3]", text: "text-[#d28b27]", label: "Pendente" },
  CONFIRMED: { bg: "bg-accent-subtle", text: "text-accent-strong", label: "Confirmado" },
  CHECKED_IN: { bg: "bg-[#e8f7f1]", text: "text-[#27865b]", label: "Check-in" },
  IN_PROGRESS: { bg: "bg-[#e8f7f1]", text: "text-[#27865b]", label: "Em atendimento" },
  COMPLETED: { bg: "bg-[#f0efea]", text: "text-[#686a73]", label: "Concluído" },
  CANCELED: { bg: "bg-[#f0efea]", text: "text-[#98a2b3]", label: "Cancelado" },
  NO_SHOW: { bg: "bg-[#fdecee]", text: "text-[#e0333f]", label: "Falta" },
};

const NEXT_ACTIONS: Record<AppointmentStatus, { action: string; label: string; tone: "accent" | "danger" }[]> = {
  PENDING: [
    { action: "confirm", label: "Confirmar", tone: "accent" },
    { action: "cancel", label: "Cancelar", tone: "danger" },
  ],
  CONFIRMED: [
    { action: "check-in", label: "Check-in", tone: "accent" },
    { action: "no-show", label: "Marcar falta", tone: "danger" },
    { action: "cancel", label: "Cancelar", tone: "danger" },
  ],
  CHECKED_IN: [
    { action: "start", label: "Iniciar atendimento", tone: "accent" },
    { action: "cancel", label: "Cancelar", tone: "danger" },
  ],
  IN_PROGRESS: [{ action: "complete", label: "Concluir", tone: "accent" }],
  COMPLETED: [],
  CANCELED: [],
  NO_SHOW: [],
};

const channelLabels: Record<string, string> = {
  CLIENT: "Agendado pelo cliente",
  BARBER: "Agendado por você",
  ADMIN: "Agendado pela administração",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function Row({ icon: Icon, children }: { icon: typeof User; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f7f6f2] text-[#5f6f87]">
        <Icon size={16} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1 pt-1.5 text-sm text-[#0d1831]">{children}</div>
    </div>
  );
}

export function AppointmentDetailModal({
  open,
  onClose,
  appointment,
  onAction,
}: {
  open: boolean;
  onClose: () => void;
  appointment: AppointmentDetail | null;
  onAction: (appointmentId: string, action: string) => Promise<void>;
}) {
  const [executando, setExecutando] = useState<string | null>(null);

  if (!appointment) return null;

  const style = statusStyles[appointment.status];
  const actions = NEXT_ACTIONS[appointment.status];
  const duracaoMin = Math.round(
    (new Date(appointment.endAt).getTime() - new Date(appointment.startAt).getTime()) / 60000,
  );

  async function executar(action: string) {
    if (!appointment) return;
    setExecutando(action);
    try {
      await onAction(appointment.id, action);
      onClose();
    } catch {
      // onAction já mostra o toast de erro — só evita fechar o modal e
      // deixa o usuário tentar de novo (ou fechar manualmente).
    } finally {
      setExecutando(null);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detalhes do agendamento"
      size="sm"
      footer={
        <>
          <ModalCancelButton onClick={onClose}>Fechar</ModalCancelButton>
          {actions.map(({ action, label, tone }) => (
            <ModalSubmitButton
              key={action}
              tone={tone}
              disabled={executando !== null}
              onClick={() => executar(action)}
            >
              {executando === action ? "Salvando…" : label}
            </ModalSubmitButton>
          ))}
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-lg font-bold text-[#0d1831]">{appointment.clientName}</p>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <Row icon={Calendar}>
            <span className="capitalize">{dateFormatter.format(new Date(appointment.startAt))}</span>
          </Row>
          <Row icon={Clock}>
            {timeFormatter.format(new Date(appointment.startAt))} – {timeFormatter.format(new Date(appointment.endAt))}
            <span className="text-[#98a2b3]"> · {duracaoMin} min</span>
          </Row>
          <Row icon={Tag}>{appointment.items.map((i) => i.name).join(" + ")}</Row>
          <Row icon={Wallet}>{brl.format(Number(appointment.totalAmount))}</Row>
          <Row icon={User}>{channelLabels[appointment.channel] ?? appointment.channel}</Row>
          {appointment.notes && <Row icon={MessageSquare}>{appointment.notes}</Row>}
        </div>

        {actions.length === 0 && (
          <p className="rounded-[10px] bg-[#f7f6f2] px-3 py-2.5 text-xs text-[#98a2b3]">
            Esse agendamento já está {style.label.toLowerCase()} — não há mais ações disponíveis.
          </p>
        )}
      </div>
    </Modal>
  );
}
