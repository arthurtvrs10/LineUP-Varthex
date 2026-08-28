"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { NotificacoesPopover, type Notificacao } from "@/components/layout/NotificacoesPopover";

const notificacoes: Notificacao[] = [
  {
    id: "a1",
    titulo: "Novo agendamento",
    detalhe: "Rafael Costa marcou corte degradê com Lucas às 10:30.",
    quando: "há 8 min",
    tone: "positivo",
  },
  {
    id: "a2",
    titulo: "Estoque baixo",
    detalhe: "Cera de acabamento mate: 2 unidades (mínimo 5).",
    quando: "há 40 min",
    tone: "atencao",
  },
  {
    id: "a3",
    titulo: "Cancelamento",
    detalhe: "Mateus Rodrigues cancelou o horário das 16:00.",
    quando: "há 2 h",
    tone: "negativo",
  },
  {
    id: "a4",
    titulo: "Nova avaliação",
    detalhe: "João Silva deixou 5 estrelas para Lucas Oliveira.",
    quando: "ontem",
    tone: "positivo",
    lida: true,
  },
];

type AdminTopbarProps = {
  title: string;
  breadcrumb: string;
};

export function AdminTopbar({ title, breadcrumb }: AdminTopbarProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e6e4df] bg-white py-2.5 pr-4 pl-4 lg:pl-7">
      <div className="pl-10 lg:pl-0">
        <p className="text-[11px] text-[#98a2b3]">
          Pages <span className="text-[#5f6f87]">/ {breadcrumb}</span>
        </p>
        <p className="text-sm font-bold text-[#0d1831]">{title}</p>
      </div>

      <div className="flex items-center gap-2">
        <NotificacoesPopover notificacoes={notificacoes} />

        <span className="h-8 w-px bg-[#e6e4df]" />

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-[8px] px-2 py-1 transition hover:bg-[#f7f6f2]"
          >
            <span className="grid size-8 place-items-center rounded-full bg-[#fdf3e3] text-xs font-semibold text-[#d28b27]">
              RM
            </span>
            <ChevronDown size={14} className="text-[#98a2b3]" />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 top-full z-20 mt-2 w-44 rounded-[10px] border border-[#e6e4df] bg-white py-1.5 shadow-[0_8px_24px_rgba(13,24,49,0.08)]"
            >
              <Link
                href="/admin/dashboard"
                role="menuitem"
                className="block px-3.5 py-2 text-[13px] text-[#0d1831] hover:bg-[#f7f6f2]"
                onClick={() => setOpen(false)}
              >
                Visão Geral
              </Link>
              <Link
                href="/"
                role="menuitem"
                className="block px-3.5 py-2 text-[13px] text-[#0d1831] hover:bg-[#f7f6f2]"
                onClick={() => setOpen(false)}
              >
                Sair
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
