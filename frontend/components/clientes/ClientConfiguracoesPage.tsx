"use client";

import { Bell, Lock, ShieldCheck, UserRound } from "lucide-react";
import {
  FieldInput,
  SaveBar,
  SectionCard,
  ToggleRow,
} from "@/components/ui/SettingsPrimitives";

export function ClientConfiguracoesPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <SectionCard icon={UserRound} title="Conta">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldInput label="Nome" defaultValue="Rafael Mendes" />
          <FieldInput label="E-mail" defaultValue="admin@varthex.com" type="email" />
          <FieldInput label="Telefone" defaultValue="(11) 96666-7080" />
          <FieldInput
            label="Data de nascimento"
            defaultValue="12/04/1994"
            hint="Usada para o brinde de aniversário."
          />
        </div>
      </SectionCard>

      <SectionCard icon={Bell} title="Lembretes e avisos">
        <div className="flex flex-col">
          <ToggleRow
            title="Lembrete do agendamento"
            hint="Enviado 24h antes do seu horário."
            defaultOn
          />
          <ToggleRow
            title="Confirmação de reserva"
            hint="Assim que o agendamento é confirmado pela barbearia."
            defaultOn
          />
          <ToggleRow
            title="Vaga liberada na fila de espera"
            hint="Avisa quando abre um horário no dia que você queria."
            defaultOn
          />
          <ToggleRow
            title="Promoções e novidades"
            hint="Ofertas da barbearia. Pode desligar quando quiser."
            border={false}
          />
        </div>
        <FieldInput
          label="Canal preferido"
          defaultValue="WhatsApp"
          hint="Por onde você prefere receber os lembretes."
        />
      </SectionCard>

      <SectionCard icon={ShieldCheck} title="Privacidade">
        <div className="flex flex-col">
          <ToggleRow
            title="Compartilhar histórico com o profissional"
            hint="Permite que o barbeiro veja seus cortes anteriores para manter o padrão."
            defaultOn
          />
          <ToggleRow
            title="Aparecer no ranking de fidelidade"
            hint="Seu nome pode ser exibido entre os clientes mais assíduos."
            border={false}
          />
        </div>
      </SectionCard>

      <SectionCard icon={Lock} title="Segurança">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldInput label="Senha atual" defaultValue="" type="password" />
          <FieldInput
            label="Nova senha"
            defaultValue=""
            type="password"
            hint="Mínimo de 8 caracteres."
          />
        </div>
      </SectionCard>

      <SaveBar />
    </div>
  );
}
