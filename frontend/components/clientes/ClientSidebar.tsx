"use client";

import { LayoutGrid, CalendarDays, History, UserRound, Settings, HelpCircle } from "lucide-react";
import { PortalSidebar, type PortalNavGroup } from "@/components/layout/PortalSidebar";

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
  { href: "#", label: "Configurações", icon: Settings },
  { href: "#", label: "Ajuda", icon: HelpCircle },
];

export function ClientSidebar() {
  return (
    <PortalSidebar
      homeHref="/clientes/dashboard"
      subtitleLine1="Barbearia Estilo Único"
      subtitleLine2="Unidade"
      groups={groups}
      bottomLinks={bottomLinks}
      user={{ initials: "RM", name: "Rafael Mendes", email: "admin@varthex.com" }}
    />
  );
}
