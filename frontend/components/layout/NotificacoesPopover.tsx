"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, Check } from "lucide-react";

/**
 * Sino + painel de notificações dos topbars.
 *
 * É popover, não modal: notificação é informação periférica — prender o
 * foco e escurecer a tela para lê-la seria desproporcional.
 */

export type Notificacao = {
  id: string;
  titulo: string;
  detalhe: string;
  quando: string;
  tone?: "neutro" | "positivo" | "negativo" | "atencao";
  lida?: boolean;
  href?: string;
};

const toneDot: Record<NonNullable<Notificacao["tone"]>, string> = {
  neutro: "#98a2b3",
  positivo: "#27865b",
  negativo: "#c84a4a",
  atencao: "#d28b27",
};

export function NotificacoesPopover({
  notificacoes,
  verTudoHref,
}: {
  notificacoes: Notificacao[];
  verTudoHref?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [lidas, setLidas] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const naoLidas = notificacoes.filter((n) => !n.lida && !lidas.includes(n.id));

  useEffect(() => {
    if (!aberto) return;
    function onClickFora(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setAberto(false);
    }
    function onEsc(event: KeyboardEvent) {
      if (event.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", onClickFora);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickFora);
      document.removeEventListener("keydown", onEsc);
    };
  }, [aberto]);

  return (
    /* Sem `relative` no mobile de propósito: assim o painel ancora no
       <header> sticky (sticky é posicionado), e `top-full` cai logo
       abaixo dele sem depender de altura fixa — que varia por breakpoint
       (medido: 98px no mobile, ~58 no desktop). */
    <div className="sm:relative" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-haspopup="menu"
        aria-label={
          naoLidas.length > 0
            ? `Notificações: ${naoLidas.length} não lidas`
            : "Notificações"
        }
        className="relative grid size-9 place-items-center rounded-[8px] text-[#5f6f87] transition hover:bg-[#f7f6f2]"
      >
        <Bell size={18} strokeWidth={1.8} />
        {naoLidas.length > 0 && (
          <span className="absolute right-1.5 top-1.5 grid min-w-[15px] place-items-center rounded-full bg-[#c84a4a] px-1 text-[9px] font-bold leading-[15px] text-white">
            {naoLidas.length}
          </span>
        )}
      </button>

      {aberto && (
        <div
          role="menu"
          aria-label="Notificações"
          /* Mobile: ancorado no header, ocupa a largura toda com margem.
             Preso ao sino, um painel de 320px começava fora da tela pela
             esquerda (medido: left -48px). De sm pra cima cabe, e ele
             volta a sair do sino. */
          className="absolute inset-x-3 top-full z-30 mt-2 overflow-hidden rounded-[10px] border border-[#e6e4df] bg-white shadow-[0_12px_32px_rgba(13,24,49,0.14)] sm:inset-x-auto sm:right-0 sm:w-80"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[#eef0f3] px-4 py-3">
            <p className="text-sm font-bold text-[#0d1831]">Notificações</p>
            {naoLidas.length > 0 && (
              <button
                type="button"
                onClick={() => setLidas(notificacoes.map((n) => n.id))}
                className="flex items-center gap-1 text-xs font-bold text-[#7247f3] transition hover:text-[#5c2ee0]"
              >
                <Check size={13} strokeWidth={2.5} />
                Marcar todas
              </button>
            )}
          </div>

          <ul className="max-h-80 overflow-y-auto">
            {notificacoes.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-[#98a2b3]">
                Nenhuma notificação por aqui.
              </li>
            )}
            {notificacoes.map((n) => {
              const lida = n.lida || lidas.includes(n.id);
              return (
                <li key={n.id} className="border-b border-[#eef0f3] last:border-none">
                  <div className={`flex gap-3 px-4 py-3 ${lida ? "opacity-55" : ""}`}>
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: toneDot[n.tone ?? "neutro"] }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#0d1831]">{n.titulo}</p>
                      <p className="mt-0.5 text-xs text-[#5f6f87]">{n.detalhe}</p>
                      <p className="mt-1 text-[11px] text-[#98a2b3]">{n.quando}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {verTudoHref && (
            <Link
              href={verTudoHref}
              onClick={() => setAberto(false)}
              className="block border-t border-[#eef0f3] px-4 py-3 text-center text-xs font-bold text-[#7247f3] transition hover:bg-[#f7f6f2]"
            >
              Ver todas as notificações
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
