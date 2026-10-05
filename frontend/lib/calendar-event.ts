export type CalendarAppointment = {
  id: string;
  customerId?: string;
  startAt: string;
  endAt: string;
  items: { name: string }[];
};

export type CalendarEvent = {
  title: string;
  startAt: string;
  endAt: string;
  description?: string;
  location?: string;
};

// The API uses local wall-clock timestamps. Keep that time in Brazil even
// when the browser or the user's Google account uses a different timezone.
function calendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(value)) {
    throw new Error("Horário inválido para o calendário.");
  }
  return (value.length === 16 ? `${value}:00` : value.slice(0, 19)).replace(/[-:]/g, "");
}

export function googleCalendarUrl(event: CalendarEvent) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${calendarDate(event.startAt)}/${calendarDate(event.endAt)}`,
    ctz: "America/Sao_Paulo",
    details: event.description ?? "Agendamento no LineUp.",
  });
  if (event.location) params.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function appointmentCalendarEvent(appointment: CalendarAppointment, detail?: string): CalendarEvent {
  return {
    title: appointment.items.map((item) => item.name).join(" + ") || "Atendimento",
    startAt: appointment.startAt,
    endAt: appointment.endAt,
    description: ["Agendamento no LineUp.", detail].filter(Boolean).join("\n"),
  };
}

const sessionSeen = new Set<string>();
export function calendarPromptSeen(audience: string, appointment: CalendarAppointment) {
  const key = `lineup:calendar-prompt:${audience}:${appointment.id}:${appointment.startAt}`;
  try { return sessionSeen.has(key) || localStorage.getItem(key) === "seen"; } catch { return sessionSeen.has(key); }
}

export function markCalendarPrompt(audience: string, appointment: CalendarAppointment) {
  const key = `lineup:calendar-prompt:${audience}:${appointment.id}:${appointment.startAt}`;
  sessionSeen.add(key);
  try { localStorage.setItem(key, "seen"); } catch { /* Optional persistence. */ }
}
