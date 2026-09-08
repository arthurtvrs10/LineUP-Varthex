"use client";

import { useEffect, useState } from "react";
import { Gift, ListOrdered, Plus, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { Toast, useToast } from "@/components/ui/Toast";

type WaitlistEntry = {
  id: string;
  customerId: string;
  customerName: string | null;
  serviceId: string;
  serviceName: string | null;
  preferredBarberId: string | null;
  preferredBarberName: string | null;
  windowStartAt: string;
  windowEndAt: string;
  status: "ACTIVE" | "BOOKED" | "CANCELED";
  notes: string | null;
  createdAt: string;
};

type WaitlistOffer = {
  id: string;
  barberId: string;
  barberName: string | null;
  slotStartAt: string;
  slotEndAt: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  expiresAt: string;
};

type CustomerOption = { id: string; fullName: string };
type CustomerPageResponse = { items: CustomerOption[] };
type ServiceOption = { id: string; name: string; durationMinutes: number };
type BarberOption = { id: string; unitId: string; displayName: string };

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const offerStatusLabels: Record<WaitlistOffer["status"], string> = {
  PENDING: "Aguardando resposta do cliente",
  ACCEPTED: "Aceita",
  REJECTED: "Recusada",
  EXPIRED: "Expirada",
};

function toLocalDateTime(date: string, time: string) {
  return `${date}T${time}:00`;
}

function addMinutes(date: string, time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const base = new Date(`${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
  base.setMinutes(base.getMinutes() + minutes);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}T${pad(base.getHours())}:${pad(base.getMinutes())}:00`;
}

export function BarberFilaDeEsperaPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [barbers, setBarbers] = useState<BarberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [formAberto, setFormAberto] = useState(false);
  const [criando, setCriando] = useState(false);
  const toast = useToast();

  const [customerId, setCustomerId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [preferredBarberId, setPreferredBarberId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [dataFim, setDataFim] = useState("");
  const [horaFim, setHoraFim] = useState("18:00");
  const [notas, setNotas] = useState("");

  const [ofertandoId, setOfertandoId] = useState<string | null>(null);
  const [ofertaBarberId, setOfertaBarberId] = useState("");
  const [ofertaData, setOfertaData] = useState("");
  const [ofertaHora, setOfertaHora] = useState("09:00");
  const [criandoOferta, setCriandoOferta] = useState(false);
  const [ofertasPorEntrada, setOfertasPorEntrada] = useState<Record<string, WaitlistOffer[]>>({});

  async function carregar() {
    setLoading(true);
    try {
      const [entriesRes, customersRes, servicesRes, barbersRes] = await Promise.all([
        apiFetch<WaitlistEntry[]>("/waitlist-entries"),
        apiFetch<CustomerPageResponse>("/customers?page=0&size=200"),
        apiFetch<ServiceOption[]>("/services"),
        apiFetch<BarberOption[]>("/barbers"),
      ]);
      setEntries(entriesRes);
      setCustomers(customersRes.items);
      setServices(servicesRes);
      setBarbers(barbersRes);
      if (barbersRes[0]) setUnitId(barbersRes[0].unitId);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar a fila de espera.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function resetForm() {
    setCustomerId("");
    setServiceId("");
    setPreferredBarberId("");
    setDataInicio("");
    setDataFim("");
    setNotas("");
  }

  async function criarEntrada() {
    if (!customerId || !serviceId || !unitId || !dataInicio || !dataFim) {
      toast.mostrar("Preencha cliente, serviço e a janela de datas.", "erro");
      return;
    }
    setCriando(true);
    try {
      const created = await apiFetch<WaitlistEntry>("/waitlist-entries", {
        method: "POST",
        body: {
          unitId,
          customerId,
          serviceId,
          preferredBarberId: preferredBarberId || null,
          windowStartAt: toLocalDateTime(dataInicio, horaInicio),
          windowEndAt: toLocalDateTime(dataFim, horaFim),
          notes: notas || null,
        },
      });
      setEntries((prev) => [...prev, created]);
      resetForm();
      setFormAberto(false);
      toast.mostrar("Cliente adicionado à fila!");
    } catch (err) {
      toast.mostrar(err instanceof ApiError ? err.message : "Não foi possível adicionar à fila.", "erro");
    } finally {
      setCriando(false);
    }
  }

  async function cancelarEntrada(id: string) {
    try {
      await apiFetch(`/waitlist-entries/${id}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.mostrar("Removido da fila.");
    } catch (err) {
      toast.mostrar(err instanceof ApiError ? err.message : "Não foi possível remover.", "erro");
    }
  }

  async function carregarOfertas(entryId: string) {
    try {
      const ofertas = await apiFetch<WaitlistOffer[]>(`/waitlist-entries/${entryId}/offers`);
      setOfertasPorEntrada((prev) => ({ ...prev, [entryId]: ofertas }));
    } catch {
      // Não trava a lista se a busca de ofertas falhar — a entrada continua visível.
    }
  }

  useEffect(() => {
    entries.forEach((entry) => carregarOfertas(entry.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  function abrirFormularioOferta(entry: WaitlistEntry) {
    setOfertandoId(entry.id);
    setOfertaBarberId(entry.preferredBarberId ?? "");
    setOfertaData("");
    setOfertaHora("09:00");
  }

  async function criarOferta(entry: WaitlistEntry) {
    const service = services.find((s) => s.id === entry.serviceId);
    if (!ofertaBarberId || !ofertaData || !service) {
      toast.mostrar("Selecione o profissional e a data/hora.", "erro");
      return;
    }
    setCriandoOferta(true);
    try {
      await apiFetch(`/waitlist-entries/${entry.id}/offers`, {
        method: "POST",
        body: {
          barberId: ofertaBarberId,
          slotStartAt: toLocalDateTime(ofertaData, ofertaHora),
          slotEndAt: addMinutes(ofertaData, ofertaHora, service.durationMinutes),
        },
      });
      toast.mostrar("Vaga oferecida! O cliente foi notificado.");
      setOfertandoId(null);
      carregarOfertas(entry.id);
    } catch (err) {
      toast.mostrar(err instanceof ApiError ? err.message : "Não foi possível ofertar essa vaga.", "erro");
    } finally {
      setCriandoOferta(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-[#0d1831]">Fila de espera</h1>
          <p className="mt-1 text-sm text-[#5f6f87]">
            Clientes aguardando um encaixe. Quando abrir um horário compatível, crie o agendamento na Agenda e remova daqui.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormAberto((v) => !v)}
          className="flex items-center gap-2 rounded-[10px] bg-accent px-5 py-3 text-sm font-bold text-on-accent transition hover:bg-accent-hover"
        >
          {formAberto ? <X size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
          {formAberto ? "Fechar" : "Adicionar à fila"}
        </button>
      </div>

      {error && <p className="rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">{error}</p>}

      {formAberto && (
        <section className="rounded-[12px] border border-[#e6e4df] bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#5f6f87]">Cliente</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="h-10 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent"
              >
                <option value="">Selecione</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#5f6f87]">Serviço</label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="h-10 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent"
              >
                <option value="">Selecione</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#5f6f87]">Profissional preferido (opcional)</label>
              <select
                value={preferredBarberId}
                onChange={(e) => setPreferredBarberId(e.target.value)}
                className="h-10 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent"
              >
                <option value="">Qualquer um</option>
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#5f6f87]">Janela — início</label>
              <div className="flex gap-1">
                <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="h-10 min-w-0 flex-1 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent" />
                <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="h-10 w-24 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#5f6f87]">Janela — fim</label>
              <div className="flex gap-1">
                <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="h-10 min-w-0 flex-1 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent" />
                <input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} className="h-10 w-24 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#5f6f87]">Observações (opcional)</label>
              <input value={notas} onChange={(e) => setNotas(e.target.value)} className="h-10 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={criarEntrada}
              disabled={criando}
              className="rounded-[10px] bg-accent px-5 py-2.5 text-sm font-bold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {criando ? "Adicionando…" : "Adicionar à fila"}
            </button>
          </div>
        </section>
      )}

      <div className="rounded-[12px] border border-[#e6e4df] bg-white">
        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-[#98a2b3]">Carregando…</p>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-accent-subtle text-accent-strong">
              <ListOrdered size={20} strokeWidth={1.8} />
            </span>
            <p className="mt-4 text-sm text-[#98a2b3]">Nenhum cliente na fila de espera.</p>
          </div>
        ) : (
          <ul>
            {entries.map((entry) => {
              const ofertas = ofertasPorEntrada[entry.id] ?? [];
              const ofertaPendente = ofertas.find((o) => o.status === "PENDING");

              return (
                <li key={entry.id} className="border-b border-[#eef0f3] px-5 py-4 last:border-none">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#0d1831]">{entry.customerName ?? "Cliente"}</p>
                      <p className="mt-0.5 text-xs text-[#5f6f87]">
                        {entry.serviceName ?? "Serviço"}
                        {entry.preferredBarberName && ` · com ${entry.preferredBarberName}`}
                      </p>
                      <p className="mt-1 text-xs text-[#98a2b3]">
                        {dateTimeFormatter.format(new Date(entry.windowStartAt))} — {dateTimeFormatter.format(new Date(entry.windowEndAt))}
                        {entry.notes && ` · ${entry.notes}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {!ofertaPendente && (
                        <button
                          type="button"
                          onClick={() => abrirFormularioOferta(entry)}
                          className="flex items-center gap-1.5 rounded-[8px] bg-accent-subtle px-3 py-1.5 text-xs font-bold text-accent-strong transition hover:bg-accent/20"
                        >
                          <Gift size={13} strokeWidth={2} />
                          Ofertar vaga
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => cancelarEntrada(entry.id)}
                        className="rounded-[8px] border border-[#e6e4df] px-3 py-1.5 text-xs font-bold text-[#5f6f87] transition hover:bg-[#f7f6f2]"
                      >
                        Remover
                      </button>
                    </div>
                  </div>

                  {ofertaPendente && (
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-[10px] bg-accent-subtle px-3.5 py-2.5">
                      <p className="text-xs font-bold text-accent-strong">
                        Vaga oferecida com {ofertaPendente.barberName} em{" "}
                        {dateTimeFormatter.format(new Date(ofertaPendente.slotStartAt))} —{" "}
                        {offerStatusLabels[ofertaPendente.status]}
                      </p>
                    </div>
                  )}

                  {ofertandoId === entry.id && (
                    <div className="mt-3 flex flex-wrap items-end gap-2 rounded-[10px] border border-dashed border-[#e6e4df] p-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-[#5f6f87]">Profissional</label>
                        <select
                          value={ofertaBarberId}
                          onChange={(e) => setOfertaBarberId(e.target.value)}
                          disabled={Boolean(entry.preferredBarberId)}
                          className="h-9 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent disabled:bg-[#f7f6f2]"
                        >
                          <option value="">Selecione</option>
                          {barbers.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.displayName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-[#5f6f87]">Data</label>
                        <input type="date" value={ofertaData} onChange={(e) => setOfertaData(e.target.value)} className="h-9 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-[#5f6f87]">Horário</label>
                        <input type="time" value={ofertaHora} onChange={(e) => setOfertaHora(e.target.value)} className="h-9 rounded-[8px] border border-[#e6e4df] px-2 text-sm text-[#0d1831] outline-none focus:border-accent" />
                      </div>
                      <button
                        type="button"
                        onClick={() => criarOferta(entry)}
                        disabled={criandoOferta}
                        className="h-9 rounded-[8px] bg-accent px-4 text-xs font-bold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {criandoOferta ? "Enviando…" : "Enviar oferta"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOfertandoId(null)}
                        className="h-9 rounded-[8px] px-3 text-xs font-bold text-[#5f6f87] transition hover:bg-[#f7f6f2]"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
