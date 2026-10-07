"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import type { BillingSummary } from "@/lib/billing";

const initial = { holderName: "", number: "", expiryMonth: "", expiryYear: "", ccv: "", cpfCnpj: "", postalCode: "", addressNumber: "", phone: "" };
export type CardValues = typeof initial;
export function CardUpdateForm({ onUpdated, submitCard }: { onUpdated: (summary: BillingSummary) => void; submitCard?: (card: CardValues) => Promise<BillingSummary> }) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(!!submitCard);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setDone(false);
    try {
      const response = await (submitCard ? submitCard(values) : apiFetch<BillingSummary>("/billing/card", { method: "POST", body: values }));
      setValues(initial); setDone(true); setOpen(false); onUpdated(response);
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível atualizar o cartão."); setValues(initial); }
    finally { setBusy(false); }
  }
  const fields: { name: keyof typeof initial; label: string; max: number; autoComplete: string; pattern?: string; numeric?: boolean }[] = [
    { name: "holderName", label: "Nome no cartão", max: 120, autoComplete: "cc-name" },
    { name: "number", label: "Número do cartão", max: 19, autoComplete: "cc-number", pattern: "[0-9]{13,19}", numeric: true },
    { name: "expiryMonth", label: "Mês de validade (MM)", max: 2, autoComplete: "cc-exp-month", pattern: "0[1-9]|1[0-2]", numeric: true },
    { name: "expiryYear", label: "Ano de validade (AAAA)", max: 4, autoComplete: "cc-exp-year", pattern: "[0-9]{4}", numeric: true },
    { name: "ccv", label: "Código de segurança", max: 4, autoComplete: "cc-csc", pattern: "[0-9]{3,4}", numeric: true },
    { name: "cpfCnpj", label: "CPF/CNPJ do titular", max: 14, autoComplete: "off", pattern: "[0-9]{11}|[0-9]{14}", numeric: true },
    { name: "postalCode", label: "CEP do titular", max: 8, autoComplete: "postal-code", pattern: "[0-9]{8}", numeric: true },
    { name: "addressNumber", label: "Número do endereço", max: 30, autoComplete: "off" },
    { name: "phone", label: "Telefone do titular com DDD", max: 13, autoComplete: "tel", pattern: "[0-9]{10,13}", numeric: true },
  ];
  return <section className="rounded-xl border border-fog bg-white p-5"><h2 className="font-semibold">{submitCard ? "Cartão para as próximas mensalidades" : "Cartão da recorrência"}</h2><p className="mt-2 text-sm text-secondary">{submitCard ? "O cartão será validado no Asaas. A mudança vale a partir da data apresentada acima, sem alterar faturas emitidas." : "Atualizar substitui o cartão das próximas mensalidades e das cobranças pendentes. Esta ação não realiza cobrança imediata."}</p>
    {done && <p role="status" className="mt-3 text-sm text-green-700">Cartão atualizado.</p>}
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    {!open ? <button className="mt-3 text-sm underline" onClick={() => { setOpen(true); setDone(false); }}>Atualizar cartão</button> : <form onSubmit={submit} className="mt-4 space-y-4"><div className="grid gap-3 sm:grid-cols-2">{fields.map(field => <label key={field.name} className="block text-sm">{field.label}<input required type={field.name === "ccv" ? "password" : "text"} autoComplete={field.autoComplete} inputMode={field.numeric ? "numeric" : "text"} pattern={field.pattern} maxLength={field.max} className="mt-1 w-full rounded-lg border border-fog p-2" value={values[field.name]} onChange={e => setValues(v => ({ ...v, [field.name]: field.numeric ? e.target.value.replace(/\D/g, "") : e.target.value }))} /></label>)}</div>
      <div className="flex gap-4"><button disabled={busy} className="rounded-lg bg-accent px-4 py-2 text-on-accent disabled:opacity-50">{busy ? "Atualizando…" : (submitCard ? "Confirmar alteração da assinatura" : "Confirmar atualização")}</button><button type="button" disabled={busy} onClick={() => { setOpen(false); setValues(initial); setError(""); }}>Cancelar</button></div>
    </form>}
  </section>;
}
