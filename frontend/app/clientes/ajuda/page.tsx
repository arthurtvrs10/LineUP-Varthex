import type { Metadata } from "next";
import { ClientShell } from "@/components/clientes/ClientShell";
import { AjudaPage, type FaqItem } from "@/components/layout/AjudaPage";

export const metadata: Metadata = {
  title: "Ajuda",
};

const faq: FaqItem[] = [
  {
    pergunta: "Como remarco ou cancelo meu horário?",
    resposta:
      "Abra o agendamento no Histórico e escolha remarcar ou cancelar. O cancelamento pelo app é liberado até o prazo definido pela barbearia — passado esse prazo, fale direto com a unidade.",
  },
  {
    pergunta: "Como funcionam os pontos de fidelidade?",
    resposta:
      "Você acumula pontos a cada atendimento concluído. Ao atingir a meta, o benefício fica disponível e pode ser usado no próximo agendamento. O progresso aparece no seu Dashboard.",
  },
  {
    pergunta: "Posso escolher com qual barbeiro quero cortar?",
    resposta:
      "Sim. Na tela de Agendar, escolha o profissional antes do horário — a agenda mostra só os horários livres dele.",
  },
  {
    pergunta: "Entrei na fila de espera. Como sou avisado?",
    resposta:
      "Se abrir uma vaga no dia que você pediu, avisamos pelo canal escolhido em Configurações. A vaga fica reservada por tempo limitado até você confirmar.",
  },
  {
    pergunta: "Como paro de receber mensagens promocionais?",
    resposta:
      "Em Configurações › Lembretes e avisos, desligue \"Promoções e novidades\". Os lembretes do seu agendamento continuam chegando normalmente.",
  },
];

const atalhos = [
  { label: "Agendar um horário", href: "/clientes/agendamento" },
  { label: "Meu histórico", href: "/clientes/historico" },
  { label: "Configurações", href: "/clientes/configuracoes" },
];

export default function ClientesAjudaRoute() {
  return (
    <ClientShell title="Ajuda" breadcrumb="Ajuda">
      <AjudaPage
        descricao="Dúvidas sobre agendamentos, fidelidade e sua conta."
        faq={faq}
        atalhos={atalhos}
      />
    </ClientShell>
  );
}
