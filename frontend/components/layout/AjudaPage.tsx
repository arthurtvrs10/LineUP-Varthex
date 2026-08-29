"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, LifeBuoy, Mail, MessageCircle } from "lucide-react";

export type FaqItem = {
  pergunta: string;
  resposta: string;
};

export type AtalhoAjuda = {
  label: string;
  href: string;
};

type AjudaPageProps = {
  descricao: string;
  faq: FaqItem[];
  atalhos?: AtalhoAjuda[];
  emailSuporte?: string;
};

function FaqRow({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const painelId = `faq-painel-${index}`;

  return (
    <div className="border-b border-[#eef0f3] last:border-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={painelId}
        className="flex w-full items-center justify-between gap-4 py-4 text-left transition hover:text-[#7247f3]"
      >
        <span className="text-sm font-bold text-[#0d1831]">{item.pergunta}</span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`shrink-0 text-[#98a2b3] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p id={painelId} className="pb-4 text-sm leading-relaxed text-[#5f6f87]">
          {item.resposta}
        </p>
      )}
    </div>
  );
}

export function AjudaPage({
  descricao,
  faq,
  atalhos = [],
  emailSuporte = "suporte@lineup.com",
}: AjudaPageProps) {
  return (
    <div className="flex w-full flex-col gap-5">
      <section className="rounded-[12px] border border-[#e6e4df] bg-white p-6">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-[#ede9fd] text-[#7247f3]">
            <LifeBuoy size={22} strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-[#0d1831]">Como podemos ajudar?</h2>
            <p className="mt-1 text-sm text-[#5f6f87]">{descricao}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <section className="min-w-0 rounded-[12px] border border-[#e6e4df] bg-white p-6">
          <h2 className="text-base font-bold text-[#0d1831]">Perguntas frequentes</h2>
          <div className="mt-2 flex flex-col">
            {faq.map((item, i) => (
              <FaqRow key={item.pergunta} item={item} index={i} />
            ))}
          </div>
        </section>

        <div className="flex min-w-0 flex-col gap-5">
          <section className="rounded-[12px] border border-[#e6e4df] bg-white p-6">
            <h2 className="text-base font-bold text-[#0d1831]">Falar com o suporte</h2>
            <p className="mt-1 text-xs text-[#5f6f87]">
              Respondemos em até 1 dia útil, de segunda a sexta.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={`mailto:${emailSuporte}`}
                className="flex items-center gap-2.5 rounded-[10px] border border-[#e6e4df] px-3.5 py-2.5 text-sm text-[#0d1831] transition hover:bg-[#f7f6f2]"
              >
                <Mail size={15} strokeWidth={1.8} className="text-[#98a2b3]" />
                {emailSuporte}
              </a>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-[10px] bg-[#7247f3] px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-[#5c2ee0]"
              >
                <MessageCircle size={15} strokeWidth={2} />
                Abrir conversa
              </button>
            </div>
          </section>

          {atalhos.length > 0 && (
            <section className="rounded-[12px] border border-[#e6e4df] bg-white p-6">
              <h2 className="text-base font-bold text-[#0d1831]">Atalhos úteis</h2>
              <ul className="mt-3 flex flex-col">
                {atalhos.map((atalho) => (
                  <li key={atalho.href} className="border-b border-[#eef0f3] last:border-none">
                    <Link
                      href={atalho.href}
                      className="block py-2.5 text-sm text-[#5f6f87] transition hover:text-[#7247f3]"
                    >
                      {atalho.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
