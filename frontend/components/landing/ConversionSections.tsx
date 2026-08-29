import { Check } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ActionLink } from "@/components/ui/ActionLink";
import { Reveal } from "@/components/ui/Reveal";

const currentFeatures = [
  "Agenda e disponibilidade",
  "Cadastro de clientes",
  "Gestão da equipe",
  "Comissões",
  "Indicadores da operação",
  "Perfis e permissões",
  "Multiunidade",
  "Bloqueios de horário",
  "Histórico de atendimentos",
  "Busca centralizada",
];

const upcomingFeatures = [
  "Estoque",
  "Programa de fidelidade",
  "Google Agenda",
  "Automações inteligentes",
];

const replaces = ["Agenda de papel", "Planilhas", "Mensagens perdidas"];

function FeatureItem({ children, upcoming = false }: { children: string; upcoming?: boolean }) {
  return (
    <span className={`flex items-center gap-2.5 text-xs ${upcoming ? "text-[#8290a2]" : "text-[#4f5d73]"}`}>
      <i className={`grid size-5 place-items-center rounded-full bg-accent text-on-accent ${upcoming ? "opacity-35" : ""}`}>
        <Check size={13} />
      </i>
      {children}
      {upcoming && (
        <em className="rounded-md bg-white/65 px-1.5 py-1 text-[7px] text-[#7d8796] not-italic">Em breve</em>
      )}
    </span>
  );
}

export function FinalSection() {
  return (
    <>
      <section
        className="mx-auto w-full max-w-[1216px] scroll-mt-20 px-5 pt-16 sm:px-6 lg:pt-24"
        id="contato"
      >
        <Reveal>
          <h2 className="max-w-2xl font-[var(--font-display)] text-[clamp(2.25rem,4vw,3.25rem)] leading-tight font-normal tracking-[-0.035em]">
            Proteja sua margem. Reduza o caos.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#5f6f87]">
            O LINEUP mantém sua operação organizada hoje e preparada
            para os próximos passos.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <strong className="mr-1 text-[13px] font-bold text-[#0d1831]">Substitui:</strong>
            {replaces.map((item) => (
              <span className="rounded-md bg-[#f2f0f7] px-2 py-1 text-[11px] text-[#687389]" key={item}>
                {item}
              </span>
            ))}
          </div>

          <div className="mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            <div className="grid gap-3">
              {currentFeatures.slice(0, 5).map((feature) => (
                <FeatureItem key={feature}>{feature}</FeatureItem>
              ))}
            </div>
            <div className="grid gap-3">
              {currentFeatures.slice(5).map((feature) => (
                <FeatureItem key={feature}>{feature}</FeatureItem>
              ))}
            </div>
            <div className="grid gap-3 sm:col-span-2 lg:col-span-1">
              {upcomingFeatures.map((feature) => (
                <FeatureItem upcoming key={feature}>{feature}</FeatureItem>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <ActionLink href="/cadastro">Começar agora</ActionLink>
          </div>
        </Reveal>
      </section>

      <div className="mx-auto w-full max-w-[1216px] px-5 pb-8 sm:px-6 lg:pb-10">
        <SiteFooter />
      </div>
    </>
  );
}
