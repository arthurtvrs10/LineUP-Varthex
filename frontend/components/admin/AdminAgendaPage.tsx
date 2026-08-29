"use client";

import { useState } from "react";
import { Toast, useToast } from "@/components/ui/Toast";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { NovoAgendamentoModal } from "./modals/AgendaModals";
import { Plus, ChevronLeft, ChevronRight, Search } from "lucide-react";

type ViewMode = "dia" | "semana" | "lista";

type Barber = {
  id: string;
  name: string;
  initials: string;
  badgeBg: string;
  badgeText: string;
};

type Appointment = {
  time: string;
  barberId: string;
  client: string;
  service: string;
  cardBg: string;
  cardBorder: string;
};

const barbers: Barber[] = [
  { id: "lucas", name: "Lucas", initials: "LO", badgeBg: "bg-[#e8f7f1]", badgeText: "text-[#27865b]" },
  { id: "gabriel", name: "Gabriel", initials: "GS", badgeBg: "bg-[#e8f7f1]", badgeText: "text-[#27865b]" },
  { id: "felipe", name: "Felipe", initials: "FC", badgeBg: "bg-accent-subtle", badgeText: "text-accent-strong" },
];

const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const appointments: Appointment[] = [
  {
    time: "09:00",
    barberId: "lucas",
    client: "João Silva",
    service: "Corte + barba",
    cardBg: "bg-accent-subtle",
    cardBorder: "border-accent/20",
  },
  {
    time: "11:00",
    barberId: "gabriel",
    client: "Thiago Pereira",
    service: "Corte social",
    cardBg: "bg-[#eaf2fb]",
    cardBorder: "border-[rgba(52,120,201,0.2)]",
  },
];

const summary = [
  { label: "Agendado", value: 2, bg: "bg-[#eaf2fb]", text: "text-[#3478c9]" },
  { label: "Confirmado", value: 1, bg: "bg-[#eaf2fb]", text: "text-[#3478c9]" },
  { label: "Em atendimento", value: 1, bg: "bg-[#fdf3e3]", text: "text-[#d28b27]" },
  { label: "Concluído", value: 1, bg: "bg-[#e8f7f1]", text: "text-[#27865b]" },
];

export function AdminAgendaPage() {
  const [novoAberto, setNovoAberto] = useState(false);
  const [filtroBarbeiro, setFiltroBarbeiro] = useState("Todos os barbeiros");
  const [filtroStatus, setFiltroStatus] = useState("Todos os status");
  const toast = useToast();
  const [view, setView] = useState<ViewMode>("dia");
  const [date, setDate] = useState("13/08/2026");
  const [search, setSearch] = useState("");

  function findAppointment(hour: string, barberId: string) {
    return appointments.find((a) => a.time === hour && a.barberId === barberId);
  }

  return (
    <div className="flex w-full flex-col items-start">
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="font-['Manrope',sans-serif] text-2xl font-bold tracking-[-0.48px] text-[#0d1831]">
            Agenda
          </h1>
          <p className="pt-0.5 text-sm text-[#686a73]">Gerencie todos os agendamentos</p>
        </div>
        <button
          type="button"
          onClick={() => setNovoAberto(true)}
          className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-accent px-4 text-sm font-medium text-on-accent transition hover:bg-accent-hover"
        >
          <Plus size={16} strokeWidth={2} />
          Novo agendamento
        </button>
      </div>

      <div className="flex w-full flex-wrap items-center gap-3 pt-6">
        <div className="flex items-center gap-1 rounded-[10px] border border-[#e6e4df] bg-white p-1">
          {(
            [
              ["dia", "Dia"],
              ["semana", "Semana"],
              ["lista", "Lista"],
            ] as [ViewMode, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              className={`rounded-[8px] px-3 py-1.5 text-xs font-medium transition ${
                view === value ? "bg-accent text-on-accent" : "text-[#686a73] hover:bg-[#f7f6f2]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center gap-2">
          <button
            type="button"
            aria-label="Dia anterior"
            className="grid size-9 place-items-center rounded-[10px] border border-[#e6e4df] bg-white text-[#686a73] transition hover:bg-[#f7f6f2]"
          >
            <ChevronLeft size={16} strokeWidth={1.8} />
          </button>
          <span className="px-2 text-sm font-medium text-[#0d1831]">{date}</span>
          <button
            type="button"
            aria-label="Próximo dia"
            className="grid size-9 place-items-center rounded-[10px] border border-[#e6e4df] bg-white text-[#686a73] transition hover:bg-[#f7f6f2]"
          >
            <ChevronRight size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex h-9 w-48 items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-3">
          <Search size={15} strokeWidth={1.8} className="text-[#b0afa8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full bg-transparent text-sm text-[#0d1831] placeholder:text-[#b0afa8] focus:outline-none"
          />
        </div>

        <FilterSelect
          label="Filtrar por barbeiro"
          className="w-[178px]"
          options={["Todos os barbeiros", "Lucas Oliveira", "Gabriel Santos", "Felipe Cardoso"]}
          value={filtroBarbeiro}
          onChange={setFiltroBarbeiro}
        />
        <FilterSelect
          label="Filtrar por status"
          className="w-[164px]"
          options={["Todos os status", "Confirmado", "Agendado", "Em atendimento", "Concluído"]}
          value={filtroStatus}
          onChange={setFiltroStatus}
        />
      </div>

      <div className="grid w-full grid-cols-1 gap-4 pt-6 lg:grid-cols-4">
        <div className="overflow-x-auto rounded-[12px] border border-[#e6e4df] bg-white lg:col-span-3">
          <div className="min-w-[560px]">
          <div className="grid grid-cols-4 border-b border-[#e6e4df] bg-[#f7f6f2]">
            <div className="p-3">
              <p className="text-xs text-[#686a73]">Horário</p>
            </div>
            {barbers.map((barber) => (
              <div key={barber.id} className="flex items-center gap-2 border-l border-[#e6e4df] p-3">
                <span
                  className={`grid size-6 place-items-center rounded-full ${barber.badgeBg} text-xs font-semibold ${barber.badgeText}`}
                >
                  {barber.initials}
                </span>
                <p className="text-xs font-medium text-[#0d1831]">{barber.name}</p>
              </div>
            ))}
          </div>

          {hours.map((hour) => (
            <div key={hour} className="grid min-h-[60px] grid-cols-4 border-b border-[#e6e4df] last:border-b-0">
              <div className="border-r border-[#e6e4df] p-3">
                <p className="text-xs text-[#686a73]">{hour}</p>
              </div>
              {barbers.map((barber) => {
                const appt = findAppointment(hour, barber.id);
                return (
                  <div key={barber.id} className="border-l border-[#e6e4df] p-1">
                    {appt && (
                      <div className={`rounded-[8px] border ${appt.cardBorder} ${appt.cardBg} p-2`}>
                        <p className="text-xs font-medium text-[#0d1831]">{appt.client}</p>
                        <p className="text-xs text-[#686a73]">{appt.service}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-4">
            <h3 className="font-['Manrope',sans-serif] text-sm font-bold tracking-[-0.28px] text-[#0d1831]">
              Resumo do dia
            </h3>
            <div className="flex flex-col gap-2 pt-3">
              {summary.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <p className="text-xs text-[#686a73]">{item.label}</p>
                  <span className={`rounded-full ${item.bg} px-2 py-0.5 text-xs font-medium ${item.text}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-4">
            <h3 className="font-['Manrope',sans-serif] text-sm font-bold tracking-[-0.28px] text-[#0d1831]">
              Faturamento
            </h3>
            <p className="pt-3 font-['Manrope',sans-serif] text-2xl font-bold text-[#0d1831]">R$ 45,00</p>
            <p className="pt-1 text-xs text-[#686a73]">1 atendimentos concluídos</p>
          </div>
        </div>
      </div>

      <NovoAgendamentoModal
        open={novoAberto}
        onClose={() => setNovoAberto(false)}
        onConcluir={toast.mostrar}
      />
      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
