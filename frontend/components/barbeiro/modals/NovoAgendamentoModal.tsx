"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { proximosDias, type DiaDisponivel } from "@/components/clientes/agendamento/dados";

export type CustomerOption = { id: string; fullName: string };
export type ServiceOption = { id: string; name: string; durationMinutes: number; price: string };
type AvailabilitySlot = { startAt: string; endAt: string };

export type NovoAgendamentoPayload = {
  customerId: string;
  serviceId: string;
  date: string;
  time: string;
  notes: string;
};

function timeLabel(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function NovoAgendamentoModal({
  open,
  onClose,
  onCriar,
  onConcluir,
  customers,
  services,
  barberId,
}: {
  open: boolean;
  onClose: () => void;
  onCriar: (payload: NovoAgendamentoPayload) => Promise<void>;
  onConcluir: (mensagem: string, tom?: "sucesso" | "erro") => void;
  customers: CustomerOption[];
  services: ServiceOption[];
  barberId: string;
}) {
  const [customerId, setCustomerId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [dia, setDia] = useState<DiaDisponivel | null>(null);
  const [horario, setHorario] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [hoje] = useState(() => new Date());
  const dias = useMemo(() => proximosDias(hoje, 14), [hoje]);

  useEffect(() => {
    if (!dia || !serviceId) {
      setSlots([]);
      return;
    }
    let ativo = true;
    setLoadingSlots(true);
    apiFetch<AvailabilitySlot[]>(
      `/barbers/${barberId}/availability?${new URLSearchParams({ date: dia.iso, serviceId })}`,
    )
      .then((items) => {
        if (ativo) setSlots(items);
      })
      .catch(() => {
        if (ativo) setSlots([]);
      })
      .finally(() => {
        if (ativo) setLoadingSlots(false);
      });
    return () => {
      ativo = false;
    };
  }, [dia, serviceId, barberId]);

  if (!open) return null;

  function reset() {
    setCustomerId("");
    setServiceId("");
    setDia(null);
    setHorario(null);
    setNotes("");
    setError(undefined);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId || !serviceId || !dia || !horario) {
      setError("Preencha cliente, serviço, dia e horário.");
      return;
    }

    setSubmitting(true);
    setError(undefined);
    try {
      await onCriar({ customerId, serviceId, date: dia.iso, time: horario, notes });
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
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[14px] bg-white p-6 shadow-xl">
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
              onChange={(event) => {
                setServiceId(event.target.value);
                setHorario(null);
              }}
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

          {serviceId && (
            <div className="flex flex-col gap-3">
              <div>
                <p className="mb-2 text-sm font-medium text-[#0d1831]">Dia</p>
                <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1">
                  {dias.map((d) => {
                    const ativo = dia?.iso === d.iso;
                    return (
                      <button
                        key={d.iso}
                        type="button"
                        aria-pressed={ativo}
                        onClick={() => {
                          setDia(d);
                          setHorario(null);
                        }}
                        className={`flex w-14 shrink-0 snap-start flex-col items-center justify-center gap-0.5 rounded-[10px] border py-2 text-xs transition ${
                          ativo
                            ? "border-accent bg-accent text-on-accent"
                            : "border-[#e6e4df] bg-white text-[#0d1831] hover:bg-[#f7f6f2]"
                        }`}
                      >
                        <span className="text-[9px] font-bold uppercase opacity-70">{d.diaSemana}</span>
                        <span className="text-base font-bold leading-none">{d.diaMes}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[#0d1831]">Horário</p>
                {!dia ? (
                  <p className="rounded-[10px] border border-dashed border-[#e6e4df] px-3 py-6 text-center text-xs text-[#98a2b3]">
                    Selecione um dia.
                  </p>
                ) : loadingSlots ? (
                  <p className="rounded-[10px] border border-dashed border-[#e6e4df] px-3 py-6 text-center text-xs text-[#98a2b3]">
                    Carregando horários…
                  </p>
                ) : slots.length === 0 ? (
                  <p className="rounded-[10px] border border-dashed border-[#e6e4df] px-3 py-6 text-center text-xs text-[#98a2b3]">
                    Sem horários livres nesse dia.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5">
                    {slots.map((slot) => {
                      const h = timeLabel(slot.startAt);
                      const ativo = horario === h;
                      return (
                        <button
                          key={slot.startAt}
                          type="button"
                          aria-pressed={ativo}
                          onClick={() => setHorario(h)}
                          className={`h-9 rounded-[8px] border text-xs font-medium transition ${
                            ativo
                              ? "border-accent bg-accent text-on-accent"
                              : "border-[#e6e4df] bg-white text-[#0d1831] hover:bg-[#f7f6f2]"
                          }`}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

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
