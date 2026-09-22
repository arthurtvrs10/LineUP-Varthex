"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";

export type Row = { id: string; [key: string]: string | number | boolean | null | undefined };
type Field = { name: string; label: string; type?: string; options?: { value: string; label: string }[]; optional?: boolean; min?: string; max?: string; step?: string; value?: string };
export const brl = (value: unknown) => Number(value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const date = (value: unknown) => value ? new Date(String(value).length === 10 ? `${value}T12:00:00` : String(value)).toLocaleString("pt-BR") : "—";
export const message = (error: unknown) => error instanceof Error ? error.message : "Não foi possível concluir a operação.";
export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="border border-fog bg-white p-5"><h2 className="mb-4 text-lg font-semibold text-ink">{title}</h2>{children}</section>;
}
export function Table({ rows, columns }: { rows: Row[]; columns: { label: string; render: (row: Row) => ReactNode }[] }) {
  return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{columns.map(c => <th key={c.label} className="border-b border-fog px-3 py-3 text-secondary">{c.label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id}>{columns.map(c => <td key={c.label} className="border-b border-fog px-3 py-3">{c.render(row)}</td>)}</tr>)}</tbody></table>{!rows.length && <p className="py-5 text-sm text-secondary">Nenhum registro encontrado.</p>}</div>;
}
export function ActionForm({ title, fields, submitLabel = "Salvar", onSubmit }: { title: string; fields: Field[]; submitLabel?: string; onSubmit: (data: Record<string, string>, key: string) => Promise<void> }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string>(); const [success, setSuccess] = useState(false);
  const operation = useRef<{ key: string; payload: string } | null>(null); const submitting = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (submitting.current) return;
    const form = event.currentTarget; const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const payload = JSON.stringify(data); if (!operation.current || operation.current.payload !== payload) operation.current = { key: crypto.randomUUID(), payload };
    submitting.current = true; setBusy(true); setError(undefined); setSuccess(false);
    try { await onSubmit(data, operation.current.key); operation.current = null; form.reset(); setSuccess(true); }
    catch (e) { setError(message(e)); } finally { submitting.current = false; setBusy(false); }
  }
  return <Panel title={title}><form onSubmit={submit} className="grid gap-3 sm:grid-cols-2"><fieldset disabled={busy} className="contents">{fields.map(f => <label key={f.name} className="flex flex-col gap-1 text-sm text-secondary">{f.label}{f.options ? <select defaultValue={f.value} name={f.name} required={!f.optional} className="h-11 border border-fog bg-white px-3"><option value="">Selecione</option>{f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select> : <input defaultValue={f.value} name={f.name} type={f.type ?? "text"} required={!f.optional} min={f.min ?? (f.type === "number" ? "0" : undefined)} max={f.max} step={f.type === "number" ? f.step ?? "0.01" : undefined} maxLength={1000} className="h-11 border border-fog px-3" />}</label>)}<button className="mt-2 h-11 bg-accent px-5 font-semibold text-on-accent disabled:opacity-50" type="submit">{busy ? "Salvando…" : submitLabel}</button></fieldset>{error && <p role="alert" className="text-sm text-danger sm:col-span-2">{error}</p>}{success && <p role="status" className="text-sm text-success sm:col-span-2">Operação concluída.</p>}</form></Panel>;
}
export function useResource<T>(path: string, loader: (path: string) => Promise<T> = apiFetch) {
  const [data, setData] = useState<T>(); const [error, setError] = useState<string>(); const [revision, setRevision] = useState(0);
  useEffect(() => { let active = true; loader(path).then(value => { if (active) { setData(value); setError(undefined); } }).catch(e => { if (active) setError(message(e)); }); return () => { active = false; }; }, [path, revision, loader]);
  return { data, error, reload: () => setRevision(r => r + 1) };
}
export function Status({ error, ready }: { error?: string; ready: boolean }) { return error ? <p role="alert" className="border border-danger bg-white p-4 text-danger">{error}</p> : !ready ? <p role="status">Carregando…</p> : null; }
export const options = (rows: Row[], label: string) => rows.map(r => ({ value: r.id, label: String(r[label] ?? r.id) }));
export const kinds = (values: Record<string, string>) => Object.entries(values).map(([value, label]) => ({ value, label }));
export async function post(path: string, body: unknown) { return apiFetch(path, { method: "POST", body }); }
export function Heading({ title, detail }: { title: string; detail: string }) { return <div><h1 className="text-2xl font-bold text-ink">{title}</h1><p className="mt-1 text-sm text-secondary">{detail}</p></div>; }
