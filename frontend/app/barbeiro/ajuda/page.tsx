import type { Metadata } from "next";
import { BarberShell } from "@/components/barbeiro/BarberShell";
import { AjudaPage, type FaqItem } from "@/components/layout/AjudaPage";

export const metadata: Metadata = {
  title: "Ajuda",
};

const faq: FaqItem[] = [
  {
    pergunta: "Como defino os dias e horários em que atendo?",
    resposta:
      "Em Disponibilidade você monta a grade semanal e cadastra exceções (férias, folgas, um dia que vai sair mais cedo). A agenda online respeita essa grade automaticamente.",
  },
  {
    pergunta: "Um cliente faltou. O que eu faço?",
    resposta:
      "Abra o atendimento na Agenda e marque como \"Falta\". Isso mantém o histórico correto e conta para a política de faltas configurada pela barbearia.",
  },
  {
    pergunta: "Quando minha comissão é fechada?",
    resposta:
      "O valor é consolidado no fim do período definido pela barbearia. Em Comissões você acompanha o acumulado do período atual antes do fechamento.",
  },
  {
    pergunta: "Como funciona a fila de espera?",
    resposta:
      "Clientes sem horário entram na fila. Se você aceita encaixes, ao liberar um intervalo o próximo da fila é notificado e pode confirmar.",
  },
  {
    pergunta: "Posso atender alguém fora do meu expediente?",
    resposta:
      "Sim, criando o atendimento manualmente na Agenda. O bloqueio fora do expediente vale para a reserva online do cliente, não para o que você registra.",
  },
];

const atalhos = [
  { label: "Minha disponibilidade", href: "/barbeiro/disponibilidade" },
  { label: "Minhas comissões", href: "/barbeiro/comissoes" },
  { label: "Configurações", href: "/barbeiro/configuracoes" },
];

export default function BarbeiroAjudaRoute() {
  return (
    <BarberShell title="Ajuda" breadcrumb="Ajuda">
      <AjudaPage
        descricao="Dúvidas sobre sua agenda, disponibilidade, atendimentos e comissões."
        faq={faq}
        atalhos={atalhos}
      />
    </BarberShell>
  );
}
