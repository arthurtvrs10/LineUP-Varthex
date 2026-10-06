"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, CreditCard, LockKeyhole, LogOut, QrCode, RefreshCw, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { apiFetch } from "@/lib/api";
import { billingMoney, billingStatus, planFeatures, selectCatalogPlan, orderedPlans, monthlyTotal, safeAsaasUrl, type BillingCatalog, type BillingSummary } from "@/lib/billing";

const primary = "inline-flex min-h-12 w-full items-center justify-center gap-2 bg-accent px-5 text-sm font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40";
const input = "mt-2 min-h-12 w-full border border-fog bg-surface px-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent";

export function CheckoutPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<BillingCatalog>();
  const [summary, setSummary] = useState<BillingSummary>();
  const [planId, setPlanId] = useState("");
  const [method, setMethod] = useState("CREDIT_CARD");
  const [document, setDocument] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [addonQuantity, setAddonQuantity] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const attempt = useRef<{ payload: string; key: string } | null>(null);
  const load = useCallback(async () => {
    const [plans, current] = await Promise.all([apiFetch<BillingCatalog>("/billing/plans"), apiFetch<BillingSummary>("/billing/subscription")]);
    setCatalog({ ...plans, plans: orderedPlans(plans.plans) }); setSummary(current);
    if (current.account?.state === "FAILED") attempt.current = null;
    if (current.cardCheckoutAvailable === false) setMethod("PIX");
    const requested = new URLSearchParams(window.location.search).get("plano");
    setPlanId(previous => selectCatalogPlan(plans.plans, previous || requested));
  }, []);
  useEffect(() => { let active = true; Promise.resolve().then(() => { if (active) void load().catch(e => { if (active) setError(e instanceof Error ? e.message : "Não foi possível carregar os planos."); }); }); return () => { active = false; }; }, [load]);

  const account = summary?.account;
  const active = summary?.subscription?.status === "ACTIVE" || summary?.subscription?.status === "TRIAL";
  const pending = !!account && !["FAILED", "EXPIRED", "CANCELED"].includes(account.state);
  const contracted = !!account && (pending || active || !!account.providerSubscriptionId);
  const plan = catalog?.plans.find(p => p.id === (contracted ? account?.planId : planId));
  const addon = catalog?.addons?.find(a => a.planId === planId && a.code === "BARBER_SEAT");
  const selectedQuantity = addon ? addonQuantity : 0;
  const price = contracted ? account?.monthlyPrice : plan ? monthlyTotal(plan.monthlyPrice, addon?.monthlyPrice, selectedQuantity) : undefined;
  const seats = contracted ? account?.contractedBarberLimit ?? plan?.barberLimit : plan ? plan.barberLimit + selectedQuantity : undefined;
  const extras = contracted ? account?.addonQuantity ?? 0 : selectedQuantity;
  const extraPrice = contracted ? account?.addonUnitPrice ?? 0 : addon?.monthlyPrice ?? 0;
  const checkout = safeAsaasUrl(account?.checkoutUrl);
  const invoice = summary?.charges.find(c => ["PENDING", "OVERDUE"].includes(c.status) && safeAsaasUrl(c.invoiceUrl));
  const paymentUrl = checkout || safeAsaasUrl(invoice?.invoiceUrl);
  const available = !!catalog?.available && !!summary?.available;
  const sandboxCharge = summary?.charges.find(c => ["PENDING", "OVERDUE"].includes(c.status));

  useEffect(() => {
    if (active) router.replace("/admin/dashboard");
  }, [active, router]);

  useEffect(() => {
    if (!pending || active || !available) return;
    let disposed = false;
    let checks = 0;
    let timer: ReturnType<typeof setTimeout>;
    async function checkPayment() {
      if (disposed) return;
      if (window.document.visibilityState === "visible" && !lock.current && checks < 40) {
        lock.current = true;
        checks++;
        try {
          const current = await apiFetch<BillingSummary>("/billing/sync", { method: "POST" });
          if (!disposed) setSummary(current);
        } catch {
          // A temporary failure never grants access. Manual verification remains available.
        } finally { lock.current = false; }
      }
      if (!disposed && checks < 40) timer = setTimeout(checkPayment, 15000);
    }
    function resume() { clearTimeout(timer); void checkPayment(); }
    timer = setTimeout(checkPayment, 1000);
    window.addEventListener("focus", resume);
    return () => { disposed = true; clearTimeout(timer); window.removeEventListener("focus", resume); };
  }, [pending, active, available]);

  async function simulatePayment() {
    if (lock.current || !sandboxCharge || !summary?.sandboxActionsEnabled) return;
    lock.current = true; setBusy(true); setError("");
    try { setSummary(await apiFetch<BillingSummary>(`/billing/sandbox/charges/${sandboxCharge.id}/confirm`, { method: "POST" })); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível simular o pagamento. Verifique o status antes de tentar novamente."); }
    finally { lock.current = false; setBusy(false); }
  }

  async function refresh() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try { setSummary(await apiFetch<BillingSummary>("/billing/sync", { method: "POST" })); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível atualizar o pagamento."); }
    finally { lock.current = false; setBusy(false); }
  }
  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !accepted || !plan || !available || pending || active) return;
    lock.current = true; setBusy(true); setError("");
    const selection = { planId, method, cpfCnpj: document, addonId: selectedQuantity ? addon?.id : null, addonQuantity: selectedQuantity };
    const payload = JSON.stringify(selection);
    if (!attempt.current || attempt.current.payload !== payload) attempt.current = { payload, key: crypto.randomUUID() };
    try {
      const result = await apiFetch<BillingSummary>("/billing/checkout", { method: "POST", body: { ...selection, requestKey: attempt.current.key } });
      setSummary(result);
      if (result.account?.state === "FAILED") attempt.current = null;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível preparar o pagamento.");
      await load().catch(() => {});
    } finally { lock.current = false; setBusy(false); }
  }

  return <div className="min-h-screen bg-surface text-ink">
    <header className="border-b border-fog"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6 sm:px-8"><Link href="/" aria-label="LineUp — início"><Logo height={22}/></Link><button onClick={() => signOut({ callbackUrl: "/login" })} className="inline-flex min-h-10 items-center gap-2 px-2 text-sm text-secondary hover:text-ink"><LogOut size={16}/>Sair</button></div></header>
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-16">
      <div className="mb-10 max-w-2xl"><p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">Seu próximo passo</p><h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Tudo pronto para começar.</h1><p className="mt-4 text-base leading-relaxed text-secondary">Escolha o plano da sua barbearia e conclua a assinatura do LineUp.</p></div>
      {error && <div role="alert" className="mb-6 border border-danger/20 bg-danger-subtle p-4 text-sm text-danger">{error}<button type="button" disabled={busy} onClick={() => { setError(""); void load().catch(e => setError(e.message)); }} className="ml-3 underline">Tentar novamente</button></div>}
      {summary?.environment === "sandbox" && <div role="status" className="mb-6 border border-warning/20 bg-warning-subtle p-4 text-sm text-warning"><strong>Ambiente de testes · Sandbox</strong><p className="mt-1">Os pagamentos deste ambiente são simulados. Use somente dados e cartões de teste.</p>{summary.sandboxActionsEnabled && account?.method === "PIX" && sandboxCharge && <button type="button" onClick={simulatePayment} disabled={busy} className="mt-3 min-h-11 font-semibold underline disabled:opacity-50">{busy ? "Consultando Asaas…" : "Simular pagamento Pix no Sandbox"}</button>}</div>}
      {!summary && !error && <p role="status" className="py-12 text-secondary">Carregando opções de assinatura…</p>}
      {summary && <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
        <section aria-label="Contratação">
          {active ? <div className="border border-success/20 bg-success-subtle p-6"><ShieldCheck className="mb-4 text-success" size={28}/><h2 className="text-xl font-semibold">Sua assinatura está ativa</h2><p className="mt-2 text-sm text-secondary">Pagamento confirmado. Redirecionando para o painel da sua barbearia…</p><Link href="/admin/dashboard" className={primary + " mt-6"}>Ir para o painel<ArrowRight size={16}/></Link><Link href="/admin/assinatura/gerenciar" className="mt-4 inline-block text-sm underline">Gerenciar minha assinatura</Link></div> : pending ? <div className="space-y-5 border border-fog p-6"><p className="text-xs font-semibold uppercase tracking-wide text-accent">Última etapa</p><h2 className="text-xl font-semibold">{billingStatus(account?.state)}</h2><p className="text-sm leading-6 text-secondary">O pagamento abre em outra aba. Mantenha esta página aberta: após a confirmação do Asaas, você será levado ao painel automaticamente.</p>{paymentUrl && <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className={primary}>{account?.method === "PIX" ? "Abrir cobrança Pix" : "Continuar para pagamento"}<ArrowRight size={16}/></a>}<button disabled={busy || !available} onClick={refresh} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent disabled:opacity-50"><RefreshCw size={16}/>{busy ? "Verificando…" : "Já paguei · verificar pagamento"}</button>{!paymentUrl && <p role="status" className="text-sm text-secondary">Estamos verificando sua contratação. Atualize o status antes de tentar novamente.</p>}</div> : <form onSubmit={subscribe} className="space-y-8">
            <fieldset disabled={busy} className="space-y-4"><legend className="mb-4 text-lg font-semibold">1. Escolha seu plano</legend>
              {catalog?.plans.length ? catalog.plans.map(p => <label key={p.id} className={"flex cursor-pointer items-start gap-3 border p-5 transition " + (p.id === planId ? "border-accent bg-accent-subtle" : "border-fog hover:bg-surface-sunken")}><input type="radio" name="plan" value={p.id} checked={p.id === planId} onChange={() => { setPlanId(p.id); setAddonQuantity(0); setAccepted(false); const url = new URL(window.location.href); url.searchParams.set("plano", p.id); window.history.replaceState(null, "", url); }} className="mt-1 accent-accent"/><span className="min-w-0 flex-1"><span className="block font-semibold">{p.name}</span><span className="mt-1 block text-sm leading-6 text-secondary">{p.description}</span><span className="mt-1 block text-sm text-secondary">Até {p.barberLimit} {p.barberLimit === 1 ? "profissional cadastrado" : "profissionais cadastrados"}</span><span className="mt-3 block space-y-1">{planFeatures(p).map(feature => <span key={feature} className="flex items-start gap-2 text-xs leading-5 text-secondary"><Check size={14} className="mt-0.5 shrink-0 text-accent"/>{feature}</span>)}</span></span><span className="text-right font-semibold tabular-nums">{billingMoney(p.monthlyPrice)}<span className="block text-xs font-normal text-secondary">por mês</span></span></label>) : <div className="border border-fog bg-surface-sunken p-5 text-sm leading-6 text-secondary">Os planos estão sendo preparados. Sua conta já foi criada; volte mais tarde para concluir a assinatura.</div>}
            </fieldset>
            {addon && <fieldset disabled={busy || !available} className="space-y-3 border border-fog p-5"><legend className="px-2 font-semibold">Profissionais adicionais · opcional</legend><p className="text-sm text-secondary">O Gestão inclui 5 profissionais. Cada profissional extra custa {billingMoney(addon.monthlyPrice)}/mês, na mesma cobrança do plano.</p><label className="block text-sm font-medium">Quantidade extra<select className={input} value={selectedQuantity} onChange={e => { setAddonQuantity(Number(e.target.value)); setAccepted(false); }}>{Array.from({length: addon.maxQuantity + 1}, (_, n) => <option value={n} key={n}>{n === 0 ? "Sem adicionais" : `${n} ${n === 1 ? "profissional extra" : "profissionais extras"}`}</option>)}</select></label><p className="text-xs text-secondary">Seleção para esta contratação, renovada mensalmente junto ao plano. Alterações após a contratação devem ser solicitadas ao suporte.</p></fieldset>}
            <p className="text-xs leading-5 text-secondary">WhatsApp e IA não fazem parte desta oferta. Você paga apenas o total apresentado no resumo; nenhum adicional é selecionado automaticamente.</p>
            {summary.cardCheckoutAvailable === false && <p className="text-sm text-secondary">Cartão requer um endereço público HTTPS de retorno. Para testar no localhost, use Pix no Sandbox.</p>}{!available && <p role="status" className="border border-warning/20 bg-warning-subtle p-4 text-sm text-warning">A contratação online está temporariamente indisponível. Nenhuma cobrança será realizada.</p>}
            <fieldset disabled={busy || !available || !plan} className="space-y-5 disabled:opacity-50"><legend className="mb-4 text-lg font-semibold">2. Forma de pagamento</legend><div className="grid grid-cols-2 gap-3">{[{id:"CREDIT_CARD",label:"Cartão",icon:CreditCard},{id:"PIX",label:"Pix",icon:QrCode}].map(m => <label key={m.id} className={"flex cursor-pointer items-center gap-2 border p-4 text-sm " + (method === m.id ? "border-accent bg-accent-subtle" : "border-fog")}><input type="radio" name="method" disabled={m.id === "CREDIT_CARD" && summary.cardCheckoutAvailable === false} checked={method === m.id} onChange={() => {setMethod(m.id);setAccepted(false);}} className="accent-accent"/><m.icon size={18}/>{m.label}</label>)}</div><label className="block text-sm font-medium">CPF ou CNPJ do contratante<input required inputMode="numeric" autoComplete="off" maxLength={18} value={document} onChange={e => setDocument(e.target.value)} placeholder="Informe seu CPF ou CNPJ" className={input}/></label><p className="text-xs leading-5 text-secondary">{method === "CREDIT_CARD" ? "Os dados do cartão serão informados no checkout do Asaas. Renovação automática mensal até o cancelamento." : "Uma cobrança Pix será emitida a cada mês. O pagamento de cada mensalidade é manual."}</p><label className="flex items-start gap-3 text-sm leading-6 text-secondary"><input type="checkbox" required checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-1.5 accent-accent"/><span>Concordo com o valor mensal, a renovação e os <Link href="/termos" target="_blank" rel="noopener noreferrer" className="underline">termos de uso</Link>. Sem teste gratuito.</span></label><button disabled={!accepted || busy || !available || !plan} className={primary}>{busy ? "Preparando pagamento…" : "Continuar para pagamento"}<ArrowRight size={16}/></button></fieldset>
          </form>}
        </section>
        <aside className="border border-fog bg-surface-sunken p-6 lg:sticky lg:top-8"><p className="text-xs font-semibold uppercase tracking-widest text-secondary">Resumo da assinatura</p><h2 className="mt-5 font-display text-2xl font-semibold">{plan?.name ?? (pending ? "Seu plano LineUp" : "Seu plano")}</h2><p className="mt-2 text-sm text-secondary">{seats ? "Até " + seats + " profissionais" : "Selecione uma opção disponível"}</p><div className="my-6 border-y border-fog py-5"><div className="flex justify-between gap-3 text-sm"><span>Total mensal</span><span className="font-semibold tabular-nums">{price !== undefined ? billingMoney(price) : "—"}</span></div>{extras > 0 && <p className="mt-3 text-xs leading-5 text-secondary">Plano: {billingMoney(contracted ? account?.basePrice ?? 0 : plan?.monthlyPrice ?? 0)} + {extras} × {billingMoney(extraPrice)} por profissional extra. Tudo em uma única mensalidade.</p>}<p className="mt-2 text-xs text-secondary">Cobrança mensal em reais.</p></div><ul className="space-y-3 text-sm text-secondary">{(plan ? planFeatures(plan) : ["Escolha um plano para conferir os benefícios"]).map(text => <li key={text} className="flex items-start gap-2"><Check size={16} className="mt-0.5 shrink-0 text-accent"/>{text}</li>)}</ul><div className="mt-7 flex items-start gap-2 border-t border-fog pt-5 text-xs leading-5 text-secondary"><LockKeyhole size={16} className="mt-0.5 shrink-0"/><p>Você revisa a contratação antes de pagar. Nenhuma cobrança é feita apenas ao criar a conta.</p></div></aside>
      </div>}
      <footer className="mt-14 flex flex-wrap gap-5 border-t border-fog pt-6 text-xs text-secondary"><span>LineUp · Gestão de barbearias</span><Link href="/termos" className="hover:underline">Termos de uso</Link><Link href="/privacidade" className="hover:underline">Privacidade</Link></footer>
    </main>
  </div>;
}
