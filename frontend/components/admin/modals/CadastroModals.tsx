"use client";

import { useState } from "react";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/ui/Modal";
import { FieldGrid, SelectField, TextAreaField, TextField } from "@/components/ui/FormFields";
import { ApiError } from "@/lib/api";
import type { ModalBaseProps } from "./AgendaModals";

/** Modais de cadastro do admin: cliente, barbeiro, serviço, produto e despesa. */

export type NovoClientePayload = {
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;
  notes: string;
};

type NovoClienteModalProps = ModalBaseProps & {
  onCriar: (payload: NovoClientePayload) => Promise<void>;
};

export function NovoClienteModal({ open, onClose, onConcluir, onCriar }: NovoClienteModalProps) {
  const [enviando, setEnviando] = useState(false);

  async function submeter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dados = new FormData(event.currentTarget);

    setEnviando(true);
    try {
      await onCriar({
        fullName: String(dados.get("fullName") ?? ""),
        phone: String(dados.get("phone") ?? ""),
        email: String(dados.get("email") ?? ""),
        birthDate: String(dados.get("birthDate") ?? ""),
        notes: String(dados.get("notes") ?? ""),
      });
      onClose();
      onConcluir("Cliente cadastrado.");
    } catch (error) {
      onConcluir(
        error instanceof ApiError ? error.message : "Não foi possível cadastrar o cliente.",
        "erro",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cadastrar cliente"
      description="Nome e (e-mail ou telefone) são obrigatórios — o resto pode vir depois."
      footer={
        <>
          <ModalCancelButton onClick={onClose} />
          <ModalSubmitButton form="form-novo-cliente" disabled={enviando}>
            {enviando ? "Cadastrando…" : "Cadastrar"}
          </ModalSubmitButton>
        </>
      }
    >
      <form id="form-novo-cliente" onSubmit={submeter} className="flex flex-col gap-4">
        <FieldGrid>
          <TextField name="fullName" label="Nome completo" required placeholder="João Silva" />
          <TextField name="phone" label="Telefone" placeholder="(11) 90000-0000" />
        </FieldGrid>
        <FieldGrid>
          <TextField name="email" label="E-mail" type="email" placeholder="joao@email.com" />
          <TextField
            name="birthDate"
            label="Data de nascimento"
            type="date"
            hint="Usada para o brinde de aniversário."
          />
        </FieldGrid>
        <TextAreaField
          name="notes"
          label="Observações"
          placeholder="Preferência de corte, alergias, histórico relevante…"
          rows={2}
        />
      </form>
    </Modal>
  );
}

export type NovoBarbeiroPayload = {
  name: string;
  email: string;
  password: string;
  commission: string;
};

type NovoBarbeiroModalProps = ModalBaseProps & {
  onCriar: (payload: NovoBarbeiroPayload) => Promise<void>;
};

export function NovoBarbeiroModal({ open, onClose, onConcluir, onCriar }: NovoBarbeiroModalProps) {
  const [enviando, setEnviando] = useState(false);

  async function submeter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dados = new FormData(event.currentTarget);

    setEnviando(true);
    try {
      await onCriar({
        name: String(dados.get("name") ?? ""),
        email: String(dados.get("email") ?? ""),
        password: String(dados.get("password") ?? ""),
        commission: String(dados.get("commission") ?? "0"),
      });
      onClose();
      onConcluir("Barbeiro adicionado.");
    } catch (error) {
      onConcluir(
        error instanceof ApiError ? error.message : "Não foi possível adicionar o barbeiro.",
        "erro",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Adicionar barbeiro"
      description="Ainda não existe convite por e-mail — defina uma senha inicial e repasse pro profissional."
      footer={
        <>
          <ModalCancelButton onClick={onClose} />
          <ModalSubmitButton form="form-novo-barbeiro" disabled={enviando}>
            {enviando ? "Adicionando…" : "Adicionar"}
          </ModalSubmitButton>
        </>
      }
    >
      <form id="form-novo-barbeiro" onSubmit={submeter} className="flex flex-col gap-4">
        <FieldGrid>
          <TextField name="name" label="Nome completo" required placeholder="Lucas Oliveira" />
          <TextField
            name="email"
            label="E-mail"
            type="email"
            required
            placeholder="lucas@barbearia.com"
          />
        </FieldGrid>
        <FieldGrid>
          <TextField
            name="password"
            label="Senha inicial"
            type="password"
            required
            hint="Repasse pro profissional trocar depois."
          />
          <TextField
            name="commission"
            label="Comissão (%)"
            type="number"
            defaultValue="40"
            hint="Percentual sobre serviços concluídos."
          />
        </FieldGrid>
      </form>
    </Modal>
  );
}

export type NovoServicoPayload = {
  name: string;
  categoryId: string;
  serviceType: string;
  price: string;
  durationMinutes: string;
  description: string;
};

type NovoServicoModalProps = ModalBaseProps & {
  categorias: { id: string; name: string }[];
  onCriar: (payload: NovoServicoPayload) => Promise<void>;
};

export function NovoServicoModal({
  open,
  onClose,
  onConcluir,
  categorias,
  onCriar,
}: NovoServicoModalProps) {
  const [enviando, setEnviando] = useState(false);

  async function submeter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dados = new FormData(event.currentTarget);

    setEnviando(true);
    try {
      await onCriar({
        name: String(dados.get("name") ?? ""),
        categoryId: String(dados.get("categoryId") ?? ""),
        serviceType: String(dados.get("serviceType") ?? "SERVICE"),
        price: String(dados.get("price") ?? ""),
        durationMinutes: String(dados.get("durationMinutes") ?? ""),
        description: String(dados.get("description") ?? ""),
      });
      onClose();
      onConcluir("Serviço criado e disponível para agendamento.");
    } catch (error) {
      onConcluir(
        error instanceof ApiError ? error.message : "Não foi possível criar o serviço.",
        "erro",
      );
    } finally {
      setEnviando(false);
    }
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
          <ModalSubmitButton form="form-novo-servico" disabled={enviando}>
            {enviando ? "Criando…" : "Criar serviço"}
          </ModalSubmitButton>
        </>
      }
    >
      <form id="form-novo-servico" onSubmit={submeter} className="flex flex-col gap-4">
        <FieldGrid>
          <TextField name="name" label="Nome do serviço" required placeholder="Corte degradê" />
          <SelectField
            name="serviceType"
            label="Tipo"
            required
            defaultValue="SERVICE"
            options={[
              { value: "SERVICE", label: "Serviço" },
              { value: "COMBO", label: "Combo" },
              { value: "ADDON", label: "Adicional" },
            ]}
          />
        </FieldGrid>
        <FieldGrid>
          <SelectField
            name="categoryId"
            label="Categoria"
            hint={categorias.length === 0 ? "Nenhuma categoria cadastrada ainda." : undefined}
            options={[
              { value: "", label: "Sem categoria" },
              ...categorias.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <TextField
            name="durationMinutes"
            label="Duração (min)"
            type="number"
            required
            defaultValue="45"
          />
        </FieldGrid>
        <TextField name="price" label="Preço (R$)" type="number" required placeholder="45.00" />
        <TextAreaField
          name="description"
          label="Descrição"
          placeholder="O que está incluso no serviço."
          rows={2}
        />
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
