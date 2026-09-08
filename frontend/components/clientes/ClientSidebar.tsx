"use client";

import { LayoutGrid, CalendarDays, History, UserRound, Settings, HelpCircle } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { PortalSidebar, type PortalNavGroup } from "@/components/layout/PortalSidebar";
import { useMyCustomer } from "./MyCustomerContext";

const groups: PortalNavGroup[] = [
  {
    items: [
      { href: "/clientes/dashboard", label: "Dashboard", icon: LayoutGrid },
      { href: "/clientes/agendamento", label: "Agendar", icon: CalendarDays },
      { href: "/clientes/historico", label: "Histórico", icon: History },
      { href: "/clientes/perfil", label: "Perfil", icon: UserRound },
    ],
  },
];

const bottomLinks = [
  { href: "/clientes/configuracoes", label: "Configurações", icon: Settings },
  { href: "/clientes/ajuda", label: "Ajuda", icon: HelpCircle },
];

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function ClientSidebar() {
  const { data: session } = useSession();
  const { customer } = useMyCustomer();

  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";

  return (
    <PortalSidebar
      homeHref="/clientes/dashboard"
      subtitleLine1={customer?.tenantName ?? "LINEUP"}
      subtitleLine2="Portal do cliente"
      groups={groups}
      bottomLinks={bottomLinks}
      user={{ initials: initialsFor(name || email), name: name || email, email }}
      activeColor="#2563eb"
      theme="light"
      profileHref="/clientes/perfil"
      onLogoutClick={() => signOut({ callbackUrl: "/login" })}
    />
  );
}
