import { ChevronDown } from "lucide-react";

type Service = {
  name: string;
  subtitle: string;
  value: string;
  color: string;
  percent: number;
};

const services: Service[] = [
  { name: "Cabelo", subtitle: "Serviço individual", value: "R$ 275,00", color: "#7247f3", percent: 50 },
  { name: "Barba", subtitle: "Serviço individual", value: "R$ 165,00", color: "#ef6f8e", percent: 30 },
  { name: "Cabelo + barba", subtitle: "Serviço combinado", value: "R$ 110,00", color: "#f2a93b", percent: 20 },
];

const totalSpent = "R$ 550";

const loyaltyStats = [
  {
    label: "PONTOS ACUMULADOS",
    value: "920",
    sub: "Saldo disponível no programa",
    footLabel: "FIDELIDADE",
    footValue: "01",
    primary: true,
  },
  {
    label: "VISITAS REALIZADAS",
    value: "46",
    sub: "Atendimentos registrados",
    footLabel: "HISTÓRICO",
    footValue: "02",
    primary: false,
  },
  {
    label: "TOTAL GASTO",
    value: totalSpent,
    sub: "Valor acumulado em serviços",
    footLabel: "INVESTIMENTO",
    footValue: "03",
    primary: false,
  },
];

function buildConicGradient(items: Service[]) {
  let cursor = 0;
  const stops = items.map((item) => {
    const start = cursor;
    cursor += item.percent;
    return `${item.color} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl border border-[#eceef2] bg-white p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-[#202126]">Gastos por serviço</h1>
            <p className="mt-1 text-sm text-[#74757d]">
              Distribuição do valor total conforme os serviços contratados.
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-[#e2e0dd] px-4 py-2 text-xs font-bold text-[#686972]"
          >
            Últimos 12 meses
            <ChevronDown size={14} strokeWidth={2} />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
          <div className="flex flex-col items-center gap-3">
            <p className="self-start text-[11px] font-bold tracking-wide text-[#8a8b92]">
              DISTRIBUIÇÃO DO PERÍODO
            </p>
            <div
              className="relative size-[220px] shrink-0 rounded-full"
              style={{ background: buildConicGradient(services) }}
            >
              <div className="absolute inset-[19%] rounded-full bg-white" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-[11px] text-[#a0a1a7]">Total gasto</p>
                <p className="text-[28px] font-bold text-[#202126]">{totalSpent}</p>
                <p className="text-[11px] text-[#a0a1a7]">3 serviços</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between border-b border-[#eceef2] pb-3">
              <p className="text-[11px] font-bold tracking-wide text-[#87888f]">SERVIÇO</p>
              <p className="text-[11px] font-bold tracking-wide text-[#87888f]">VALOR</p>
            </div>
            <ul>
              {services.map((service) => (
                <li
                  key={service.name}
                  className="flex items-center justify-between gap-4 border-b border-[#f1f2f5] py-4 last:border-none"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-8 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: service.color }}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-bold text-[#24252b]">{service.name}</p>
                      <p className="text-[11px] text-[#8a8b92]">{service.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-base font-bold text-[#24252b]">{service.value}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-[28px] font-bold text-[#202126]">Minha fidelidade</h2>
        <p className="mt-1 text-sm text-[#74757d]">Benefícios e relacionamento com a barbearia.</p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {loyaltyStats.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl p-6 ${
                stat.primary
                  ? "bg-[#4318ff] text-white"
                  : "border border-[#eceef2] bg-white text-[#24252b]"
              }`}
            >
              <p
                className={`text-[11px] font-bold tracking-wide ${
                  stat.primary ? "text-[#d9d3ff]" : "text-[#85868d]"
                }`}
              >
                {stat.label}
              </p>
              <p className="mt-4 text-[42px] font-bold leading-none">{stat.value}</p>
              <p className={`mt-3 text-xs ${stat.primary ? "text-[#d8d2ff]" : "text-[#7d7e86]"}`}>
                {stat.sub}
              </p>
              <div
                className={`mt-5 flex items-center justify-between border-t pt-3 text-[10px] font-bold tracking-wide ${
                  stat.primary ? "border-white/15 text-[#ece9ff]" : "border-[#eceef2] text-[#96979e]"
                }`}
              >
                <span>{stat.footLabel}</span>
                <span>{stat.footValue}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eceef2] pt-5 text-[11px] text-[#92939a]">
        <p>Valores consolidados a partir do histórico de serviços.</p>
        <p>Resumo do cliente</p>
      </div>
    </div>
  );
}
