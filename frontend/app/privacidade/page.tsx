import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Saiba como a Varthex Barber coleta, usa e protege os dados de gestores, barbeiros e clientes.",
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
    title: "Seus direitos",
    paragraphs: [
      "Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você pode solicitar acesso, correção, portabilidade ou exclusão dos seus dados pessoais a qualquer momento pelos canais de suporte.",
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
      updatedAt="21 de agosto de 2026"
      intro="Esta política explica como a Varthex Barber coleta, usa, armazena e protege as informações de gestores, barbeiros e clientes que utilizam a nossa plataforma."
      sections={sections}
    />
  );
}
