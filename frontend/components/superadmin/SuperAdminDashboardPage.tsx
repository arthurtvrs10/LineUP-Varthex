"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { BarTrendChart } from "@/components/ui/TrendCharts";
import { StatCard } from "@/components/ui/StatCard";
import { SaudacaoHeader } from "@/components/layout/SaudacaoHeader";
import { apiFetch, ApiError } from "@/lib/api";

type TenantStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELED";

type TenantResponse = {
  id: string;
  tradeName: string;
  document: string | null;
  status: TenantStatus;
  email: string | null;
  createdAt: string;
  version: number;
};

type UserSummaryResponse = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "BARBER" | "CLIENT";
  status: string;
  tenantId: string | null;
};

const statusLabel: Record<TenantStatus, string> = {
  TRIAL: "Trial",
  ACTIVE: "Ativo",
  PAST_DUE: "Inadimplente",
  SUSPENDED: "Suspenso",
  CANCELED: "Cancelado",
};

const statusStyles: Record<TenantStatus, string> = {
  TRIAL: "bg-[#fdf3e3] text-[#d28b27]",
  ACTIVE: "bg-[#e8f7f1] text-[#27865b]",
  PAST_DUE: "bg-[#fdf3e3] text-[#d28b27]",
  SUSPENDED: "bg-[#fdeaea] text-[#c84a4a]",
  CANCELED: "bg-[#f0efea] text-[#686a73]",
};

const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export function SuperAdminDashboardPage() {
  const [tenants, setTenants] = useState<TenantResponse[]>([]);
  const [users, setUsers] = useState<UserSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    Promise.all([apiFetch<TenantResponse[]>("/tenants"), apiFetch<UserSummaryResponse[]>("/users")])
      .then(([t, u]) => {
        setTenants(t);
        setUsers(u);
        setError(undefined);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar os dados da plataforma."))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const ativas = tenants.filter((t) => t.status === "ACTIVE");
  const suspensas = tenants.filter((t) => t.status === "SUSPENDED");
  const trial = tenants.filter((t) => t.status === "TRIAL");
  const novosMes = tenants.filter((t) => {
    const d = new Date(t.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const usuariosAtivos = users.filter((u) => u.status === "ACTIVE");

  const metrics = [
    { label: "Barbearias ativas", value: loading ? "…" : String(ativas.length) },
    { label: "Em trial", value: loading ? "…" : String(trial.length) },
    { label: "Novos cadastros (mês)", value: loading ? "…" : String(novosMes.length) },
    { label: "Usuários ativos", value: loading ? "…" : String(usuariosAtivos.length) },
    { label: "Suspensas", value: loading ? "…" : String(suspensas.length), tone: suspensas.length > 0 ? ("negativo" as const) : undefined },
  ];

  const cadastrosPorMes = Array.from({ length: 6 }, (_, i) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const count = tenants.filter((t) => {
      const d = new Date(t.createdAt);
      return d.getFullYear() === monthDate.getFullYear() && d.getMonth() === monthDate.getMonth();
    }).length;
    return { label: monthFormatter.format(monthDate), value: count, detalhe: `${count} cadastro(s)` };
  });

  const precisamAtencao = [...suspensas, ...trial].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const recentes = [...tenants].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  return (
    <div className="flex w-full flex-col items-start gap-5">
      <SaudacaoHeader
        data={dateFormatter.format(now)}
        nome="Super Admin"
        contexto={`Painel da plataforma · ${loading ? "…" : ativas.length} barbearia(s) ativa(s)`}
      />

      {error && <p className="w-full rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">{error}</p>}

      <div className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {metrics.map((m) => (
          <StatCard key={m.label} label={m.label} value={m.value} tone={m.tone} />
        ))}
      </div>

      <div className="grid w-full grid-cols-1 lg:grid-cols-[661fr_438fr] gap-4">
        <div className="rounded-[12px] border border-[#e6e4df] bg-white p-6">
          <p className="text-lg font-bold text-[#0d1831]">Novos cadastros por mês</p>
          <p className="pt-1 text-sm text-[#98a2b3]">Últimos 6 meses</p>
          <div className="pt-4">
            <BarTrendChart
              data={cadastrosPorMes}
              height={220}
              yWidth={32}
              label={`Novos cadastros por mês. ${cadastrosPorMes.map((d) => `${d.label}: ${d.value}`).join(", ")}.`}
            />
          </div>
        </div>

        <div className="rounded-[12px] border border-[#e6e4df] bg-white p-6">
          <p className="text-lg font-bold text-[#0d1831]">Precisam de atenção</p>
          <p className="pt-1 text-sm text-[#98a2b3]">Suspensas ou ainda em trial</p>
          <div className="flex flex-col divide-y divide-[#eef0f3] pt-4">
            {loading ? (
              <p className="py-3 text-sm text-[#98a2b3]">Carregando…</p>
            ) : precisamAtencao.length === 0 ? (
              <p className="py-3 text-sm text-[#98a2b3]">Nenhuma barbearia precisa de atenção agora.</p>
            ) : (
              precisamAtencao.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-start gap-3 py-3">
                  <span
                    className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
                      t.status === "SUSPENDED" ? "bg-[#fdeaea] text-[#c84a4a]" : "bg-[#fdf3e3] text-[#d28b27]"
                    }`}
                  >
                    <AlertTriangle size={13} strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#0d1831]">{t.tradeName}</p>
                    <p className="pt-1 text-xs text-[#98a2b3]">
                      {statusLabel[t.status]} desde {dateFormatter.format(new Date(t.createdAt))}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="w-full rounded-[12px] border border-[#e6e4df] bg-white p-6">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-[#0d1831]">Barbearias recentes</p>
          <Link href="/superadmin/barbearias" className="flex items-center gap-1 text-xs font-bold text-accent-strong">
            Ver todas <ChevronRight size={13} strokeWidth={2} />
          </Link>
        </div>
        <div className="flex items-center justify-between border-b border-[#e6e4df] pt-4 pb-2 text-[10px] font-bold text-[#98a2b3]">
          <span>BARBEARIA</span>
          <span>STATUS</span>
        </div>
        <div className="flex flex-col divide-y divide-[#eef0f3]">
          {loading ? (
            <p className="py-4 text-sm text-[#98a2b3]">Carregando…</p>
          ) : recentes.length === 0 ? (
            <p className="py-4 text-sm text-[#98a2b3]">Nenhuma barbearia cadastrada ainda.</p>
          ) : (
            recentes.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-[10px] bg-accent-subtle text-xs font-bold text-accent-strong">
                    {t.tradeName
                      .split(" ")
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join("")}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#0d1831]">{t.tradeName}</p>
                    <p className="text-sm text-[#5f6f87]">{t.email ?? "—"}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[t.status]}`}>
                  {statusLabel[t.status]}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
