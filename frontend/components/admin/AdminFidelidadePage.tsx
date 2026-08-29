"use client";

import { Award, Crown, Scissors, Plus, Settings2 } from "lucide-react";

const metrics = [
  { label: "Assinaturas ativas", value: "2" },
  { label: "Receita recorrente", value: "R$ 198,00", trend: "+8% vs mês anterior" },
  { label: "Clientes fidelizados", value: "33%" },
  { label: "Pontos em circulação", value: "3230" },
];

const tabs = [
  { id: "planos", label: "Planos" },
  { id: "assinantes", label: "Assinantes" },
  { id: "pontos", label: "Programa de pontos" },
];

type Plano = {
  icon: typeof Award;
  name: string;
  cadence: string;
  price: string;
  description: string;
  features: string[];
  popular: boolean;
};

const planos: Plano[] = [
  {
    icon: Award,
    name: "Clube Essencial",
    cadence: "Mensal",
    price: "R$ 79,00",
    description: "Plano básico com descontos e prioridade no agendamento.",
    features: ["2 cortes por mês com desconto de 20%", "Prioridade no agendamento", "Acumulação dupla de pontos"],
    popular: false,
  },
  {
    icon: Crown,
    name: "Clube Premium",
    cadence: "Mensal",
    price: "R$ 149,00",
    description: "Plano completo com acesso ilimitado e benefícios exclusivos.",
    features: [
      "Cortes ilimitados",
      "1 barba completa por mês",
      "Desconto de 15% em produtos",
      "Prioridade máxima",
      "Acumulação tripla de pontos",
    ],
    popular: true,
  },
  {
    icon: Scissors,
    name: "Corte Mensal",
    cadence: "Mensal",
    price: "R$ 49,00",
    description: "Um corte por mês com preço especial.",
    features: ["1 corte por mês", "Agendamento facilitado"],
    popular: false,
  },
];

type Assinante = {
  initials: string;
  name: string;
  plan: string;
  totalSpent: string;
  points: string;
  lastVisit: string;
};

const assinantes: Assinante[] = [
  { initials: "TP", name: "Thiago Pereira", plan: "Clube Essencial", totalSpent: "R$ 2.200,00", points: "1100 pts", lastVisit: "09/06/2026" },
  { initials: "JS", name: "João Silva", plan: "Clube Premium", totalSpent: "R$ 1.840,00", points: "920 pts", lastVisit: "04/08/2026" },
];

const rules = [
  { label: "Pontos por real gasto", value: "1 ponto / R$ 1,00" },
  { label: "Bônus assinatura Essencial", value: "2× pontos" },
  { label: "Bônus assinatura Premium", value: "3× pontos" },
  { label: "Expiração dos pontos", value: "12 meses sem uso" },
  { label: "Resgate mínimo", value: "100 pontos" },
  { label: "Valor do ponto no resgate", value: "R$ 0,10 por ponto" },
];

const ranking = [
  { rank: 1, initials: "TP", name: "Thiago Pereira", points: "1100 pts", percent: 100 },
  { rank: 2, initials: "JS", name: "João Silva", points: "920 pts", percent: 84 },
  { rank: 3, initials: "RC", name: "Rafael Costa", points: "480 pts", percent: 44 },
  { rank: 4, initials: "MR", name: "Mateus Rodrigues", points: "320 pts", percent: 29 },
  { rank: 5, initials: "DM", name: "Diego Martins", points: "290 pts", percent: 26 },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function AdminFidelidadePage() {
  return (
    <div className="flex w-full flex-col items-start">
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="font-['Manrope',sans-serif] text-2xl font-bold tracking-[-0.48px] text-[#0d1831]">
            Fidelidade e planos
          </h1>
          <p className="pt-0.5 text-sm text-[#686a73]">Planos, assinantes e programa de pontos em um único lugar</p>
        </div>
        <button
          type="button"
          className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-accent px-4 text-sm font-medium text-on-accent transition hover:bg-accent-hover"
        >
          <Plus size={16} strokeWidth={2} />
          Novo plano
        </button>
      </div>

      <div className="grid w-full grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-sm text-[#686a73]">{metric.label}</p>
            <p className="pt-1 font-['Manrope',sans-serif] text-2xl font-bold text-[#0d1831]">{metric.value}</p>
            {metric.trend && <p className="pt-1.5 text-xs text-[#27865b]">{metric.trend}</p>}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 rounded-[10px] border border-[#e6e4df] bg-white p-1 mt-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => scrollToSection(tab.id)}
            className="rounded-[8px] px-4 py-2.5 text-sm font-medium text-[#686a73] transition hover:bg-[#f7f6f2] hover:text-[#0d1831]"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div id="planos" className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 scroll-mt-6">
        {planos.map((plano) => {
          const Icon = plano.icon;
          return (
            <div key={plano.name} className="relative rounded-[12px] border border-[#e6e4df] bg-white p-6">
              {plano.popular && (
                <span className="absolute right-4 top-4 rounded-full bg-[#fdf3e3] px-2 py-0.5 text-xs font-medium text-[#d28b27]">
                  Popular
                </span>
              )}
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-accent-subtle text-accent-strong">
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-base font-semibold text-[#0d1831]">{plano.name}</p>
                  <p className="text-xs text-[#686a73]">{plano.cadence}</p>
                </div>
              </div>
              <p className="pt-4 font-['Manrope',sans-serif] text-3xl font-bold text-[#0d1831]">{plano.price}</p>
              <p className="pt-3 text-sm text-[#686a73]">{plano.description}</p>
              <ul className="flex flex-col gap-2 pt-4">
                {plano.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-[#0d1831]">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-6 w-full rounded-[10px] border border-[#e6e4df] bg-white py-2 text-sm font-medium text-[#0d1831] transition hover:bg-[#f7f6f2]"
              >
                Editar
              </button>
            </div>
          );
        })}
      </div>

      <div id="assinantes" className="w-full pt-8 scroll-mt-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-[#0d1831]">Assinantes</h2>
          <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-xs font-medium text-accent-strong">
            {assinantes.length} clientes
          </span>
        </div>
        <div className="w-full overflow-x-auto rounded-[12px] border border-[#e6e4df] bg-white mt-4">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e6e4df] bg-[#f7f6f2] text-xs font-medium text-[#686a73]">
                <th className="sticky left-0 z-10 bg-white px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Plano</th>
                <th className="px-4 py-3 font-medium">Total gasto</th>
                <th className="px-4 py-3 font-medium">Pontos</th>
                <th className="px-4 py-3 font-medium">Última visita</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {assinantes.map((a) => (
                <tr key={a.name} className="border-b border-[#e6e4df] last:border-b-0">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-full bg-accent-subtle text-xs font-semibold text-accent-strong">
                        {a.initials}
                      </span>
                      <p className="text-sm font-medium text-[#0d1831]">{a.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#f0efea] px-2 py-0.5 text-xs font-medium text-[#686a73]">
                      {a.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[#0d1831]">{a.totalSpent}</td>
                  <td className="px-4 py-3 text-sm text-[#686a73]">{a.points}</td>
                  <td className="px-4 py-3 text-sm text-[#686a73]">{a.lastVisit}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#e8f7f1] px-2 py-0.5 text-xs font-medium text-[#27865b]">
                      Ativo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div id="pontos" className="w-full pt-8 scroll-mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-[#0d1831]">Programa de pontos</h2>
          <button
            type="button"
            className="flex items-center gap-2 rounded-[8px] border border-[#e6e4df] bg-white px-3 py-1.5 text-sm font-medium text-[#0d1831] transition hover:bg-[#f7f6f2]"
          >
            <Settings2 size={13} strokeWidth={1.8} />
            Editar regras
          </button>
        </div>

        <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-sm font-semibold text-[#0d1831]">Regras vigentes</p>
            <div className="flex flex-col divide-y divide-[#e6e4df] pt-2">
              {rules.map((rule) => (
                <div key={rule.label} className="flex items-center justify-between py-3">
                  <p className="text-sm text-[#686a73]">{rule.label}</p>
                  <p className="text-sm font-medium text-[#0d1831]">{rule.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-sm font-semibold text-[#0d1831]">Ranking de pontos</p>
            <div className="flex flex-col gap-4 pt-3">
              {ranking.map((r) => (
                <div key={r.rank}>
                  <div className="flex items-center gap-3">
                    <span className="w-4 text-sm font-medium text-[#686a73]">{r.rank}</span>
                    <span className="grid size-8 place-items-center rounded-full bg-accent-subtle text-xs font-semibold text-accent-strong">
                      {r.initials}
                    </span>
                    <p className="flex-1 text-sm text-[#0d1831]">{r.name}</p>
                    <span className="rounded-full bg-[#f0efea] px-2 py-0.5 text-xs font-medium text-[#686a73]">
                      {r.points}
                    </span>
                  </div>
                  <div className="mt-2 ml-7 h-1.5 overflow-hidden rounded-full bg-[#f0efea]">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${r.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
