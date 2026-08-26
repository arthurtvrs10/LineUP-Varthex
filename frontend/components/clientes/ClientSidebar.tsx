"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CalendarDays,
  History,
  UserRound,
  Settings,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { Brand } from "@/components/brand/Brand";

const navItems = [
  { href: "/clientes/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/clientes/agendamento", label: "Agendar", icon: CalendarDays },
  { href: "/clientes/historico", label: "Histórico", icon: History },
  { href: "/clientes/perfil", label: "Perfil", icon: UserRound },
];

export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[298px] flex-col bg-[#101116]">
      <div className="flex h-24 shrink-0 items-center justify-center border-b border-white/10 px-6">
        <Link href="/clientes/dashboard">
          <Brand light />
        </Link>
      </div>

      <div className="shrink-0 border-b border-white/10 px-9 py-3">
        <p className="text-sm font-medium text-white">Barbearia Estilo Único</p>
        <p className="text-sm text-white/40">Unidade</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-[30px] pt-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-[10px] px-2.5 py-2.5 text-[15px] font-bold tracking-[-0.32px] transition ${
                active
                  ? "bg-[#4318ff] text-[#f8f9fa]"
                  : "text-white/60 hover:bg-white/5 hover:text-white/90"
              }`}
            >
              <Icon size={20} strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-white/10 px-[30px] py-5">
        <div className="flex flex-col gap-1.5">
          <Link
            href="#"
            className="flex items-center gap-3 rounded-[10px] px-2.5 py-2.5 text-[15px] font-bold text-white/60 transition hover:bg-white/5 hover:text-white/90"
          >
            <Settings size={20} strokeWidth={1.8} />
            Configurações
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-[10px] px-2.5 py-2.5 text-[15px] font-bold text-white/60 transition hover:bg-white/5 hover:text-white/90"
          >
            <HelpCircle size={20} strokeWidth={1.8} />
            Ajuda
          </Link>
        </div>

        <div className="mt-3 flex items-center gap-2.5 rounded-[10px] py-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#fdf3e3] text-xs font-semibold text-[#d28b27]">
            RM
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">Rafael Mendes</p>
            <p className="truncate text-xs text-white/40">admin@varthex.com</p>
          </div>
          <ChevronDown size={14} className="shrink-0 text-white/40" />
        </div>
      </div>
    </aside>
  );
}
