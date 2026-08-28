"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { NotificacoesPopover, type Notificacao } from "@/components/layout/NotificacoesPopover";

const notificacoes: Notificacao[] = [
  {
    id: "n1",
    titulo: "Falha na sincronização",
    detalhe: "3 agendamentos não sincronizaram na Barbearia Estilo Único.",
    quando: "há 12 min",
    tone: "negativo",
  },
  {
    id: "n2",
    titulo: "5 barbearias aguardam verificação",
    detalhe: "Cadastros pendentes de validação de dados.",
    quando: "há 1 h",
    tone: "atencao",
  },
  {
    id: "n3",
    titulo: "Worker de agendamentos degradado",
    detalhe: "Latência acima de 250ms por 15 minutos.",
    quando: "há 3 h",
    tone: "atencao",
  },
  {
    id: "n4",
    titulo: "Pagamento confirmado",
    detalhe: "BarberKing Premium regularizou a fatura em atraso.",
    quando: "ontem",
    tone: "positivo",
    lida: true,
  },
];

type SuperAdminTopbarProps = {
  title: string;
  breadcrumb: string;
};

export function SuperAdminTopbar({ title, breadcrumb }: SuperAdminTopbarProps) {
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
                href="/superadmin/dashboard"
                role="menuitem"
                className="block px-3.5 py-2 text-[13px] text-[#0d1831] hover:bg-[#f7f6f2]"
                onClick={() => setOpen(false)}
              >
                Dashboard
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
