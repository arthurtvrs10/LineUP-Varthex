import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { AgendaPreview } from "./previews/AgendaPreview";
import { ClientsPreview } from "./previews/ClientsPreview";
import { TeamPreview } from "./previews/TeamPreview";

type FeatureRowProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  reverse?: boolean;
  children: ReactNode;
};

function FeatureRow({
  eyebrow,
  title,
  description,
  bullets,
  reverse = false,
  children,
}: FeatureRowProps) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={reverse ? "lg:order-2" : ""}>
        <span className="text-[11px] font-bold tracking-[0.1em] text-accent-strong uppercase">
          {eyebrow}
        </span>
        <h3 className="mt-3 font-[var(--font-display)] text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-normal tracking-[-0.02em]">
          {title}
        </h3>
        <p className="mt-3 max-w-md text-[15px] leading-7 text-[#5f6f87]">{description}</p>
        <ul className="mt-5 grid gap-2.5">
          {bullets.map((item) => (
            <li className="flex items-start gap-2.5 text-[13px] text-[#4f5e73]" key={item}>
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className={reverse ? "lg:order-1" : ""}>{children}</div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section
      className="mx-auto w-full max-w-[1216px] scroll-mt-20 px-5 py-16 sm:px-6 lg:py-24"
      id="recursos"
    >
      <Reveal className="max-w-2xl">
        <SectionLabel>Recursos</SectionLabel>
        <h2 className="mt-3 font-[var(--font-display)] text-[clamp(2rem,3.5vw,2.75rem)] leading-tight font-normal tracking-[-0.03em]">
          Tudo que a operação precisa, em um só lugar.
        </h2>
      </Reveal>

      <div className="mt-14 space-y-16 lg:mt-16 lg:space-y-24">
        <Reveal>
          <FeatureRow
            bullets={[
              "Agenda individual por profissional",
              "Bloqueios e regras de horário",
              "Cliente agenda sozinho, sem trocar mensagens",
            ]}
            description="Disponibilidade, bloqueios, encaixes e próximos atendimentos organizados para toda a equipe."
            eyebrow="Agenda"
            title="Domine sua agenda."
          >
            <AgendaPreview />
          </FeatureRow>
        </Reveal>

        <Reveal>
          <FeatureRow
            bullets={[
              "Comissão calculada por atendimento",
              "Produtividade e ocupação por profissional",
              "Sem planilha paralela no fim do mês",
            ]}
            description="Veja produtividade, ocupação e valores por profissional sem recalcular nada manualmente."
            eyebrow="Equipe e comissões"
            reverse
            title="Comissões sem confusão."
          >
            <TeamPreview />
          </FeatureRow>
        </Reveal>

        <Reveal>
          <FeatureRow
            bullets={[
              "Histórico completo por cliente",
              "Alertas de recorrência e retorno",
              "Base centralizada, sem caderno",
            ]}
            description="Histórico, recorrência e lembretes para transformar um bom atendimento em relacionamento."
            eyebrow="Clientes"
            title="Clientes por perto."
          >
            <ClientsPreview />
          </FeatureRow>
        </Reveal>
      </div>
    </section>
  );
}
