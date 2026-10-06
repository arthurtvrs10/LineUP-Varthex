"use client";

import { useEffect, useState } from "react";
import { type BillingCatalog, billingMoney, planFeatures, orderedPlans } from "@/lib/billing";
import { Check } from "lucide-react";
import { ActionLink } from "@/components/ui/ActionLink";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function PricingSection() {
  const [catalog, setCatalog] = useState<BillingCatalog>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    fetch("/billing/plans", { signal: abort.signal }).then(async r => {
      if (!r.ok) throw new Error("Catalog unavailable");
      setCatalog(await r.json());
    }).catch(() => { if (!abort.signal.aborted) setFailed(true); });
    return () => abort.abort();
  }, []);
  const plans = orderedPlans(catalog?.plans ?? []).map(plan => ({
    id: plan.id, name: plan.name, price: billingMoney(plan.monthlyPrice),
    audience: plan.description || "Organize os atendimentos da sua barbearia.",
    capacity: "Até " + plan.barberLimit + (plan.barberLimit === 1 ? " profissional cadastrado" : " profissionais cadastrados"),
    features: planFeatures(plan),
    highlighted: plan.id === "2a110000-0000-4000-8000-000000000002",
  }));
  return (
    <section
      className="mx-auto w-full max-w-[1216px] px-5 py-16 scroll-mt-20 sm:px-6 lg:py-24"
      id="planos"
    >
      <Reveal className="max-w-2xl">
        <SectionLabel>Planos</SectionLabel>
        <h2 className="mt-3 font-[var(--font-display)] text-[clamp(2rem,3.5vw,2.75rem)] leading-tight font-normal tracking-[-0.03em]">
          Um plano para cada tamanho de operação.
        </h2>
        <p className="mt-3 text-[15px] leading-7 text-[#5f6f87]">
          Comece pelo essencial e evolua conforme sua barbearia cresce, sem
          trocar de plataforma.
        </p>
      </Reveal>

      {!plans.length && <p role="status" className="mt-8 text-sm text-secondary">{failed ? "Não foi possível carregar os planos. Atualize a página para tentar novamente." : catalog ? "Nenhum plano disponível no momento. Tente novamente mais tarde." : "Carregando planos…"}</p>}
      <div className="mt-10 grid gap-5 lg:mt-12 lg:grid-cols-2">
        {plans.map((plan, index) => (
          <Reveal
            className={`relative flex flex-col rounded-xl border px-7 py-8 ${
              plan.highlighted
                ? "border-accent bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
                : "border-[#e2e7f0] bg-white"
            }`}
            delay={index * 0.08}
            key={plan.name}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-8 rounded-md bg-accent px-3 py-1 text-[10px] font-extrabold text-on-accent">
                Para equipes
              </span>
            )}
            <h3 className="font-[var(--font-display)] text-2xl font-normal text-[#0d1831]">
              {plan.name}
            </h3>
            <p className="mt-1.5 text-xs leading-5 text-[#5f6f87]">{plan.audience}</p>
            <p className="mt-3 text-sm font-semibold text-ink">{plan.capacity}</p>
            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="font-[var(--font-display)] text-4xl font-normal text-[#0d1831]">
                {plan.price}
              </span>
              {plan.price !== "Sob consulta" && (
                <span className="text-xs font-semibold text-[#8290a2]">/mês</span>
              )}
            </div>
            <ul className="mt-7 grid gap-3">
              {plan.features.map((feature) => (
                <li className="flex items-start gap-2.5 text-[13px] text-[#4f5e73]" key={feature}>
                  <Check className="mt-0.5 shrink-0 rounded-full bg-accent p-0.5 text-on-accent" size={16} />
                  {feature}
                </li>
              ))}
            </ul>
            <ActionLink
              className="mt-8 w-full"
              href={`/cadastro?plano=${encodeURIComponent(plan.id)}`}
              variant={plan.highlighted ? "primary" : "secondary"}
            >
              {"Escolher " + plan.name}
            </ActionLink>
          </Reveal>
        ))}
      </div>

      <p className="mt-6 text-sm text-secondary">O Individual atende quem trabalha sozinho. O Gestão inclui até 5 profissionais. Acesso de clientes não conta como profissional. WhatsApp e IA não fazem parte desta oferta.</p>
      {catalog?.addons?.filter(addon => addon.code === "BARBER_SEAT").map(addon => <p key={addon.id} className="mt-3 text-sm text-secondary">No {catalog.plans.find(plan => plan.id === addon.planId)?.name ?? "plano elegível"}, adicione profissionais por {new Intl.NumberFormat("pt-BR", {style:"currency", currency:"BRL"}).format(addon.monthlyPrice)}/mês cada, junto à mensalidade. Escolha a quantidade na contratação.</p>)}
      <p className="mt-6 text-[11px] text-[#98a2b3]">
        {catalog?.available && catalog.plans.length ? `Cartão com renovação mensal automática ou Pix com pagamento a cada mês. Sem teste gratuito. Cancelamento da renovação pela plataforma. Tolerância de ${catalog.graceDays} dias após uma renovação vencida.` : "Você pode escolher seu plano e criar a conta. O pagamento será liberado quando a contratação online estiver disponível."}
      </p>
    </section>
  );
}
