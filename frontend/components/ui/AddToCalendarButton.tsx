import { CalendarPlus } from "lucide-react";
import { googleCalendarUrl, type CalendarEvent } from "@/lib/calendar-event";

export function AddToCalendarButton({ event }: { event: CalendarEvent }) {
  return <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer"
    className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-xs font-medium text-secondary transition hover:bg-surface-sunken hover:text-ink"
    title="Abre o Google Calendar em outra aba; confirme o salvamento na sua conta.">
    <CalendarPlus size={15} aria-hidden="true" /> Adicionar ao Google Calendar
  </a>;
}
