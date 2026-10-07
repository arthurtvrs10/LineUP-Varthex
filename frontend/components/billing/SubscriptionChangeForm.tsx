"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { billingDate, billingMoney, monthlyTotal, orderedPlans, type BillingCatalog, type BillingSummary, type BillingTerms } from "@/lib/billing";
import { CardUpdateForm, type CardValues } from "./CardUpdateForm";
const button = "min-h-10 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent disabled:opacity-50";
const field = "mt-2 min-h-11 w-full rounded-lg border border-fog bg-surface px-3 text-sm";

export function SubscriptionChangeForm({ catalog, summary, onUpdated, mode }: { catalog: BillingCatalog; summary: BillingSummary; onUpdated: (value: BillingSummary) => void; mode: "plan" | "extras" | "payment" }) {
  const account = summary.account!;
  const [open, setOpen] = useState(false);
  const [planId, setPlanId] = useState(account.planId);
  const [quantity, setQuantity] = useState(account.addonQuantity ?? 0);
  const [method, setMethod] = useState(account.method);
  const [quote, setQuote] = useState<BillingTerms>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const plan = catalog.plans.find(p => p.id === planId);
  const addon = catalog.addons?.find(a => a.planId === planId);
  const pending = summary.pendingChange;
  async function review() {
    setBusy(true); setError("");
    try { setQuote(await apiFetch<BillingTerms>("/billing/changes/preview", { method: "POST", body: { planId, addonId: quantity > 0 ? addon?.id : null, addonQuantity: quantity, method } })); }
    catch(e) { setError(e instanceof Error ? e.message : "Não foi possível revisar a alteração."); }
    finally { setBusy(false); }
  }
  async function confirm(card?: CardValues) {
    setBusy(true);
    try {
      return await apiFetch<BillingSummary>("/billing/changes/confirm", { method: "POST", body: { quoteId: quote?.id, card } });
    } catch(e) {
      // Refresh even after a timeout: the provider may have accepted the change.
      try {
        const latest = await apiFetch<BillingSummary>("/billing/subscription"); onUpdated(latest);
        if (!latest.pendingChange) setQuote(undefined);
      } catch { /* Keep the original actionable error. */ }
      setError(e instanceof Error ? e.message : "Atualize a assinatura antes de repetir.");
      throw e;
    } finally { setBusy(false); }
  }
  function completed(value: BillingSummary) { onUpdated(value); setOpen(false); setQuote(undefined); setDone(true); }
  async function apply() {
    setBusy(true); setError("");
    try { completed(await confirm()); }
    catch(e) { setError(e instanceof Error ? e.message : "Não foi possível confirmar. Atualize a assinatura antes de repetir."); }
    finally { setBusy(false); }
  }
  if (done) return <p role="status" className="rounded-lg bg-success-subtle p-4 text-sm text-success">Alteração programada. As condições atuais permanecem até o novo ciclo.</p>;
  if (pending) return <p className="text-sm text-secondary">Há uma alteração programada ou em conciliação. Consulte os detalhes acima antes de solicitar outra.</p>;
  const label = mode === "payment" ? "Mudar forma de pagamento" : mode === "extras" ? "Alterar adicionais" : "Mudar plano";
  return <div className="space-y-4">
    {!open ? <button className={button} disabled={!summary.available || account.state !== "ACTIVE" || account.cancelRequested} onClick={() => { setOpen(true); setError(""); }}>{label}</button> : <section className="space-y-5 rounded-xl border border-fog p-5" aria-label={label}>
      <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{label}</h3><button type="button" className="text-sm underline" disabled={busy} onClick={() => { setOpen(false); setQuote(undefined); setError(""); }}>Fechar</button></div>
      {!quote ? <form onSubmit={e => { e.preventDefault(); void review(); }} className="space-y-5">
        <div className="grid gap-4 xl:grid-cols-3">
          <label className="text-sm">Plano<select className={field} value={planId} onChange={e => { setPlanId(e.target.value); setQuantity(0); }}>{orderedPlans(catalog.plans).map(p => <option key={p.id} value={p.id}>{p.name} · {billingMoney(p.monthlyPrice)}/mês · {p.barberLimit} profissional(is)</option>)}</select></label>
          <label className="text-sm">Profissionais extras{addon ? <input className={field} type="number" required min={0} max={addon.maxQuantity} step={1} value={quantity} onChange={e => setQuantity(Number(e.target.value))}/> : <p className="mt-2 py-3 text-secondary">Disponíveis no plano Gestão.</p>}{addon && <span className="mt-1 block text-xs text-secondary">{billingMoney(addon.monthlyPrice)} por profissional/mês</span>}</label>
          <label className="text-sm">Forma de pagamento<select className={field} value={method} onChange={e => setMethod(e.target.value)}><option value="PIX">Pix mensal</option><option value="CREDIT_CARD">Cartão de crédito</option></select></label>
        </div>
        <div className="flex flex-wrap justify-between gap-3 rounded-lg bg-surface-sunken p-4"><p className="text-sm">{summary.professionals ?? 0} profissionais cadastrados · novo limite: {(plan?.barberLimit ?? 0) + quantity}</p><strong>{billingMoney(monthlyTotal(plan?.monthlyPrice ?? 0, addon?.monthlyPrice ?? 0, quantity))}/mês</strong></div>
        <p className="text-sm text-secondary">O novo valor entra no próximo ciclo ainda não emitido. Faturas existentes permanecem iguais. Não há cobrança proporcional. A redução exige que todos os profissionais cadastrados, inclusive inativos, caibam no novo limite.</p>
        <button className={button} disabled={busy || !plan || (summary.professionals ?? 0) > (plan.barberLimit + quantity)}>{busy ? "Calculando…" : "Revisar alteração"}</button>
      </form> : <div className="space-y-4">
        <dl className="grid gap-4 rounded-lg bg-surface-sunken p-4 sm:grid-cols-2"><div><dt className="text-xs text-secondary">Novo plano e limite</dt><dd className="mt-1 font-medium">{quote.planName} · {quote.barberLimit} profissionais</dd></div><div><dt className="text-xs text-secondary">Nova mensalidade</dt><dd className="mt-1 font-semibold">{billingMoney(quote.monthlyPrice)}</dd></div><div><dt className="text-xs text-secondary">A partir do ciclo de</dt><dd className="mt-1 font-medium">{billingDate(quote.effectiveOn)}</dd></div><div><dt className="text-xs text-secondary">Pagamento</dt><dd className="mt-1 font-medium">{quote.method === "PIX" ? "Pix mensal" : "Cartão de crédito"}</dd></div></dl>
        <p className="text-sm text-secondary">Plano e extras serão cobrados juntos. A capacidade será atualizada quando o novo ciclo começar e estiver pago. Até lá, reduções já reservam o novo limite para evitar cadastros acima dele. A prévia vale por 10 minutos.</p>
        {quote.method === "CREDIT_CARD" && account.method !== "CREDIT_CARD" ? <CardUpdateForm submitCard={confirm} onUpdated={completed}/> : <button className={button} disabled={busy} onClick={apply}>{busy ? "Confirmando…" : "Confirmar alteração"}</button>}
        <button className="ml-3 min-h-10 text-sm underline" disabled={busy} onClick={() => { setQuote(undefined); setError(""); }}>Voltar à edição</button>
      </div>}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </section>}
  </div>;
}
