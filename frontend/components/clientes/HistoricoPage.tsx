"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { Toast, useToast } from "@/components/ui/Toast";

const CANCELAVEIS: AppointmentStatus[] = ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS"];

type AppointmentStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | "NO_SHOW";

type AppointmentResponse = {
  id: string;
  unitId: string;
  barberId: string;
  status: AppointmentStatus;
  startAt: string;
  endAt: string;
  totalAmount: string;
  items: { name: string; durationMinutes: number }[];
};

type BarberResponse = { id: string; displayName: string };

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

const statusLabel: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Agendado",
  CHECKED_IN: "Em atendimento",
  IN_PROGRESS: "Em atendimento",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
  NO_SHOW: "Falta",
};

const statusStyles: Record<AppointmentStatus, string> = {
  PENDING: "bg-[#fdf3e3] text-[#d28b27]",
  CONFIRMED: "bg-accent-subtle text-accent-strong",
  CHECKED_IN: "bg-[#e8f7f1] text-[#27865b]",
  IN_PROGRESS: "bg-[#e8f7f1] text-[#27865b]",
  COMPLETED: "bg-[#e8f7f1] text-[#27865b]",
  CANCELED: "bg-[#fdeaea] text-[#c84a4a]",
  NO_SHOW: "bg-[#fdf3e3] text-[#d28b27]",
};

function toLocalDateTime(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export function HistoricoPage() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [barberNames, setBarberNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [professional, setProfessional] = useState("Todos");
  const [status, setStatus] = useState<"Todos" | AppointmentStatus>("Todos");
  const [cancelingId, setCancelingId] = useState<string>();
  const toast = useToast();

  async function carregar() {
    try {
      const from = new Date();
      from.setMonth(from.getMonth() - 12);
      const to = new Date();
      to.setMonth(to.getMonth() + 3);

      const items = await apiFetch<AppointmentResponse[]>(
        `/appointments?${new URLSearchParams({ from: toLocalDateTime(from), to: toLocalDateTime(to) })}`,
      );
      items.sort((a, b) => b.startAt.localeCompare(a.startAt));
      setAppointments(items);

      const unitIds = Array.from(new Set(items.map((a) => a.unitId)));
      const names: Record<string, string> = {};
      for (const unitId of unitIds) {
        const barbers = await apiFetch<BarberResponse[]>(`/barbers?unitId=${unitId}`);
        for (const barber of barbers) names[barber.id] = barber.displayName;
      }
      setBarberNames(names);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar seu histórico.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function cancelar(id: string) {
    setCancelingId(id);
    try {
      await apiFetch(`/appointments/${id}/cancel`, { method: "POST" });
      toast.mostrar("Agendamento cancelado.");
      await carregar();
    } catch (err) {
      toast.mostrar(err instanceof ApiError ? err.message : "Não foi possível cancelar.", "erro");
    } finally {
      setCancelingId(undefined);
    }
  }

  const professionals = useMemo(
    () => ["Todos", ...Array.from(new Set(appointments.map((a) => barberNames[a.barberId]).filter(Boolean)))],
    [appointments, barberNames],
  );

  const filtered = useMemo(
    () =>
      appointments.filter(
        (item) =>
          (professional === "Todos" || barberNames[item.barberId] === professional) &&
          (status === "Todos" || item.status === status),
      ),
    [appointments, barberNames, professional, status],
  );

  const summary = useMemo(
    () => ({
      concluido: filtered.filter((item) => item.status === "COMPLETED").length,
      cancelado: filtered.filter((item) => item.status === "CANCELED").length,
      falta: filtered.filter((item) => item.status === "NO_SHOW").length,
    }),
    [filtered],
  );

  function clearFilters() {
    setProfessional("Todos");
    setStatus("Todos");
  }

  return (
    <div className="rounded-[12px] border border-[#e6e4df] bg-white p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-[#0d1831]">Histórico de agendamentos</h1>
          <p className="mt-2 text-sm text-[#5f6f87]">
            Últimos 12 meses e próximos 3 meses de agendamentos.
          </p>
        </div>
        <Link
          href="/clientes/agendamento"
          className="flex items-center gap-2 rounded-[10px] bg-accent px-5 py-3 text-sm font-bold text-on-accent transition hover:bg-accent-hover"
        >
          <Plus size={16} strokeWidth={2.5} />
          Novo agendamento
        </Link>
      </div>

      {error && (
        <p className="mt-5 rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">{error}</p>
      )}

      <div className="mt-7 grid grid-cols-1 gap-4 rounded-[12px] border border-[#e6e4df] p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
        <div>
          <label className="text-sm text-[#5f6f87]" htmlFor="profissional">
            Profissional
          </label>
          <select
            id="profissional"
            value={professional}
            onChange={(event) => setProfessional(event.target.value)}
            className="mt-2 h-12 w-full rounded-[10px] border border-[#e6e4df] px-3.5 text-sm text-[#0d1831] outline-none focus:border-accent"
          >
            {professionals.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-[#5f6f87]" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as "Todos" | AppointmentStatus)}
            className="mt-2 h-12 w-full rounded-[10px] border border-[#e6e4df] px-3.5 text-sm text-[#0d1831] outline-none focus:border-accent"
          >
            <option value="Todos">Todos</option>
            {(Object.keys(statusLabel) as AppointmentStatus[]).map((key) => (
              <option key={key} value={key}>
                {statusLabel[key]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="mt-auto h-12 rounded-[10px] border border-[#e6e4df] px-6 text-sm font-bold text-[#5f6f87] transition hover:bg-[#f7f6f2]"
        >
          Limpar
        </button>
      </div>

      <div className="mt-7 rounded-[12px] border border-[#e6e4df]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5">
          <div>
            <p className="text-xl font-bold text-[#0d1831]">Agendamentos</p>
            <p className="mt-1 text-sm text-[#5f6f87]">
              {loading ? "Carregando…" : `${filtered.length} de ${appointments.length} agendamentos`}
            </p>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-y border-[#e6e4df] bg-[#f7f6f2] text-[12px] font-bold text-[#98a2b3]">
                <th className="sticky left-0 z-10 bg-white px-6 py-3 font-bold">DATA E HORÁRIO</th>
                <th className="px-6 py-3 font-bold">SERVIÇO</th>
                <th className="px-6 py-3 font-bold">PROFISSIONAL</th>
                <th className="px-6 py-3 font-bold">STATUS</th>
                <th className="px-6 py-3 text-right font-bold">VALOR</th>
                <th className="px-6 py-3 text-right font-bold">AÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-[#eef0f3] last:border-none">
                  <td className="sticky left-0 z-10 bg-white px-6 py-4">
                    <p className="text-sm font-bold text-[#0d1831]">{dateFormatter.format(new Date(item.startAt))}</p>
                    <p className="mt-1 text-xs text-[#5f6f87]">
                      {timeFormatter.format(new Date(item.startAt))} — {timeFormatter.format(new Date(item.endAt))}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#0d1831]">{item.items.map((i) => i.name).join(" + ")}</p>
                    <p className="mt-1 text-xs text-[#5f6f87]">
                      {item.items.length} serviço{item.items.length > 1 ? "s" : ""} •{" "}
                      {item.items.reduce((sum, i) => sum + i.durationMinutes, 0)} min
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5f6f87]">{barberNames[item.barberId] ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[item.status]}`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {statusLabel[item.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-[#0d1831]">
                    {brl.format(Number(item.totalAmount))}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {CANCELAVEIS.includes(item.status) && (
                      <button
                        type="button"
                        disabled={cancelingId === item.id}
                        onClick={() => cancelar(item.id)}
                        className="text-sm font-bold text-[#c84a4a] transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {cancelingId === item.id ? "Cancelando…" : "Cancelar"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-[#5f6f87]">
                    Nenhum agendamento encontrado para esse filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="m-6 flex flex-wrap items-center gap-4 rounded-[10px] bg-[#f7f6f2] px-4 py-4 text-xs text-[#5f6f87]">
          <span className="font-bold text-[#5f6f87]">Resumo</span>
          <span>{summary.concluido} concluídos</span>
          <span className="size-1 rounded-full bg-[#e6e4df]" />
          <span>{summary.cancelado} cancelados</span>
          <span className="size-1 rounded-full bg-[#e6e4df]" />
          <span>{summary.falta} falta</span>
        </div>
      </div>

      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
