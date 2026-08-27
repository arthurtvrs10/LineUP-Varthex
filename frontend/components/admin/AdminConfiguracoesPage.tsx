"use client";

import { Bell, CalendarCog, Store, UserRound, Wallet } from "lucide-react";
import {
  FieldInput,
  SaveBar,
  SectionCard,
  ToggleRow,
} from "@/components/ui/SettingsPrimitives";

export function AdminConfiguracoesPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <SectionCard icon={UserRound} title="Conta">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldInput label="Nome" defaultValue="Rafael Mendes" />
          <FieldInput label="E-mail" defaultValue="admin@varthex.com" type="email" />
          <FieldInput label="Telefone" defaultValue="(11) 98888-1020" />
          <FieldInput label="Cargo" defaultValue="Proprietário" />
        </div>
      </SectionCard>

      <SectionCard icon={Store} title="Barbearia">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldInput label="Nome da barbearia" defaultValue="Barbearia Estilo Único" />
          <FieldInput label="CNPJ" defaultValue="12.345.678/0001-90" />
          <FieldInput label="Endereço" defaultValue="Rua das Palmeiras, 320 — Centro" />
          <FieldInput label="Telefone de contato" defaultValue="(11) 3344-5566" />
        </div>
        <ToggleRow
          title="Exibir barbearia na busca pública"
          hint="Permite que novos clientes encontrem a unidade pelo site."
          defaultOn
          border={false}
        />
      </SectionCard>

      <SectionCard icon={CalendarCog} title="Agendamento">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldInput
            label="Antecedência mínima (horas)"
            defaultValue="2"
            hint="Tempo mínimo entre a reserva e o atendimento."
          />
          <FieldInput
            label="Prazo de cancelamento (horas)"
            defaultValue="12"
            hint="Depois disso o cliente não cancela sozinho."
          />
        </div>
        <div className="flex flex-col">
          <ToggleRow
            title="Confirmar agendamentos automaticamente"
            hint="Sem confirmação manual da recepção."
            defaultOn
          />
          <ToggleRow
            title="Permitir lista de espera"
            hint="Clientes entram na fila quando o horário está cheio."
            defaultOn
          />
          <ToggleRow
            title="Bloquear cliente com faltas recorrentes"
            hint="Suspende o agendamento online após 3 faltas."
            border={false}
          />
        </div>
      </SectionCard>

      <SectionCard icon={Wallet} title="Financeiro e comissões">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldInput
            label="Comissão padrão do barbeiro (%)"
            defaultValue="40"
            hint="Aplicada a novos profissionais."
          />
          <FieldInput label="Dia de fechamento do caixa" defaultValue="Último dia do mês" />
        </div>
        <ToggleRow
          title="Incluir produtos no cálculo de comissão"
          hint="Vendas de estoque entram na base de comissão."
          border={false}
        />
      </SectionCard>

      <SectionCard icon={Bell} title="Notificações">
        <div className="flex flex-col">
          <ToggleRow
            title="Novo agendamento"
            hint="Avisa quando um cliente reserva um horário."
            defaultOn
          />
          <ToggleRow title="Cancelamento" hint="Avisa quando um horário é liberado." defaultOn />
          <ToggleRow
            title="Estoque baixo"
            hint="Alerta quando um produto chega ao mínimo."
            defaultOn
          />
          <ToggleRow
            title="Resumo diário por e-mail"
            hint="Fechamento do dia enviado às 20h."
            border={false}
          />
        </div>
      </SectionCard>

      <SaveBar />
    </div>
  );
}
