"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { ChevronDown } from "lucide-react";
import { NotificacoesPopover } from "@/components/layout/NotificacoesPopover";
import { toNotificacao, type NotificationResponse } from "@/lib/notifications";
import { apiFetch } from "@/lib/api";

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

type BarberTopbarProps = {
  title: string;
  breadcrumb: string;
};

export function BarberTopbar({ title, breadcrumb }: BarberTopbarProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [notificacoes, setNotificacoes] = useState<NotificationResponse[]>([]);
  const pathname = usePathname();
  const nome = session?.user?.name ?? session?.user?.email ?? "";
  const iniciais = initialsFor(nome);

  useEffect(() => {
    // Refaz a busca a cada navegação — a página /barbeiro/notificacoes marca
    // itens como lidos por conta própria, e sem isso o badge do sino ficaria
    // com a contagem antiga até um refresh manual (o layout não remonta).
    apiFetch<NotificationResponse[]>("/notifications").then(setNotificacoes).catch(() => {});
  }, [pathname]);

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
        <NotificacoesPopover
          notificacoes={notificacoes.map(toNotificacao)}
          verTudoHref="/barbeiro/notificacoes"
          onMarcarTodas={() => apiFetch("/notifications/read-all", { method: "PATCH" }).catch(() => {})}
        />

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
              {iniciais}
            </span>
            <ChevronDown size={14} className="text-[#98a2b3]" />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 top-full z-20 mt-2 w-44 rounded-[10px] border border-[#e6e4df] bg-white py-1.5 shadow-[0_8px_24px_rgba(13,24,49,0.08)]"
            >
              <Link
                href="/barbeiro/notificacoes"
                role="menuitem"
                className="block px-3.5 py-2 text-[13px] text-[#0d1831] hover:bg-[#f7f6f2]"
                onClick={() => setOpen(false)}
              >
                Notificações
              </Link>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3.5 py-2 text-left text-[13px] text-[#0d1831] hover:bg-[#f7f6f2]"
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
