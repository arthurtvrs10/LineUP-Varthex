import Link from "next/link";
import { Calendar, ChevronDown, ChevronRight, Wallet } from "lucide-react";
import { AreaTrendChart, BarTrendChart } from "@/components/ui/TrendCharts";
import { StatCard, type StatTone } from "@/components/ui/StatCard";
import { SaudacaoHeader } from "@/components/layout/SaudacaoHeader";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const brlCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

/** Agosto fecha com os mesmos números dos cards acima: R$ 740 bruto, R$ 296 de comissão, 8 concluídos. */
const historico = [
  { label: "Mar", bruto: 620, comissao: 248, atendimentos: 7 },
  { label: "Abr", bruto: 810, comissao: 324, atendimentos: 9 },
  { label: "Mai", bruto: 700, comissao: 280, atendimentos: 8 },
  { label: "Jun", bruto: 890, comissao: 356, atendimentos: 10 },
  { label: "Jul", bruto: 760, comissao: 304, atendimentos: 9 },
  { label: "Ago", bruto: 740, comissao: 296, atendimentos: 8 },
];

const comissaoData = historico.map((m) => ({
  label: m.label,
  value: m.comissao,
  detalhe: `${brl.format(m.bruto)} em atendimentos`,
}));

const atendimentosData = historico.map((m) => ({
  label: m.label,
  value: m.atendimentos,
  detalhe: `${brl.format(m.comissao)} de comissão`,
}));

const metrics: { label: string; value: string; tone?: StatTone }[] = [
  { label: "Agendamentos", value: "12" },
  { label: "Concluídos", value: "8", tone: "positivo" },
  { label: "Cancelados", value: "2", tone: "negativo" },
  { label: "Faltas", value: "1", tone: "atencao" },
  { label: "Valor bruto", value: "R$ 740,00" },
  { label: "Minha comissão", value: "R$ 296,00" },
];

const shortcuts = [
  {
    href: "/barbeiro/agenda",
    title: "Abrir agenda",
    subtitle: "Ver sua agenda e atendimentos",
    icon: Calendar,
  },
  {
    href: "/barbeiro/comissoes",
    title: "Consultar comissões",
    subtitle: "Ver somente seus lançamentos",
    icon: Wallet,
  },
];

export function BarberDashboardPage() {
  return (
    <div className="flex flex-col gap-5">
      <SaudacaoHeader
        data="Sexta-feira, 14 de agosto"
        nome="Paulo"
        contexto="Barbearia Estilo Único · Unidade Centro"
        acoes={
          <>
            <button
              type="button"
              className="flex h-11 items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-3.5 text-sm text-[#0d1831]"
            >
              <Calendar size={16} strokeWidth={1.8} className="text-[#98a2b3]" />
              11 ago — 17 ago 2026
              <ChevronDown size={14} strokeWidth={2} className="text-[#98a2b3]" />
            </button>
            <button
              type="button"
              className="h-11 rounded-[10px] bg-[#7247f3] px-5 text-sm font-bold text-white transition hover:bg-[#5c2ee0]"
            >
              Atualizar
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            tone={metric.tone}
          />
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
        <p className="mt-0.5 text-xs text-[#5f6f87]">Últimos 6 meses.</p>

        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
          <div className="min-w-0 rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <h3 className="text-base font-bold text-[#0d1831]">Comissão por mês</h3>
            <p className="mt-1 text-xs text-[#5f6f87]">
              Passe o mouse para ver o bruto que gerou cada comissão.
            </p>
            <div className="mt-5">
              <AreaTrendChart
                data={comissaoData}
                height={216}
                yWidth={56}
                format="moedaCompacta"
                label={`Comissão por mês. ${comissaoData
                  .map((d) => `${d.label}: ${brl.format(d.value)}`)
                  .join(", ")}.`}
              />
            </div>
          </div>

          <div className="min-w-0 rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <h3 className="text-base font-bold text-[#0d1831]">Atendimentos por mês</h3>
            <p className="mt-1 text-xs text-[#5f6f87]">
              Atendimentos concluídos em cada mês do período.
            </p>
            <div className="mt-5">
              <BarTrendChart
                data={atendimentosData}
                height={216}
                yWidth={32}
                label={`Atendimentos por mês. ${atendimentosData
                  .map((d) => `${d.label}: ${d.value}`)
                  .join(", ")}.`}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
