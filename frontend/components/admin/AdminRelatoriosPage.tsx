"use client";

import { useEffect, useState } from "react";
import { Award, TrendingUp } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });
const weekdayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

type AppointmentStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | "NO_SHOW";
type AppointmentResponse = {
  id: string;
  status: AppointmentStatus;
  barberId: string;
  customerId: string;
  totalAmount: string;
  startAt: string;
  items: { serviceId: string; name: string }[];
};
type CustomerResponse = { id: string; fullName: string; createdAt: string };
type CustomerPageResponse = { items: CustomerResponse[] };
type BarberResponse = { id: string; displayName: string };
type CommissionSummaryResponse = { provisionedAmount: string; approvedAmount: string; paidAmount: string };

function toLocalDateTime(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}
function toLocalDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function somaComissao(r: CommissionSummaryResponse) {
  return Number(r.provisionedAmount) + Number(r.approvedAmount) + Number(r.paidAmount);
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
      <p className="text-sm text-[#686a73]">{label}</p>
      <p className="pt-1 font-['Manrope',sans-serif] text-2xl font-bold text-[#0d1831]">{value}</p>
      {hint && <p className="pt-1.5 text-xs text-[#98a2b3]">{hint}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-[#0d1831]">{children}</h2>;
}

function BarChart({ data, color = "#2563eb" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-[180px] items-end gap-2 pt-6">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full rounded-t-[6px]" style={{ height: `${(d.value / max) * 140}px`, backgroundColor: color }} />
          <span className="text-xs text-[#686a73]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function AdminRelatoriosPage() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [barbers, setBarbers] = useState<BarberResponse[]>([]);
  const [comissaoPorBarbeiro, setComissaoPorBarbeiro] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function carregar() {
      try {
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const [appts, customerPage, barbersRes] = await Promise.all([
          apiFetch<AppointmentResponse[]>(
            `/appointments?${new URLSearchParams({ from: toLocalDateTime(from), to: toLocalDateTime(to) })}`,
          ),
          apiFetch<CustomerPageResponse>("/customers?page=0&size=500"),
          apiFetch<BarberResponse[]>("/barbers"),
        ]);
        setAppointments(appts);
        setCustomers(customerPage.items);
        setBarbers(barbersRes);

        const comissoes = await Promise.all(
          barbersRes.map((b) =>
            apiFetch<CommissionSummaryResponse>(
              `/commissions/summary?${new URLSearchParams({ barberId: b.id, from: toLocalDate(from), to: toLocalDate(now) })}`,
            ).then((r) => [b.id, somaComissao(r)] as const),
          ),
        );
        setComissaoPorBarbeiro(Object.fromEntries(comissoes));
        setError(undefined);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Não foi possível carregar os relatórios.");
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const now = new Date();
  const concluidos = appointments.filter((a) => a.status === "COMPLETED");
  const cancelados = appointments.filter((a) => a.status === "CANCELED");
  const faturamentoBruto = concluidos.reduce((sum, a) => sum + Number(a.totalAmount), 0);
  const ticketMedio = concluidos.length > 0 ? faturamentoBruto / concluidos.length : 0;
  const comissaoTotal = Object.values(comissaoPorBarbeiro).reduce((sum, v) => sum + v, 0);
  const taxaConclusao = appointments.length > 0 ? (concluidos.length / appointments.length) * 100 : 0;

  const last30 = appointments.filter((a) => now.getTime() - new Date(a.startAt).getTime() <= 30 * 24 * 60 * 60 * 1000);
  const porDiaSemana = weekdayLabels.map((label, i) => ({
    label,
    value: last30.filter((a) => {
      const d = new Date(a.startAt).getDay();
      return (d === 0 ? 6 : d - 1) === i;
    }).length,
  }));

  const meses = Array.from({ length: 6 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - (5 - i), 1));
  const faturamentoPorMes = meses.map((m) => {
    const total = concluidos
      .filter((a) => {
        const d = new Date(a.startAt);
        return d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth();
      })
      .reduce((sum, a) => sum + Number(a.totalAmount), 0);
    return { label: monthFormatter.format(m), value: total };
  });
  const cancelamentosPorMes = meses.map((m) => ({
    label: monthFormatter.format(m),
    value: cancelados.filter((a) => {
      const d = new Date(a.startAt);
      return d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth();
    }).length,
  }));
  const novosClientesPorMes = meses.map((m) => ({
    label: monthFormatter.format(m),
    value: customers.filter((c) => {
      const d = new Date(c.createdAt);
      return d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth();
    }).length,
  }));

  const gastosPorCliente = new Map<string, number>();
  for (const a of concluidos) gastosPorCliente.set(a.customerId, (gastosPorCliente.get(a.customerId) ?? 0) + Number(a.totalAmount));
  const melhoresClientes = [...gastosPorCliente.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([customerId, valor]) => ({ nome: customers.find((c) => c.id === customerId)?.fullName ?? "Cliente", valor }));

  const atendimentosPorClienteCount = new Map<string, number>();
  for (const a of concluidos) atendimentosPorClienteCount.set(a.customerId, (atendimentosPorClienteCount.get(a.customerId) ?? 0) + 1);
  const clientesRecorrentes = [...atendimentosPorClienteCount.values()].filter((n) => n > 1).length;
  const taxaRecorrencia = atendimentosPorClienteCount.size > 0 ? (clientesRecorrentes / atendimentosPorClienteCount.size) * 100 : 0;

  const equipe = barbers
    .map((b) => {
      const atendimentosBarbeiro = concluidos.filter((a) => a.barberId === b.id);
      return {
        id: b.id,
        nome: b.displayName,
        atendimentos: atendimentosBarbeiro.length,
        faturamento: atendimentosBarbeiro.reduce((sum, a) => sum + Number(a.totalAmount), 0),
        comissao: comissaoPorBarbeiro[b.id] ?? 0,
      };
    })
    .sort((a, b) => b.faturamento - a.faturamento);

  const servicoStats = new Map<string, { nome: string; qtd: number; receita: number }>();
  for (const a of concluidos) {
    for (const item of a.items) {
      const atual = servicoStats.get(item.serviceId) ?? { nome: item.name, qtd: 0, receita: 0 };
      atual.qtd += 1;
      atual.receita += Number(a.totalAmount) / a.items.length;
      servicoStats.set(item.serviceId, atual);
    }
  }
  const servicos = [...servicoStats.values()].sort((a, b) => b.qtd - a.qtd);
  const maisVendido = servicos[0];
  const maisLucrativo = [...servicos].sort((a, b) => b.receita - a.receita)[0];

  if (loading) {
    return <p className="py-10 text-center text-sm text-[#98a2b3]">Carregando relatórios…</p>;
  }

  return (
    <div className="flex w-full flex-col items-start">
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="font-['Manrope',sans-serif] text-2xl font-bold tracking-[-0.48px] text-[#0d1831]">Relatórios</h1>
          <p className="pt-0.5 text-sm text-[#686a73]">Últimos 6 meses · só dados reais da sua barbearia</p>
        </div>
      </div>

      {error && <p className="mt-4 w-full rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">{error}</p>}

      <div className="w-full pt-8">
        <SectionTitle>Faturamento</SectionTitle>
        <div className="grid w-full grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <MetricCard label="Faturamento bruto" value={brl.format(faturamentoBruto)} hint="Atendimentos concluídos" />
          <MetricCard label="Ticket médio" value={brl.format(ticketMedio)} />
          <MetricCard label="Comissão total" value={brl.format(comissaoTotal)} />
          <MetricCard label="Taxa de conclusão" value={`${taxaConclusao.toFixed(0)}%`} hint={`${concluidos.length} de ${appointments.length}`} />
        </div>
        <div className="w-full rounded-[12px] border border-[#e6e4df] bg-white p-5 mt-4">
          <p className="text-base font-semibold text-[#0d1831]">Faturamento por mês</p>
          <BarChart data={faturamentoPorMes} />
        </div>
      </div>

      <div className="w-full pt-8">
        <SectionTitle>Agendamentos</SectionTitle>
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-base font-semibold text-[#0d1831]">Agendamentos por dia da semana</p>
            <p className="text-xs text-[#98a2b3]">Últimos 30 dias</p>
            <BarChart data={porDiaSemana} />
          </div>
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-base font-semibold text-[#0d1831]">Cancelamentos por mês</p>
            <BarChart data={cancelamentosPorMes} color="#e57373" />
          </div>
        </div>
      </div>

      <div className="w-full pt-8">
        <SectionTitle>Clientes</SectionTitle>
        <div className="grid w-full grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          <MetricCard label="Total de clientes" value={String(customers.length)} />
          <MetricCard
            label="Novos este mês"
            value={String(customers.filter((c) => {
              const d = new Date(c.createdAt);
              return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
            }).length)}
          />
          <MetricCard label="Clientes recorrentes" value={`${taxaRecorrencia.toFixed(0)}%`} hint="Mais de 1 atendimento no período" />
        </div>
        <div className="grid w-full grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 pt-4">
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-base font-semibold text-[#0d1831]">Novos clientes por mês</p>
            <BarChart data={novosClientesPorMes} />
          </div>
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-base font-semibold text-[#0d1831]">Melhores clientes</p>
            <p className="text-xs text-[#98a2b3]">Por valor gasto no período</p>
            <div className="flex flex-col divide-y divide-[#e6e4df] pt-3">
              {melhoresClientes.length === 0 ? (
                <p className="py-4 text-sm text-[#98a2b3]">Sem atendimentos concluídos ainda.</p>
              ) : (
                melhoresClientes.map((c, i) => (
                  <div key={c.nome + i} className="flex items-center gap-3 py-2.5">
                    <span className="w-4 text-sm text-[#686a73]">{i + 1}</span>
                    <span className="grid size-8 place-items-center rounded-full bg-accent-subtle text-xs font-semibold text-accent-strong">
                      {c.nome.slice(0, 2).toUpperCase()}
                    </span>
                    <p className="flex-1 truncate text-sm text-[#0d1831]">{c.nome}</p>
                    <p className="text-sm font-medium text-[#0d1831]">{brl.format(c.valor)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full pt-8">
        <SectionTitle>Equipe</SectionTitle>
        <div className="grid w-full grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4 pt-4">
          <div className="flex flex-col gap-3">
            {equipe.length === 0 ? (
              <p className="rounded-[12px] border border-dashed border-[#e6e4df] px-4 py-8 text-center text-sm text-[#98a2b3]">
                Nenhum barbeiro cadastrado.
              </p>
            ) : (
              equipe.map((b, i) => (
                <div key={b.id} className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-accent-subtle text-sm font-semibold text-accent-strong">
                      {b.nome.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0d1831]">{b.nome}</p>
                      <p className="text-xs text-[#686a73]">{b.atendimentos} atendimentos · #{i + 1} no ranking</p>
                    </div>
                    <p className="text-base font-semibold text-[#0d1831]">{brl.format(b.faturamento)}</p>
                  </div>
                  <div className="mt-4 border-t border-[#e6e4df] pt-3 text-center">
                    <p className="text-xs text-[#686a73]">Comissão no período</p>
                    <p className="pt-1 text-sm font-medium text-[#0d1831]">{brl.format(b.comissao)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-base font-semibold text-[#0d1831]">Faturamento por profissional</p>
            <p className="text-xs text-[#98a2b3]">Atendimentos concluídos no período</p>
            <BarChart data={equipe.map((b) => ({ label: b.nome.split(" ")[0], value: b.faturamento }))} />
          </div>
        </div>
      </div>

      <div className="w-full pt-8 pb-2">
        <SectionTitle>Serviços</SectionTitle>
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-base font-semibold text-[#0d1831]">Serviços mais executados</p>
            <div className="flex flex-col gap-3 pt-4">
              {servicos.length === 0 ? (
                <p className="text-sm text-[#98a2b3]">Sem atendimentos concluídos ainda.</p>
              ) : (
                servicos.slice(0, 6).map((s) => (
                  <div key={s.nome} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 truncate text-sm text-[#686a73]">{s.nome}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#f0efea]">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${(s.qtd / servicos[0].qtd) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 shrink-0 text-right text-xs text-[#98a2b3]">{s.qtd}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-base font-semibold text-[#0d1831]">Destaques do período</p>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-xs text-[#686a73]">
                  <TrendingUp size={13} strokeWidth={1.8} />
                  Mais lucrativo
                </p>
                <p className="pt-1 text-sm font-medium text-[#0d1831]">{maisLucrativo?.nome ?? "—"}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs text-[#686a73]">
                  <Award size={13} strokeWidth={1.8} />
                  Mais vendido
                </p>
                <p className="pt-1 text-sm font-medium text-[#0d1831]">{maisVendido?.nome ?? "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
