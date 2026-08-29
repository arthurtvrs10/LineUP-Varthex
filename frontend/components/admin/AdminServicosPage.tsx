"use client";

import { useState } from "react";
import { Toast, useToast } from "@/components/ui/Toast";
import { NovoServicoModal } from "./modals/CadastroModals";
import { Plus, Clock, Percent } from "lucide-react";

type Servico = {
  category: "Corte" | "Barba" | "Combo" | "Estética";
  name: string;
  description: string;
  highlight: boolean;
  active: boolean;
  duration: string;
  commission: string;
  price: string;
};

const servicos: Servico[] = [
  {
    category: "Corte",
    name: "Corte degradê",
    description: "Corte moderno com transição suave entre os comprimentos.",
    highlight: true,
    active: true,
    duration: "45min",
    commission: "40% comissão",
    price: "R$ 45,00",
  },
  {
    category: "Corte",
    name: "Corte social",
    description: "Corte clássico e elegante para ambientes formais.",
    highlight: false,
    active: true,
    duration: "40min",
    commission: "40% comissão",
    price: "R$ 40,00",
  },
  {
    category: "Corte",
    name: "Corte infantil",
    description: "Corte especializado para crianças até 12 anos.",
    highlight: false,
    active: true,
    duration: "30min",
    commission: "35% comissão",
    price: "R$ 30,00",
  },
  {
    category: "Barba",
    name: "Barba completa",
    description: "Modelagem, hidratação e acabamento profissional.",
    highlight: true,
    active: true,
    duration: "30min",
    commission: "40% comissão",
    price: "R$ 35,00",
  },
  {
    category: "Combo",
    name: "Corte + barba",
    description: "Corte degradê e barba completa com desconto.",
    highlight: true,
    active: true,
    duration: "70min",
    commission: "40% comissão",
    price: "R$ 70,00",
  },
  {
    category: "Estética",
    name: "Sobrancelha",
    description: "Modelagem de sobrancelha com navalha.",
    highlight: false,
    active: true,
    duration: "15min",
    commission: "35% comissão",
    price: "R$ 15,00",
  },
];

const categories = ["Todos", "Corte", "Barba", "Combo", "Estética"] as const;
type Category = (typeof categories)[number];

export function AdminServicosPage() {
  const [filter, setFilter] = useState<Category>("Todos");
  const [novoAberto, setNovoAberto] = useState(false);
  const toast = useToast();

  const filtered = filter === "Todos" ? servicos : servicos.filter((s) => s.category === filter);
  const grouped = filtered.reduce<Record<string, Servico[]>>((acc, servico) => {
    (acc[servico.category] ??= []).push(servico);
    return acc;
  }, {});

  return (
    <div className="flex w-full flex-col items-start">
      <div>
        <h1 className="font-['Manrope',sans-serif] text-2xl font-bold tracking-[-0.48px] text-[#0d1831]">
          Serviços
        </h1>
        <p className="pt-0.5 text-sm text-[#686a73]">{servicos.length} serviços cadastrados</p>
      </div>

      <div className="flex w-full flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-3 overflow-x-auto pb-1 sm:w-auto sm:overflow-visible sm:pb-0">
          {categories.map((category) => {
            const count = category === "Todos" ? servicos.length : servicos.filter((s) => s.category === category).length;
            const isActive = filter === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setFilter(category)}
                className={`flex h-[34px] shrink-0 items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "border border-accent bg-accent text-on-accent"
                    : "border border-[#e6e4df] bg-white text-[#686a73] hover:bg-[#f7f6f2]"
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setNovoAberto(true)}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-accent px-4 text-sm font-medium text-on-accent transition hover:bg-accent-hover sm:w-auto"
        >
          <Plus size={16} strokeWidth={2} />
          Novo serviço
        </button>
      </div>

      <div className="flex w-full flex-col gap-6 pt-5">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="w-full">
            <h3 className="font-['Manrope',sans-serif] text-sm font-bold uppercase tracking-[-0.28px] text-[#686a73]">
              {category}
            </h3>
            <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
              {items.map((servico) => (
                <div key={servico.name} className="rounded-[12px] border border-[#e6e4df] bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#0d1831]">{servico.name}</p>
                        {servico.highlight && (
                          <span className="rounded-full bg-[#fbf4e8] px-2 py-0.5 text-xs font-medium text-[#c8a86b]">
                            Destaque
                          </span>
                        )}
                      </div>
                      <p className="pt-1 text-xs text-[#686a73]">{servico.description}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#e8f7f1] px-2 py-0.5 text-xs font-medium text-[#27865b]">
                      Ativo
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-[#686a73]" />
                        <p className="text-xs text-[#686a73]">{servico.duration}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Percent size={12} className="text-[#686a73]" />
                        <p className="text-xs text-[#686a73]">{servico.commission}</p>
                      </div>
                    </div>
                    <p className="text-base font-bold text-[#0d1831]">{servico.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <NovoServicoModal
        open={novoAberto}
        onClose={() => setNovoAberto(false)}
        onConcluir={toast.mostrar}
      />
      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
