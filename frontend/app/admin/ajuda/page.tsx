import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AjudaPage, type FaqItem } from "@/components/layout/AjudaPage";

export const metadata: Metadata = {
  title: "Ajuda",
};

const faq: FaqItem[] = [
  {
    pergunta: "Como cadastro um novo barbeiro na equipe?",
    resposta:
      "Vá em Equipe e use \"Adicionar profissional\". Defina o percentual de comissão e a disponibilidade — o profissional passa a aparecer para os clientes assim que a agenda dele é preenchida.",
  },
  {
    pergunta: "Posso bloquear um horário sem cancelar os agendamentos?",
    resposta:
      "Sim. Na Agenda, use \"Bloquear horário\" para reservar um intervalo. Agendamentos já confirmados naquele intervalo continuam válidos e aparecem sinalizados.",
  },
  {
    pergunta: "Como funciona o cálculo de comissão?",
    resposta:
      "A comissão usa o percentual do profissional sobre os serviços concluídos no período. Vendas de produtos entram na base apenas se a opção estiver ligada em Configurações › Financeiro e comissões.",
  },
  {
    pergunta: "O que acontece quando um produto atinge o estoque mínimo?",
    resposta:
      "O item passa a aparecer como \"Baixo\" na página de Estoque e no resumo do dashboard. Se o alerta de estoque estiver ligado, você também recebe a notificação.",
  },
  {
    pergunta: "Consigo exportar os relatórios?",
    resposta:
      "Sim. Em Relatórios, ajuste o período desejado e use a exportação — o arquivo sai com os mesmos filtros aplicados na tela.",
  },
];

const atalhos = [
  { label: "Configurações da barbearia", href: "/admin/configuracoes" },
  { label: "Gerenciar equipe", href: "/admin/equipe" },
  { label: "Relatórios", href: "/admin/relatorios" },
];

export default function AdminAjudaRoute() {
  return (
    <AdminShell title="Ajuda" breadcrumb="Ajuda">
      <AjudaPage
        descricao="Dúvidas sobre a gestão da sua barbearia — equipe, agenda, financeiro e estoque."
        faq={faq}
        atalhos={atalhos}
      />
    </AdminShell>
  );
}
