import { Check } from "lucide-react";
import { ActionLink } from "@/components/ui/ActionLink";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

const plans = [
  {
    name: "Essencial",
    price: "R$ 89",
    audience: "Para barbearias com uma unidade",
    features: [
      "Agenda e disponibilidade",
      "Cadastro de clientes",
      "Gestão da equipe",
      "Comissões por atendimento",
    ],
    highlighted: false,
  },
  {
    name: "Profissional",
    price: "R$ 149",
    audience: "Para quem quer indicadores e mais controle",
    features: [
      "Tudo do plano Essencial",
      "Indicadores da operação",
      "Bloqueios e regras avançadas de horário",
      "Histórico completo de atendimentos",
      "Suporte prioritário",
    ],
    highlighted: true,
  },
  {
    name: "Rede",
    price: "Sob consulta",
    audience: "Para redes com mais de uma unidade",
    features: [
      "Tudo do plano Profissional",
      "Gestão multiunidade",
      "Perfis e permissões por unidade",
      "Indicadores consolidados da rede",
    ],
    highlighted: false,
  },
];

export function PricingSection() {
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

      <div className="mt-10 grid gap-5 lg:mt-12 lg:grid-cols-3">
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
                Mais escolhido
              </span>
            )}
            <h3 className="font-[var(--font-display)] text-2xl font-normal text-[#0d1831]">
              {plan.name}
            </h3>
            <p className="mt-1.5 text-xs leading-5 text-[#5f6f87]">{plan.audience}</p>
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
              href="/cadastro"
              variant={plan.highlighted ? "primary" : "secondary"}
            >
              Começar agora
            </ActionLink>
          </Reveal>
        ))}
      </div>

      <p className="mt-6 text-[11px] text-[#98a2b3]">
        Valores de referência, sujeitos a confirmação comercial.
      </p>
    </section>
  );
}
