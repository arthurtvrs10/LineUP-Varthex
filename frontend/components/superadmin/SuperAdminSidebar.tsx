"use client";

import { useSession, signOut } from "next-auth/react";
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
} from "lucide-react";
import { PortalSidebar, type PortalNavGroup } from "@/components/layout/PortalSidebar";

const groups: PortalNavGroup[] = [
  {
    items: [
      { href: "/superadmin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/superadmin/barbearias", label: "Barbearias", icon: Store },
      { href: "/superadmin/usuarios", label: "Usuários", icon: Users },
      { href: "/superadmin/planos", label: "Planos", icon: CreditCard },
    ],
  },
  {
    items: [{ href: "/superadmin/assinaturas", label: "Assinaturas", icon: FileSignature }],
  },
  {
    items: [{ href: "/superadmin/metricas", label: "Métricas", icon: BarChart3 }],
  },
  {
    items: [
      { href: "/superadmin/auditorias", label: "Auditoria", icon: ClipboardList },
      { href: "/superadmin/saude-sistema", label: "Saúde do sistema", icon: Activity },
    ],
  },
];

const bottomLinks = [
  { href: "/superadmin/configuracoes", label: "Configurações", icon: Settings },
  { href: "/superadmin/ajuda", label: "Ajuda", icon: HelpCircle },
];

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function SuperAdminSidebar() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";

  return (
    <PortalSidebar
      homeHref="/superadmin/dashboard"
      subtitleLine1="Painel da plataforma"
      subtitleLine2="Super Admin"
      groups={groups}
      bottomLinks={bottomLinks}
      user={{ initials: initialsFor(name || email), name: name || email, email }}
      activeColor="#2563eb"
      theme="light"
      profileHref="/superadmin/configuracoes"
      onLogoutClick={() => signOut({ callbackUrl: "/login" })}
    />
  );
}
