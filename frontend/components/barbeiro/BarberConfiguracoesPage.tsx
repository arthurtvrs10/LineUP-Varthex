"use client";

import { Bell, CalendarCog, Scissors, UserRound } from "lucide-react";
import {
  FieldInput,
  SaveBar,
  SectionCard,
  ToggleRow,
} from "@/components/ui/SettingsPrimitives";

export function BarberConfiguracoesPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <SectionCard icon={UserRound} title="Conta">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldInput label="Nome" defaultValue="Paulo Roberto" />
          <FieldInput label="E-mail" defaultValue="barber@lineup.com" type="email" />
          <FieldInput label="Telefone" defaultValue="(11) 97777-3040" />
          <FieldInput label="Unidade" defaultValue="Barbearia Estilo Único — Centro" />
        </div>
      </SectionCard>

      <SectionCard icon={Scissors} title="Perfil profissional">
        <FieldInput
          label="Especialidades"
          defaultValue="Corte degradê, barba, navalhado"
          hint="Aparecem para o cliente na hora de escolher o profissional."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldInput
            label="Duração padrão do atendimento (min)"
            defaultValue="45"
            hint="Usada quando o serviço não define a própria duração."
          />
          <FieldInput
            label="Intervalo entre atendimentos (min)"
            defaultValue="10"
            hint="Folga para organizar a estação."
          />
        </div>
        <ToggleRow
          title="Aceitar agendamento online"
          hint="Clientes podem reservar direto com você pelo app."
          defaultOn
          border={false}
        />
      </SectionCard>

      <SectionCard icon={CalendarCog} title="Agenda">
        <div className="flex flex-col">
          <ToggleRow
            title="Aceitar encaixes"
            hint="Permite encaixar clientes fora da grade quando houver folga."
            defaultOn
          />
          <ToggleRow
            title="Entrar na fila de espera automaticamente"
            hint="Assume clientes da fila quando um horário é liberado."
            defaultOn
          />
          <ToggleRow
            title="Bloquear agenda fora do expediente"
            hint="Impede reservas fora da sua disponibilidade cadastrada."
            defaultOn
            border={false}
          />
        </div>
      </SectionCard>

      <SectionCard icon={Bell} title="Notificações">
        <div className="flex flex-col">
          <ToggleRow
            title="Novo agendamento comigo"
            hint="Avisa quando um cliente reserva seu horário."
            defaultOn
          />
          <ToggleRow
            title="Cancelamento de cliente"
            hint="Avisa quando um horário seu é liberado."
            defaultOn
          />
          <ToggleRow
            title="Fechamento de comissão"
            hint="Avisa quando o valor do período é consolidado."
            defaultOn
          />
          <ToggleRow
            title="Resumo do dia seguinte"
            hint="Enviado às 20h com a agenda de amanhã."
            border={false}
          />
        </div>
      </SectionCard>

      <SaveBar />
    </div>
  );
}
