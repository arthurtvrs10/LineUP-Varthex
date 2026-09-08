"use client";

import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/ui/Modal";
import { FieldGrid, SelectField, TextAreaField, TextField } from "@/components/ui/FormFields";

/**
 * Modais de agenda do admin. Compartilhados porque os mesmos botões
 * aparecem no dashboard e nas páginas de agenda.
 *
 * Sem backend: cada `onSubmit` marca o ponto onde a chamada de API entra.
 */

export type ModalBaseProps = {
  open: boolean;
  onClose: () => void;
  /** Chamado no submit, com a mensagem para o toast da página. */
  onConcluir: (mensagem: string, tom?: "sucesso" | "erro") => void;
};

const profissionais = ["Lucas Oliveira", "Gabriel Santos", "Felipe Cardoso"];
const servicos = [
  "Corte de cabelo — R$ 45,00",
  "Barba — R$ 35,00",
  "Corte + barba — R$ 70,00",
  "Corte social — R$ 40,00",
];

export function NovoAgendamentoModal({ open, onClose, onConcluir }: ModalBaseProps) {
  function submeter(event: React.FormEvent) {
    event.preventDefault();
    onClose();
    onConcluir("Agendamento criado e confirmado para o cliente.");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo agendamento"
      description="O cliente recebe a confirmação pelo canal cadastrado."
      footer={
        <>
          <ModalCancelButton onClick={onClose} />
          <ModalSubmitButton form="form-novo-agendamento">Criar agendamento</ModalSubmitButton>
        </>
      }
    >
      <form id="form-novo-agendamento" onSubmit={submeter} className="flex flex-col gap-4">
        <FieldGrid>
          <TextField label="Cliente" required placeholder="Buscar ou digitar o nome" />
          <TextField label="Telefone" placeholder="(11) 90000-0000" />
        </FieldGrid>
        <SelectField label="Serviço" options={servicos} required />
        <FieldGrid>
          <SelectField label="Profissional" options={profissionais} required />
          <TextField label="Data" type="date" required defaultValue="2026-08-14" />
        </FieldGrid>
        <FieldGrid>
          <TextField label="Início" type="time" required defaultValue="09:00" />
          <TextField
            label="Duração (min)"
            type="number"
            defaultValue="45"
            hint="Puxada do serviço, mas pode ser ajustada."
          />
        </FieldGrid>
        <TextAreaField label="Observações" placeholder="Preferências do cliente, alergias, etc." rows={2} />
      </form>
    </Modal>
  );
}

export function BloquearHorarioModal({ open, onClose, onConcluir }: ModalBaseProps) {
  function submeter(event: React.FormEvent) {
    event.preventDefault();
    onClose();
    onConcluir("Horário bloqueado. A agenda online não aceita reservas nesse intervalo.");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bloquear horário"
      description="Agendamentos já confirmados nesse intervalo continuam válidos."
      size="sm"
      footer={
        <>
          <ModalCancelButton onClick={onClose} />
          <ModalSubmitButton form="form-bloquear-horario">Bloquear</ModalSubmitButton>
        </>
      }
    >
      <form id="form-bloquear-horario" onSubmit={submeter} className="flex flex-col gap-4">
        <SelectField
          label="Aplicar a"
          options={["Toda a equipe", ...profissionais]}
          required
        />
        <FieldGrid>
          <TextField label="Data" type="date" required defaultValue="2026-08-14" />
          <SelectField label="Repetir" options={["Não repetir", "Toda semana", "Todo mês"]} />
        </FieldGrid>
        <FieldGrid>
          <TextField label="Das" type="time" required defaultValue="12:00" />
          <TextField label="Até" type="time" required defaultValue="13:00" />
        </FieldGrid>
        <TextField label="Motivo" placeholder="Almoço, manutenção, treinamento…" />
      </form>
    </Modal>
  );
}
