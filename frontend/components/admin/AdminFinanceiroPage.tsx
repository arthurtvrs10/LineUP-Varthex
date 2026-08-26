import { Download, Plus, TrendingUp, TrendingDown } from "lucide-react";

type Metric = {
  label: string;
  value: string;
  trend: string;
  positive: boolean;
};

const metrics: Metric[] = [
  { label: "Faturamento bruto", value: "R$ 270,00", trend: "+14% vs mês anterior", positive: true },
  { label: "Despesas", value: "R$ 3.220,00", trend: "-5% vs mês anterior", positive: false },
  { label: "Lucro líquido", value: "-R$ 2.950,00", trend: "+22% vs mês anterior", positive: true },
  { label: "Ticket médio", value: "R$ 52,50", trend: "+3% vs mês anterior", positive: true },
];

const monthlyRevenue = [
  { label: "Mar", value: 3 },
  { label: "Abr", value: 5 },
  { label: "Mai", value: 4 },
  { label: "Jun", value: 7 },
  { label: "Jul", value: 9 },
  { label: "Ago", value: 0.27 },
];

const commissionsByBarber = [
  { label: "Lucas", value: 4.96 },
  { label: "Gabriel", value: 3.43 },
  { label: "Felipe", value: 2.52 },
];

const expenseCategories = [
  { label: "Infraestrutura", value: "R$ 2.800,00", percent: 72 },
  { label: "Estoque", value: "R$ 420,00", percent: 11 },
  { label: "Marketing", value: "R$ 300,00", percent: 8 },
  { label: "Pessoal", value: "R$ 1.200,00", percent: 31 },
];

type Transaction = {
  date: string;
  description: string;
  category: string;
  type: "Entrada" | "Saída";
  value: string;
};

const transactions: Transaction[] = [
  { date: "13/08/2026", description: "Corte + barba — João Silva", category: "Serviços", type: "Entrada", value: "+R$ 70,00" },
  { date: "13/08/2026", description: "Corte degradê — Diego Martins", category: "Serviços", type: "Entrada", value: "+R$ 70,00" },
  { date: "08/08/2026", description: "Aluguel mensal", category: "Infraestrutura", type: "Saída", value: "-R$ 2.800,00" },
  { date: "05/08/2026", description: "Produtos para estoque", category: "Estoque", type: "Saída", value: "-R$ 420,00" },
  { date: "03/08/2026", description: "Barba completa — Mateus Rodrigues", category: "Serviços", type: "Entrada", value: "+R$ 70,00" },
  { date: "01/08/2026", description: "Assinatura Clube Premium — João Silva", category: "Assinaturas", type: "Entrada", value: "+R$ 70,00" },
];

type Commission = {
  name: string;
  appointments: number;
  rate: string;
  revenue: string;
  commission: string;
  percent: number;
};

const commissions: Commission[] = [
  { name: "Lucas Oliveira", appointments: 248, rate: "40%", revenue: "R$ 12.400,00", commission: "R$ 4.960,00", percent: 100 },
  { name: "Gabriel Santos", appointments: 196, rate: "35%", revenue: "R$ 9.800,00", commission: "R$ 3.430,00", percent: 79 },
  { name: "Felipe Cardoso", appointments: 144, rate: "35%", revenue: "R$ 7.200,00", commission: "R$ 2.520,00", percent: 58 },
];

const cashFlowDays = [
  { label: "Dia 01", entrada: 480, saida: 200 },
  { label: "Dia 05", entrada: 720, saida: 420 },
  { label: "Dia 10", entrada: 890, saida: 180 },
  { label: "Dia 13", entrada: 320, saida: 160 },
];

function buildAreaPath(values: number[], width: number, height: number) {
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);
  const points = values.map((v, i) => [i * step, height - (v / max) * height]);
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  return { line, area };
}

export function AdminFinanceiroPage() {
  const chartWidth = 480;
  const chartHeight = 160;
  const { line, area } = buildAreaPath(
    monthlyRevenue.map((m) => m.value),
    chartWidth,
    chartHeight,
  );
  const maxCommission = Math.max(...commissionsByBarber.map((c) => c.value));
  const maxCashFlow = Math.max(...cashFlowDays.flatMap((d) => [d.entrada, d.saida]));

  return (
    <div className="flex w-full flex-col items-start">
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="font-['Manrope',sans-serif] text-2xl font-bold tracking-[-0.48px] text-[#17181d]">
            Financeiro
          </h1>
          <p className="pt-0.5 text-sm text-[#686a73]">Controle de entradas e saídas</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-4 text-sm font-medium text-[#17181d] transition hover:bg-[#f7f6f2]"
          >
            <Download size={16} strokeWidth={1.8} />
            Exportar
          </button>
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-[10px] bg-[#6c4cf1] px-4 text-sm font-medium text-white shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.1)] transition hover:bg-[#5d3fe0]"
          >
            <Plus size={16} strokeWidth={2} />
            Lançamento
          </button>
        </div>
      </div>

      <div className="grid w-full grid-cols-4 gap-4 pt-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-sm text-[#686a73]">{metric.label}</p>
            <p className="pt-1 font-['Manrope',sans-serif] text-2xl font-bold text-[#17181d]">{metric.value}</p>
            <div className={`flex items-center gap-1 pt-1.5 text-xs ${metric.positive ? "text-[#27865b]" : "text-[#c84a4a]"}`}>
              {metric.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {metric.trend}
            </div>
          </div>
        ))}
      </div>

      <h2 className="pt-6 text-lg font-semibold text-[#17181d]">Visão geral</h2>

      <div className="grid w-full grid-cols-2 gap-4 pt-3">
        <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
          <h3 className="font-['Manrope',sans-serif] text-sm font-bold text-[#17181d]">Faturamento mensal</h3>
          <p className="text-xs text-[#686a73]">Últimos 6 meses</p>
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="mt-4 h-40 w-full">
            <path d={area} fill="rgba(108,76,241,0.12)" />
            <path d={line} fill="none" stroke="#6c4cf1" strokeWidth={2} />
          </svg>
          <div className="flex justify-between text-xs text-[#686a73]">
            {monthlyRevenue.map((m) => (
              <span key={m.label}>{m.label}</span>
            ))}
          </div>
        </div>

        <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
          <h3 className="font-['Manrope',sans-serif] text-sm font-bold text-[#17181d]">Comissões por profissional</h3>
          <p className="text-xs text-[#686a73]">Este mês</p>
          <div className="mt-4 flex h-40 items-end justify-around gap-4">
            {commissionsByBarber.map((c) => (
              <div key={c.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-[6px] bg-[#6c4cf1]"
                  style={{ height: `${(c.value / maxCommission) * 100}%` }}
                />
                <span className="text-xs text-[#686a73]">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full pt-4">
        <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
          <h3 className="font-['Manrope',sans-serif] text-sm font-bold text-[#17181d]">Categorias de despesa</h3>
          <div className="flex flex-col gap-3 pt-4">
            {expenseCategories.map((cat) => (
              <div key={cat.label} className="flex items-center gap-3">
                <p className="w-28 shrink-0 text-sm text-[#17181d]">{cat.label}</p>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f0efea]">
                  <div className="h-full rounded-full bg-[#6c4cf1]" style={{ width: `${cat.percent}%` }} />
                </div>
                <p className="w-24 shrink-0 text-right text-sm font-medium text-[#17181d]">{cat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="pt-6 text-lg font-semibold text-[#17181d]">Transações</h2>
      <div className="w-full pt-3">
        <div className="w-full overflow-x-auto rounded-[12px] border border-[#e6e4df] bg-white">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e6e4df] bg-[#f7f6f2] text-xs font-medium text-[#686a73]">
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium">Descrição</th>
                <th className="px-5 py-3 font-medium">Categoria</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={i} className="border-b border-[#e6e4df] last:border-b-0">
                  <td className="px-5 py-3 text-sm text-[#686a73]">{t.date}</td>
                  <td className="px-5 py-3 text-sm text-[#17181d]">{t.description}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-[#ede9fd] px-2 py-0.5 text-xs font-medium text-[#6c4cf1]">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.type === "Entrada" ? "bg-[#e8f7f1] text-[#27865b]" : "bg-[#fbeaea] text-[#c84a4a]"
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td
                    className={`px-5 py-3 text-right text-sm font-medium ${
                      t.value.startsWith("+") ? "text-[#27865b]" : "text-[#c84a4a]"
                    }`}
                  >
                    {t.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="pt-6 text-lg font-semibold text-[#17181d]">Comissões</h2>
      <div className="flex w-full flex-col gap-3 pt-3">
        {commissions.map((c) => (
          <div key={c.name} className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#17181d]">{c.name}</p>
                <p className="pt-0.5 text-xs text-[#686a73]">
                  {c.appointments} atendimentos · {c.rate} comissão
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#686a73]">Faturamento</p>
                <p className="text-sm font-medium text-[#17181d]">{c.revenue}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#686a73]">Comissão</p>
                <p className="font-['Manrope',sans-serif] text-lg font-bold text-[#17181d]">{c.commission}</p>
              </div>
              <button
                type="button"
                className="rounded-[8px] bg-[#6c4cf1] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#5d3fe0]"
              >
                Pagar
              </button>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f0efea]">
              <div className="h-full rounded-full bg-[#6c4cf1]" style={{ width: `${c.percent}%` }} />
            </div>
          </div>
        ))}
      </div>

      <h2 className="pt-6 text-lg font-semibold text-[#17181d]">Fluxo de caixa</h2>
      <div className="grid w-full grid-cols-[1fr_2fr] gap-4 pt-3">
        <div className="flex flex-col gap-3">
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-4">
            <p className="text-sm text-[#686a73]">Total entradas</p>
            <p className="pt-1 font-['Manrope',sans-serif] text-2xl font-bold text-[#17181d]">R$ 270,00</p>
          </div>
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-4">
            <p className="text-sm text-[#686a73]">Total saídas</p>
            <p className="pt-1 font-['Manrope',sans-serif] text-2xl font-bold text-[#17181d]">R$ 3.220,00</p>
          </div>
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-4">
            <p className="text-sm text-[#686a73]">Saldo do período</p>
            <p className="pt-1 font-['Manrope',sans-serif] text-2xl font-bold text-[#17181d]">-R$ 2.950,00</p>
          </div>
        </div>

        <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
          <h3 className="font-['Manrope',sans-serif] text-sm font-bold text-[#17181d]">Entradas e saídas diárias</h3>
          <p className="text-xs text-[#686a73]">Agosto 2026</p>
          <div className="mt-4 flex h-44 items-end justify-around gap-6">
            {cashFlowDays.map((day) => (
              <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-36 w-full items-end justify-center gap-1">
                  <div
                    className="w-1/2 rounded-t-[4px] bg-[#6c4cf1]"
                    style={{ height: `${(day.entrada / maxCashFlow) * 100}%` }}
                  />
                  <div
                    className="w-1/2 rounded-t-[4px] bg-[#e6e4df]"
                    style={{ height: `${(day.saida / maxCashFlow) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-[#686a73]">{day.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
