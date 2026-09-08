"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { ApiError } from "@/lib/api";

export type CustomerOption = { id: string; fullName: string };
export type ServiceOption = { id: string; name: string; durationMinutes: number; price: string };

export type NovoAgendamentoPayload = {
  customerId: string;
  serviceId: string;
  date: string;
  time: string;
  notes: string;
};

export function NovoAgendamentoModal({
  open,
  onClose,
  onCriar,
  onConcluir,
  customers,
  services,
}: {
  open: boolean;
  onClose: () => void;
  onCriar: (payload: NovoAgendamentoPayload) => Promise<void>;
  onConcluir: (mensagem: string, tom?: "sucesso" | "erro") => void;
  customers: CustomerOption[];
  services: ServiceOption[];
}) {
  const [customerId, setCustomerId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  if (!open) return null;

  function reset() {
    setCustomerId("");
    setServiceId("");
    setDate("");
    setTime("");
    setNotes("");
    setError(undefined);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId || !serviceId || !date || !time) {
      setError("Preencha cliente, serviço, data e horário.");
      return;
    }

    setSubmitting(true);
    setError(undefined);
    try {
      await onCriar({ customerId, serviceId, date, time, notes });
      onConcluir("Agendamento criado com sucesso!");
      reset();
      onClose();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Não foi possível criar o agendamento.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-[14px] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0d1831]">Novo agendamento</h2>
            <p className="mt-1 text-sm text-[#5f6f87]">Reserve um horário na sua própria agenda.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            aria-label="Fechar"
            className="grid size-8 shrink-0 place-items-center rounded-[8px] text-[#5f6f87] transition hover:bg-[#f7f6f2]"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="agendamento-cliente" className="text-sm font-medium text-[#0d1831]">
              Cliente
            </label>
            <select
              id="agendamento-cliente"
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              className="h-10 rounded-[10px] border border-[#e6e4df] px-3 text-sm text-[#0d1831] outline-none focus:border-accent"
            >
              <option value="">Selecione um cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="agendamento-servico" className="text-sm font-medium text-[#0d1831]">
              Serviço
            </label>
            <select
              id="agendamento-servico"
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              className="h-10 rounded-[10px] border border-[#e6e4df] px-3 text-sm text-[#0d1831] outline-none focus:border-accent"
            >
              <option value="">Selecione um serviço</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} · {service.durationMinutes}min · R$ {service.price}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="agendamento-data" className="text-sm font-medium text-[#0d1831]">
                Data
              </label>
              <input
                id="agendamento-data"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-10 rounded-[10px] border border-[#e6e4df] px-3 text-sm text-[#0d1831] outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="agendamento-horario" className="text-sm font-medium text-[#0d1831]">
                Horário
              </label>
              <input
                id="agendamento-horario"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="h-10 rounded-[10px] border border-[#e6e4df] px-3 text-sm text-[#0d1831] outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="agendamento-obs" className="text-sm font-medium text-[#0d1831]">
              Observações (opcional)
            </label>
            <textarea
              id="agendamento-obs"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              className="rounded-[10px] border border-[#e6e4df] px-3 py-2 text-sm text-[#0d1831] outline-none focus:border-accent"
            />
          </div>

          {error && (
            <p className="rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">{error}</p>
          )}

          <div className="mt-1 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="rounded-[10px] border border-[#e6e4df] px-4 py-2.5 text-sm font-bold text-[#0d1831] transition hover:bg-[#f7f6f2]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-[10px] bg-accent px-4 py-2.5 text-sm font-bold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Criando…" : "Criar agendamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
