"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, ListOrdered } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { Toast, useToast } from "@/components/ui/Toast";

type WaitlistEntry = {
  id: string;
  serviceName: string | null;
  preferredBarberName: string | null;
  windowStartAt: string;
  windowEndAt: string;
  status: "ACTIVE" | "BOOKED" | "CANCELED";
};

type WaitlistOffer = {
  id: string;
  barberId: string;
  barberName: string | null;
  slotStartAt: string;
  slotEndAt: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  expiresAt: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export function FilaDeEsperaPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [ofertasPorEntrada, setOfertasPorEntrada] = useState<Record<string, WaitlistOffer[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [respondendo, setRespondendo] = useState<string>();
  const toast = useToast();

  async function carregar() {
    setLoading(true);
    try {
      const entriesRes = await apiFetch<WaitlistEntry[]>("/waitlist-entries");
      setEntries(entriesRes);

      const ofertasEntries = await Promise.all(
        entriesRes.map((entry) =>
          apiFetch<WaitlistOffer[]>(`/waitlist-entries/${entry.id}/offers`)
            .then((ofertas) => [entry.id, ofertas] as const)
            .catch(() => [entry.id, []] as const),
        ),
      );
      setOfertasPorEntrada(Object.fromEntries(ofertasEntries));
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar sua fila de espera.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function aceitar(offerId: string) {
    setRespondendo(offerId);
    try {
      await apiFetch(`/waitlist-offers/${offerId}/accept`, { method: "POST" });
      toast.mostrar("Agendamento confirmado!");
      setTimeout(() => router.push("/clientes/dashboard"), 1200);
    } catch (err) {
      toast.mostrar(err instanceof ApiError ? err.message : "Não foi possível aceitar essa vaga.", "erro");
      carregar();
    } finally {
      setRespondendo(undefined);
    }
  }

  async function recusar(offerId: string) {
    setRespondendo(offerId);
    try {
      await apiFetch(`/waitlist-offers/${offerId}/reject`, { method: "POST" });
      toast.mostrar("Vaga recusada.");
      carregar();
    } catch (err) {
      toast.mostrar(err instanceof ApiError ? err.message : "Não foi possível recusar essa vaga.", "erro");
    } finally {
      setRespondendo(undefined);
    }
  }

  const ativas = entries.filter((e) => e.status === "ACTIVE");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0d1831]">Fila de espera</h1>
        <p className="mt-1 text-sm text-[#5f6f87]">
          Horários que você está aguardando. Quando a barbearia oferecer uma vaga, você confirma por aqui.
        </p>
      </div>

      {error && <p className="rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">{error}</p>}

      <div className="rounded-[12px] border border-[#e6e4df] bg-white">
        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-[#98a2b3]">Carregando…</p>
        ) : ativas.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-accent-subtle text-accent-strong">
              <ListOrdered size={20} strokeWidth={1.8} />
            </span>
            <p className="mt-4 text-sm text-[#98a2b3]">
              Você não está em nenhuma fila de espera. Peça pra barbearia te colocar quando não houver horário disponível.
            </p>
          </div>
        ) : (
          <ul>
            {ativas.map((entry) => {
              const ofertaPendente = (ofertasPorEntrada[entry.id] ?? []).find((o) => o.status === "PENDING");

              return (
                <li key={entry.id} className="border-b border-[#eef0f3] px-5 py-4 last:border-none">
                  <p className="text-sm font-bold text-[#0d1831]">{entry.serviceName ?? "Serviço"}</p>
                  <p className="mt-0.5 text-xs text-[#5f6f87]">
                    {entry.preferredBarberName ? `Com ${entry.preferredBarberName} · ` : ""}
                    Janela: {dateTimeFormatter.format(new Date(entry.windowStartAt))} —{" "}
                    {dateTimeFormatter.format(new Date(entry.windowEndAt))}
                  </p>

                  {ofertaPendente && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-accent-subtle px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-accent-strong">
                          <Gift size={15} strokeWidth={2} />
                        </span>
                        <p className="text-xs font-bold text-accent-strong">
                          Vaga disponível com {ofertaPendente.barberName} em{" "}
                          {dateTimeFormatter.format(new Date(ofertaPendente.slotStartAt))}!
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => recusar(ofertaPendente.id)}
                          disabled={respondendo === ofertaPendente.id}
                          className="rounded-[8px] border border-[#e6e4df] bg-white px-3.5 py-2 text-xs font-bold text-[#5f6f87] transition hover:bg-[#f7f6f2] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Recusar
                        </button>
                        <button
                          type="button"
                          onClick={() => aceitar(ofertaPendente.id)}
                          disabled={respondendo === ofertaPendente.id}
                          className="rounded-[8px] bg-accent px-3.5 py-2 text-xs font-bold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {respondendo === ofertaPendente.id ? "Confirmando…" : "Aceitar"}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
