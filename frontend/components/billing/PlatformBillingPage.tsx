"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { type BillingAccount, type BillingCharge, billingDate, billingMoney, billingStatus } from "@/lib/billing";

type Report = { accounts: BillingAccount[]; charges: BillingCharge[] };
export function PlatformBillingPage() {
  const [report, setReport] = useState<Report>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [chargeId, setChargeId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [requestKey, setRequestKey] = useState<string>();
  const load = useCallback(() => apiFetch<Report>("/platform/billing").then(setReport), []);
  useEffect(() => { load().catch(e => setError(e.message)); }, [load]);
  async function refund(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const key = requestKey ?? crypto.randomUUID(); setRequestKey(key);
    try { const response = await apiFetch<Report>(`/platform/billing/charges/${chargeId}/refund`, { method: "POST", body: { amount: Number(amount), reason, requestKey: key } }); setReport(response); }
    catch (e) { setError(e instanceof Error ? e.message : "Falha ao solicitar devolução."); await load().catch(() => {}); }
    finally { setBusy(false); }
  }
  const refundable = report?.charges.filter(c => ["CONFIRMED", "RECEIVED"].includes(c.status) && (!c.refundState || ["DONE", "FAILED"].includes(c.refundState)) && c.gross > c.refunded) ?? [];
  return <div className="space-y-5"><h1 className="text-2xl font-semibold">Cobranças da plataforma</h1><p className="text-sm text-secondary">Mensalidades integradas do LineUp. Confirmação do pagamento não significa disponibilidade em conta.</p>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {!report && !error && <p role="status">Carregando cobranças…</p>}
    {report && <><div className="overflow-x-auto rounded-xl border border-fog bg-white p-4"><table className="w-full text-left text-sm"><thead><tr>{["Conta", "Vencimento", "Bruto", "Tarifa", "Líquido", "Disponibilidade", "Situação", "Reembolso"].map(label => <th className="p-2" key={label}>{label}</th>)}</tr></thead><tbody>{report.charges.map(c => <tr className="border-t border-fog" key={c.id}><td className="p-2">{report.accounts.find(a => a.id === c.accountId)?.tenantId}</td><td className="p-2">{billingDate(c.dueDate)}</td><td className="p-2">{billingMoney(c.gross)}</td><td className="p-2">{c.net === null ? "—" : billingMoney(c.gross - c.net)}</td><td className="p-2">{c.net === null ? "—" : billingMoney(c.net)}</td><td className="p-2">{billingDate(c.availableOn)}</td><td className="p-2">{billingStatus(c.status)}</td><td className="p-2">{billingMoney(c.refunded)}{c.refundState && <p>{billingStatus(c.refundState)}</p>}</td></tr>)}</tbody></table>{!report.charges.length && <p className="p-3 text-sm">Nenhuma cobrança integrada.</p>}</div>
    <form className="space-y-3 rounded-xl border border-fog bg-white p-5" onSubmit={refund}><h2 className="font-semibold">Solicitar reembolso</h2><p className="text-sm text-secondary">A devolução será solicitada ao Asaas. Ela só será concluída após confirmação externa e não cancela a renovação.</p>
      <label className="block text-sm">Cobrança<select required className="mt-1 w-full rounded-lg border border-fog p-2" value={chargeId} onChange={e => { setChargeId(e.target.value); setRequestKey(undefined); }}><option value="">Selecione</option>{refundable.map(c => <option key={c.id} value={c.id}>{billingDate(c.dueDate)} · {c.providerId} · saldo {billingMoney(c.gross - c.refunded)}</option>)}</select></label>
      <label className="block text-sm">Valor a devolver<input required type="number" min="0.01" step="0.01" className="mt-1 w-full rounded-lg border border-fog p-2" value={amount} onChange={e => { setAmount(e.target.value); setRequestKey(undefined); }} /></label>
      <label className="block text-sm">Motivo<textarea required maxLength={1000} className="mt-1 w-full rounded-lg border border-fog p-2" value={reason} onChange={e => { setReason(e.target.value); setRequestKey(undefined); }} /></label>
      <button disabled={busy || !refundable.length} className="rounded-lg bg-accent px-4 py-2 text-on-accent disabled:opacity-50">{busy ? "Solicitando…" : "Confirmar solicitação de reembolso"}</button>
    </form></>}
  </div>;
}
