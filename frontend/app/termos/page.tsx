import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Termos de uso",
  description:
    "Conheça as regras de uso da plataforma LINEUP para gestores, barbeiros e clientes.",
};

const sections = [
  {
    title: "Aceitação dos termos",
    paragraphs: [
      "Ao criar uma conta ou utilizar a LINEUP, você concorda com estes termos de uso e com a nossa política de privacidade. Se não concordar, não utilize a plataforma.",
    ],
  },
  {
    title: "Quem pode usar a LINEUP",
    paragraphs: [
      "A plataforma é destinada a gestores e profissionais de barbearias maiores de 18 anos, responsáveis pelas informações inseridas em nome do seu estabelecimento.",
    ],
  },
  {
    title: "Conta e responsabilidades do usuário",
    paragraphs: [
      "Você é responsável por manter a confidencialidade das credenciais de acesso e por todas as atividades realizadas na sua conta. Notifique-nos imediatamente em caso de uso não autorizado.",
      "As informações cadastradas (agenda, clientes, equipe, comissões) devem ser verdadeiras e mantidas atualizadas pelo próprio usuário.",
    ],
  },
  {
    title: "Planos, pagamentos e cancelamento",
    paragraphs: [
      "O acesso a determinadas funcionalidades pode depender da contratação de um plano pago. Os valores, formas de cobrança e política de cancelamento são informados no momento da contratação.",
      "Você pode cancelar sua assinatura a qualquer momento; o acesso às funcionalidades pagas é mantido até o fim do período já pago.",
    ],
  },
  {
    title: "Uso aceitável da plataforma",
    paragraphs: [
      "Não é permitido usar a LINEUP para fins ilícitos, tentar acessar dados de outras contas sem autorização, ou comprometer a segurança e o funcionamento do sistema.",
    ],
  },
  {
    title: "Propriedade intelectual",
    paragraphs: [
      "A marca, o layout, o código e as funcionalidades da LINEUP são de propriedade da empresa e protegidos por lei. Os dados inseridos pelo usuário na plataforma continuam sendo de propriedade do usuário.",
    ],
  },
  {
    title: "Limitação de responsabilidade",
    paragraphs: [
      "A LINEUP busca manter a plataforma disponível e funcionando corretamente, mas não garante operação ininterrupta e não se responsabiliza por decisões de negócio tomadas com base nos dados apresentados.",
    ],
  },
  {
    title: "Alterações nestes termos",
    paragraphs: [
      "Podemos atualizar estes termos periodicamente. Mudanças relevantes serão comunicadas com antecedência razoável pelos canais de contato cadastrados.",
    ],
  },
  {
    title: "Legislação aplicável",
    paragraphs: [
      "Estes termos são regidos pela legislação brasileira, e eventuais disputas serão resolvidas no foro do domicílio do usuário, salvo disposição legal em contrário.",
    ],
  },
];

export default function TermosPage() {
  return (
    <LegalPage
      eyebrow="Termos"
      title="Termos de uso"
      updatedAt="21 de agosto de 2026"
      intro="Estes termos definem as regras para uso da plataforma LINEUP por gestores, barbeiros e demais usuários autorizados."
      sections={sections}
    />
  );
}
