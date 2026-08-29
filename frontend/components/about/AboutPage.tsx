import Link from "next/link";
import { ConstellationBackground } from "@/components/landing/previews/ConstellationBackground";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SectionLabel } from "@/components/ui/SectionLabel";

const values = [
  {
    title: "Foco no usuário",
    description:
      "Desenvolver soluções considerando as necessidades de gestores, barbeiros e clientes.",
  },
  {
    title: "Simplicidade",
    description:
      "Tornar os processos de gestão mais fáceis, organizados e acessíveis.",
  },
  {
    title: "Inovação",
    description:
      "Usar tecnologia para resolver problemas e melhorar continuamente a experiência.",
  },
  {
    title: "Confiabilidade",
    description:
      "Oferecer uma plataforma estável e consistente para apoiar a operação.",
  },
  {
    title: "Segurança",
    description:
      "Proteger os dados dos usuários, dos estabelecimentos e dos clientes.",
  },
  {
    title: "Eficiência",
    description:
      "Reduzir processos manuais e otimizar o tempo e os recursos das barbearias.",
  },
  {
    title: "Transparência",
    description:
      "Manter relações claras e responsáveis com usuários e parceiros.",
  },
  {
    title: "Evolução contínua",
    description:
      "Usar feedbacks e resultados para aprimorar constantemente o produto.",
  },
  {
    title: "Escalabilidade",
    description:
      "Atender desde pequenos estabelecimentos até operações com várias unidades.",
  },
  {
    title: "Foco no negócio",
    description:
      "Garantir que a tecnologia gere valor para a gestão, a produtividade e o crescimento.",
  },
];

export function AboutPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#101828]">
      <SiteHeader />

      <section className="relative isolate mx-auto flex w-full max-w-[1216px] flex-col justify-center overflow-hidden px-5 py-20 sm:px-6 lg:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            maskImage:
              "radial-gradient(ellipse 55% 75% at 25% 15%, black 35%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 55% 75% at 25% 15%, black 35%, transparent 85%)",
          }}
        >
          <ConstellationBackground className="h-full w-full" />
        </div>

        <SectionLabel>Sobre o LINEUP</SectionLabel>
        <h1 className="mt-5 max-w-5xl font-[var(--font-display)] text-[clamp(3rem,7vw,5.5rem)] leading-[1.05] font-normal tracking-[-0.045em]">
          Uma gestão mais simples para quem vive de{" "}
          <strong className="font-normal text-accent-strong">atender bem.</strong>
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-8 text-[#667085]">
          O LINEUP é um sistema SaaS para administrar a rotina da
          barbearia e reunir as informações essenciais da operação em um só
          lugar.
        </p>
      </section>

      <section
        className="scroll-mt-20 bg-[#f8fafc] px-5 py-20 sm:px-6 lg:py-24"
        id="proposito"
      >
        <div className="mx-auto w-full max-w-[1216px]">
          <SectionLabel>Nosso propósito</SectionLabel>
          <h2 className="mt-5 font-[var(--font-display)] text-[clamp(3.25rem,7vw,5.1rem)] leading-none font-normal tracking-[-0.05em]">
            Propósito
          </h2>
          <p className="mt-6 max-w-4xl text-base leading-8 text-[#667085]">
            Simplificar e modernizar a gestão de barbearias por meio da
            tecnologia, centralizando processos operacionais, administrativos
            e de relacionamento com clientes em uma única plataforma.
          </p>
        </div>
      </section>

      <section className="scroll-mt-20 bg-[#101828] px-5 py-20 text-white sm:px-6 lg:py-24" id="missao">
        <div className="mx-auto w-full max-w-[1216px]">
          <h2 className="font-[var(--font-display)] text-[clamp(3.25rem,7vw,5.1rem)] leading-none font-normal tracking-[-0.05em]">
            Missão
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[#d0d5dd]">
            Oferecer uma plataforma SaaS completa, intuitiva e confiável para
            ajudar profissionais e gestores a otimizar a operação, melhorar o
            relacionamento com clientes e acompanhar o desempenho do negócio.
          </p>
        </div>
      </section>

      <section className="scroll-mt-20 bg-accent px-5 py-20 text-on-accent sm:px-6 lg:py-24" id="visao">
        <div className="mx-auto w-full max-w-[1216px]">
          <h2 className="font-[var(--font-display)] text-[clamp(3.25rem,7vw,5.1rem)] leading-none font-normal tracking-[-0.05em]">
            Visão
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-8 text-on-accent/85">
            Tornar-se uma referência em gestão de barbearias, reconhecida pela
            eficiência, facilidade de uso, inovação e confiabilidade, apoiando
            a digitalização e o crescimento sustentável do segmento.
          </p>
        </div>
      </section>

      <section
        className="scroll-mt-20 px-5 py-20 sm:px-6 lg:py-24"
        id="valores"
      >
        <div className="mx-auto w-full max-w-[1216px]">
          <SectionLabel>O que nos orienta</SectionLabel>
          <h2 className="mt-5 font-[var(--font-display)] text-[clamp(3.25rem,7vw,5.1rem)] leading-none font-normal tracking-[-0.05em]">
            Nossos valores
          </h2>

          <div className="mt-10 border-t border-[#d0d5dd]">
            {values.map((value, index) => (
              <article
                className="grid gap-2 border-b border-[#d0d5dd] py-7 md:grid-cols-[80px_220px_1fr] md:items-center md:gap-8"
                key={value.title}
              >
                <span className="text-xs font-semibold text-[#98a2b3]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xl font-semibold text-[#101828]">
                  {value.title}
                </h3>
                <p className="text-sm leading-7 text-[#667085]">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1216px] flex-col items-start justify-between gap-8 border-t border-[#eaecf0] px-5 py-16 sm:px-6 lg:flex-row lg:items-center">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.1em] text-accent-strong uppercase">
            LINEUP
          </span>
          <h2 className="mt-3 text-[38px] font-bold tracking-[-0.04em]">
            Pronto para organizar sua rotina?
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#667085]">
            Reúna agenda, equipe, clientes e gestão em uma experiência simples.
          </p>
        </div>
        <Link
          href="/cadastro"
          className="shrink-0 rounded-xl bg-accent px-6 py-3.5 text-xs font-semibold text-on-accent transition hover:bg-accent-hover"
        >
          Criar uma conta
        </Link>
      </section>

      <SiteFooter simple />
    </main>
  );
}
