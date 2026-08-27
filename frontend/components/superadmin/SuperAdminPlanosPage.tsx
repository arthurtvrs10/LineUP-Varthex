"use client";

import { Scissors, Star, Building2, Check, Plus } from "lucide-react";

type Plano = {
  name: string;
  price: string;
  subscribers: string;
  features: string[];
  icon: typeof Scissors;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeColor: string;
  accent: string;
  popular?: boolean;
};

const planos: Plano[] = [
  {
    name: "Básico",
    price: "R$ 49,00",
    subscribers: "12 assinantes",
    features: ["Até 2 profissionais", "Agendamento básico", "Relatórios simples"],
    icon: Scissors,
    iconBg: "#f0efea",
    iconColor: "#686a73",
    badgeBg: "#f0efea",
    badgeColor: "#686a73",
    accent: "#5f6f87",
  },
  {
    name: "Pro",
    price: "R$ 99,00",
    subscribers: "8 assinantes",
    features: ["Até 10 profissionais", "CRM & WhatsApp", "Relatórios avançados", "Fidelidade"],
    icon: Star,
    iconBg: "#ede9fd",
    iconColor: "#7247f3",
    badgeBg: "#ede9fd",
    badgeColor: "#7247f3",
    accent: "#7247f3",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "R$ 299,00",
    subscribers: "3 assinantes",
    features: ["Profissionais ilimitados", "Multi-unidades", "API access", "SLA garantido", "Suporte dedicado"],
    icon: Building2,
    iconBg: "#fbf4e8",
    iconColor: "#c8a86b",
    badgeBg: "#fbf4e8",
    badgeColor: "#c8a86b",
    accent: "#c8a86b",
  },
];

export function SuperAdminPlanosPage() {
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <div className="flex w-full items-center justify-end">
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-[10px] bg-[#7247f3] px-4 text-xs font-medium text-white transition hover:bg-[#5c2ee0]"
        >
          <Plus size={16} strokeWidth={2} />
          Novo plano
        </button>
      </div>

      <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
        {planos.map((plano) => {
          const Icon = plano.icon;
          return (
            <div
              key={plano.name}
              className={`relative flex flex-col gap-6 rounded-[14px] bg-white px-6 py-7 transition ${
                plano.popular ? "border-2" : "border border-[#e6e4df]"
              }`}
              style={plano.popular ? { borderColor: plano.accent } : undefined}
            >
              {plano.popular && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-bold text-white"
                  style={{ backgroundColor: plano.accent }}
                >
                  Mais popular
                </span>
              )}

              <div className="flex items-start gap-3">
                <span
                  className="grid size-[45px] shrink-0 place-items-center rounded-[10px]"
                  style={{ backgroundColor: plano.iconBg }}
                >
                  <Icon size={20} strokeWidth={1.8} style={{ color: plano.iconColor }} />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#0d1831]">{plano.name}</p>
                  <span
                    className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                    style={{ backgroundColor: plano.badgeBg, color: plano.badgeColor }}
                  >
                    {plano.subscribers}
                  </span>
                </div>
              </div>

              <div className="flex items-end gap-1">
                <p className="text-4xl font-bold text-[#0d1831]">{plano.price}</p>
                <p className="pb-1 text-xs text-[#98a2b3]">/mês</p>
              </div>

              <ul className="flex flex-col gap-2.5">
                {plano.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-[#4f5e73]">
                    <span
                      className="grid size-4 shrink-0 place-items-center rounded-full"
                      style={{ backgroundColor: plano.iconBg }}
                    >
                      <Check size={11} strokeWidth={2.5} style={{ color: plano.iconColor }} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex items-center gap-2 border-t border-[#e6e4df] pt-4">
                <button
                  type="button"
                  className={`h-9 flex-1 rounded-[8px] text-sm font-medium transition ${
                    plano.popular ? "text-white hover:opacity-90" : "border border-[#e6e4df] text-[#0d1831] hover:bg-[#f7f6f2]"
                  }`}
                  style={plano.popular ? { backgroundColor: plano.accent } : undefined}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="h-9 shrink-0 rounded-[8px] px-3 text-sm text-[#98a2b3] transition hover:bg-[#f7f6f2] hover:text-[#0d1831]"
                >
                  Ver assinantes
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
