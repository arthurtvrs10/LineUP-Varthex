"use client";

import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/ui/Modal";
import { FieldGrid, SelectField, TextAreaField, TextField } from "@/components/ui/FormFields";
import type { ModalBaseProps } from "./AgendaModals";

/** Modais de CRM & WhatsApp: campanha, automação e modelo de mensagem. */

const publicos = [
  "Todos os clientes",
  "Clientes ativos (últimos 90 dias)",
  "Clientes inativos (90+ dias)",
  "Aniversariantes do mês",
  "Clientes do plano fidelidade",
];

export function NovaCampanhaModal({ open, onClose, onConcluir }: ModalBaseProps) {
  function submeter(event: React.FormEvent) {
    event.preventDefault();
    onClose();
    onConcluir("Campanha criada. O disparo começa no horário agendado.");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova campanha"
      description="Envio único para um público segmentado."
      footer={
        <>
          <ModalCancelButton onClick={onClose} />
          <ModalSubmitButton form="form-campanha">Criar campanha</ModalSubmitButton>
        </>
      }
    >
      <form id="form-campanha" onSubmit={submeter} className="flex flex-col gap-4">
        <TextField label="Nome da campanha" required placeholder="Promoção de setembro" />
        <SelectField label="Público" options={publicos} required />
        <FieldGrid>
          <SelectField label="Canal" options={["WhatsApp", "SMS", "E-mail"]} required />
          <TextField label="Enviar em" type="datetime-local" required />
        </FieldGrid>
        <TextAreaField
          label="Mensagem"
          rows={4}
          placeholder="Olá {{nome}}, temos 20% de desconto até sexta!"
          hint="Use {{nome}} para personalizar com o nome do cliente."
        />
      </form>
    </Modal>
  );
}

export function NovaAutomacaoModal({ open, onClose, onConcluir }: ModalBaseProps) {
  function submeter(event: React.FormEvent) {
    event.preventDefault();
    onClose();
    onConcluir("Automação ativada.");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova automação"
      description="Dispara sozinha sempre que o gatilho acontecer."
      footer={
        <>
          <ModalCancelButton onClick={onClose} />
          <ModalSubmitButton form="form-automacao">Ativar automação</ModalSubmitButton>
        </>
      }
    >
      <form id="form-automacao" onSubmit={submeter} className="flex flex-col gap-4">
        <TextField label="Nome" required placeholder="Lembrete 24h antes" />
        <SelectField
          label="Gatilho"
          required
          options={[
            "24h antes do agendamento",
            "Logo após o atendimento",
            "Cliente sem visita há 60 dias",
            "Aniversário do cliente",
            "Agendamento cancelado",
          ]}
        />
        <FieldGrid>
          <SelectField label="Canal" options={["WhatsApp", "SMS", "E-mail"]} required />
          <SelectField label="Status" options={["Ativa", "Pausada"]} defaultValue="Ativa" />
        </FieldGrid>
        <TextAreaField
          label="Mensagem"
          rows={3}
          placeholder="Oi {{nome}}! Seu horário é amanhã às {{hora}}. Confirma?"
          hint="Variáveis disponíveis: {{nome}}, {{hora}}, {{profissional}}."
        />
      </form>
    </Modal>
  );
}

export function NovoModeloModal({ open, onClose, onConcluir }: ModalBaseProps) {
  function submeter(event: React.FormEvent) {
    event.preventDefault();
    onClose();
    onConcluir("Modelo de mensagem salvo.");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo modelo de mensagem"
      description="Modelos ficam disponíveis ao criar campanhas e automações."
      size="sm"
      footer={
        <>
          <ModalCancelButton onClick={onClose} />
          <ModalSubmitButton form="form-modelo">Salvar modelo</ModalSubmitButton>
        </>
      }
    >
      <form id="form-modelo" onSubmit={submeter} className="flex flex-col gap-4">
        <TextField label="Nome do modelo" required placeholder="Confirmação de horário" />
        <TextAreaField
          label="Conteúdo"
          rows={4}
          placeholder="Olá {{nome}}, tudo certo para {{data}} às {{hora}}?"
          hint="Variáveis: {{nome}}, {{data}}, {{hora}}, {{profissional}}, {{servico}}."
        />
      </form>
    </Modal>
  );
}
