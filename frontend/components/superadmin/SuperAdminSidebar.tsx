"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Users,
  CreditCard,
  FileSignature,
  BarChart3,
  ClipboardList,
  Activity,
  Settings,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { Brand } from "@/components/brand/Brand";

const operationItems = [
  { href: "/superadmin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/superadmin/barbearias", label: "Barbearias", icon: Store },
  { href: "/superadmin/usuarios", label: "Usuários", icon: Users },
  { href: "/superadmin/planos", label: "Planos", icon: CreditCard },
];

const financialItems = [
  { href: "/superadmin/assinaturas", label: "Assinaturas", icon: FileSignature },
];

const intelligenceItems = [{ href: "/superadmin/metricas", label: "Métricas", icon: BarChart3 }];

const relationshipItems = [
  { href: "/superadmin/auditorias", label: "Auditoria", icon: ClipboardList },
  { href: "/superadmin/saude-sistema", label: "Saúde do sistema", icon: Activity },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-[10px] px-2.5 py-2.5 text-[16px] font-bold tracking-[-0.32px] transition ${
        active ? "bg-[#4318ff] text-[#f8f9fa]" : "text-white/60 hover:bg-white/5 hover:text-white/90"
      }`}
    >
      <Icon size={22} strokeWidth={1.8} />
      {label}
    </Link>
  );
}

export function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[298px] flex-col bg-[#101116]">
      <div className="flex h-24 shrink-0 items-center justify-center border-b border-white/10 px-6">
        <Link href="/superadmin/dashboard">
          <Brand light />
        </Link>
      </div>

      <div className="shrink-0 border-b border-white/10 px-9 py-3">
        <p className="text-sm font-medium text-white">Painel da plataforma</p>
        <p className="text-sm text-white/40">Super Admin</p>
      </div>

      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-[30px] pt-3">
        <div className="flex flex-col gap-1.5">
          {operationItems.map((item) => (
            <NavLink key={item.href} {...item} active={pathname === item.href} />
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          {financialItems.map((item) => (
            <NavLink key={item.href} {...item} active={pathname === item.href} />
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          {intelligenceItems.map((item) => (
            <NavLink key={item.href} {...item} active={pathname === item.href} />
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          {relationshipItems.map((item) => (
            <NavLink key={item.href} {...item} active={pathname === item.href} />
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-white/10 px-[30px] py-5">
        <div className="flex flex-col gap-1.5">
          <Link
            href="/superadmin/configuracoes"
            className={`flex items-center gap-3 rounded-[10px] px-2.5 py-2.5 text-[16px] font-bold tracking-[-0.32px] transition ${
              pathname === "/superadmin/configuracoes"
                ? "bg-[#4318ff] text-[#f8f9fa]"
                : "text-white/60 hover:bg-white/5 hover:text-white/90"
            }`}
          >
            <Settings size={22} strokeWidth={1.8} />
            Configurações
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-[10px] px-2.5 py-2.5 text-[16px] font-bold text-white/60 transition hover:bg-white/5 hover:text-white/90"
          >
            <HelpCircle size={22} strokeWidth={1.8} />
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
