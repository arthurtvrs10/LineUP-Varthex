"use client";

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

export function AdminSidebar() {
  return (
    <PortalSidebar
      homeHref="/admin/dashboard"
      subtitleLine1="Barbearia Estilo Único"
      subtitleLine2="Unidade"
      groups={groups}
      bottomLinks={bottomLinks}
      user={{ initials: "RM", name: "Rafael Mendes", email: "admin@lineup.com" }}
      activeColor="#2563eb"
      theme="light"
      profileHref="/admin/configuracoes"
    />
  );
}
