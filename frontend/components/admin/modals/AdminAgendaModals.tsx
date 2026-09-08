"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/ui/Modal";
import { FieldGrid } from "@/components/ui/FormFields";
import { apiFetch, ApiError } from "@/lib/api";
import { proximosDias, type DiaDisponivel } from "@/components/clientes/agendamento/dados";

export type CustomerOption = { id: string; fullName: string };
export type ServiceOption = { id: string; name: string; durationMinutes: number; price: string };
export type BarberOption = { id: string; unitId: string; displayName: string };
type AvailabilitySlot = { startAt: string; endAt: string };

function timeLabel(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function toLocalDateTime(date: string, time: string) {
  return `${date}T${time}:00`;
}

/**
 * Novo agendamento do Admin: igual o modelo do Cliente/Barbeiro (pílulas de
 * dia + grade de horários vindos da disponibilidade real), mas com um
 * seletor de profissional a mais — o Admin agenda pra qualquer um da equipe.
 */
export function AdminNovoAgendamentoModal({
  open,
  onClose,
  onConcluir,
  customers,
  services,
  barbers,
}: {
  open: boolean;
  onClose: () => void;
  onConcluir: (mensagem: string, tom?: "sucesso" | "erro") => void;
  customers: CustomerOption[];
  services: ServiceOption[];
  barbers: BarberOption[];
}) {
  const [barberId, setBarberId] = useState("");
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
    if (!dia || !serviceId || !barberId) {
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

  function reset() {
    setBarberId("");
    setCustomerId("");
    setServiceId("");
    setDia(null);
    setHorario(null);
    setNotes("");
    setError(undefined);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const barber = barbers.find((b) => b.id === barberId);
    if (!barber || !customerId || !serviceId || !dia || !horario) {
      setError("Preencha profissional, cliente, serviço, dia e horário.");
      return;
    }

    setSubmitting(true);
    setError(undefined);
    try {
      const [hh, mm] = horario.split(":").map(Number);
      const [y, m, d] = dia.iso.split("-").map(Number);
      const startAt = new Date(y, m - 1, d, hh, mm);

      await apiFetch("/appointments", {
        method: "POST",
        body: {
          unitId: barber.unitId,
          customerId,
          barberId,
          startAt: toLocalDateTime(dia.iso, horario),
          channel: "ADMIN",
          notes: notes || null,
          items: [{ serviceId }],
        },
      });
      onConcluir("Agendamento criado e confirmado para o cliente.");
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível criar o agendamento.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Novo agendamento"
      description="O cliente recebe a confirmação pelo canal cadastrado."
      footer={
        <>
          <ModalCancelButton
            onClick={() => {
              reset();
              onClose();
            }}
          />
          <ModalSubmitButton form="form-admin-novo-agendamento" disabled={submitting}>
            {submitting ? "Criando…" : "Criar agendamento"}
          </ModalSubmitButton>
        </>
      }
    >
      <form id="form-admin-novo-agendamento" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FieldGrid>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">
              Profissional<span className="ml-0.5 text-danger">*</span>
            </label>
            <select
              value={barberId}
              onChange={(e) => {
                setBarberId(e.target.value);
                setDia(null);
                setHorario(null);
              }}
              className="h-11 w-full rounded-[10px] border border-fog bg-white px-3 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="">Selecione</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.displayName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">
              Cliente<span className="ml-0.5 text-danger">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="h-11 w-full rounded-[10px] border border-fog bg-white px-3 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="">Selecione</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </div>
        </FieldGrid>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">
            Serviço<span className="ml-0.5 text-danger">*</span>
          </label>
          <select
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value);
              setHorario(null);
            }}
            className="h-11 w-full rounded-[10px] border border-fog bg-white px-3 text-sm text-ink outline-none focus:border-accent"
          >
            <option value="">Selecione</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.durationMinutes}min · R$ {s.price}
              </option>
            ))}
          </select>
        </div>

        {barberId && serviceId && (
          <div className="flex flex-col gap-3">
            <div>
              <p className="mb-2 text-sm font-medium text-ink">Dia</p>
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
                          : "border-fog bg-white text-ink hover:bg-surface-sunken"
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
              <p className="mb-2 text-sm font-medium text-ink">Horário</p>
              {!dia ? (
                <p className="rounded-[10px] border border-dashed border-fog px-3 py-6 text-center text-xs text-tertiary">
                  Selecione um dia.
                </p>
              ) : loadingSlots ? (
                <p className="rounded-[10px] border border-dashed border-fog px-3 py-6 text-center text-xs text-tertiary">
                  Carregando horários…
                </p>
              ) : slots.length === 0 ? (
                <p className="rounded-[10px] border border-dashed border-fog px-3 py-6 text-center text-xs text-tertiary">
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
                            : "border-fog bg-white text-ink hover:bg-surface-sunken"
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
          <label className="text-sm font-medium text-ink">Observações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Preferências do cliente, alergias, etc."
            className="h-auto w-full rounded-[10px] border border-fog bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
        </div>

        {error && <p className="rounded-[10px] bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      </form>
    </Modal>
  );
}

/**
 * Bloquear horário: cria uma exceção de disponibilidade (BLOCK) real pro(s)
 * profissional(is) escolhido(s) — "Toda a equipe" aplica em cada um.
 */
export function AdminBloquearHorarioModal({
  open,
  onClose,
  onConcluir,
  barbers,
}: {
  open: boolean;
  onClose: () => void;
  onConcluir: (mensagem: string, tom?: "sucesso" | "erro") => void;
  barbers: BarberOption[];
}) {
  const [aplicarA, setAplicarA] = useState("toda-equipe");
  const [data, setData] = useState("");
  const [das, setDas] = useState("12:00");
  const [ate, setAte] = useState("13:00");
  const [motivo, setMotivo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  function reset() {
    setAplicarA("toda-equipe");
    setData("");
    setDas("12:00");
    setAte("13:00");
    setMotivo("");
    setError(undefined);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!data) {
      setError("Escolha a data do bloqueio.");
      return;
    }

    const alvos = aplicarA === "toda-equipe" ? barbers.map((b) => b.id) : [aplicarA];
    if (alvos.length === 0) {
      setError("Nenhum profissional pra bloquear.");
      return;
    }

    setSubmitting(true);
    setError(undefined);
    try {
      await Promise.all(
        alvos.map((barberId) =>
          apiFetch(`/barbers/${barberId}/availability-exceptions`, {
            method: "POST",
            body: {
              type: "BLOCK",
              startsAt: toLocalDateTime(data, das),
              endsAt: toLocalDateTime(data, ate),
              reason: motivo || null,
            },
          }),
        ),
      );
      onConcluir("Horário bloqueado. A agenda online não aceita reservas nesse intervalo.");
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível bloquear o horário.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Bloquear horário"
      description="Agendamentos já confirmados nesse intervalo continuam válidos."
      size="sm"
      footer={
        <>
          <ModalCancelButton
            onClick={() => {
              reset();
              onClose();
            }}
          />
          <ModalSubmitButton form="form-admin-bloquear-horario" disabled={submitting}>
            {submitting ? "Bloqueando…" : "Bloquear"}
          </ModalSubmitButton>
        </>
      }
    >
      <form id="form-admin-bloquear-horario" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">
            Aplicar a<span className="ml-0.5 text-danger">*</span>
          </label>
          <select
            value={aplicarA}
            onChange={(e) => setAplicarA(e.target.value)}
            className="h-11 w-full rounded-[10px] border border-fog bg-white px-3 text-sm text-ink outline-none focus:border-accent"
          >
            <option value="toda-equipe">Toda a equipe</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.displayName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">
            Data<span className="ml-0.5 text-danger">*</span>
          </label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="h-11 w-full rounded-[10px] border border-fog bg-white px-3 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
        <FieldGrid>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Das</label>
            <input
              type="time"
              value={das}
              onChange={(e) => setDas(e.target.value)}
              className="h-11 w-full rounded-[10px] border border-fog bg-white px-3 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Até</label>
            <input
              type="time"
              value={ate}
              onChange={(e) => setAte(e.target.value)}
              className="h-11 w-full rounded-[10px] border border-fog bg-white px-3 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
        </FieldGrid>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Motivo</label>
          <input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Almoço, manutenção, treinamento…"
            className="h-11 w-full rounded-[10px] border border-fog bg-white px-3 text-sm text-ink outline-none focus:border-accent"
          />
        </div>

        {error && <p className="rounded-[10px] bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      </form>
    </Modal>
  );
}
