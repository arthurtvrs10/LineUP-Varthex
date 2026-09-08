"use client";

import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { formatRelativo, type NotificationResponse } from "@/lib/notifications";

const toneDot: Record<NotificationResponse["type"], string> = {
  APPOINTMENT_CREATED: "#27865b",
  APPOINTMENT_CONFIRMED: "#27865b",
  APPOINTMENT_CANCELED: "#d28b27",
};

export function BarberNotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  function carregar() {
    setLoading(true);
    apiFetch<NotificationResponse[]>("/notifications")
      .then((data) => {
        setNotificacoes(data);
        setError(undefined);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar suas notificações."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function marcarLida(id: string) {
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      carregar();
    }
  }

  async function marcarTodasLidas() {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    try {
      await apiFetch("/notifications/read-all", { method: "PATCH" });
    } catch {
      carregar();
    }
  }

  const naoLidas = notificacoes.filter((n) => !n.readAt);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0d1831]">Notificações</h1>
          <p className="mt-1 text-sm text-[#5f6f87]">
            {naoLidas.length > 0 ? `${naoLidas.length} não lidas` : "Tudo em dia"}
          </p>
        </div>
        {naoLidas.length > 0 && (
          <button
            type="button"
            onClick={marcarTodasLidas}
            className="flex items-center gap-1.5 rounded-[10px] border border-[#e6e4df] px-4 py-2 text-xs font-bold text-accent-strong transition hover:bg-[#f7f6f2]"
          >
            <Check size={13} strokeWidth={2.5} />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {error && <p className="rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">{error}</p>}

      <div className="rounded-[12px] border border-[#e6e4df] bg-white">
        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-[#98a2b3]">Carregando…</p>
        ) : notificacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-accent-subtle text-accent-strong">
              <Bell size={20} strokeWidth={1.8} />
            </span>
            <p className="mt-4 text-sm text-[#98a2b3]">Nenhuma notificação por aqui ainda.</p>
          </div>
        ) : (
          <ul>
            {notificacoes.map((n) => (
              <li key={n.id} className="border-b border-[#eef0f3] last:border-none">
                <button
                  type="button"
                  onClick={() => !n.readAt && marcarLida(n.id)}
                  className={`flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-[#f7f6f2] ${n.readAt ? "opacity-60" : ""}`}
                >
                  <span
                    className="mt-1.5 size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: toneDot[n.type] ?? "#98a2b3" }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#0d1831]">{n.title}</p>
                    <p className="mt-0.5 text-sm text-[#5f6f87]">{n.message}</p>
                    <p className="mt-1 text-xs text-[#98a2b3]">{formatRelativo(n.createdAt)}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
