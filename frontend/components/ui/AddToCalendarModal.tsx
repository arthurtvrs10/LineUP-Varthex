"use client";

import { CalendarPlus } from "lucide-react";
import { Modal, ModalCancelButton } from "./Modal";
import { googleCalendarUrl, type CalendarEvent } from "@/lib/calendar-event";

export function AddToCalendarModal({ event, onClose }: { event: CalendarEvent | null; onClose: () => void }) {
  const dateLabel = event ? `${event.startAt.slice(8, 10)}/${event.startAt.slice(5, 7)}/${event.startAt.slice(0, 4)} às ${event.startAt.slice(11, 16)}` : "";
  return (
    <Modal open={event !== null} onClose={onClose} size="sm" title="Adicionar à sua agenda?"
      description="Seu agendamento foi salvo no LineUp."
      footer={<>
        <ModalCancelButton onClick={onClose}>Agora não</ModalCancelButton>
        {event && <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" onClick={(click) => {
          // Keep the clicked event's URL even if closing immediately offers
          // another appointment in the same dialog.
          click.preventDefault();
          window.open(click.currentTarget.href, "_blank", "noopener,noreferrer");
          onClose();
        }}
          className="flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-accent px-4 text-sm font-bold text-on-accent hover:bg-accent-hover">
          <CalendarPlus size={18} /> Adicionar ao Google Calendar
        </a>}
      </>}>
      {event && <div className="space-y-3 text-sm text-secondary">
        <p className="font-semibold text-ink">{event.title}</p>
        <p>{dateLabel} (horário de Brasília)</p>
        <p>O Google Calendar abrirá em outra aba. Escolha sua conta e clique em Salvar para adicionar o evento.</p>
        <p className="text-xs">Se este atendimento já foi sincronizado com sua agenda, não precisa adicioná-lo novamente. Eventos adicionados por este botão não são atualizados automaticamente ao reagendar ou cancelar.</p>
      </div>}
    </Modal>
  );
}
