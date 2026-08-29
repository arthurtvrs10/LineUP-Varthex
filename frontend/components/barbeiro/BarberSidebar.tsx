"use client";

import {
  LayoutGrid,
  CalendarDays,
  Users,
  Grid2x2,
  ListOrdered,
  Wallet,
  Bell,
  Settings,
  HelpCircle,
} from "lucide-react";
import { PortalSidebar, type PortalNavGroup } from "@/components/layout/PortalSidebar";

const groups: PortalNavGroup[] = [
  {
    items: [
      { href: "/barbeiro/dashboard", label: "Dashboard", icon: LayoutGrid },
      { href: "/barbeiro/agenda", label: "Agenda", icon: CalendarDays },
      { href: "/barbeiro/clientes", label: "Clientes", icon: Users },
      { href: "/barbeiro/disponibilidade", label: "Disponibilidade", icon: Grid2x2 },
      { href: "/barbeiro/fila-de-espera", label: "Fila de espera", icon: ListOrdered },
    ],
  },
  {
    items: [
      { href: "/barbeiro/comissoes", label: "Comissões", icon: Wallet },
      { href: "/barbeiro/notificacoes", label: "Notificações", icon: Bell },
    ],
  },
];

const bottomLinks = [
  { href: "/barbeiro/configuracoes", label: "Configurações", icon: Settings },
  { href: "/barbeiro/ajuda", label: "Ajuda", icon: HelpCircle },
];

export function BarberSidebar() {
  return (
    <PortalSidebar
      homeHref="/barbeiro/dashboard"
      subtitleLine1="Barbearia Estilo Único"
      subtitleLine2="Unidade"
      groups={groups}
      bottomLinks={bottomLinks}
      user={{ initials: "PR", name: "Paulo Roberto", email: "barber@lineup.com" }}
      activeColor="#7247f3"
      theme="light"
      profileHref="/barbeiro/configuracoes"
    />
  );
}
