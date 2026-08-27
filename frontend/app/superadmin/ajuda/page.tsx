import type { Metadata } from "next";
import { SuperAdminShell } from "@/components/superadmin/SuperAdminShell";
import { AjudaPage, type FaqItem } from "@/components/layout/AjudaPage";

export const metadata: Metadata = {
  title: "Ajuda",
};

const faq: FaqItem[] = [
  {
    pergunta: "O que acontece quando bloqueio uma barbearia?",
    resposta:
      "Todos os usuários daquela barbearia perdem o acesso, mas nenhum dado é apagado. Agendamentos futuros ficam suspensos e voltam ao normal se a barbearia for reativada.",
  },
  {
    pergunta: "Como funciona o bloqueio automático por inadimplência?",
    resposta:
      "Após o prazo de carência definido em Configurações › Planos e cobrança, a barbearia é suspensa automaticamente se a fatura não for regularizada. O responsável recebe aviso antes.",
  },
  {
    pergunta: "Posso mudar o plano de uma barbearia no meio do ciclo?",
    resposta:
      "Sim. A alteração vale a partir da troca e a diferença é ajustada na próxima cobrança. A ação fica registrada na Auditoria.",
  },
  {
    pergunta: "O que a página de Saúde do sistema monitora?",
    resposta:
      "Serviços de infraestrutura — API, autenticação, workers, notificações e armazenamento — com latência, uptime e incidentes abertos. Serviços degradados aparecem no topo.",
  },
  {
    pergunta: "Por quanto tempo os logs de auditoria ficam disponíveis?",
    resposta:
      "Os eventos ficam consultáveis na página de Auditoria e podem ser exportados a qualquer momento com os filtros aplicados na tela.",
  },
];

const atalhos = [
  { label: "Configurações da plataforma", href: "/superadmin/configuracoes" },
  { label: "Saúde do sistema", href: "/superadmin/saude-sistema" },
  { label: "Auditoria", href: "/superadmin/auditorias" },
];

export default function SuperAdminAjudaRoute() {
  return (
    <SuperAdminShell title="Ajuda" breadcrumb="Ajuda">
      <AjudaPage
        descricao="Dúvidas sobre gestão da plataforma, barbearias, assinaturas e monitoramento."
        faq={faq}
        atalhos={atalhos}
      />
    </SuperAdminShell>
  );
}
