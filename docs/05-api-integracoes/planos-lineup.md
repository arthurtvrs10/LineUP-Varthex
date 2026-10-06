# Catálogo de lançamento LineUp

## Oferta implementada

| Plano | Mensalidade | Limite |
| --- | --- | --- |
| Individual | R$ 59,90 | 1 profissional cadastrado |
| Gestão | R$ 99,90 | Até 5 profissionais cadastrados |
| Profissional extra (Gestão) | R$ 19,90 por profissional/mês | Até 20 extras na contratação |

O diferencial contratual nesta versão é a capacidade da equipe. Os módulos existentes não têm bloqueio específico por plano; não se anuncia exclusividade de estoque ou financeiro. O limite atual conta todos os profissionais cadastrados, incluindo inativos; usuários clientes não entram nessa contagem. Não há mensalidade por cliente nem adicional automático.

## Embasamento comercial

Pesquisa de páginas oficiais em 04/10/2026: Booksy Brasil anuncia R$ 99,99/mês mais R$ 20 por agenda adicional e impostos; AppBarber anuncia R$ 79,90 para 1 profissional e R$ 109,90 para 2–5 no mensal. Os valores propostos posicionam a oferta de lançamento abaixo dessas referências. Isso é uma hipótese de posicionamento, não comprovação de rentabilidade ou disposição a pagar.

- Booksy: https://biz.booksy.com/pt-br/precos
- AppBarber: https://appbarber-appbeleza.zendesk.com/hc/pt-br/articles/360001701331-Planos-e-Pre%C3%A7os-do-Sistema
- Trinks, exemplo de adicionais: https://ajuda.trinks.com/como-gerenciar-o-meu-plano-na-trinks

Validar preço com 5–10 clientes pagantes e medir custos de infraestrutura, suporte e cobrança. Crescimento por R$ 149,90, clubes recorrentes de clientes e adicionais de WhatsApp/IA não são ofertados nesta entrega. A taxa de recebimento da assinatura é custo da plataforma: o checkout não acrescenta uma taxa oculta ao contratante.

Proposta autorizada em 06/10/2026: profissional extra a R$ 19,90/mês somente no Gestão. O preço é uma hipótese inicial para monetizar crescimento de equipe, não uma margem validada. Não se cobra novamente por módulos já incluídos e não se vende consumo indefinido de WhatsApp ou IA. O adicional expande um limite que já é efetivamente controlado no backend.

Plano e extras entram na mesma mensalidade e renovam juntos. Exemplo: Gestão + 2 extras = R$ 139,70/mês e 7 profissionais. A cobrança não usa transações avulsas de pequeno valor. O preço e o limite são registrados na contratação; mudanças posteriores do catálogo não reajustam contratos existentes. Neste incremento a seleção é feita na contratação inicial; alteração de adicionais durante a vigência e prorrateio não estão disponíveis.

## Fluxo e fonte única

A migração V32 adiciona os planos com IDs estáveis, descrição e lista de benefícios. É aditiva e não substitui planos nem valores de assinaturas existentes. Landing e checkout consomem /billing/plans, inclusive quando available=false; este indicador controla o pagamento, não a visualização do catálogo.

A landing envia /cadastro?plano=UUID. O cadastro mantém o parâmetro até /admin/assinatura. A contratação valida a seleção contra o catálogo retornado. Acesso direto não escolhe um plano automaticamente: o usuário compara e seleciona. Uma opção removida não é substituída silenciosamente. O resumo acompanha a seleção, e o backend obtém o preço pelo ID do plano.

O pagamento só é habilitado quando o Asaas está configurado; criar conta ou escolher plano não gera cobrança. Esta entrega não altera o bloqueio operacional de contas nem ativa credenciais de pagamento.
