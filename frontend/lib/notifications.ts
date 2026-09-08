import type { Notificacao } from "@/components/layout/NotificacoesPopover";

export type NotificationType = "APPOINTMENT_CREATED" | "APPOINTMENT_CONFIRMED" | "APPOINTMENT_CANCELED";

export type NotificationResponse = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceType: string | null;
  referenceId: string | null;
  readAt: string | null;
  createdAt: string;
};

const toneByType: Record<NotificationType, Notificacao["tone"]> = {
  APPOINTMENT_CREATED: "positivo",
  APPOINTMENT_CONFIRMED: "positivo",
  APPOINTMENT_CANCELED: "atencao",
};

export function formatRelativo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutos = Math.floor(diffMs / 60000);

  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;

  const dias = Math.floor(horas / 24);
  if (dias === 1) return "ontem";
  return `há ${dias} dias`;
}

export function toNotificacao(n: NotificationResponse): Notificacao {
  return {
    id: n.id,
    titulo: n.title,
    detalhe: n.message,
    quando: formatRelativo(n.createdAt),
    tone: toneByType[n.type] ?? "neutro",
    lida: n.readAt !== null,
  };
}
