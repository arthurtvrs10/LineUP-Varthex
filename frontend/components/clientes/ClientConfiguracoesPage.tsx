"use client";

import { useSession } from "next-auth/react";
import { Bell, KeyRound, UserRound, Store } from "lucide-react";
import { FieldInput, SectionCard } from "@/components/ui/SettingsPrimitives";
import { PrivacyPanel } from "@/components/commercial/Settings";
import { useMyCustomer } from "./MyCustomerContext";

export function ClientConfiguracoesPage() {
  const { data: session } = useSession();
  const { customer, shop, loading } = useMyCustomer();

  return (
    <div className="flex w-full flex-col gap-4">
      <SectionCard icon={Store} title="Minha barbearia">
        <p className="text-sm font-semibold text-[#0d1831]">{loading ? "Carregando…" : shop?.name ?? "Nenhuma barbearia selecionada"}</p>
        <p className="text-sm text-secondary">Sua escolha fica salva na conta. Para agendar em outro estabelecimento, altere sua barbearia aqui. Seus agendamentos e históricos anteriores são preservados.</p>
        <a href="/clientes/configuracoes/barbearia" className="inline-flex w-fit rounded-[10px] bg-accent px-4 py-3 text-sm font-semibold text-on-accent">{shop ? "Alterar barbearia" : "Escolher barbearia"}</a>
        <a href="/clientes/ajuda" className="text-sm font-semibold text-accent-strong hover:underline">Entenda como funciona</a>
      </SectionCard>
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

      {shop && <PrivacyPanel />}
    </div>
  );
}
