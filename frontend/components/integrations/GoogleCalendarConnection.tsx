"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Check, CircleAlert, ExternalLink, RefreshCw, Unplug } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";

type ConnectionScope = "TENANT" | "BARBER";
type CalendarOption = { id: string; summary: string; primary: boolean; timeZone: string | null };
type ConnectionStatus = {
  scope: ConnectionScope;
  connected: boolean;
  status: string;
  calendarId: string | null;
  calendarSummary: string | null;
  googleEmail: string | null;
  lastSyncAt: string | null;
  pendingCount: number;
  failedCount: number;
  lastError: string | null;
  configured: boolean;
};

const path = "/integrations/google-calendar";
const primaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] bg-accent px-4 text-sm font-medium text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] border border-fog bg-white px-4 text-sm font-medium text-ink transition hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-60";

function formatDate(value: string | null) {
  if (!value) return "Ainda não sincronizado";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Ainda não sincronizado" : date.toLocaleString("pt-BR");
}

export function GoogleCalendarConnection({ scope, returnTo }: { scope: ConnectionScope; returnTo: string }) {
  const [connection, setConnection] = useState<ConnectionStatus>();
  const [calendars, setCalendars] = useState<CalendarOption[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  const loadStatus = useCallback(async () => {
    const result = await apiFetch<ConnectionStatus>(`${path}/status?scope=${scope}`);
    setConnection(result);
    setSelectedCalendar(result.calendarId ?? "");
    if (result.connected) {
      const response = await apiFetch<{ calendars: CalendarOption[] }>(`${path}/calendars?scope=${scope}`);
      setCalendars(response.calendars);
    } else {
      setCalendars([]);
    }
  }, [scope]);

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams(window.location.search);
    const result = query.get("googleCalendar");
    if (result === "connected") setNotice("Conta Google conectada. Escolha o calendário que receberá os agendamentos.");
    if (result === "error") setError("Não foi possível concluir a autorização do Google. Tente conectar novamente.");
    if (result) {
      query.delete("googleCalendar");
      const search = query.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`);
    }
    Promise.resolve().then(async () => {
      try { await loadStatus(); }
      catch (e) { if (active) setError(e instanceof ApiError ? e.message : "Não foi possível consultar a integração."); }
      finally { if (active) setLoading(false); }
    });
    return () => { active = false; };
  }, [loadStatus]);

  async function connect() {
    setBusy(true); setError(undefined); setNotice(undefined);
    try {
      const result = await apiFetch<{ authorizationUrl: string }>(`${path}/connect?scope=${scope}`, {
        method: "POST", body: { returnTo },
      });
      window.location.assign(result.authorizationUrl);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Não foi possível iniciar a conexão com o Google.");
      setBusy(false);
    }
  }

  async function saveCalendar() {
    setBusy(true); setError(undefined); setNotice(undefined);
    try {
      await apiFetch(`${path}/calendar?scope=${scope}`, { method: "PUT", body: { calendarId: selectedCalendar } });
      await loadStatus();
      setNotice("Calendário atualizado.");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Não foi possível salvar o calendário."); }
    finally { setBusy(false); }
  }

  async function disconnect() {
    setBusy(true); setError(undefined); setNotice(undefined);
    try {
      await apiFetch(`${path}/connection?scope=${scope}`, { method: "DELETE" });
      await loadStatus();
      setNotice("Conta desconectada. Novos agendamentos não serão enviados ao Google Calendar.");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Não foi possível desconectar a conta."); }
    finally { setBusy(false); }
  }

  async function retry() {
    setBusy(true); setError(undefined); setNotice(undefined);
    try {
      const result = await apiFetch<{ queued: number }>(`${path}/retry?scope=${scope}`, { method: "POST" });
      await loadStatus();
      setNotice(result.queued ? `${result.queued} sincronização(ões) adicionada(s) à fila de novas tentativas.` : "Não há falhas pendentes para reprocessar.");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Não foi possível reprocessar as falhas."); }
    finally { setBusy(false); }
  }

  return (
    <section className="rounded-[12px] border border-fog bg-white p-5 sm:p-6" aria-labelledby={`google-calendar-title-${scope}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-accent-subtle text-accent-strong"><CalendarDays size={20} aria-hidden="true" /></span>
          <div>
            <h2 id={`google-calendar-title-${scope}`} className="font-semibold text-ink">Google Calendar</h2>
            <p className="mt-1 max-w-2xl text-sm text-secondary">Envie automaticamente novos agendamentos, reagendamentos e cancelamentos para o calendário escolhido. Alterações no Google não alteram o LineUp.</p>
            {connection?.googleEmail && <p className="mt-1 text-xs text-secondary">Conta autorizada: {connection.googleEmail}</p>}
          </div>
        </div>
        {!loading && connection && <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${connection.connected ? "bg-success-subtle text-success" : "bg-surface-sunken text-secondary"}`}>
      {connection.connected ? "Conectado" : "Desconectado"}
        </span>}
      </div>

      {error && <p role="alert" className="mt-4 flex items-start gap-2 rounded-[10px] border border-danger/30 bg-danger-subtle p-3 text-sm text-danger"><CircleAlert size={17} className="mt-0.5 shrink-0" />{error}</p>}
      {notice && <p role="status" className="mt-4 flex items-start gap-2 rounded-[10px] border border-success/30 bg-success-subtle p-3 text-sm text-success"><Check size={17} className="mt-0.5 shrink-0" />{notice}</p>}
      {loading ? <p role="status" className="mt-5 text-sm text-secondary">Carregando status da integração…</p> : connection && <div className="mt-5 space-y-4">
        {!connection.configured && <p className="rounded-[10px] border border-warning/30 bg-warning-subtle p-3 text-sm text-warning">A integração ainda não está configurada pelo operador do LineUp.</p>}
        {connection.lastError && <p role="alert" className="rounded-[10px] border border-danger/30 bg-danger-subtle p-3 text-sm text-danger">Última falha: {connection.lastError}</p>}
        {connection.connected ? <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[10px] border border-fog p-3"><p className="text-xs text-secondary">Calendário selecionado</p><p className="mt-1 text-sm font-medium text-ink">{connection.calendarSummary ?? "Selecione um calendário"}</p></div>
            <div className="rounded-[10px] border border-fog p-3"><p className="text-xs text-secondary">Última sincronização</p><p className="mt-1 text-sm font-medium text-ink">{formatDate(connection.lastSyncAt)}</p></div>
            <div className="rounded-[10px] border border-fog p-3"><p className="text-xs text-secondary">Na fila / com falha</p><p className="mt-1 text-sm font-medium text-ink">{connection.pendingCount} / {connection.failedCount}</p></div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-ink">Calendário de destino
              <select className="h-10 rounded-[10px] border border-fog bg-white px-3 text-sm outline-none focus:border-accent" value={selectedCalendar} onChange={event => setSelectedCalendar(event.target.value)}>
                <option value="">Selecione um calendário</option>
                {calendars.map(calendar => <option key={calendar.id} value={calendar.id}>{calendar.summary}{calendar.primary ? " · Principal" : ""}{calendar.timeZone ? ` · ${calendar.timeZone}` : ""}</option>)}
              </select>
            </label>
            <button type="button" className={primaryButton} disabled={busy || !selectedCalendar || selectedCalendar === connection.calendarId} onClick={saveCalendar}>Salvar calendário</button>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-fog pt-4">
            {connection.failedCount > 0 && <button type="button" className={secondaryButton} disabled={busy} onClick={retry}><RefreshCw size={16} />Tentar novamente ({connection.failedCount})</button>}
            <a className={secondaryButton} href="https://calendar.google.com/" target="_blank" rel="noopener noreferrer">Abrir Google Calendar <ExternalLink size={15} /></a>
            <button type="button" className={secondaryButton} disabled={busy || !connection.configured} onClick={connect}><CalendarDays size={16} />Reconectar conta</button>
            <button type="button" className={`${secondaryButton} text-danger`} disabled={busy} onClick={disconnect}><Unplug size={16} />Desconectar</button>
          </div>
        </> : <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm text-secondary">A conexão usa autorização do Google. Os agendamentos continuam funcionando mesmo se a sincronização falhar.</p>
          <button type="button" className={primaryButton} disabled={busy || !connection.configured} onClick={connect}><CalendarDays size={17} />{busy ? "Conectando…" : "Conectar Google Calendar"}</button>
        </div>}
      </div>}
    </section>
  );
}
