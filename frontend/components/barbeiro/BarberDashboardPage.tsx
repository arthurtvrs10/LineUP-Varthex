"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Calendar, ChevronRight, Wallet } from "lucide-react";
import { AreaTrendChart, BarTrendChart } from "@/components/ui/TrendCharts";
import { StatCard, type StatTone } from "@/components/ui/StatCard";
import { SaudacaoHeader } from "@/components/layout/SaudacaoHeader";
import { apiFetch, ApiError } from "@/lib/api";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });

type AppointmentStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | "NO_SHOW";
type AppointmentResponse = { status: AppointmentStatus; totalAmount: string };
type BarberMeResponse = { id: string };
type CommissionSummaryResponse = { provisionedAmount: string; approvedAmount: string; paidAmount: string };

function toLocalDateTime(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function toLocalDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function somaComissao(resumo: CommissionSummaryResponse) {
  return Number(resumo.provisionedAmount) + Number(resumo.approvedAmount) + Number(resumo.paidAmount);
}

const shortcuts = [
  { href: "/barbeiro/agenda", title: "Abrir agenda", subtitle: "Ver sua agenda e atendimentos", icon: Calendar },
  { href: "/barbeiro/comissoes", title: "Consultar comissões", subtitle: "Ver somente seus lançamentos", icon: Wallet },
];

export function BarberDashboardPage() {
  const { data: session } = useSession();
  const [barber, setBarber] = useState<BarberMeResponse>();
  const [semana, setSemana] = useState<AppointmentResponse[]>([]);
  const [comissaoSemana, setComissaoSemana] = useState<number>();
  const [historicoMensal, setHistoricoMensal] = useState<{ label: string; comissao: number; atendimentos: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    apiFetch<BarberMeResponse>("/barbers/me")
      .then(setBarber)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar seu perfil de barbeiro."));
  }, []);

  async function carregar(barberId: string) {
    setLoading(true);
    try {
      const weekStart = startOfWeek(new Date());
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const weekEndInclusive = new Date(weekEnd.getTime() - 24 * 60 * 60 * 1000);
      const [semanaAtual, resumoComissaoSemana] = await Promise.all([
        apiFetch<AppointmentResponse[]>(
          `/appointments?${new URLSearchParams({ barberId, from: toLocalDateTime(weekStart), to: toLocalDateTime(weekEnd) })}`,
        ),
        apiFetch<CommissionSummaryResponse>(
          `/commissions/summary?${new URLSearchParams({ barberId, from: toLocalDate(weekStart), to: toLocalDate(weekEndInclusive) })}`,
        ),
      ]);
      setSemana(semanaAtual);
      setComissaoSemana(somaComissao(resumoComissaoSemana));

      const meses: { label: string; comissao: number; atendimentos: number }[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthEndInclusive = new Date(monthEnd.getTime() - 24 * 60 * 60 * 1000);
        const [items, resumoComissaoMes] = await Promise.all([
          apiFetch<AppointmentResponse[]>(
            `/appointments?${new URLSearchParams({ barberId, from: toLocalDateTime(monthStart), to: toLocalDateTime(monthEnd) })}`,
          ),
          apiFetch<CommissionSummaryResponse>(
            `/commissions/summary?${new URLSearchParams({ barberId, from: toLocalDate(monthStart), to: toLocalDate(monthEndInclusive) })}`,
          ),
        ]);
        const concluidos = items.filter((a) => a.status === "COMPLETED");
        meses.push({
          label: monthFormatter.format(monthStart),
          comissao: somaComissao(resumoComissaoMes),
          atendimentos: concluidos.length,
        });
      }
      setHistoricoMensal(meses);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar seus atendimentos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (barber) carregar(barber.id);
  }, [barber]);

  const concluidos = semana.filter((a) => a.status === "COMPLETED");
  const cancelados = semana.filter((a) => a.status === "CANCELED");
  const faltas = semana.filter((a) => a.status === "NO_SHOW");
  const valorBruto = concluidos.reduce((sum, a) => sum + Number(a.totalAmount), 0);

  const metrics: { label: string; value: string; tone?: StatTone }[] = [
    { label: "Agendamentos (semana)", value: loading ? "…" : String(semana.length) },
    { label: "Concluídos", value: loading ? "…" : String(concluidos.length), tone: "positivo" },
    { label: "Cancelados", value: loading ? "…" : String(cancelados.length), tone: "negativo" },
    { label: "Faltas", value: loading ? "…" : String(faltas.length), tone: "atencao" },
    { label: "Valor bruto", value: loading ? "…" : brl.format(valorBruto) },
    { label: "Minha comissão", value: loading || comissaoSemana === undefined ? "…" : brl.format(comissaoSemana), tone: "positivo" },
  ];

  const comissaoData = historicoMensal.map((m) => ({ label: m.label, value: m.comissao, detalhe: `${m.atendimentos} atendimentos` }));
  const atendimentosData = historicoMensal.map((m) => ({ label: m.label, value: m.atendimentos, detalhe: brl.format(m.comissao) }));

  return (
    <div className="flex flex-col gap-5">
      <SaudacaoHeader
        data={weekdayFormatter.format(new Date())}
        nome={session?.user?.name?.split(" ")[0] ?? "barbeiro"}
        contexto="Sua semana atual"
        acoes={
          <button
            type="button"
            onClick={() => barber && carregar(barber.id)}
            className="h-11 rounded-[10px] bg-accent px-5 text-sm font-bold text-on-accent transition hover:bg-accent-hover"
          >
            Atualizar
          </button>
        }
      />

      {error && (
        <p className="rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
        ))}
      </div>

      <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
        <h2 className="text-[17px] font-bold text-[#0d1831]">Acesso rápido</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {shortcuts.map(({ href, title, subtitle, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-[10px] border border-[#e6e4df] px-4 py-3.5 transition hover:bg-[#f7f6f2]"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-[#f7f6f2] text-[#5f6f87]">
                <Icon size={17} strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[#0d1831]">{title}</span>
                <span className="block text-xs text-[#5f6f87]">{subtitle}</span>
              </span>
              <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-[#98a2b3]" />
            </Link>
          ))}
        </div>
      </div>

      <section>
        <h2 className="text-[17px] font-bold text-[#0d1831]">Minha evolução</h2>
        <p className="mt-0.5 text-xs text-[#5f6f87]">Últimos 6 meses, contando só atendimentos concluídos.</p>

        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
          <div className="min-w-0 rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <h3 className="text-base font-bold text-[#0d1831]">Comissão por mês</h3>
            <p className="mt-1 text-xs text-[#5f6f87]">Soma dos lançamentos de comissão em cada mês do período.</p>
            <div className="mt-5">
              <AreaTrendChart
                data={comissaoData}
                height={216}
                yWidth={56}
                format="moedaCompacta"
                label={`Comissão por mês. ${comissaoData.map((d) => `${d.label}: ${brl.format(d.value)}`).join(", ")}.`}
              />
            </div>
          </div>

          <div className="min-w-0 rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <h3 className="text-base font-bold text-[#0d1831]">Atendimentos por mês</h3>
            <p className="mt-1 text-xs text-[#5f6f87]">Atendimentos concluídos em cada mês do período.</p>
            <div className="mt-5">
              <BarTrendChart
                data={atendimentosData}
                height={216}
                yWidth={32}
                label={`Atendimentos por mês. ${atendimentosData.map((d) => `${d.label}: ${d.value}`).join(", ")}.`}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
