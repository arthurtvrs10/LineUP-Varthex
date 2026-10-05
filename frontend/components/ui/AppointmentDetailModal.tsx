"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, MessageSquare, Scissors, Tag, User, Wallet } from "lucide-react";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/ui/Modal";
import { AddToCalendarButton } from "./AddToCalendarButton";
import { appointmentCalendarEvent } from "@/lib/calendar-event";

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
  version?: number;
  /** Só relevante pra quem gerencia vários profissionais (Admin) — o
   * Barbeiro vendo a própria agenda já sabe de quem é. */
  barberName?: string;
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
  BARBER: "Agendado pelo barbeiro",
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
  onReschedule,
}: {
  open: boolean;
  onClose: () => void;
  appointment: AppointmentDetail | null;
  onAction: (appointmentId: string, action: string) => Promise<void>;
  onReschedule?: (appointmentId: string, startAt: string, version?: number) => Promise<void>;
}) {
  const [executando, setExecutando] = useState<string | null>(null);
  const [reagendando, setReagendando] = useState(false);
  const [novoInicio, setNovoInicio] = useState("");

  useEffect(() => {
    if (!appointment) return;
    const value = new Date(appointment.startAt);
    setNovoInicio(new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    setReagendando(false);
  }, [appointment?.id, appointment?.startAt]);

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

  async function confirmarReagendamento(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!appointment || !onReschedule || !novoInicio) return;
    setExecutando("reschedule");
    try {
      await onReschedule(appointment.id, `${novoInicio}:00`, appointment.version);
      onClose();
    } catch {
      // A tela que chamou exibe a falha; mantém o modal aberto para correção.
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
        reagendando ? <>
          <ModalCancelButton onClick={() => setReagendando(false)}>Voltar</ModalCancelButton>
          <ModalSubmitButton form="appointment-reschedule-form" disabled={executando !== null}>{executando === "reschedule" ? "Salvando…" : "Salvar novo horário"}</ModalSubmitButton>
        </> : <>
          <ModalCancelButton onClick={onClose}>Fechar</ModalCancelButton>
          {onReschedule && (appointment.status === "PENDING" || appointment.status === "CONFIRMED") && <button type="button" disabled={executando !== null} onClick={() => setReagendando(true)} className="h-11 rounded-[10px] border border-fog bg-white px-4 text-sm font-medium text-ink transition hover:bg-surface-sunken disabled:opacity-50">Reagendar</button>}
          {actions.map(({ action, label, tone }) => (
            <ModalSubmitButton key={action} tone={tone} disabled={executando !== null} onClick={() => executar(action)}>
              {executando === action ? "Salvando…" : label}
            </ModalSubmitButton>
          ))}
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {reagendando && <form id="appointment-reschedule-form" onSubmit={confirmarReagendamento} className="flex flex-col gap-2 rounded-[10px] bg-surface-sunken p-4">
          <label htmlFor="appointment-new-start" className="text-sm font-medium text-ink">Novo dia e horário</label>
          <input id="appointment-new-start" type="datetime-local" required value={novoInicio} onChange={event => setNovoInicio(event.target.value)} className="h-11 rounded-[8px] border border-fog bg-white px-3 text-sm text-ink outline-none focus:border-accent" />
          <p className="text-xs text-secondary">A duração atual será mantida e o sistema verificará a disponibilidade antes de salvar.</p>
        </form>}
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-lg font-bold text-[#0d1831]">{appointment.clientName}</p>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {appointment.barberName && <Row icon={Scissors}>{appointment.barberName}</Row>}
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
          {["PENDING", "CONFIRMED"].includes(appointment.status) && <AddToCalendarButton
            event={appointmentCalendarEvent(appointment, `Cliente: ${appointment.clientName}`)} />}
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
