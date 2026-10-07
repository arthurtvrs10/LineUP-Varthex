"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CreditCard, Layers, Receipt, Settings2, RefreshCw, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { SubscriptionChangeForm } from "./SubscriptionChangeForm";
import { CardUpdateForm } from "./CardUpdateForm";
import { type BillingCatalog, type BillingSummary, billingDate, billingMoney, billingStatus, safeAsaasUrl } from "@/lib/billing";

const button = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent disabled:opacity-50";
const panel = "rounded-xl border border-fog bg-surface p-5";
const sections = [
  { id: "plan", label: "Meu plano", icon: Layers },
  { id: "extras", label: "Profissionais", icon: Users },
  { id: "payment", label: "Pagamento", icon: CreditCard },
  { id: "history", label: "Faturas", icon: Receipt },
  { id: "renewal", label: "Renovação", icon: Settings2 },
] as const;
type Section = typeof sections[number]["id"];

export function SubscriptionPage({ section: selectedSection, embedded = false }: { section?: Section; embedded?: boolean }) {
  const [catalog, setCatalog] = useState<BillingCatalog>();
  const [summary, setSummary] = useState<BillingSummary>();
  const [localSection, setSection] = useState<Section>("plan");
  const section = selectedSection ?? localSection;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const load = useCallback(async () => {
    const [plans, current] = await Promise.all([apiFetch<BillingCatalog>("/billing/plans"), apiFetch<BillingSummary>("/billing/subscription")]);
    setCatalog(plans); setSummary(current);
  }, []);
  useEffect(() => { let alive = true; void Promise.all([apiFetch<BillingCatalog>("/billing/plans"), apiFetch<BillingSummary>("/billing/subscription")]).then(([plans, current]) => { if (alive) { setCatalog(plans); setSummary(current); } }).catch(e => { if (alive) setError(e.message); }); return () => { alive = false; }; }, []);
  async function action(path: string) {
    if (busy) return;
    setBusy(true); setError("");
    try { setSummary(await apiFetch<BillingSummary>(path, { method: "POST" })); setCancelOpen(false); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível concluir a operação."); }
    finally { setBusy(false); }
  }
  const account = summary?.account;
  const plan = catalog?.plans.find(p => p.id === (account?.planId ?? summary?.subscription?.planId));
  const paid = summary?.subscription && ["ACTIVE", "TRIAL"].includes(summary.subscription.status);
  const upcoming = summary?.charges.filter(c => ["PENDING", "OVERDUE"].includes(c.status)).sort((a,b) => a.dueDate.localeCompare(b.dueDate))[0];
  const checkout = safeAsaasUrl(account?.checkoutUrl);
  return <div className={embedded ? "w-full" : "flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-fog bg-surface"}>
    <header className={"flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-fog " + (embedded ? "pb-5" : "px-5 py-4")}>
      <div><p className="text-xs text-secondary">Configurações</p><h1 className="text-xl font-semibold text-ink">Minha assinatura</h1></div>
      <div className="flex items-center gap-3">{summary?.environment === "sandbox" && <span className="rounded-full bg-warning-subtle px-3 py-1 text-xs font-medium text-warning">Sandbox · teste</span>}<button aria-label="Atualizar assinatura" title="Atualizar assinatura" disabled={busy || !summary?.available} onClick={() => action("/billing/sync")} className="rounded-lg p-2 text-secondary hover:bg-surface-sunken disabled:opacity-40"><RefreshCw size={18} className={busy ? "animate-spin" : ""}/></button></div>
    </header>
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      {!embedded && <nav aria-label="Configurações da assinatura" className="flex shrink-0 gap-1 overflow-x-auto border-b border-fog bg-surface-sunken p-2 md:w-48 md:flex-col md:border-b-0 md:border-r md:p-3">
        {sections.map(item => <button key={item.id} type="button" aria-current={section === item.id ? "page" : undefined} onClick={() => { setSection(item.id); setCancelOpen(false); }} className={"flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-left text-sm transition " + (section === item.id ? "bg-accent-subtle font-semibold text-accent" : "text-secondary hover:bg-surface")}><item.icon size={17}/>{item.label}</button>)}
      </nav>}
      <section key={section} aria-label={sections.find(item => item.id === section)?.label} className={embedded ? "min-w-0 w-full pt-6" : "min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-7"}>
        <div className="w-full space-y-5">
          {error && <div role="alert" className="rounded-lg bg-danger-subtle p-3 text-sm text-danger">{error}<button className="ml-3 underline" onClick={() => { setError(""); void load().catch(e => setError(e.message)); }}>Tentar novamente</button></div>}
          {!summary && !error && <p role="status" className="text-sm text-secondary">Carregando assinatura…</p>}
          {summary && <>
            {summary.pendingChange && <div role="status" className="rounded-xl border border-fog bg-accent-subtle p-4 text-sm"><p className="font-semibold">{summary.pendingChange.state === "APPLIED" ? "Alteração programada" : "Alteração em conciliação — não repita a operação"}</p><p className="mt-2">{summary.pendingChange.planName} · {billingMoney(summary.pendingChange.monthlyPrice)}/mês · {summary.pendingChange.barberLimit} profissionais · {summary.pendingChange.method === "PIX" ? "Pix" : "Cartão"}</p><p className="mt-1">Ciclo de {billingDate(summary.pendingChange.effectiveOn)}. Acesso atualizado no início do ciclo, após pagamento.</p></div>}
            {account?.issue && <p role="alert" className="text-sm text-danger">{account.issue}</p>}
            {!summary.available && <p role="status" className="text-sm text-secondary">A contratação online está indisponível no momento.</p>}
            {section === "plan" && <>
              <div><h2 className="text-lg font-semibold">Meu plano</h2><p className="mt-1 text-sm text-secondary">Seu acesso ao LineUp, em um só lugar.</p></div>
              <div className={panel}><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-2xl font-semibold">{plan?.name ?? "Sem plano contratado"}</p><p className="mt-2 text-sm text-secondary">{billingStatus(account?.state ?? summary.subscription?.status)}</p></div>{account && <p className="text-2xl font-semibold tabular-nums">{billingMoney(account.monthlyPrice)}<span className="text-sm font-normal text-secondary"> /mês</span></p>}</div><dl className="mt-6 grid gap-5 border-t border-fog pt-5 sm:grid-cols-2"><div><dt className="text-xs text-secondary">Profissionais incluídos</dt><dd className="mt-1 font-medium">{account?.contractedBarberLimit ?? plan?.barberLimit ?? "—"}</dd></div><div><dt className="text-xs text-secondary">Acesso até</dt><dd className="mt-1 font-medium">{paid ? billingDate(summary.subscription?.endsOn) : "Aguardando pagamento"}</dd></div></dl></div>
              {!paid && <Link className={button} href="/admin/assinatura">{account ? "Regularizar assinatura" : "Escolher plano"}</Link>}
              {catalog && account && <SubscriptionChangeForm key={account.planId + account.monthlyPrice} catalog={catalog} summary={summary} onUpdated={setSummary} mode="plan"/>}
            </>}
            {section === "extras" && <>
              <div><h2 className="text-lg font-semibold">Profissionais e adicionais</h2><p className="mt-1 text-sm text-secondary">Plano e extras são cobrados na mesma mensalidade.</p></div>
              <dl className={panel + " space-y-4 text-sm"}><div className="flex justify-between gap-4"><dt>Plano base</dt><dd>{account ? billingMoney(account.basePrice ?? account.monthlyPrice) : "—"}</dd></div><div className="flex justify-between gap-4"><dt>Profissionais extras</dt><dd>{account?.addonQuantity ?? 0}{!!account?.addonQuantity && ` × ${billingMoney(account.addonUnitPrice ?? 0)}`}</dd></div><div className="flex justify-between gap-4 border-t border-fog pt-4 font-semibold"><dt>Total mensal</dt><dd>{account ? billingMoney(account.monthlyPrice) : "—"}</dd></div></dl>
              <p className="text-sm text-secondary">Capacidade contratada: {account?.contractedBarberLimit ?? plan?.barberLimit ?? 0} profissionais. A contagem inclui profissionais inativos.</p>{catalog && account && <SubscriptionChangeForm key={account.planId + account.monthlyPrice} catalog={catalog} summary={summary} onUpdated={setSummary} mode="extras"/>}
            </>}
            {section === "payment" && <>
              <h2 className="text-lg font-semibold">Forma de pagamento</h2><div className={panel}><p className="font-medium">{account ? account.method === "PIX" ? "Pix mensal" : "Cartão de crédito" : "Nenhuma forma cadastrada"}</p><p className="mt-2 text-sm text-secondary">{account?.method === "PIX" ? "Cada mensalidade deve ser paga manualmente. Abra sua cobrança em Faturas." : account ? "Renovação mensal automática enquanto a assinatura estiver ativa." : "Escolha a forma de pagamento ao contratar."}</p>{upcoming && <p className="mt-4 text-sm">Cobrança pendente: {billingMoney(upcoming.gross)} · {billingDate(upcoming.dueDate)}</p>}{checkout && account?.state === "PENDING" && <a className={button + " mt-4"} href={checkout} target="_blank" rel="noopener noreferrer">Continuar pagamento</a>}</div>
              {summary.charges.some(c => c.failureCode === "CARD_REFUSED") && <p role="alert" className="text-sm text-danger">Uma mensalidade teve o cartão recusado. Confira a fatura e atualize o cartão.</p>}
              {catalog && account && <SubscriptionChangeForm key={account.planId + account.method} catalog={catalog} summary={summary} onUpdated={setSummary} mode="payment"/>}
              {!summary.pendingChange && summary.available && account?.method === "CREDIT_CARD" && account.providerSubscriptionId && !account.cancelRequested && <CardUpdateForm onUpdated={setSummary}/>}
              {summary.environment === "sandbox" && !paid && <Link href="/admin/assinatura" className="text-sm text-accent underline">Abrir teste de pagamento</Link>}
            </>}
            {section === "history" && <>
              <h2 className="text-lg font-semibold">Faturas</h2>{!summary.charges.length ? <div className={panel}><Receipt size={24} className="text-secondary"/><p className="mt-3 text-sm text-secondary">Suas mensalidades aparecerão aqui após a contratação.</p></div> : <div className="overflow-x-auto rounded-xl border border-fog"><table className="w-full text-left text-sm"><thead className="bg-surface-sunken"><tr><th className="p-3">Vencimento</th><th className="p-3">Valor</th><th className="p-3">Situação</th><th className="p-3">Fatura</th></tr></thead><tbody>{summary.charges.map(charge => <tr key={charge.id} className="border-t border-fog"><td className="whitespace-nowrap p-3">{billingDate(charge.dueDate)}</td><td className="whitespace-nowrap p-3">{billingMoney(charge.gross)}{charge.refunded > 0 && <p className="text-xs">Devolvido: {billingMoney(charge.refunded)}</p>}</td><td className="p-3">{billingStatus(charge.status)}{charge.refundState && <p className="text-xs">{billingStatus(charge.refundState)}</p>}</td><td className="p-3">{safeAsaasUrl(charge.invoiceUrl) && <a className="text-accent underline" href={safeAsaasUrl(charge.invoiceUrl)} target="_blank" rel="noopener noreferrer">{["PENDING", "OVERDUE"].includes(charge.status) ? "Pagar" : "Ver fatura"}</a>}</td></tr>)}</tbody></table></div>}
            </>}
            {section === "renewal" && <>
              <h2 className="text-lg font-semibold">Renovação</h2><div className={panel}><p className="font-medium">{account?.cancelRequested ? "Renovação cancelada" : account ? "Assinatura mensal" : "Nenhuma assinatura para gerenciar"}</p><p className="mt-2 text-sm text-secondary">{account?.cancelRequested ? "Seu acesso permanece até o fim do período já pago." : "Cancelar interrompe as novas cobranças. Faturas já emitidas podem permanecer pendentes; o cancelamento não solicita reembolso."}</p>{paid && <p className="mt-3 text-sm">Acesso até {billingDate(summary.subscription?.endsOn)}.</p>}
              {summary.available && account && !account.cancelRequested && !cancelOpen && <button className="mt-5 min-h-10 rounded-lg border border-danger/30 px-4 text-sm text-danger" disabled={busy} onClick={() => setCancelOpen(true)}>Cancelar renovação</button>}
              {cancelOpen && <div className="mt-5 border-t border-fog pt-4"><p className="text-sm font-medium">Deseja confirmar o cancelamento da renovação?</p><div className="mt-4 flex flex-wrap gap-3"><button className={button} disabled={busy} onClick={() => action("/billing/cancel")}>Confirmar cancelamento</button><button className="min-h-10 px-4 text-sm" disabled={busy} onClick={() => setCancelOpen(false)}>Manter assinatura</button></div></div>}</div>
            </>}
          </>}
        </div>
      </section>
    </div>
  </div>;
}
