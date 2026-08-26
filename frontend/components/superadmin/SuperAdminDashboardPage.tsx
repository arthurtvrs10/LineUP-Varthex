"use client";

import {
  FileText,
  UserPlus,
  Users,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Bell,
  CheckCircle2,
} from "lucide-react";

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
  return { line, area };
}

const metrics = [
  { label: "Barbearias ativas", value: "4", trend: "+8% vs mês ant.", icon: FileText },
  { label: "Novos cadastros", value: "5", trend: "+8% vs mês ant.", icon: UserPlus },
  { label: "Usuários ativos", value: "284", trend: "+8% vs mês ant.", icon: Users },
  { label: "MRR", value: "R$ 21.400,00", trend: "+8% vs mês ant.", icon: CreditCard },
  { label: "Bloqueadas", value: "1", trend: "+8% vs mês ant.", icon: AlertTriangle },
];

const mrrMonths = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const mrrValues = [420, 180, 220, 280, 340, 500, 480, 320, 360, 190, 260, 440];

type Alerta = {
  icon: typeof Bell;
  color: string;
  text: string;
  date: string;
};

const alertas: Alerta[] = [
  {
    icon: CheckCircle2,
    color: "#4fd1c5",
    text: 'Barbearia "Corte & Arte" foi bloqueada há 14 dias',
    date: "22 DEZ 19:20",
  },
  {
    icon: Bell,
    color: "#e53e3e",
    text: "Falha na sincronização de 3 agendamentos.",
    date: "25 DEZ 07:20",
  },
  {
    icon: Bell,
    color: "#ecc94b",
    text: "5 novas barbearias aguardam verificação de dados.",
    date: "25 DEZ 07:20",
  },
];

type Barbearia = {
  name: string;
  email: string;
  color: string;
  status: "Ativo" | "Bloqueado" | "Pendente";
};

const barbeariasRecentes: Barbearia[] = [
  { name: "Barbearia Estilo Único", email: "contato@estilounico.com", color: "#4fd1c5", status: "Ativo" },
  { name: "Corte & Arte", email: "contato@corteearte.com", color: "#c84a4a", status: "Bloqueado" },
  { name: "Studio Navalha de Ouro", email: "contato@navalhadeouro.com", color: "#4318ff", status: "Ativo" },
  { name: "Barba Boa", email: "contato@barbaboa.com", color: "#d28b27", status: "Pendente" },
  { name: "Barbearia Vintage", email: "contato@barbeariavintage.com", color: "#48bb78", status: "Ativo" },
  { name: "Clube do Corte", email: "contato@clubedocorte.com", color: "#8f7bf5", status: "Pendente" },
];

const statusStyles: Record<Barbearia["status"], string> = {
  Ativo: "bg-[#48bb78] text-white",
  Bloqueado: "bg-[#e53e3e] text-white",
  Pendente: "bg-[#ecc94b] text-[#7a5d00]",
};

export function SuperAdminDashboardPage() {
  const width = 900;
  const height = 220;
  const { line, area } = buildAreaPath(mrrValues, width, height);

  return (
    <div className="flex w-full flex-col items-start gap-5">
      <div className="grid w-full grid-cols-5 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="flex items-start justify-between rounded-[15px] bg-white p-[17px] shadow-[0px_3.5px_2.75px_rgba(0,0,0,0.02)]"
            >
              <div>
                <p className="text-xs font-bold text-[#a0aec0]">{m.label}</p>
                <p className="pt-2 text-lg font-bold text-[#2d3748]">{m.value}</p>
                <div className="flex items-center gap-1 pt-2.5">
                  <TrendingUp size={10} strokeWidth={2} className="text-[#48bb78]" />
                  <span className="text-[10px] text-[#a0aec0]">{m.trend}</span>
                </div>
              </div>
              <span className="grid size-[45px] shrink-0 place-items-center rounded-[12px] bg-[#4318ff] shadow-[0px_3.5px_5.5px_rgba(0,0,0,0.02)]">
                <Icon size={20} strokeWidth={1.8} className="text-white" />
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid w-full grid-cols-[661fr_438fr] gap-4">
        <div className="rounded-[15px] bg-white p-6 shadow-[0px_3.5px_5.5px_rgba(0,0,0,0.02)]">
          <p className="text-lg font-bold text-[#2d3748]">MRR — Receita recorrente mensal</p>
          <p className="pt-1 text-sm text-[#a0aec0]">
            <span className="font-bold text-[#48bb78]">+30% </span>
            este ano
          </p>
          <div className="pt-4">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4318ff" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#4318ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={area} fill="url(#mrrGradient)" />
              <path d={line} fill="none" stroke="#4318ff" strokeWidth={3} />
            </svg>
            <div className="flex justify-between pt-2 text-[10px] font-bold text-[#cbd5e0]">
              {mrrMonths.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[15px] bg-white p-6 shadow-[0px_3.5px_5.5px_rgba(0,0,0,0.02)]">
          <p className="text-lg font-bold text-[#2d3748]">Alertas operacionais</p>
          <p className="pt-1 text-sm text-[#a0aec0]">
            <span className="font-bold text-[#48bb78]">+30% </span>
            this month
          </p>
          <div className="flex flex-col divide-y divide-[#eef0f3] pt-4">
            {alertas.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.text} className="flex items-start gap-3 py-3">
                  <span
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full"
                    style={{ backgroundColor: `${a.color}22`, color: a.color }}
                  >
                    <Icon size={13} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#2d3748]">{a.text}</p>
                    <p className="pt-1 text-xs text-[#a0aec0]">{a.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full rounded-[15px] bg-white p-6 shadow-[0px_3.5px_5.5px_rgba(0,0,0,0.02)]">
        <p className="text-lg font-bold text-[#2d3748]">Barbearias recentes</p>
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pt-4 pb-2 text-[10px] font-bold text-[#a0aec0]">
          <span>BARBEARIA</span>
          <span>STATUS</span>
        </div>
        <div className="flex flex-col divide-y divide-[#eef0f3]">
          {barbeariasRecentes.map((b) => (
            <div key={b.name} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span
                  className="grid size-10 place-items-center rounded-[12px] text-xs font-bold text-white shadow-[0px_3.5px_5.5px_rgba(0,0,0,0.02)]"
                  style={{ backgroundColor: b.color }}
                >
                  {b.name
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")}
                </span>
                <div>
                  <p className="text-sm font-bold text-[#2d3748]">{b.name}</p>
                  <p className="text-sm text-[#718096]">{b.email}</p>
                </div>
              </div>
              <span className={`rounded-[8px] px-3 py-1 text-sm font-bold ${statusStyles[b.status]}`}>
                {b.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
