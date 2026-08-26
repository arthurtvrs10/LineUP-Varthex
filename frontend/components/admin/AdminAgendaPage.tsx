"use client";

import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Search, ChevronDown } from "lucide-react";

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
  { id: "felipe", name: "Felipe", initials: "FC", badgeBg: "bg-[#ede9fd]", badgeText: "text-[#6c4cf1]" },
];

const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const appointments: Appointment[] = [
  {
    time: "09:00",
    barberId: "lucas",
    client: "João Silva",
    service: "Corte + barba",
    cardBg: "bg-[#ede9fd]",
    cardBorder: "border-[rgba(108,76,241,0.2)]",
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
          <h1 className="font-['Manrope',sans-serif] text-2xl font-bold tracking-[-0.48px] text-[#17181d]">
            Agenda
          </h1>
          <p className="pt-0.5 text-sm text-[#686a73]">Gerencie todos os agendamentos</p>
        </div>
        <button
          type="button"
          className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#6c4cf1] px-4 text-sm font-medium text-white shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.1)] transition hover:bg-[#5d3fe0]"
        >
          <Plus size={16} strokeWidth={2} />
          Novo agendamento
        </button>
      </div>

      <div className="flex w-full items-center gap-3 pt-6">
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
                view === value ? "bg-[#6c4cf1] text-white" : "text-[#686a73] hover:bg-[#f7f6f2]"
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
          <span className="px-2 text-sm font-medium text-[#17181d]">{date}</span>
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
            className="w-full bg-transparent text-sm text-[#17181d] placeholder:text-[#b0afa8] focus:outline-none"
          />
        </div>

        <button
          type="button"
          className="flex h-10 w-[178px] items-center justify-between rounded-[10px] border border-[#e6e4df] bg-white px-3 text-sm text-[#17181d]"
        >
          Todos os barbeiros
          <ChevronDown size={12} className="text-[#686a73]" />
        </button>
        <button
          type="button"
          className="flex h-10 w-[164px] items-center justify-between rounded-[10px] border border-[#e6e4df] bg-white px-3 text-sm text-[#17181d]"
        >
          Todos os status
          <ChevronDown size={12} className="text-[#686a73]" />
        </button>
      </div>

      <div className="grid w-full grid-cols-4 gap-4 pt-6">
        <div className="col-span-3 overflow-clip rounded-[12px] border border-[#e6e4df] bg-white">
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
                <p className="text-xs font-medium text-[#17181d]">{barber.name}</p>
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
                        <p className="text-xs font-medium text-[#17181d]">{appt.client}</p>
                        <p className="text-xs text-[#686a73]">{appt.service}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-4">
            <h3 className="font-['Manrope',sans-serif] text-sm font-bold tracking-[-0.28px] text-[#17181d]">
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
            <h3 className="font-['Manrope',sans-serif] text-sm font-bold tracking-[-0.28px] text-[#17181d]">
              Faturamento
            </h3>
            <p className="pt-3 font-['Manrope',sans-serif] text-2xl font-bold text-[#17181d]">R$ 45,00</p>
            <p className="pt-1 text-xs text-[#686a73]">1 atendimentos concluídos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
