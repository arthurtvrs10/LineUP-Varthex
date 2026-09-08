"use client";

import { useSession } from "next-auth/react";
import { Bell, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { FieldInput, SectionCard } from "@/components/ui/SettingsPrimitives";
import { EmBreve } from "@/components/ui/EmBreve";
import { useMyCustomer } from "./MyCustomerContext";

export function ClientConfiguracoesPage() {
  const { data: session } = useSession();
  const { customer } = useMyCustomer();

  return (
    <div className="flex w-full flex-col gap-4">
      <SectionCard icon={UserRound} title="Conta">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldInput label="Nome" value={session?.user?.name ?? ""} onChange={() => {}} disabled />
          <FieldInput label="E-mail" value={session?.user?.email ?? ""} onChange={() => {}} disabled type="email" />
          <FieldInput label="Telefone" value={customer?.phone ?? "Não informado"} onChange={() => {}} disabled />
        </div>
        <p className="text-xs text-[#98a2b3]">
          Para editar seus dados, acesse{" "}
          <a href="/clientes/perfil" className="font-semibold text-accent-strong hover:underline">
            Meu perfil
          </a>
          . Telefone é cadastrado pela sua barbearia.
        </p>
      </SectionCard>

      <SectionCard icon={Bell} title="Lembretes e avisos">
        <p className="text-sm text-secondary">
          Escolha quais e-mails você recebe (confirmação, cancelamento, vaga na fila de espera) em{" "}
          <a href="/clientes/perfil" className="font-semibold text-accent-strong hover:underline">
            Meu perfil → Preferências de comunicação
          </a>
          .
        </p>
      </SectionCard>

      <SectionCard icon={KeyRound} title="Segurança">
        <p className="text-sm text-secondary">
          Trocar senha e gerenciar dispositivos conectados também ficam em{" "}
          <a href="/clientes/perfil" className="font-semibold text-accent-strong hover:underline">
            Meu perfil → Segurança e acesso
          </a>
          .
        </p>
      </SectionCard>

      <SectionCard icon={ShieldCheck} title="Privacidade">
        <EmBreve text="Controles de privacidade ainda não estão disponíveis." />
      </SectionCard>
    </div>
  );
}
