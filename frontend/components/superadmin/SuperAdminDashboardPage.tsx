"use client";

import { AreaTrendChart } from "@/components/ui/TrendCharts";
import { StatCard, type StatTone } from "@/components/ui/StatCard";
import { SaudacaoHeader } from "@/components/layout/SaudacaoHeader";
import {
  FileText,
  UserPlus,
  Users,
  CreditCard,
  AlertTriangle,
  Bell,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

const mrrCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

/**
 * Antes os cinco cards repetiam "+8% vs mês ant." — string idêntica em
 * todos, o que não informa nada e ainda custa uma linha por card.
 * A variação fica só onde ela é de fato diferente entre as métricas.
 */
const metrics: { label: string; value: string; hint?: string; tone?: StatTone; icon: LucideIcon }[] = [
  { label: "Barbearias ativas", value: "4", hint: "+8% vs mês ant.", tone: "positivo", icon: FileText },
  { label: "Novos cadastros", value: "5", hint: "+2 vs mês ant.", tone: "positivo", icon: UserPlus },
  { label: "Usuários ativos", value: "284", hint: "+19 vs mês ant.", tone: "positivo", icon: Users },
  { label: "MRR", value: "R$ 21.400", hint: "+1,2% vs mês ant.", tone: "positivo", icon: CreditCard },
  { label: "Bloqueadas", value: "1", hint: "requer ação", tone: "negativo", icon: AlertTriangle },
];

const mrrMonths = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const mrrValues = [16800, 17200, 17900, 18400, 19100, 19800, 20200, 20500, 20800, 21000, 21200, 21400];

const mrrData = mrrMonths.map((label, i) => ({ label, value: mrrValues[i] }));

type Alerta = {
  icon: typeof Bell;
  bg: string;
  color: string;
  text: string;
  date: string;
};

const alertas: Alerta[] = [
  {
    icon: CheckCircle2,
    bg: "#ede9fd",
    color: "#7247f3",
    text: 'Barbearia "Corte & Arte" foi bloqueada há 14 dias',
    date: "22 DEZ 19:20",
  },
  {
    icon: Bell,
    bg: "#fdeaea",
    color: "#c84a4a",
    text: "Falha na sincronização de 3 agendamentos.",
    date: "25 DEZ 07:20",
  },
  {
    icon: Bell,
    bg: "#fdf3e3",
    color: "#d28b27",
    text: "5 novas barbearias aguardam verificação de dados.",
    date: "25 DEZ 07:20",
  },
];

type Barbearia = {
  name: string;
  email: string;
  status: "Ativo" | "Bloqueado" | "Pendente";
};

const barbeariasRecentes: Barbearia[] = [
  { name: "Barbearia Estilo Único", email: "contato@estilounico.com", status: "Ativo" },
  { name: "Corte & Arte", email: "contato@corteearte.com", status: "Bloqueado" },
  { name: "Studio Navalha de Ouro", email: "contato@navalhadeouro.com", status: "Ativo" },
  { name: "Barba Boa", email: "contato@barbaboa.com", status: "Pendente" },
  { name: "Barbearia Vintage", email: "contato@barbeariavintage.com", status: "Ativo" },
  { name: "Clube do Corte", email: "contato@clubedocorte.com", status: "Pendente" },
];

const statusStyles: Record<Barbearia["status"], string> = {
  Ativo: "bg-[#e8f7f1] text-[#27865b]",
  Bloqueado: "bg-[#fdeaea] text-[#c84a4a]",
  Pendente: "bg-[#fdf3e3] text-[#d28b27]",
};

export function SuperAdminDashboardPage() {
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <SaudacaoHeader
        data="Sexta-feira, 14 de agosto"
        nome="Rafael"
        contexto="Painel da plataforma · 4 barbearias ativas"
      />

      <div className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {metrics.map((m) => (
          <StatCard
            key={m.label}
            label={m.label}
            value={m.value}
            hint={m.hint}
            tone={m.tone}
            icon={m.icon}
          />
        ))}
      </div>

      <div className="grid w-full grid-cols-1 lg:grid-cols-[661fr_438fr] gap-4">
        <div className="rounded-[12px] border border-[#e6e4df] bg-white p-6">
          <p className="text-lg font-bold text-[#0d1831]">MRR — Receita recorrente mensal</p>
          <p className="pt-1 text-sm text-[#98a2b3]">
            <span className="font-bold text-[#27865b]">+30% </span>
            este ano
          </p>
          <div className="pt-4">
            <AreaTrendChart
              data={mrrData}
              height={240}
              yWidth={60}
              format="moedaCompacta"
              label={`MRR por mês. ${mrrData
                .map((d) => `${d.label}: ${mrrCompact.format(d.value)}`)
                .join(", ")}.`}
            />
          </div>
        </div>

        <div className="rounded-[12px] border border-[#e6e4df] bg-white p-6">
          <p className="text-lg font-bold text-[#0d1831]">Alertas operacionais</p>
          <p className="pt-1 text-sm text-[#98a2b3]">
            <span className="font-bold text-[#27865b]">+30% </span>
            este mês
          </p>
          <div className="flex flex-col divide-y divide-[#eef0f3] pt-4">
            {alertas.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.text} className="flex items-start gap-3 py-3">
                  <span
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full"
                    style={{ backgroundColor: a.bg, color: a.color }}
                  >
                    <Icon size={13} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#0d1831]">{a.text}</p>
                    <p className="pt-1 text-xs text-[#98a2b3]">{a.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full rounded-[12px] border border-[#e6e4df] bg-white p-6">
        <p className="text-lg font-bold text-[#0d1831]">Barbearias recentes</p>
        <div className="flex items-center justify-between border-b border-[#e6e4df] pt-4 pb-2 text-[10px] font-bold text-[#98a2b3]">
          <span>BARBEARIA</span>
          <span>STATUS</span>
        </div>
        <div className="flex flex-col divide-y divide-[#eef0f3]">
          {barbeariasRecentes.map((b) => (
            <div key={b.name} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-[10px] bg-[#ede9fd] text-xs font-bold text-[#7247f3]">
                  {b.name
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")}
                </span>
                <div>
                  <p className="text-sm font-bold text-[#0d1831]">{b.name}</p>
                  <p className="text-sm text-[#5f6f87]">{b.email}</p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[b.status]}`}>
                {b.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
