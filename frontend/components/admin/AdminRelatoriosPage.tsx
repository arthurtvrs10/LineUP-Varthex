"use client";

import { Download, ChevronDown, TrendingUp, Award } from "lucide-react";

function buildAreaPath(values: number[], width: number, height: number) {
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - (v / max) * height;
    return { x, y };
  });
  const line = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  return { line, area, points };
}

const faturamentoMetrics = [
  { label: "Faturamento bruto", value: "R$ 9.800", trend: "+14% vs período anterior" },
  { label: "Faturamento líquido", value: "R$ 5.380", trend: "+8% vs período anterior" },
  { label: "Ticket médio", value: "R$ 52,50", trend: "+3% vs período anterior" },
  { label: "Receita recorrente", value: "R$ 1.340", trend: "+22% vs período anterior" },
];

const faturamentoMonths = ["Mar", "Abr", "Mai", "Jun", "Jul", "Ago"];
const faturamentoValues = [4200, 5100, 6300, 7800, 8600, 9800];

const agendamentosMetrics = [
  { label: "Total de agendamentos", value: "248" },
  { label: "Concluídos", value: "212" },
  { label: "Cancelamentos", value: "18" },
  { label: "Taxa de ocupação", value: "73%" },
];

const weekDays = [
  { label: "Seg", value: 24 },
  { label: "Ter", value: 30 },
  { label: "Qua", value: 20 },
  { label: "Qui", value: 36 },
  { label: "Sex", value: 44 },
  { label: "Sáb", value: 56 },
  { label: "Dom", value: 12 },
];

const cancelMonths = [
  { label: "Mar", value: 5 },
  { label: "Abr", value: 8 },
  { label: "Mai", value: 3 },
  { label: "Jun", value: 10 },
  { label: "Jul", value: 6 },
  { label: "Ago", value: 2 },
];

const clientesMetrics = [
  { label: "Total de clientes", value: "6" },
  { label: "Novos este mês", value: "4", trend: "+4 vs mês anterior" },
  { label: "Taxa de retenção", value: "78%" },
  { label: "Clientes inativos", value: "2" },
];

const novosClientesMonths = [
  { label: "Mar", value: 1 },
  { label: "Abr", value: 2 },
  { label: "Mai", value: 1 },
  { label: "Jun", value: 3 },
  { label: "Jul", value: 2 },
  { label: "Ago", value: 4 },
];

const melhoresClientes = [
  { rank: 1, initials: "TP", name: "Thiago Pereira", value: "R$ 2.200,00" },
  { rank: 2, initials: "JS", name: "João Silva", value: "R$ 1.840,00" },
  { rank: 3, initials: "RC", name: "Rafael Costa", value: "R$ 960,00" },
  { rank: 4, initials: "MR", name: "Mateus Rodrigues", value: "R$ 640,00" },
];

type Barbeiro = {
  initials: string;
  name: string;
  rating: number;
  atendimentos: number;
  faturamento: string;
  comissao: string;
  aReceber: string;
  ranking: string;
};

const equipe: Barbeiro[] = [
  { initials: "LO", name: "Lucas Oliveira", rating: 4.9, atendimentos: 248, faturamento: "R$ 12.400,00", comissao: "40%", aReceber: "R$ 4.960,00", ranking: "#1" },
  { initials: "GS", name: "Gabriel Santos", rating: 4.7, atendimentos: 196, faturamento: "R$ 9.800,00", comissao: "35%", aReceber: "R$ 3.430,00", ranking: "#2" },
  { initials: "FC", name: "Felipe Cardoso", rating: 4.6, atendimentos: 144, faturamento: "R$ 7.200,00", comissao: "35%", aReceber: "R$ 2.520,00", ranking: "#3" },
];

const faturamentoPorProfissional = [
  { label: "Lucas", value: 12400 },
  { label: "Gabriel", value: 9800 },
  { label: "Felipe", value: 7200 },
];

const servicosMaisExecutados = [
  { label: "Corte simples", value: 100 },
  { label: "Barba", value: 74 },
  { label: "Corte + Barba", value: 60 },
  { label: "Corte degradê", value: 47 },
  { label: "Sobrancelha", value: 44 },
  { label: "Corte + Sobrancelha", value: 33 },
];

const categorias = [
  { label: "Corte", percent: 45, color: "#7247f3" },
  { label: "Combo", percent: 25, color: "#8f7bf5" },
  { label: "Barba", percent: 15, color: "#c8bffa" },
  { label: "Outros", percent: 15, color: "#e6e4df" },
];

const estoqueMetrics = [
  { label: "Produtos ativos", value: "5" },
  { label: "Estoque baixo", value: "2" },
  { label: "Valor em estoque", value: "R$ 480" },
  { label: "Giro mensal", value: "38 un" },
];

const estoqueMovimentacao = [
  { label: "Mar", entrada: 22, saida: 18 },
  { label: "Abr", entrada: 30, saida: 20 },
  { label: "Mai", entrada: 40, saida: 28 },
  { label: "Jun", entrada: 26, saida: 24 },
  { label: "Jul", entrada: 32, saida: 22 },
  { label: "Ago", entrada: 18, saida: 34 },
];

function conicGradient(items: { percent: number; color: string }[]) {
  let acc = 0;
  const stops = items.map((item) => {
    const start = acc;
    acc += item.percent;
    return `${item.color} ${start}% ${acc}%`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

function MetricCard({ label, value, trend }: { label: string; value: string; trend?: string }) {
  return (
    <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
      <p className="text-sm text-[#686a73]">{label}</p>
      <p className="pt-1 font-['Manrope',sans-serif] text-2xl font-bold text-[#0d1831]">{value}</p>
      {trend && <p className="pt-1.5 text-xs text-[#27865b]">{trend}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-[#0d1831]">{children}</h2>;
}

export function AdminRelatoriosPage() {
  const areaWidth = 1000;
  const areaHeight = 160;
  const { line, area } = buildAreaPath(faturamentoValues, areaWidth, areaHeight);
  const weekMax = Math.max(...weekDays.map((d) => d.value));
  const cancelMax = Math.max(...cancelMonths.map((d) => d.value));
  const novosMax = Math.max(...novosClientesMonths.map((d) => d.value));
  const profMax = Math.max(...faturamentoPorProfissional.map((d) => d.value));
  const servicoMax = Math.max(...servicosMaisExecutados.map((d) => d.value));
  const estoqueMax = Math.max(...estoqueMovimentacao.flatMap((d) => [d.entrada, d.saida]));

  return (
    <div className="flex w-full flex-col items-start">
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="font-['Manrope',sans-serif] text-2xl font-bold tracking-[-0.48px] text-[#0d1831]">
            Relatórios
          </h1>
          <p className="pt-0.5 text-sm text-[#686a73]">Análise completa da operação</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-3 text-sm font-medium text-[#0d1831] transition hover:bg-[#f7f6f2]"
          >
            Este mês
            <ChevronDown size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-accent px-4 text-sm font-medium text-on-accent transition hover:bg-accent-hover"
          >
            <Download size={16} strokeWidth={2} />
            Exportar
          </button>
        </div>
      </div>

      {/* Faturamento */}
      <div className="w-full pt-8">
        <SectionTitle>Faturamento</SectionTitle>
        <div className="grid w-full grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {faturamentoMetrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
        <div className="w-full rounded-[12px] border border-[#e6e4df] bg-white p-5 mt-4">
          <p className="text-base font-semibold text-[#0d1831]">Evolução do faturamento</p>
          <p className="text-sm text-[#686a73]">Últimos 6 meses</p>
          <div className="pt-4">
            <svg viewBox={`0 0 ${areaWidth} ${areaHeight}`} className="h-[180px] w-full" preserveAspectRatio="none">
              <path d={area} fill="#ede9fd" />
              <path d={line} fill="none" stroke="#7247f3" strokeWidth={3} />
            </svg>
            <div className="flex justify-between pt-2 text-xs text-[#686a73]">
              {faturamentoMonths.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Agendamentos */}
      <div className="w-full pt-8">
        <SectionTitle>Agendamentos</SectionTitle>
        <div className="grid w-full grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {agendamentosMetrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-base font-semibold text-[#0d1831]">Agendamentos por dia da semana</p>
            <div className="flex h-[200px] items-end gap-3 pt-6">
              {weekDays.map((d) => (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-[6px] bg-accent"
                    style={{ height: `${(d.value / weekMax) * 160}px` }}
                  />
                  <span className="text-xs text-[#686a73]">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-base font-semibold text-[#0d1831]">Cancelamentos por mês</p>
            <div className="flex h-[200px] items-end gap-3 pt-6">
              {cancelMonths.map((d) => (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-[6px] bg-[#e57373]"
                    style={{ height: `${(d.value / cancelMax) * 160}px` }}
                  />
                  <span className="text-xs text-[#686a73]">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clientes */}
      <div className="w-full pt-8">
        <SectionTitle>Clientes</SectionTitle>
        <div className="grid w-full grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {clientesMetrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
        <div className="grid w-full grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 pt-4">
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-base font-semibold text-[#0d1831]">Novos clientes por mês</p>
            <div className="flex h-[180px] items-end gap-3 pt-6">
              {novosClientesMonths.map((d) => (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-[6px] bg-accent"
                    style={{ height: `${(d.value / novosMax) * 140}px` }}
                  />
                  <span className="text-xs text-[#686a73]">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-base font-semibold text-[#0d1831]">Melhores clientes</p>
            <div className="flex flex-col divide-y divide-[#e6e4df] pt-3">
              {melhoresClientes.map((c) => (
                <div key={c.name} className="flex items-center gap-3 py-2.5">
                  <span className="w-4 text-sm text-[#686a73]">{c.rank}</span>
                  <span className="grid size-8 place-items-center rounded-full bg-accent-subtle text-xs font-semibold text-accent-strong">
                    {c.initials}
                  </span>
                  <p className="flex-1 text-sm text-[#0d1831]">{c.name}</p>
                  <p className="text-sm font-medium text-[#0d1831]">{c.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Equipe */}
      <div className="w-full pt-8">
        <SectionTitle>Equipe</SectionTitle>
        <div className="grid w-full grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4 pt-4">
          <div className="flex flex-col gap-3">
            {equipe.map((b) => (
              <div key={b.name} className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-accent-subtle text-sm font-semibold text-accent-strong">
                    {b.initials}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#0d1831]">{b.name}</p>
                    <p className="text-xs text-[#686a73]">
                      {b.rating.toFixed(1)} · {b.atendimentos} atendimentos
                    </p>
                  </div>
                  <p className="text-base font-semibold text-[#0d1831]">{b.faturamento}</p>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 border-t border-[#e6e4df] pt-3">
                  <div className="text-center">
                    <p className="text-xs text-[#686a73]">Comissão</p>
                    <p className="pt-1 text-sm font-medium text-[#0d1831]">{b.comissao}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[#686a73]">A receber</p>
                    <p className="pt-1 text-sm font-medium text-[#0d1831]">{b.aReceber}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[#686a73]">Ranking</p>
                    <p className="pt-1 text-sm font-medium text-[#0d1831]">{b.ranking}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-base font-semibold text-[#0d1831]">Faturamento por profissional</p>
            <div className="flex h-[260px] items-end gap-6 pt-8">
              {faturamentoPorProfissional.map((p) => (
                <div key={p.label} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs text-[#686a73]">
                    R$ {(p.value / 1000).toFixed(1)}k
                  </span>
                  <div
                    className="w-full rounded-t-[6px] bg-accent"
                    style={{ height: `${(p.value / profMax) * 200}px` }}
                  />
                  <span className="text-xs text-[#686a73]">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Serviços */}
      <div className="w-full pt-8">
        <SectionTitle>Serviços</SectionTitle>
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-base font-semibold text-[#0d1831]">Serviços mais executados</p>
            <div className="flex flex-col gap-3 pt-4">
              {servicosMaisExecutados.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm text-[#686a73]">{s.label}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#f0efea]">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${(s.value / servicoMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-base font-semibold text-[#0d1831]">Participação por categoria</p>
            <div className="flex items-center gap-8 pt-4">
              <div
                className="size-[140px] shrink-0 rounded-full"
                style={{ background: conicGradient(categorias) }}
              />
              <div className="flex flex-col gap-2.5">
                {categorias.map((c) => (
                  <div key={c.label} className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="w-16 text-sm text-[#0d1831]">{c.label}</span>
                    <span className="text-sm text-[#686a73]">{c.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-[#e6e4df] pt-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs text-[#686a73]">
                  <TrendingUp size={13} strokeWidth={1.8} />
                  Mais lucrativo
                </p>
                <p className="pt-1 text-sm font-medium text-[#0d1831]">Corte + Barba</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs text-[#686a73]">
                  <Award size={13} strokeWidth={1.8} />
                  Mais vendido
                </p>
                <p className="pt-1 text-sm font-medium text-[#0d1831]">Corte simples</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estoque */}
      <div className="w-full pt-8 pb-2">
        <SectionTitle>Estoque</SectionTitle>
        <div className="grid w-full grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {estoqueMetrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
        <div className="w-full rounded-[12px] border border-[#e6e4df] bg-white p-5 mt-4">
          <p className="text-base font-semibold text-[#0d1831]">Movimentação de estoque por mês</p>
          <div className="flex h-[200px] items-end gap-6 pt-6">
            {estoqueMovimentacao.map((d) => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-end justify-center gap-1.5" style={{ height: 160 }}>
                  <div
                    className="w-5 rounded-t-[4px] bg-accent"
                    style={{ height: `${(d.entrada / estoqueMax) * 160}px` }}
                  />
                  <div
                    className="w-5 rounded-t-[4px] bg-[#c8bffa]"
                    style={{ height: `${(d.saida / estoqueMax) * 160}px` }}
                  />
                </div>
                <span className="text-xs text-[#686a73]">{d.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 pt-3">
            <span className="flex items-center gap-1.5 text-xs text-[#686a73]">
              <span className="size-2.5 rounded-full bg-accent" />
              Entrada
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#686a73]">
              <span className="size-2.5 rounded-full bg-[#c8bffa]" />
              Saída
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
