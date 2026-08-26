"use client";

import { Globe, Plus } from "lucide-react";

type Plano = {
  name: string;
  price: string;
  subscribers: string;
  features: string[];
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeColor: string;
};

const planos: Plano[] = [
  {
    name: "Básico",
    price: "R$ 49,00",
    subscribers: "12 assinantes",
    features: ["Até 2 profissionais", "Agendamento básico", "Relatórios simples"],
    iconBg: "#c3c3c3",
    iconColor: "#ffffff",
    badgeBg: "rgba(195,195,195,0.39)",
    badgeColor: "#5e5e5e",
  },
  {
    name: "Pro",
    price: "R$ 99,00",
    subscribers: "8 assinantes",
    features: ["Até 10 profissionais", "CRM & WhatsApp", "Relatórios avançados", "Fidelidade"],
    iconBg: "rgba(183,0,255,0.21)",
    iconColor: "#b700ff",
    badgeBg: "rgba(183,0,255,0.12)",
    badgeColor: "#b700ff",
  },
  {
    name: "Enterprise",
    price: "R$ 299,00",
    subscribers: "3 assinantes",
    features: ["Profissionais ilimitados", "Multi-unidades", "API access", "SLA garantido", "Suporte dedicado"],
    iconBg: "#ffbb00",
    iconColor: "#ffffff",
    badgeBg: "rgba(255,187,0,0.15)",
    badgeColor: "#ffbb00",
  },
];

export function SuperAdminPlanosPage() {
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <div className="flex w-full items-center justify-end">
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-[15px] bg-[#4318ff] px-4 text-xs font-medium text-white transition hover:bg-[#3712d1]"
        >
          <Plus size={16} strokeWidth={2} />
          Novo plano
        </button>
      </div>

      <div className="grid w-full grid-cols-3 gap-4">
        {planos.map((plano) => (
          <div
            key={plano.name}
            className="flex flex-col gap-5 rounded-[20px] bg-white px-[22px] py-[23px] shadow-[0px_3.5px_5.5px_rgba(0,0,0,0.02)]"
          >
            <div className="flex items-start gap-1.5">
              <span
                className="grid size-[45px] shrink-0 place-items-center rounded-[12px] shadow-[0px_3.5px_5.5px_rgba(0,0,0,0.02)]"
                style={{ backgroundColor: plano.iconBg }}
              >
                <Globe size={22} strokeWidth={1.8} style={{ color: plano.iconColor }} />
              </span>
              <div>
                <p className="text-sm font-bold text-[#2d3748]">{plano.name}</p>
                <span
                  className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px]"
                  style={{ backgroundColor: plano.badgeBg, color: plano.badgeColor }}
                >
                  {plano.subscribers}
                </span>
              </div>
            </div>

            <div className="flex items-end gap-1">
              <p className="text-4xl font-bold text-[#2d3748]">{plano.price}</p>
              <p className="pb-1 text-xs text-[#5e5e5e]">/mês</p>
            </div>

            <ul className="flex flex-col gap-1.5">
              {plano.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm text-[#898989]">
                  <span className="size-[5px] shrink-0 rounded-full bg-[#898989]" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="h-[25px] w-[138px] rounded-[5px] border border-[#d9d9d9] text-sm text-black transition hover:bg-[#f8f9fa]"
              >
                Editar
              </button>
              <button
                type="button"
                className="h-[25px] text-sm text-[#898989] transition hover:text-[#2d3748]"
              >
                Ver assinantes
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
