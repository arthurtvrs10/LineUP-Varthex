# Financeiro administrativo

A tela `/admin/financeiro` segue a estrutura da referência visual: indicadores, visão mensal, categorias de saída, transações, comissões e fluxo diário. Mantém os componentes e tokens do design system.

## Indicadores e filtros

- O mês selecionado filtra as movimentações pela data de registro e as comissões pelo período consultado.
- Recebimentos brutos incluem serviços e produtos antes dos estornos; suprimentos não são faturamento.
- Saídas incluem movimentos negativos, como sangrias e estornos.
- Saldo do período é entradas menos saídas, não lucro. O fundo inicial do caixa não integra esse indicador.
- Ticket médio considera recebimentos de serviços por atendimento distinto no mês. Parcelas do mesmo atendimento não aumentam a contagem.
- O saldo do caixa atual é independente do mês selecionado e considera o dinheiro esperado em caixa.
- Busca e filtro de entrada/saída afetam a tabela e o CSV exportado. O CSV inclui todas as linhas filtradas, além da página visível.

## Operações

Abertura, fechamento, lançamento, estorno e comprovante usam modais e os endpoints existentes. Recebimentos exigem atendimento concluído com saldo pendente. Pix e cartão são registros manuais; não iniciam cobranças externas. Suprimentos e sangrias movimentam dinheiro. O estorno preserva o histórico e cria um movimento inverso.

Comissões mostram os registros retornados pelo backend, agrupados por profissional, excluindo registros estornados dos totais. Os detalhes preservam todas as situações. A tela não executa repasses. Despesas operacionais por categoria e lucro líquido dependem de funcionalidades ainda não disponíveis na API; não são simulados.

O backend continua responsável pela autorização e pelo isolamento dos dados de cada estabelecimento.

## Validação

Testes automatizados cobrem totais, estornos, suprimentos, ticket por atendimento e limites de mês. A conferência em ambiente local isolado verifica abertura de caixa e lançamento com atualização da tabela, indicadores e gráfico. Para validação manual adicional, registre uma sangria, confira o saldo, estorne o movimento e feche o caixa com o valor contado; confira o histórico e exporte os filtros desejados.
