"use client";

import { useMemo, useState } from "react";
import { Check, Info, UserCheck } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  description: string;
  channel: "No aplicativo" | "E-mail";
  time: string;
  read: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: "n1",
    title: "Novo agendamento",
    description: "Ana Costa agendou Corte de cabelo para hoje, às 16:30.",
    channel: "No aplicativo",
    time: "Hoje, 14:20",
    read: false,
  },
  {
    id: "n2",
    title: "Agendamento cancelado",
    description: "Bruno Alves cancelou o atendimento de Barba das 18:00.",
    channel: "E-mail",
    time: "Hoje, 12:05",
    read: false,
  },
  {
    id: "n3",
    title: "Comissão gerada",
    description: "Uma comissão de R$ 28,00 foi provisionada após o atendimento.",
    channel: "No aplicativo",
    time: "Hoje, 10:42",
    read: false,
  },
  {
    id: "n4",
    title: "Estoque baixo",
    description: "O estoque de Pomada modeladora atingiu o limite configurado.",
    channel: "No aplicativo",
    time: "Ontem, 17:30",
    read: true,
  },
  {
    id: "n5",
    title: "Novo agendamento",
    description: "Carla Dias agendou Corte + Barba para 18 de agosto, às 09:00.",
    channel: "E-mail",
    time: "14 ago, 16:10",
    read: true,
  },
];

type Preference = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  locked?: boolean;
};

const initialPreferences: Preference[] = [
  {
    id: "agendamentos",
    title: "Agendamentos",
    description: "No aplicativo · Obrigatória",
    enabled: true,
    locked: true,
  },
  {
    id: "cancelamentos",
    title: "Cancelamentos",
    description: "E-mail · Obrigatória",
    enabled: true,
    locked: true,
  },
  {
    id: "comissao",
    title: "Comissão gerada",
    description: "No aplicativo",
    enabled: true,
  },
  {
    id: "estoque",
    title: "Estoque baixo",
    description: "E-mail",
    enabled: false,
  },
];

export function BarberNotificacoesPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<"Todas" | "Não lidas">("Todas");
  const [preferences, setPreferences] = useState<Preference[]>(initialPreferences);
  const [saved, setSaved] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const visibleNotifications = useMemo(
    () =>
      filter === "Não lidas"
        ? notifications.filter((notification) => !notification.read)
        : notifications,
    [notifications, filter]
  );

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }

  function togglePreference(id: string) {
    setPreferences((prev) =>
      prev.map((preference) =>
        preference.id === id && !preference.locked
          ? { ...preference, enabled: !preference.enabled }
          : preference
      )
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#101828]">Notificações</h1>
          <p className="mt-1 text-sm text-[#475467]">
            Acompanhe avisos importantes da sua conta.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#eef1ff] px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-[#293aa3]" />
          <span className="text-xs font-bold text-[#293aa3]">{unreadCount} não lidas</span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-[#eff8ff] px-5 py-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1849a9]" />
          <div>
            <p className="text-sm font-bold text-[#1849a9]">
              Suas notificações são pessoais
            </p>
            <p className="mt-1 text-xs text-[#175cd3]">
              Somente você pode visualizar e marcar estes avisos como lidos. Notificações
              obrigatórias permanecem ativas.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full border border-[#1849a9]/20 bg-white px-3 py-1.5">
          <UserCheck className="h-3 w-3 text-[#1849a9]" />
          <span className="text-[11px] font-bold text-[#1849a9]">Dados próprios</span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        <div className="rounded-xl border border-[#eaecf0] bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#101828]">Seus avisos</h2>
              <p className="mt-1 text-[13px] text-[#475467]">
                Eventos importantes registrados para sua conta.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter("Todas")}
                className={`rounded-full px-4 py-1.5 text-[11px] font-bold transition ${
                  filter === "Todas"
                    ? "bg-[#3448c5] text-white"
                    : "border border-[#d0d5dd] text-[#475467] hover:bg-[#f8f9fc]"
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setFilter("Não lidas")}
                className={`rounded-full px-4 py-1.5 text-[11px] font-bold transition ${
                  filter === "Não lidas"
                    ? "bg-[#3448c5] text-white"
                    : "border border-[#d0d5dd] text-[#475467] hover:bg-[#f8f9fc]"
                }`}
              >
                Não lidas ({unreadCount})
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col divide-y divide-[#eaecf0] border-t border-[#eaecf0]">
            {visibleNotifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 py-4">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    notification.read ? "bg-transparent" : "bg-[#3448c5]"
                  }`}
                />
                <div className="flex-1">
                  <p
                    className={`text-sm font-bold ${
                      notification.read ? "text-[#344054]" : "text-[#101828]"
                    }`}
                  >
                    {notification.title}
                  </p>
                  <p
                    className={`mt-1 text-xs ${
                      notification.read ? "text-[#667085]" : "text-[#475467]"
                    }`}
                  >
                    {notification.description}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      notification.read
                        ? "bg-[#f2f4f7] text-[#667085]"
                        : "bg-[#eef1ff] text-[#293aa3]"
                    }`}
                  >
                    {notification.channel}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <p
                    className={`text-[11px] ${
                      notification.read ? "text-[#98a2b3]" : "text-[#667085]"
                    }`}
                  >
                    {notification.time}
                  </p>
                  {notification.read ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#98a2b3]">
                      <Check className="h-3 w-3" />
                      Lida
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                      className="text-[11px] font-bold text-[#3448c5] hover:underline"
                    >
                      Marcar como lida
                    </button>
                  )}
                </div>
              </div>
            ))}
            {visibleNotifications.length === 0 && (
              <p className="py-6 text-center text-sm text-[#98a2b3]">
                Nenhuma notificação por aqui.
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#eaecf0] pt-4 text-[11px] text-[#667085]">
            <span>Mostrando notificações da sua conta</span>
            <span className="text-[#98a2b3]">{notifications.length} avisos</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#eaecf0] bg-white p-5">
          <h2 className="text-lg font-bold text-[#101828]">Preferências</h2>
          <p className="mt-1 text-xs text-[#475467]">Escolha os canais permitidos.</p>

          <div className="mt-4 flex flex-col divide-y divide-[#eaecf0] border-t border-[#eaecf0]">
            {preferences.map((preference) => (
              <div key={preference.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[13px] font-bold text-[#101828]">{preference.title}</p>
                  <p className="mt-1 text-[11px] text-[#667085]">{preference.description}</p>
                </div>
                <button
                  type="button"
                  disabled={preference.locked}
                  onClick={() => togglePreference(preference.id)}
                  aria-pressed={preference.enabled}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                    preference.enabled ? "bg-[#3448c5]" : "bg-[#e4e7ec]"
                  } ${preference.locked ? "cursor-not-allowed opacity-70" : ""}`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                      preference.enabled ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setSaved(true)}
            className="mt-5 w-full rounded-lg bg-[#3448c5] py-2.5 text-sm font-medium text-white transition hover:bg-[#2c3aa8]"
          >
            {saved ? "Preferências salvas" : "Salvar preferências"}
          </button>
        </div>
      </div>
    </div>
  );
}
