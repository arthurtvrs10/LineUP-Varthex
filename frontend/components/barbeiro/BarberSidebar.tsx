"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
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
import { apiFetch } from "@/lib/api";

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

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function BarberSidebar() {
  const { data: session } = useSession();
  const [tenantName, setTenantName] = useState<string>();
  const [photoData, setPhotoData] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ tradeName: string }>("/tenant").then((t) => setTenantName(t.tradeName)).catch(() => {});
    apiFetch<{ photoData: string | null }>("/users/me").then((me) => setPhotoData(me.photoData)).catch(() => {});
  }, []);

  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";

  return (
    <PortalSidebar
      homeHref="/barbeiro/dashboard"
      subtitleLine1={tenantName ?? "LINEUP"}
      subtitleLine2="Unidade"
      groups={groups}
      bottomLinks={bottomLinks}
      user={{ initials: initialsFor(name || email), name: name || email, email, avatarUrl: photoData }}
      activeColor="#2563eb"
      theme="light"
      profileHref="/barbeiro/configuracoes"
      onLogoutClick={() => signOut({ callbackUrl: "/login" })}
    />
  );
}
