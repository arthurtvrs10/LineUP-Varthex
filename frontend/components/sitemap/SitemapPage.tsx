import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileSignature,
  Gift,
  Grid2x2,
  HelpCircle,
  Info,
  KeyRound,
  LayoutGrid,
  ListOrdered,
  LogIn,
  MessageSquare,
  Package,
  Scissors,
  Settings,
  ShieldCheck,
  Star,
  Store,
  UserCheck,
  UserPlus,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SectionLabel } from "@/components/ui/SectionLabel";

type MapaLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type MapaGrupo = {
  title: string;
  nota?: string;
  links: MapaLink[];
};

const grupos: MapaGrupo[] = [
  {
    title: "Institucional",
    links: [
      { label: "Início", href: "/", icon: LayoutGrid },
      { label: "Recursos", href: "/#recursos", icon: Star },
      { label: "Para quem", href: "/#publicos", icon: Users },
      { label: "Planos", href: "/#planos", icon: CreditCard },
      { label: "Sobre nós", href: "/sobre-nos", icon: Info },
      { label: "Central de ajuda", href: "/#faq", icon: HelpCircle },
    ],
  },
  {
    title: "Conta",
    links: [
      { label: "Entrar", href: "/login", icon: LogIn },
      { label: "Criar conta", href: "/cadastro", icon: UserPlus },
      { label: "Esqueceu a senha", href: "/esqueceu-senha", icon: KeyRound },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Política de privacidade", href: "/privacidade", icon: ShieldCheck },
      { label: "Termos de uso", href: "/termos", icon: FileSignature },
    ],
  },
  {
    title: "Painel Admin",
    nota: "Requer login como administrador da barbearia",
    links: [
      { label: "Visão geral", href: "/admin/dashboard", icon: LayoutGrid },
      { label: "Agenda", href: "/admin/agenda", icon: CalendarDays },
      { label: "Clientes", href: "/admin/clientes", icon: Users },
      { label: "Equipe", href: "/admin/equipe", icon: UserCheck },
      { label: "Serviços", href: "/admin/servicos", icon: Scissors },
      { label: "Financeiro", href: "/admin/financeiro", icon: Wallet },
      { label: "Estoque", href: "/admin/estoque", icon: Package },
      { label: "Fidelidade", href: "/admin/fidelidade", icon: Gift },
      { label: "CRM & WhatsApp", href: "/admin/crm", icon: MessageSquare },
      { label: "Avaliações", href: "/admin/avaliacoes", icon: Star },
      { label: "Relatórios", href: "/admin/relatorios", icon: BarChart3 },
      { label: "Configurações", href: "/admin/configuracoes", icon: Settings },
      { label: "Ajuda", href: "/admin/ajuda", icon: HelpCircle },
    ],
  },
  {
    title: "Painel Barbeiro",
    nota: "Requer login como profissional",
    links: [
      { label: "Dashboard", href: "/barbeiro/dashboard", icon: LayoutGrid },
      { label: "Agenda", href: "/barbeiro/agenda", icon: CalendarDays },
      { label: "Clientes", href: "/barbeiro/clientes", icon: Users },
      { label: "Disponibilidade", href: "/barbeiro/disponibilidade", icon: Grid2x2 },
      { label: "Fila de espera", href: "/barbeiro/fila-de-espera", icon: ListOrdered },
      { label: "Comissões", href: "/barbeiro/comissoes", icon: Wallet },
      { label: "Notificações", href: "/barbeiro/notificacoes", icon: Bell },
      { label: "Configurações", href: "/barbeiro/configuracoes", icon: Settings },
      { label: "Ajuda", href: "/barbeiro/ajuda", icon: HelpCircle },
    ],
  },
  {
    title: "Portal do cliente",
    nota: "Requer login como cliente",
    links: [
      { label: "Dashboard", href: "/clientes/dashboard", icon: LayoutGrid },
      { label: "Agendar", href: "/clientes/agendamento", icon: CalendarDays },
      { label: "Histórico", href: "/clientes/historico", icon: ListOrdered },
      { label: "Perfil", href: "/clientes/perfil", icon: UserRound },
      { label: "Configurações", href: "/clientes/configuracoes", icon: Settings },
      { label: "Ajuda", href: "/clientes/ajuda", icon: HelpCircle },
    ],
  },
  {
    title: "Painel Super Admin",
    nota: "Requer login como administrador da plataforma",
    links: [
      { label: "Dashboard", href: "/superadmin/dashboard", icon: LayoutGrid },
      { label: "Barbearias", href: "/superadmin/barbearias", icon: Store },
      { label: "Usuários", href: "/superadmin/usuarios", icon: Users },
      { label: "Planos", href: "/superadmin/planos", icon: CreditCard },
      { label: "Assinaturas", href: "/superadmin/assinaturas", icon: FileSignature },
      { label: "Métricas", href: "/superadmin/metricas", icon: BarChart3 },
      { label: "Auditoria", href: "/superadmin/auditorias", icon: ClipboardList },
      { label: "Saúde do sistema", href: "/superadmin/saude-sistema", icon: Activity },
      { label: "Configurações", href: "/superadmin/configuracoes", icon: Settings },
      { label: "Ajuda", href: "/superadmin/ajuda", icon: HelpCircle },
    ],
  },
];

export function SitemapPage() {
  return (
    <main className="min-h-screen bg-white text-[#101828]">
      <SiteHeader />

      <section className="mx-auto w-full max-w-[1216px] px-5 py-16 sm:px-6 lg:py-20">
        <SectionLabel>Navegação</SectionLabel>
        <h1 className="mt-5 font-[var(--font-display)] text-[clamp(2.25rem,5vw,3.25rem)] leading-tight font-normal tracking-[-0.03em]">
          Mapa do site
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-8 text-[#667085]">
          Todas as páginas do LINEUP em um só lugar — do site institucional aos
          quatro painéis do sistema.
        </p>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {grupos.map((grupo) => (
            <div key={grupo.title}>
              <h2 className="text-sm font-bold tracking-[-0.28px] text-[#101828]">
                {grupo.title}
              </h2>
              {grupo.nota && (
                <p className="mt-1 text-xs text-[#98a2b3]">{grupo.nota}</p>
              )}
              <ul className="mt-4 grid gap-2.5">
                {grupo.links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-2.5 text-sm text-[#4e5d73] transition hover:text-accent-strong"
                      >
                        <Icon size={15} strokeWidth={1.8} className="shrink-0 text-[#98a2b3]" />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter simple />
    </main>
  );
}
