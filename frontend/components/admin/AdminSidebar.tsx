"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutGrid,
  CalendarDays,
  Users,
  UserCheck,
  Scissors,
  Wallet,
  Package,
  Gift,
  MessageSquare,
  Star,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";
import { PortalSidebar, type PortalNavGroup } from "@/components/layout/PortalSidebar";
import { apiFetch } from "@/lib/api";

const groups: PortalNavGroup[] = [
  {
    label: "Operação",
    items: [
      { href: "/admin/dashboard", label: "Visão Geral", icon: LayoutGrid },
      { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
      { href: "/admin/clientes", label: "Clientes", icon: Users },
      { href: "/admin/equipe", label: "Equipe", icon: UserCheck },
      { href: "/admin/servicos", label: "Serviços", icon: Scissors },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { href: "/admin/financeiro", label: "Financeiro", icon: Wallet },
      { href: "/admin/estoque", label: "Estoque", icon: Package },
    ],
  },
  {
    label: "Relacionamento",
    items: [
      { href: "/admin/fidelidade", label: "Fidelidade", icon: Gift },
      { href: "/admin/crm", label: "CRM & WhatsApp", icon: MessageSquare },
      { href: "/admin/avaliacoes", label: "Avaliações", icon: Star },
    ],
  },
  {
    label: "Inteligência",
    items: [{ href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 }],
  },
];

const bottomLinks = [
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { href: "/admin/ajuda", label: "Ajuda", icon: HelpCircle },
];

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function AdminSidebar() {
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
      homeHref="/admin/dashboard"
      subtitleLine1={tenantName ?? "LINEUP"}
      subtitleLine2="Unidade"
      groups={groups}
      bottomLinks={bottomLinks}
      user={{ initials: initialsFor(name || email), name: name || email, email, avatarUrl: photoData }}
      activeColor="#2563eb"
      theme="light"
      profileHref="/admin/configuracoes"
      onLogoutClick={() => signOut({ callbackUrl: "/login" })}
    />
  );
}
