"use client";

import { useSession } from "next-auth/react";
import { Bell, Lock, ShieldCheck, UserRound } from "lucide-react";
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
          Para editar seu nome, acesse{" "}
          <a href="/clientes/perfil" className="font-semibold text-accent-strong hover:underline">
            Meu perfil
          </a>
          . Telefone é cadastrado pela sua barbearia.
        </p>
      </SectionCard>

      <SectionCard icon={Bell} title="Lembretes e avisos">
        <EmBreve text="Preferências de lembrete e canal de contato ainda não estão disponíveis." />
      </SectionCard>

      <SectionCard icon={ShieldCheck} title="Privacidade">
        <EmBreve text="Controles de privacidade ainda não estão disponíveis." />
      </SectionCard>

      <SectionCard icon={Lock} title="Segurança">
        <EmBreve text="Troca de senha ainda não está disponível." />
      </SectionCard>
    </div>
  );
}
