"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Plus } from "lucide-react";

type Status = "Concluído" | "Cancelado" | "Falta";

type Appointment = {
  date: string;
  time: string;
  service: string;
  detail: string;
  professional: string;
  unit: string;
  status: Status;
  value: string;
};

const appointments: Appointment[] = [
  {
    date: "08 ago 2026",
    time: "14:00 — 15:10",
    service: "Corte de cabelo + Barba",
    detail: "2 serviços • 70 min",
    professional: "João Pereira",
    unit: "Unidade Centro",
    status: "Concluído",
    value: "R$ 85,00",
  },
  {
    date: "31 jul 2026",
    time: "10:00 — 10:45",
    service: "Corte de cabelo",
    detail: "1 serviço • 45 min",
    professional: "Lucas Rocha",
    unit: "Unidade Centro",
    status: "Concluído",
    value: "R$ 50,00",
  },
  {
    date: "18 jul 2026",
    time: "16:30 — 17:00",
    service: "Barba",
    detail: "1 serviço • 30 min",
    professional: "João Pereira",
    unit: "Unidade Centro",
    status: "Cancelado",
    value: "R$ 35,00",
  },
  {
    date: "04 jul 2026",
    time: "09:00 — 09:45",
    service: "Corte de cabelo",
    detail: "1 serviço • 45 min",
    professional: "Lucas Rocha",
    unit: "Unidade Sul",
    status: "Falta",
    value: "R$ 50,00",
  },
  {
    date: "25 jun 2026",
    time: "15:00 — 16:10",
    service: "Corte de cabelo + Barba",
    detail: "2 serviços • 70 min",
    professional: "João Pereira",
    unit: "Unidade Centro",
    status: "Concluído",
    value: "R$ 85,00",
  },
  {
    date: "10 jun 2026",
    time: "11:00 — 11:30",
    service: "Barba",
    detail: "1 serviço • 30 min",
    professional: "João Pereira",
    unit: "Unidade Sul",
    status: "Cancelado",
    value: "R$ 35,00",
  },
];

const professionals = ["Todos", "João Pereira", "Lucas Rocha"];
const statuses: Array<"Todos" | Status> = ["Todos", "Concluído", "Cancelado", "Falta"];

const statusStyles: Record<Status, string> = {
  Concluído: "bg-[#e6f7ec] text-[#085d3a]",
  Cancelado: "bg-[#fbeae8] text-[#912018]",
  Falta: "bg-[#fdf1e4] text-[#93370d]",
};

export function HistoricoPage() {
  const [professional, setProfessional] = useState("Todos");
  const [status, setStatus] = useState<"Todos" | Status>("Todos");

  const filtered = useMemo(
    () =>
      appointments.filter(
        (item) =>
          (professional === "Todos" || item.professional === professional) &&
          (status === "Todos" || item.status === status),
      ),
    [professional, status],
  );

  const summary = useMemo(() => {
    return {
      concluido: filtered.filter((item) => item.status === "Concluído").length,
      cancelado: filtered.filter((item) => item.status === "Cancelado").length,
      falta: filtered.filter((item) => item.status === "Falta").length,
    };
  }, [filtered]);

  function clearFilters() {
    setProfessional("Todos");
    setStatus("Todos");
  }

  return (
    <div className="rounded-2xl bg-white p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-[#101828]">Histórico de agendamentos</h1>
          <p className="mt-2 text-sm text-[#475467]">
            Consulte seus atendimentos, horários, serviços e valores.
          </p>
        </div>
        <Link
          href="/clientes/agendamento"
          className="flex items-center gap-2 rounded-lg bg-[#3448c5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#293aa3]"
        >
          <Plus size={16} strokeWidth={2.5} />
          Novo agendamento
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4 rounded-xl border border-[#eaecf0] p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto]">
        <div>
          <label className="text-sm text-[#344054]" htmlFor="periodo">
            Período
          </label>
          <div
            id="periodo"
            className="mt-2 flex h-12 items-center rounded-lg border border-[#d0d5dd] px-3.5 text-sm text-[#101828]"
          >
            01/06/2026 — 14/08/2026
          </div>
        </div>

        <div>
          <label className="text-sm text-[#344054]" htmlFor="profissional">
            Profissional
          </label>
          <select
            id="profissional"
            value={professional}
            onChange={(event) => setProfessional(event.target.value)}
            className="mt-2 h-12 w-full rounded-lg border border-[#d0d5dd] px-3.5 text-sm text-[#101828] outline-none focus:border-[#7247f3]"
          >
            {professionals.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-[#344054]" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as "Todos" | Status)}
            className="mt-2 h-12 w-full rounded-lg border border-[#d0d5dd] px-3.5 text-sm text-[#101828] outline-none focus:border-[#7247f3]"
          >
            {statuses.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="mt-auto h-12 rounded-lg border border-[#d0d5dd] px-6 text-sm font-bold text-[#344054] transition hover:bg-[#f9fafb]"
        >
          Limpar
        </button>
        <button
          type="button"
          className="mt-auto h-12 rounded-lg bg-[#3448c5] px-6 text-sm font-bold text-white transition hover:bg-[#293aa3]"
        >
          Aplicar
        </button>
      </div>

      <div className="mt-7 rounded-xl border border-[#eaecf0]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5">
          <div>
            <p className="text-xl font-bold text-[#101828]">Agendamentos</p>
            <p className="mt-1 text-sm text-[#475467]">
              {filtered.length} de {appointments.length} agendamentos
            </p>
          </div>
          <button className="flex items-center gap-1.5 rounded-full border border-[#d0d5dd] px-3.5 py-1.5 text-xs font-bold text-[#293aa3]">
            <ArrowUpDown size={13} strokeWidth={2} />
            Mais recentes
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-y border-[#eaecf0] bg-[#f9fafb] text-[12px] font-bold text-[#475467]">
                <th className="px-6 py-3 font-bold">DATA E HORÁRIO</th>
                <th className="px-6 py-3 font-bold">SERVIÇO</th>
                <th className="px-6 py-3 font-bold">PROFISSIONAL</th>
                <th className="px-6 py-3 font-bold">UNIDADE</th>
                <th className="px-6 py-3 font-bold">STATUS</th>
                <th className="px-6 py-3 text-right font-bold">VALOR</th>
                <th className="px-6 py-3 text-right font-bold">AÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={`${item.date}-${item.time}`} className="border-b border-[#eaecf0] last:border-none">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#101828]">{item.date}</p>
                    <p className="mt-1 text-xs text-[#475467]">{item.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#101828]">{item.service}</p>
                    <p className="mt-1 text-xs text-[#475467]">{item.detail}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#344054]">{item.professional}</td>
                  <td className="px-6 py-4 text-sm text-[#344054]">{item.unit}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[item.status]}`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-[#101828]">{item.value}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-[#3448c5]">
                    <button type="button" className="hover:underline">
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-[#667085]">
                    Nenhum agendamento encontrado para esse filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="m-6 flex flex-wrap items-center gap-4 rounded-lg bg-[#f9fafb] px-4 py-4 text-xs text-[#475467]">
          <span className="font-bold text-[#344054]">Resumo desta página</span>
          <span>{summary.concluido} concluídos</span>
          <span className="size-1 rounded-full bg-[#d0d5dd]" />
          <span>{summary.cancelado} cancelados</span>
          <span className="size-1 rounded-full bg-[#d0d5dd]" />
          <span>{summary.falta} falta</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eaecf0] px-6 py-4 text-sm">
          <p className="text-[#475467]">
            Mostrando 1–{filtered.length} de {appointments.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="flex items-center gap-1 rounded-lg border border-[#d0d5dd] px-3.5 py-2 text-[#344054] opacity-40"
            >
              <ChevronLeft size={14} strokeWidth={2} />
              Anterior
            </button>
            <span className="grid size-10 place-items-center rounded-lg border border-[#3448c5] text-sm font-bold text-[#293aa3]">
              1
            </span>
            <button
              type="button"
              disabled
              className="flex items-center gap-1 rounded-lg border border-[#d0d5dd] px-3.5 py-2 text-[#344054] opacity-40"
            >
              Próxima
              <ChevronRight size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
