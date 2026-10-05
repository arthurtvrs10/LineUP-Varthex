"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";
import { CardUpdateForm } from "./CardUpdateForm";
import { type BillingCatalog, type BillingSummary, billingDate, billingMoney, billingStatus, safeAsaasUrl } from "@/lib/billing";

const button = "rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent disabled:opacity-50";
const panel = "rounded-xl border border-fog bg-white p-5";

export function SubscriptionPage() {
  const [catalog, setCatalog] = useState<BillingCatalog>();
  const [summary, setSummary] = useState<BillingSummary>();
  const [planId, setPlanId] = useState("");
  const [method, setMethod] = useState("CREDIT_CARD");
  const [document, setDocument] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [requestKey, setRequestKey] = useState<string>();
  const load = useCallback(async () => {
    const [plans, subscription] = await Promise.all([apiFetch<BillingCatalog>("/billing/plans"), apiFetch<BillingSummary>("/billing/subscription")]);
    setCatalog(plans); setSummary(subscription);
    const selected = new URLSearchParams(window.location.search).get("plano");
    setPlanId(current => current || plans.plans.find(p => p.id === selected)?.id || plans.plans[0]?.id || "");
  }, []);
  useEffect(() => {
    let active = true;
    Promise.all([apiFetch<BillingCatalog>("/billing/plans"), apiFetch<BillingSummary>("/billing/subscription")])
      .then(([plans, subscription]) => {
        if (!active) return;
        setCatalog(plans); setSummary(subscription);
        const selected = new URLSearchParams(window.location.search).get("plano");
        setPlanId(plans.plans.find(p => p.id === selected)?.id || plans.plans[0]?.id || "");
      }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);
  async function action(path: string, body?: unknown) {
    setBusy(true); setError("");
    try { const response = await apiFetch<BillingSummary>(path, { method: "POST", body }); setSummary(response); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível concluir a operação."); await load().catch(() => {}); }
    finally { setBusy(false); }
  }
  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!accepted) return;
    // Keep the key after an uncertain response; never create a second provider request on retry.
    const key = summary?.account && ["EXPIRED", "CANCELED", "FAILED"].includes(summary.account.state) ? crypto.randomUUID() : requestKey ?? crypto.randomUUID(); setRequestKey(key);
    await action("/billing/checkout", { planId, method, cpfCnpj: document, requestKey: key });
  }
  const account = summary?.account;
  const plan = catalog?.plans.find(p => p.id === (account?.planId ?? planId));
  const checkout = safeAsaasUrl(account?.checkoutUrl);
  return <div className="mx-auto max-w-4xl space-y-5">
    <div><h1 className="text-2xl font-semibold text-ink">Minha assinatura</h1><p className="mt-2 text-sm text-secondary">Gerencie o plano de uso do LineUp e acompanhe suas mensalidades.</p></div>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {!summary && !error && <p role="status">Carregando assinatura…</p>}
    {summary && <>
      {!summary.available && <p className={panel}>A contratação online ainda não está disponível. Entre em contato com o suporte para contratar ou ajustar seu plano.</p>}
      <section className={panel}><h2 className="font-semibold">Plano e acesso</h2><dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
        <div><dt className="text-secondary">Plano</dt><dd>{plan?.name ?? (summary.subscription?.planId ? "Plano contratado" : "Escolha um plano")}</dd></div>
        <div><dt className="text-secondary">Situação</dt><dd>{billingStatus(account?.state ?? summary.subscription?.status)}</dd></div>
        <div><dt className="text-secondary">Acesso até</dt><dd>{summary.subscription?.status === "ACTIVE" || summary.subscription?.status === "TRIAL" ? billingDate(summary.subscription.endsOn) : "Aguardando regularização"}</dd></div>
      </dl>{account && <p className="mt-3 text-sm text-secondary">{billingMoney(account.monthlyPrice)}/mês · {account.method === "PIX" ? "Pix com pagamento a cada mês" : "Cartão com renovação automática"}</p>}
      {account?.issue && <p role="status" className="mt-3 text-sm text-amber-700">{account.state === "FAILED" ? "Confira os dados do contratante para tentar novamente." : "Estamos verificando sua contratação. Atualize o pagamento antes de tentar novamente."}</p>}
      {checkout && account?.state === "PENDING" && <a className={`${button} mt-4 inline-block`} href={checkout} rel="noopener noreferrer">Continuar no checkout seguro</a>}
      {summary.available && <div className="mt-4 flex flex-wrap gap-3"><button className={button} disabled={busy} onClick={() => action("/billing/sync")}>Atualizar pagamentos</button>
        {account && !account.cancelRequested && <button className="text-sm underline" disabled={busy} onClick={() => setCancelOpen(true)}>Cancelar renovação</button>}</div>}
      {account?.cancelRequested && <p className="mt-3 text-sm text-secondary">A renovação foi cancelada. O período já pago permanece disponível até o fim da vigência.</p>}
      {cancelOpen && <div className="mt-4 rounded-lg border border-fog p-4"><p className="text-sm">Cancelar interrompe novas cobranças. Cobranças já emitidas podem permanecer pendentes. Isso não solicita reembolso.</p><div className="mt-3 flex gap-4"><button className={button} disabled={busy} onClick={async () => { await action("/billing/cancel"); setCancelOpen(false); }}>Confirmar cancelamento</button><button disabled={busy} onClick={() => setCancelOpen(false)}>Voltar</button></div></div>}
      </section>
      {summary.available && (!account || ["EXPIRED", "CANCELED", "FAILED"].includes(account.state) && !account.cancelRequested) && <form onSubmit={subscribe} className={`${panel} space-y-4`}><h2 className="font-semibold">Contratar plano mensal</h2>
        {!catalog?.plans.length ? <p>Nenhum plano disponível para contratação.</p> : <>
          <label className="block text-sm">Plano<select required className="mt-1 w-full rounded-lg border border-fog p-3" value={planId} onChange={e => { setPlanId(e.target.value); setRequestKey(undefined); }}>{catalog.plans.map(p => <option key={p.id} value={p.id}>{p.name} — {billingMoney(p.monthlyPrice)}/mês — até {p.barberLimit} profissionais</option>)}</select></label>
          <label className="block text-sm">Forma de pagamento<select className="mt-1 w-full rounded-lg border border-fog p-3" value={method} onChange={e => { setMethod(e.target.value); setRequestKey(undefined); }}><option value="CREDIT_CARD">Cartão — renovação automática</option><option value="PIX">Pix — pagar a cada mês</option></select></label>
          <label className="block text-sm">CPF ou CNPJ do contratante<input required autoComplete="off" inputMode="numeric" maxLength={18} className="mt-1 w-full rounded-lg border border-fog p-3" value={document} onChange={e => setDocument(e.target.value)} /></label>
          <p className="text-sm text-secondary">{method === "CREDIT_CARD" ? "Você informará o cartão no checkout seguro. A cobrança será renovada mensalmente até o cancelamento." : "Uma cobrança Pix será emitida a cada mês. Você precisará pagar cada mensalidade."} Sem teste gratuito. Após uma renovação vencida, o prazo de tolerância é de {summary.graceDays} dias.</p>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" required checked={accepted} onChange={e => setAccepted(e.target.checked)} /><span>Li os <Link className="underline" href="/termos">termos</Link> e concordo com o preço mensal e as condições de renovação e cancelamento apresentados.</span></label>
          <button className={button} disabled={busy || !accepted}>{busy ? "Preparando contratação…" : "Assinar plano"}</button>
        </>}
      </form>}
      {summary.charges.some(c => c.failureCode === "CARD_REFUSED") && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">O cartão foi recusado em uma mensalidade. Confira a cobrança e atualize o cartão para regularizar o pagamento.</p>}
      {summary.available && account?.method === "CREDIT_CARD" && account.providerSubscriptionId && !account.cancelRequested && <CardUpdateForm onUpdated={setSummary} />}
      <section className={panel}><h2 className="font-semibold">Histórico de mensalidades</h2>{!summary.charges.length ? <p className="mt-3 text-sm text-secondary">Ainda não há cobranças integradas.</p> : <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Vencimento</th><th className="p-2">Valor</th><th className="p-2">Situação</th><th className="p-2">Pagamento</th></tr></thead><tbody>{summary.charges.map(charge => <tr key={charge.id} className="border-t border-fog"><td className="p-2">{billingDate(charge.dueDate)}</td><td className="p-2">{billingMoney(charge.gross)}{charge.refunded > 0 && <p className="text-xs">Devolvido: {billingMoney(charge.refunded)}</p>}</td><td className="p-2">{billingStatus(charge.status)}{charge.refundState && <p className="text-xs">{billingStatus(charge.refundState)}</p>}</td><td className="p-2">{safeAsaasUrl(charge.invoiceUrl) && <a className="underline" href={safeAsaasUrl(charge.invoiceUrl)} rel="noopener noreferrer">{["PENDING", "OVERDUE"].includes(charge.status) ? "Pagar mensalidade" : "Ver fatura"}</a>}</td></tr>)}</tbody></table></div>}</section>
    </>}
  </div>;
}
