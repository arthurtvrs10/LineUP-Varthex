import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SectionLabel } from "@/components/ui/SectionLabel";

type LegalSection = {
  title: string;
  paragraphs: string[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
};

export function LegalPage({
  eyebrow,
  title,
  updatedAt,
  intro,
  sections,
}: LegalPageProps) {
  return (
    <main className="min-h-screen bg-white text-[#101828]">
      <SiteHeader />

      <section className="mx-auto w-full max-w-[840px] px-5 py-16 sm:px-6 lg:py-20">
        <SectionLabel>{eyebrow}</SectionLabel>
        <h1 className="mt-5 font-[var(--font-display)] text-[clamp(2.25rem,5vw,3.25rem)] leading-tight font-normal tracking-[-0.03em]">
          {title}
        </h1>
        <p className="mt-3 text-xs font-semibold tracking-[0.08em] text-[#98a2b3] uppercase">
          Última atualização em {updatedAt}
        </p>
        <p className="mt-6 text-[15px] leading-8 text-[#667085]">{intro}</p>

        <div className="mt-12 grid gap-10">
          {sections.map((section, index) => (
            <article key={section.title}>
              <h2 className="text-lg font-bold text-[#101828]">
                <span className="mr-2 text-[#7247f3]">
                  {String(index + 1).padStart(2, "0")}.
                </span>
                {section.title}
              </h2>
              <div className="mt-3 grid gap-3">
                {section.paragraphs.map((paragraph) => (
                  <p className="text-sm leading-7 text-[#667085]" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-14 border-t border-[#eaecf0] pt-8 text-sm leading-7 text-[#667085]">
          Dúvidas sobre este documento? Fale com a gente pela{" "}
          <Link className="font-semibold text-[#7247f3] hover:underline" href="/#faq">
            central de ajuda
          </Link>
          .
        </p>
      </section>

      <SiteFooter simple />
    </main>
  );
}
