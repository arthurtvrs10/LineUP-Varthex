"use client";

import { useState } from "react";
import { Plus, Star } from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";
import { NovoBarbeiroModal } from "./modals/CadastroModals";

type Barbeiro = {
  initials: string;
  avatarBg: string;
  avatarText: string;
  name: string;
  email: string;
  rating: string;
  appointments: string;
  specialties: string[];
  revenue: string;
  commission: string;
  activeDays: boolean[];
};

const metrics = [
  { label: "Total de profissionais", value: "3" },
  { label: "Faturamento médio", value: "R$ 9.800,00" },
  { label: "Avaliação média", value: "4.7 ★" },
  { label: "Atendimentos", value: "588" },
];

const weekDays = ["S", "T", "Q", "Q", "S", "S", "D"];

const barbeiros: Barbeiro[] = [
  {
    initials: "LO",
    avatarBg: "bg-[#e8f7f1]",
    avatarText: "text-[#27865b]",
    name: "Lucas Oliveira",
    email: "lucas@estilounico.com.br",
    rating: "4.9",
    appointments: "248",
    specialties: ["Corte degradê", "Barba modelada", "Sobrancelha"],
    revenue: "R$ 12.400,00",
    commission: "40%",
    activeDays: [true, true, true, true, true, true, false],
  },
  {
    initials: "GS",
    avatarBg: "bg-[#e8f7f1]",
    avatarText: "text-[#27865b]",
    name: "Gabriel Santos",
    email: "gabriel@estilounico.com.br",
    rating: "4.7",
    appointments: "196",
    specialties: ["Corte social", "Pigmentação", "Progressiva"],
    revenue: "R$ 9.800,00",
    commission: "35%",
    activeDays: [true, true, true, true, true, true, false],
  },
  {
    initials: "FC",
    avatarBg: "bg-[#ede9fd]",
    avatarText: "text-[#7247f3]",
    name: "Felipe Cardoso",
    email: "felipe@estilounico.com.br",
    rating: "4.6",
    appointments: "144",
    specialties: ["Corte infantil", "Corte clássico", "Barba"],
    revenue: "R$ 7.200,00",
    commission: "35%",
    activeDays: [true, true, true, true, true, false, false],
  },
];

export function AdminEquipePage() {
  const [novoAberto, setNovoAberto] = useState(false);
  const toast = useToast();

  return (
    <div className="flex w-full flex-col items-start">
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="font-['Manrope',sans-serif] text-2xl font-bold tracking-[-0.48px] text-[#0d1831]">
            Equipe
          </h1>
          <p className="pt-0.5 text-sm text-[#686a73]">{barbeiros.length} profissionais cadastrados</p>
        </div>
        <button
          type="button"
          onClick={() => setNovoAberto(true)}
          className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#7247f3] px-4 text-sm font-medium text-white transition hover:bg-[#5c2ee0]"
        >
          <Plus size={16} strokeWidth={2} />
          Adicionar barbeiro
        </button>
      </div>

      <div className="grid w-full grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-sm text-[#686a73]">{metric.label}</p>
            <p className="pt-1 font-['Manrope',sans-serif] text-2xl font-bold text-[#0d1831]">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
        {barbeiros.map((barbeiro) => (
          <div key={barbeiro.email} className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <div className="flex items-start gap-4">
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-full ${barbeiro.avatarBg} text-base font-semibold ${barbeiro.avatarText}`}
              >
                {barbeiro.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-base font-semibold text-[#0d1831]">{barbeiro.name}</p>
                  <span className="shrink-0 rounded-full bg-[#e8f7f1] px-2 py-0.5 text-xs font-medium text-[#27865b]">
                    Ativo
                  </span>
                </div>
                <p className="truncate pt-1 text-sm text-[#686a73]">{barbeiro.email}</p>
                <div className="flex items-center gap-1 pt-1">
                  <Star size={12} className="fill-[#686a73] text-[#686a73]" />
                  <p className="text-xs text-[#686a73]">
                    {barbeiro.rating} · {barbeiro.appointments} atendimentos
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 pt-3">
              {barbeiro.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="rounded-full bg-[#ede9fd] px-2 py-0.5 text-xs font-medium text-[#7247f3]"
                >
                  {specialty}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-[#e6e4df] pt-4 mt-4">
              <div>
                <p className="text-xs text-[#686a73]">Faturamento</p>
                <p className="font-['Manrope',sans-serif] text-base font-bold text-[#0d1831]">
                  {barbeiro.revenue}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#686a73]">Comissão</p>
                <p className="font-['Manrope',sans-serif] text-base font-bold text-[#27865b]">
                  {barbeiro.commission}
                </p>
              </div>
            </div>

            <div className="flex gap-1 pt-3">
              {weekDays.map((day, index) => (
                <span
                  key={index}
                  className={`grid size-6 place-items-center rounded-[4px] text-[9px] font-medium ${
                    barbeiro.activeDays[index]
                      ? "bg-[#ede9fd] text-[#7247f3]"
                      : "bg-[#f0efea] text-[#b0afa8]"
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <NovoBarbeiroModal
        open={novoAberto}
        onClose={() => setNovoAberto(false)}
        onConcluir={toast.mostrar}
      />
      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
