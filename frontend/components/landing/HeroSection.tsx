import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ActionLink } from "@/components/ui/ActionLink";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { DashboardPreview } from "./previews/DashboardPreview";

export function HeroSection() {
  return (
    <section
      className="relative mx-auto w-full max-w-[1216px] scroll-mt-20 px-5 pt-16 pb-16 sm:px-6 lg:pt-20 lg:pb-20"
      id="inicio"
    >
      <div className="mx-auto max-w-2xl text-center">
        <Reveal className="flex justify-center">
          <SectionLabel>Gestão de barbearias</SectionLabel>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-6 font-[var(--font-display)] text-[clamp(2.75rem,5.2vw,4.25rem)] leading-[1.02] font-normal tracking-[-0.04em] text-balance">
            Sua barbearia.
            <br />
            Sob controle.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#5f6f87]">
            Agenda, equipe, clientes e comissões em um só lugar — simples de
            configurar, fácil de usar todos os dias.
          </p>
        </Reveal>
        <Reveal
          className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row"
          delay={0.15}
        >
          <ActionLink href="/cadastro">Começar agora</ActionLink>
          <Link
            href="#recursos"
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-[#0d1831] transition hover:text-[#7247f3]"
          >
            Ver como funciona
            <ArrowRight className="transition group-hover:translate-x-0.5" size={16} />
          </Link>
        </Reveal>
      </div>

      <Reveal className="mt-14 lg:mt-16" delay={0.2}>
        <DashboardPreview className="mx-auto max-w-[980px]" />
      </Reveal>
    </section>
  );
}
