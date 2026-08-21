"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

const questions = [
  {
    question: "A Varthex funciona para uma barbearia pequena?",
    answer:
      "Sim. O plano Essencial foi pensado para barbearias com uma unidade, com o necessário para organizar agenda, equipe e comissões desde o primeiro dia.",
  },
  {
    question: "Posso configurar comissões diferentes por profissional?",
    answer:
      "Sim. A regra de comissão é vinculada ao profissional e ao atendimento, reduzindo cálculos manuais e divergências no fim do mês.",
  },
  {
    question: "O cliente consegue fazer o próprio agendamento?",
    answer:
      "Sim. O cliente escolhe serviço, profissional e horário disponível diretamente na plataforma, sem depender de mensagens.",
  },
  {
    question: "A plataforma tem programa de fidelidade?",
    answer:
      "Está no roadmap. Hoje o Varthex já organiza histórico e recorrência de clientes; o programa de fidelidade entra como próxima evolução da plataforma.",
  },
  {
    question: "É possível administrar mais de uma unidade?",
    answer:
      "Sim. A arquitetura considera múltiplas unidades, com dados separados por barbearia e uma visão administrativa consolidada para a rede.",
  },
  {
    question: "Como conheço a plataforma antes de contratar?",
    answer:
      "Você pode criar uma conta e explorar a plataforma diretamente — o cadastro leva poucos minutos e não exige compromisso imediato.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      className="mx-auto w-full max-w-[1216px] scroll-mt-20 px-5 py-16 sm:px-6 lg:py-24"
      id="faq"
    >
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <SectionLabel>Perguntas frequentes</SectionLabel>
          <h2 className="mt-3 font-[var(--font-display)] text-[clamp(2rem,3.5vw,2.75rem)] leading-tight font-normal tracking-[-0.03em]">
            Tudo claro para <span className="text-[#7247f3]">começar.</span>
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-7 text-[#5f6f87]">
            Respostas diretas sobre como o Varthex Barber entra na rotina da
            sua operação.
          </p>
        </Reveal>

        <Reveal className="border-t border-[#e2e7f0]" delay={0.08}>
          {questions.map((item, index) => {
            const expanded = index === openIndex;
            return (
              <article className="border-b border-[#e2e7f0]" key={item.question}>
                <button
                  className="flex min-h-[74px] w-full items-center justify-between gap-5 py-5 text-left text-[15px] font-bold text-[#0d1831]"
                  type="button"
                  onClick={() => setOpenIndex(expanded ? -1 : index)}
                  aria-expanded={expanded}
                >
                  <span>{item.question}</span>
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-lg border transition ${
                      expanded
                        ? "border-[#7247f3] bg-[#eee8ff] text-[#7247f3]"
                        : "border-[#e2e7f0] text-[#0d1831]"
                    }`}
                  >
                    <Plus
                      className={`transition-transform duration-200 ${expanded ? "rotate-45" : ""}`}
                      size={18}
                    />
                  </span>
                </button>
                {expanded && (
                  <p className="pb-6 pr-14 text-[13px] leading-6 text-[#5f6f87]">
                    {item.answer}
                  </p>
                )}
              </article>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
