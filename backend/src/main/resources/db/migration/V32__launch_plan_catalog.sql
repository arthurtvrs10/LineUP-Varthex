-- Additive catalog: existing plans and subscription prices remain unchanged.
ALTER TABLE saas_plans ADD COLUMN description varchar(1000);
ALTER TABLE saas_plans ADD COLUMN features text;
INSERT INTO saas_plans (id, version, name, monthly_price, barber_limit, active, created_at, description, features)
VALUES
('2a110000-0000-4000-8000-000000000001', 0, 'Individual', 59.90, 1, true, CURRENT_TIMESTAMP,
 'Para quem atende sozinho e quer organizar a rotina em um só lugar.',
 E'Agenda e agendamento online
Cadastro e histórico de clientes
Caixa, estoque e venda de produtos
Relatórios da operação
Conexão com Google Calendar'),
('2a110000-0000-4000-8000-000000000002', 0, 'Gestão', 99.90, 5, true, CURRENT_TIMESTAMP,
 'Para barbearias que precisam organizar a equipe e acompanhar os atendimentos.',
 E'Todos os recursos do Individual
Até 5 profissionais cadastrados
Agenda por profissional
Gestão de comissões
Visão da operação da equipe')
ON CONFLICT (id) DO NOTHING;
