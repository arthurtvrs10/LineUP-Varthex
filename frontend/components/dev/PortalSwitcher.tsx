"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, LayoutGrid, Scissors, ShieldCheck, Store, UserRound, X } from "lucide-react";

/**
 * ────────────────────────────────────────────────────────────────
 *  AID DE DEMONSTRAÇÃO — não é um recurso de produto.
 *
 *  Atalho para navegar entre os quatro portais ao apresentar o
 *  sistema. Num produto real um admin não "vira" cliente: quando
 *  houver autenticação, a navegação entre papéis deve respeitar
 *  permissão. Para esconder em produção, basta deixar de montar
 *  este componente nos Shells (ou envolver o return num guard de
 *  ambiente) — ele é o único ponto a mudar.
 * ────────────────────────────────────────────────────────────────
 */

type Portal = {
  label: string;
  descricao: string;
  href: string;
  prefixo: string;
  icon: typeof Store;
};

const portais: Portal[] = [
  {
    label: "Super Admin",
    descricao: "Plataforma",
    href: "/superadmin/dashboard",
    prefixo: "/superadmin",
    icon: ShieldCheck,
  },
  {
    label: "Admin",
    descricao: "Barbearia",
    href: "/admin/dashboard",
    prefixo: "/admin",
    icon: Store,
  },
  {
    label: "Barbeiro",
    descricao: "Profissional",
    href: "/barbeiro/dashboard",
    prefixo: "/barbeiro",
    icon: Scissors,
  },
  {
    label: "Cliente",
    descricao: "Minha área",
    href: "/clientes/dashboard",
    prefixo: "/clientes",
    icon: UserRound,
  },
];

export function PortalSwitcher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const atual = portais.find((p) => pathname?.startsWith(p.prefixo));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className="fixed right-4 top-1/2 z-40 -translate-y-1/2">
      {open && (
        <div
          role="menu"
          aria-label="Trocar de painel"
          className="absolute right-0 top-1/2 w-60 -translate-y-1/2 overflow-hidden rounded-[12px] border border-[#e6e4df] bg-white shadow-[0_12px_32px_rgba(13,24,49,0.14)]"
        >
          <div className="flex items-center justify-between border-b border-[#eef0f3] px-3.5 py-2.5">
            <div>
              <p className="text-[13px] font-bold text-[#0d1831]">Trocar de painel</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#98a2b3]">
                Modo demonstração
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar seletor de painel"
              className="grid size-6 place-items-center rounded-[6px] text-[#98a2b3] transition hover:bg-[#f7f6f2] hover:text-[#0d1831]"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>

          <ul className="p-1.5">
            {portais.map((portal) => {
              const Icon = portal.icon;
              const ativo = portal.prefixo === atual?.prefixo;
              return (
                <li key={portal.prefixo}>
                  <Link
                    href={portal.href}
                    role="menuitem"
                    aria-current={ativo ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 transition ${
                      ativo ? "bg-accent-subtle" : "hover:bg-[#f7f6f2]"
                    }`}
                  >
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-[7px] ${
                        ativo ? "bg-accent text-on-accent" : "bg-[#f0efea] text-[#5f6f87]"
                      }`}
                    >
                      <Icon size={15} strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-[13px] font-bold ${
                          ativo ? "text-accent-strong" : "text-[#0d1831]"
                        }`}
                      >
                        {portal.label}
                      </span>
                      <span className="block truncate text-[11px] text-[#98a2b3]">
                        {portal.descricao}
                      </span>
                    </span>
                    {ativo && <Check size={14} strokeWidth={2.5} className="shrink-0 text-accent-strong" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        title={atual ? `Painel ${atual.label} — trocar` : "Trocar de painel"}
        className={`grid size-11 place-items-center rounded-full border border-[#e6e4df] bg-white text-[#5f6f87] shadow-[0_6px_20px_rgba(13,24,49,0.12)] transition hover:text-accent-strong ${
          open ? "opacity-0" : "opacity-100"
        }`}
      >
        <LayoutGrid size={19} strokeWidth={1.8} />
        <span className="sr-only">
          {atual ? `Painel atual: ${atual.label}. Trocar de painel` : "Trocar de painel"}
        </span>
      </button>
    </div>
  );
}
