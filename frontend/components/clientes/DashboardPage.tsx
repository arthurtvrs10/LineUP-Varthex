"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, CalendarDays, Clock, Gift, MapPin, Scissors, UserRound } from "lucide-react";
import { SaudacaoHeader } from "@/components/layout/SaudacaoHeader";
import { apiFetch, ApiError } from "@/lib/api";
import { useMyCustomer } from "./MyCustomerContext";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
const dateLongFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long" });
const weekdayShortFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

type AppointmentResponse = {
  id: string;
  unitId: string;
  barberId: string;
  status: string;
  startAt: string;
  endAt: string;
  totalAmount: string;
  items: { name: string }[];
};

type BarberResponse = { id: string; displayName: string };

function toLocalDateTime(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export function DashboardPage() {
  const { data: session } = useSession();
  const { customer } = useMyCustomer();
  const [proximo, setProximo] = useState<AppointmentResponse>();
  const [barberName, setBarberName] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function carregar() {
      try {
        const now = new Date();
        const future = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        const items = await apiFetch<AppointmentResponse[]>(
          `/appointments?${new URLSearchParams({ from: toLocalDateTime(now), to: toLocalDateTime(future) })}`,
        );
        const proximos = items
          .filter((a) => a.status !== "CANCELED" && a.status !== "NO_SHOW" && a.status !== "COMPLETED")
          .sort((a, b) => a.startAt.localeCompare(b.startAt));

        const next = proximos[0];
        setProximo(next);

        if (next) {
          const barbers = await apiFetch<BarberResponse[]>(`/barbers?unitId=${next.unitId}`);
          setBarberName(barbers.find((b) => b.id === next.barberId)?.displayName);
        }
        setError(undefined);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Não foi possível carregar seus agendamentos.");
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const primeiroNome = session?.user?.name?.split(" ")[0] ?? "";

  return (
    <div className="flex flex-col gap-5">
      <SaudacaoHeader
        data={weekdayFormatter.format(new Date())}
        nome={primeiroNome}
        contexto={customer?.tenantName ?? ""}
        acoes={
          <Link
            href="/clientes/agendamento"
            className="flex h-11 items-center gap-2 rounded-[10px] bg-accent px-5 text-sm font-bold text-on-accent transition hover:bg-accent-hover"
          >
            Agendar novo horário
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        }
      />

      {error && (
        <p className="rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">{error}</p>
      )}

      <section>
        <h2 className="text-[17px] font-bold text-[#0d1831]">Próximo agendamento</h2>

        <div className="mt-3 rounded-[12px] border border-[#e6e4df] bg-white p-5">
          {loading ? (
            <p className="text-sm text-[#98a2b3]">Carregando…</p>
          ) : !proximo ? (
            <p className="text-sm text-[#98a2b3]">Você não tem nenhum agendamento futuro.</p>
          ) : (
            <div className="flex flex-wrap items-start gap-6">
              <div className="flex items-center gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-[10px] bg-accent-subtle text-accent-strong">
                  <CalendarDays size={22} strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-[11px] font-bold tracking-wide text-[#98a2b3]">
                    {weekdayShortFormatter.format(new Date(proximo.startAt)).toUpperCase()}
                  </p>
                  <p className="text-xl font-bold text-[#0d1831]">{dateLongFormatter.format(new Date(proximo.startAt))}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[#5f6f87]">
                    <Clock size={13} strokeWidth={2} />
                    {timeFormatter.format(new Date(proximo.startAt))} — {timeFormatter.format(new Date(proximo.endAt))}
                  </p>
                </div>
              </div>

              <div className="hidden self-stretch border-l border-[#eef0f3] lg:block" />

              <div className="min-w-[200px] flex-1">
                <p className="flex items-center gap-1.5 text-sm font-bold text-[#0d1831]">
                  <Scissors size={14} strokeWidth={2} className="text-[#98a2b3]" />
                  {proximo.items.map((i) => i.name).join(" + ")}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5f6f87]">
                  <span className="flex items-center gap-1.5">
                    <UserRound size={13} strokeWidth={2} className="text-[#98a2b3]" />
                    {barberName ?? "Profissional"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} strokeWidth={2} className="text-[#98a2b3]" />
                    {customer?.tenantName}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <p className="text-[11px] font-bold tracking-wide text-[#98a2b3]">VALOR</p>
                  <p className="text-xl font-bold text-[#0d1831]">{brl.format(Number(proximo.totalAmount))}</p>
                </div>
                <Link
                  href="/clientes/historico"
                  className="rounded-[10px] border border-[#e6e4df] px-4 py-2 text-xs font-bold text-[#5f6f87] transition hover:bg-[#f7f6f2] hover:text-[#0d1831]"
                >
                  Ver detalhes
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-[17px] font-bold text-[#0d1831]">Minha fidelidade</h2>
        <div className="mt-3 flex items-center gap-3 rounded-[12px] border border-dashed border-[#e6e4df] bg-white px-5 py-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-subtle text-accent-strong">
            <Gift size={18} strokeWidth={1.8} />
          </span>
          <p className="text-sm text-[#5f6f87]">O programa de fidelidade ainda não está disponível.</p>
        </div>
      </section>

      <p className="border-t border-[#e6e4df] pt-5 text-[11px] text-[#98a2b3]">
        Histórico de gastos ainda não está disponível.
      </p>
    </div>
  );
}
