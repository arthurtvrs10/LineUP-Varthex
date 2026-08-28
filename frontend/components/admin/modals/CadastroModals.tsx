"use client";

import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/ui/Modal";
import { FieldGrid, SelectField, TextAreaField, TextField } from "@/components/ui/FormFields";
import type { ModalBaseProps } from "./AgendaModals";

/** Modais de cadastro do admin: cliente, barbeiro, serviço, produto e despesa. */

export function NovoClienteModal({ open, onClose, onConcluir }: ModalBaseProps) {
  function submeter(event: React.FormEvent) {
    event.preventDefault();
    onClose();
    onConcluir("Cliente cadastrado.");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cadastrar cliente"
      description="Só nome e telefone são obrigatórios — o resto pode vir depois."
      footer={
        <>
          <ModalCancelButton onClick={onClose} />
          <ModalSubmitButton form="form-novo-cliente">Cadastrar</ModalSubmitButton>
        </>
      }
    >
      <form id="form-novo-cliente" onSubmit={submeter} className="flex flex-col gap-4">
        <FieldGrid>
          <TextField label="Nome completo" required placeholder="João Silva" />
          <TextField label="Telefone" required placeholder="(11) 90000-0000" />
        </FieldGrid>
        <FieldGrid>
          <TextField label="E-mail" type="email" placeholder="joao@email.com" />
          <TextField
            label="Data de nascimento"
            type="date"
            hint="Usada para o brinde de aniversário."
          />
        </FieldGrid>
        <TextAreaField
          label="Observações"
          placeholder="Preferência de corte, alergias, histórico relevante…"
          rows={2}
        />
      </form>
    </Modal>
  );
}

export function NovoBarbeiroModal({ open, onClose, onConcluir }: ModalBaseProps) {
  function submeter(event: React.FormEvent) {
    event.preventDefault();
    onClose();
    onConcluir("Barbeiro adicionado. Um convite de acesso foi enviado.");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Adicionar barbeiro"
      description="O profissional recebe um convite para acessar o painel dele."
      footer={
        <>
          <ModalCancelButton onClick={onClose} />
          <ModalSubmitButton form="form-novo-barbeiro">Adicionar</ModalSubmitButton>
        </>
      }
    >
      <form id="form-novo-barbeiro" onSubmit={submeter} className="flex flex-col gap-4">
        <FieldGrid>
          <TextField label="Nome completo" required placeholder="Lucas Oliveira" />
          <TextField label="E-mail" type="email" required placeholder="lucas@barbearia.com" />
        </FieldGrid>
        <FieldGrid>
          <TextField label="Telefone" placeholder="(11) 90000-0000" />
          <TextField
            label="Comissão (%)"
            type="number"
            defaultValue="40"
            hint="Percentual sobre serviços concluídos."
          />
        </FieldGrid>
        <TextField
          label="Especialidades"
          placeholder="Corte degradê, barba, navalhado"
          hint="Aparecem para o cliente na hora de escolher o profissional."
        />
      </form>
    </Modal>
  );
}

export function NovoServicoModal({ open, onClose, onConcluir }: ModalBaseProps) {
  function submeter(event: React.FormEvent) {
    event.preventDefault();
    onClose();
    onConcluir("Serviço criado e disponível para agendamento.");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo serviço"
      description="Fica disponível na agenda online assim que criado."
      footer={
        <>
          <ModalCancelButton onClick={onClose} />
          <ModalSubmitButton form="form-novo-servico">Criar serviço</ModalSubmitButton>
        </>
      }
    >
      <form id="form-novo-servico" onSubmit={submeter} className="flex flex-col gap-4">
        <FieldGrid>
          <TextField label="Nome do serviço" required placeholder="Corte degradê" />
          <SelectField
            label="Categoria"
            options={["Cabelo", "Barba", "Combo", "Finalização", "Outros"]}
          />
        </FieldGrid>
        <FieldGrid>
          <TextField label="Preço (R$)" type="number" required placeholder="45" />
          <TextField label="Duração (min)" type="number" required defaultValue="45" />
        </FieldGrid>
        <TextAreaField label="Descrição" placeholder="O que está incluso no serviço." rows={2} />
      </form>
    </Modal>
  );
}

export function NovoProdutoModal({ open, onClose, onConcluir }: ModalBaseProps) {
  function submeter(event: React.FormEvent) {
    event.preventDefault();
    onClose();
    onConcluir("Produto adicionado ao estoque.");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo produto"
      description="Ao atingir o estoque mínimo, o produto aparece como baixo no painel."
      footer={
        <>
          <ModalCancelButton onClick={onClose} />
          <ModalSubmitButton form="form-novo-produto">Adicionar produto</ModalSubmitButton>
        </>
      }
    >
      <form id="form-novo-produto" onSubmit={submeter} className="flex flex-col gap-4">
        <FieldGrid>
          <TextField label="Nome do produto" required placeholder="Pomada modeladora" />
          <SelectField
            label="Categoria"
            options={["Finalização", "Barba", "Cabelo", "Acessórios"]}
          />
        </FieldGrid>
        <FieldGrid>
          <TextField label="Custo (R$)" type="number" required placeholder="10" />
          <TextField label="Preço de venda (R$)" type="number" required placeholder="35" />
        </FieldGrid>
        <FieldGrid>
          <TextField label="Quantidade inicial" type="number" required defaultValue="0" />
          <TextField
            label="Estoque mínimo"
            type="number"
            defaultValue="5"
            hint="Dispara o alerta de estoque baixo."
          />
        </FieldGrid>
        <TextField label="Fornecedor" placeholder="Distribuidor Norte" />
      </form>
    </Modal>
  );
}

export function RegistrarDespesaModal({ open, onClose, onConcluir }: ModalBaseProps) {
  function submeter(event: React.FormEvent) {
    event.preventDefault();
    onClose();
    onConcluir("Despesa registrada no fluxo de caixa.");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar despesa"
      description="Entra no fluxo de caixa do período selecionado."
      size="sm"
      footer={
        <>
          <ModalCancelButton onClick={onClose} />
          <ModalSubmitButton form="form-despesa">Registrar</ModalSubmitButton>
        </>
      }
    >
      <form id="form-despesa" onSubmit={submeter} className="flex flex-col gap-4">
        <TextField label="Descrição" required placeholder="Compra de produtos, aluguel…" />
        <FieldGrid>
          <TextField label="Valor (R$)" type="number" required placeholder="250" />
          <TextField label="Data" type="date" required defaultValue="2026-08-14" />
        </FieldGrid>
        <FieldGrid>
          <SelectField
            label="Categoria"
            options={["Produtos", "Aluguel", "Salários", "Energia e água", "Marketing", "Outros"]}
          />
          <SelectField
            label="Forma de pagamento"
            options={["Dinheiro", "PIX", "Cartão de débito", "Cartão de crédito", "Boleto"]}
          />
        </FieldGrid>
      </form>
    </Modal>
  );
}
