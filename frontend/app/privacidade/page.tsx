import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Saiba como o LINEUP coleta, usa e protege os dados de gestores, barbeiros e clientes.",
};

const sections = [
  {
    title: "Quais dados coletamos",
    paragraphs: [
      "Coletamos dados de cadastro (nome, e-mail, telefone) de gestores e barbeiros, e dados operacionais inseridos na plataforma, como agenda, clientes, serviços, comissões e indicadores do negócio.",
      "Também coletamos dados técnicos de uso, como tipo de dispositivo, navegador e registros de acesso, para manter a segurança e o funcionamento do sistema.",
    ],
  },
  {
    title: "Como usamos seus dados",
    paragraphs: [
      "Usamos os dados para viabilizar as funcionalidades da plataforma — agenda, gestão de equipe, relacionamento com clientes e relatórios de desempenho — e para dar suporte à sua conta.",
      "Também podemos usar dados agregados e anonimizados para melhorar o produto e desenvolver novas funcionalidades.",
    ],
  },
  {
    title: "Compartilhamento de informações",
    paragraphs: [
      "Não vendemos dados pessoais. Compartilhamos informações apenas com prestadores de serviço que apoiam a operação da plataforma (como hospedagem e processamento de pagamentos) e quando exigido por lei.",
    ],
  },
  {
    title: "Armazenamento e segurança",
    paragraphs: [
      "Adotamos medidas técnicas e organizacionais para proteger os dados armazenados contra acesso não autorizado, perda ou alteração, incluindo controle de acesso e criptografia em trânsito.",
    ],
  },
  {
    title: "Cookies e tecnologias similares",
    paragraphs: [
      "Utilizamos cookies essenciais para manter sua sessão ativa e cookies analíticos para entender como a plataforma é utilizada e melhorar a experiência. Você pode gerenciar preferências de cookies no seu navegador.",
    ],
  },
  {
    title: "Base legal do tratamento",
    paragraphs: [
      "Tratamos seus dados pessoais com base em uma ou mais hipóteses legais previstas na Lei Geral de Proteção de Dados (LGPD), dependendo da finalidade: execução de contrato, para fornecer as funcionalidades da plataforma, como agenda e cobrança; cumprimento de obrigação legal ou regulatória, como emissão de documentos fiscais; legítimo interesse, para segurança, prevenção a fraudes e melhoria do produto; e consentimento, para comunicações de marketing e cookies não essenciais.",
      "Quando o tratamento depende do seu consentimento, ele é sempre livre, informado e pode ser revogado a qualquer momento, sem prejuízo aos serviços essenciais da plataforma.",
    ],
  },
  {
    title: "Seus direitos",
    paragraphs: [
      "Como titular de dados pessoais, a LGPD garante a você os seguintes direitos, que podem ser exercidos a qualquer momento:",
      "• Confirmação da existência de tratamento dos seus dados;",
      "• Acesso aos dados pessoais tratados;",
      "• Correção de dados incompletos, inexatos ou desatualizados;",
      "• Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a lei;",
      "• Portabilidade dos dados a outro fornecedor de serviço ou produto, mediante requisição expressa;",
      "• Eliminação dos dados pessoais tratados com base no seu consentimento, exceto nas hipóteses de conservação previstas em lei;",
      "• Informação sobre as entidades públicas e privadas com as quais compartilhamos seus dados;",
      "• Informação sobre a possibilidade de não fornecer consentimento e sobre as consequências dessa negativa;",
      "• Revogação do consentimento a qualquer momento.",
      "Para exercer qualquer um desses direitos, entre em contato pela central de ajuda. Respondemos às solicitações dentro dos prazos estabelecidos pela LGPD, podendo solicitar informações adicionais para confirmar sua identidade antes de atender ao pedido.",
    ],
  },
  {
    title: "Retenção de dados",
    paragraphs: [
      "Mantemos os dados pelo tempo necessário para prestar o serviço e cumprir obrigações legais. Após o encerramento da conta, os dados são removidos ou anonimizados dentro dos prazos aplicáveis.",
    ],
  },
  {
    title: "Alterações nesta política",
    paragraphs: [
      "Podemos atualizar esta política periodicamente para refletir mudanças na plataforma ou na legislação. Alterações relevantes serão comunicadas pelos canais de contato cadastrados.",
    ],
  },
];

export default function PrivacidadePage() {
  return (
    <LegalPage
      eyebrow="Privacidade"
      title="Política de privacidade"
      updatedAt="7 de setembro de 2026"
      intro="Esta política explica como o LINEUP coleta, usa, armazena e protege as informações de gestores, barbeiros e clientes que utilizam a nossa plataforma."
      sections={sections}
    />
  );
}
