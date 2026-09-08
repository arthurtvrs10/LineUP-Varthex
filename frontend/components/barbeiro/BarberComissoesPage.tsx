"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";

type CommissionSummary = { provisionedAmount: string; approvedAmount: string; paidAmount: string };
type CommissionEntry = {
  id: string;
  appointmentId: string | null;
  baseAmount: string;
  percentage: string;
  fixedAmount: string;
  commissionAmount: string;
  status: "PROVISIONED" | "APPROVED" | "PAID" | "REVERSED";
  reason: string | null;
  createdAt: string;
};

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const statusLabels: Record<CommissionEntry["status"], string> = {
  PROVISIONED: "Provisionado",
  APPROVED: "Aprovado",
  PAID: "Pago",
  REVERSED: "Estornado",
};

function toIsoDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function BarberComissoesPage() {
  const [from, setFrom] = useState(() => toIsoDate(startOfMonth(new Date())));
  const [to, setTo] = useState(() => toIsoDate(endOfMonth(new Date())));
  const [summary, setSummary] = useState<CommissionSummary>();
  const [entries, setEntries] = useState<CommissionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  async function carregar() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from, to });
      const [summaryRes, entriesRes] = await Promise.all([
        apiFetch<CommissionSummary>(`/commissions/summary?${params}`),
        apiFetch<CommissionEntry[]>(`/commissions?${params}`),
      ]);
      setSummary(summaryRes);
      setEntries(entriesRes);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar suas comissões.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = summary
    ? Number(summary.provisionedAmount) + Number(summary.approvedAmount) + Number(summary.paidAmount)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[30px] font-bold text-[#0d1831]">Comissões</h1>
        <p className="mt-1 text-sm text-[#5f6f87]">Acompanhe o cálculo e o histórico das suas comissões.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-[12px] border border-[#e6e4df] bg-white p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-[#5f6f87]">De</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-[#5f6f87]">Até</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-10 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent" />
        </div>
        <button
          type="button"
          onClick={carregar}
          className="h-10 rounded-[10px] bg-accent px-5 text-sm font-bold text-on-accent transition hover:bg-accent-hover"
        >
          Filtrar
        </button>
      </div>

      {error && <p className="rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">{error}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total no período" value={loading || !summary ? "…" : brl.format(total)} tone="positivo" />
        <StatCard label="Provisionado" value={loading || !summary ? "…" : brl.format(Number(summary.provisionedAmount))} />
        <StatCard label="Aprovado" value={loading || !summary ? "…" : brl.format(Number(summary.approvedAmount))} />
        <StatCard label="Pago" value={loading || !summary ? "…" : brl.format(Number(summary.paidAmount))} />
      </div>

      <div className="rounded-[12px] border border-[#e6e4df] bg-white">
        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-[#98a2b3]">Carregando…</p>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-accent-subtle text-accent-strong">
              <Wallet size={20} strokeWidth={1.8} />
            </span>
            <p className="mt-4 text-sm text-[#98a2b3]">Nenhum lançamento neste período.</p>
          </div>
        ) : (
          <ul>
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 border-b border-[#eef0f3] px-5 py-4 last:border-none">
                <div>
                  <p className="text-sm font-bold text-[#0d1831]">
                    {entry.reason ?? (entry.appointmentId ? "Comissão de atendimento" : "Ajuste manual")}
                  </p>
                  <p className="mt-0.5 text-xs text-[#5f6f87]">
                    {statusLabels[entry.status]} · {dateFormatter.format(new Date(entry.createdAt))}
                    {Number(entry.percentage) > 0 && ` · ${entry.percentage}%`}
                  </p>
                </div>
                <p className={`shrink-0 text-sm font-bold ${Number(entry.commissionAmount) < 0 ? "text-[#c84a4a]" : "text-[#27865b]"}`}>
                  {brl.format(Number(entry.commissionAmount))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
