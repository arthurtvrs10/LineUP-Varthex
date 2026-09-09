"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bell, Calendar, ChevronRight, Wallet } from "lucide-react";
import { AreaTrendChart, BarTrendChart } from "@/components/ui/TrendCharts";
import { StatCard, type StatTone } from "@/components/ui/StatCard";
import { SaudacaoHeader } from "@/components/layout/SaudacaoHeader";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiFetch, ApiError } from "@/lib/api";
import { AppointmentDetailModal } from "./modals/AppointmentDetailModal";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const dateShortFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

type AppointmentStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | "NO_SHOW";
type AppointmentResponse = {
  id: string;
  customerId: string;
  status: AppointmentStatus;
  channel: string;
  startAt: string;
  endAt: string;
  totalAmount: string;
  notes: string | null;
  items: { name: string }[];
};
type BarberMeResponse = { id: string };
type CommissionSummaryResponse = { provisionedAmount: string; approvedAmount: string; paidAmount: string };
type CustomerOption = { id: string; fullName: string };
type CustomerPageResponse = { items: CustomerOption[] };

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
  const [customersById, setCustomersById] = useState<Record<string, string>>({});
  const [detalhe, setDetalhe] = useState<AppointmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const toast = useToast();

  useEffect(() => {
    apiFetch<BarberMeResponse>("/barbers/me")
      .then(setBarber)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar seu perfil de barbeiro."));
    apiFetch<CustomerPageResponse>("/customers?page=0&size=200")
      .then((page) => setCustomersById(Object.fromEntries(page.items.map((c) => [c.id, c.fullName]))))
      .catch(() => {});
  }, []);

  async function executarAcao(appointmentId: string, action: string) {
    try {
      await apiFetch(`/appointments/${appointmentId}/${action}`, { method: "POST" });
      toast.mostrar("Agendamento atualizado.");
      if (barber) await carregar(barber.id);
    } catch (err) {
      toast.mostrar(err instanceof ApiError ? err.message : "Não foi possível atualizar o agendamento.", "erro");
      throw err;
    }
  }

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
  const pendentes = semana.filter((a) => a.status === "PENDING").sort((a, b) => a.startAt.localeCompare(b.startAt));

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

      {pendentes.length > 0 && (
        <section className="rounded-[12px] border border-[#f3dcae] bg-[#fdf3e3] p-5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-[#d28b27]">
              <Bell size={17} strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="text-[15px] font-bold text-[#0d1831]">
                {pendentes.length === 1
                  ? "1 agendamento esperando sua confirmação"
                  : `${pendentes.length} agendamentos esperando sua confirmação`}
              </h2>
              <p className="text-xs text-[#8a6a2a]">Toque num agendamento para confirmar ou cancelar.</p>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {pendentes.slice(0, 4).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDetalhe(item)}
                className="flex items-center gap-3 rounded-[10px] border border-[#f3dcae] bg-white px-3.5 py-2.5 text-left transition hover:bg-[#fffaf0]"
              >
                <span className="shrink-0 text-xs font-bold text-[#d28b27]">
                  {dateShortFormatter.format(new Date(item.startAt))} · {timeFormatter.format(new Date(item.startAt))}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#0d1831]">
                  {customersById[item.customerId] ?? "Cliente"}
                  {item.items.length > 0 && (
                    <span className="text-[#5f6f87]"> · {item.items.map((i) => i.name).join(" + ")}</span>
                  )}
                </span>
                <ChevronRight size={15} strokeWidth={2} className="shrink-0 text-[#98a2b3]" />
              </button>
            ))}
          </div>

          {pendentes.length > 4 && (
            <Link
              href="/barbeiro/agenda"
              className="mt-3 inline-block text-xs font-bold text-[#8a6a2a] hover:underline"
            >
              Ver todos os {pendentes.length} na agenda →
            </Link>
          )}
        </section>
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

      <AppointmentDetailModal
        open={detalhe !== null}
        onClose={() => setDetalhe(null)}
        appointment={
          detalhe && {
            id: detalhe.id,
            status: detalhe.status,
            channel: detalhe.channel,
            startAt: detalhe.startAt,
            endAt: detalhe.endAt,
            totalAmount: detalhe.totalAmount,
            notes: detalhe.notes,
            items: detalhe.items,
            clientName: customersById[detalhe.customerId] ?? "Cliente",
          }
        }
        onAction={executarAcao}
      />

      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
