"use client";

import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { useMyCustomer } from "./MyCustomerContext";

// A conta de login (User) só vira um Customer de verdade quando o staff já
// cadastrou esse e-mail em Admin > Clientes — sem isso não há tenant, não
// há histórico, não há nada pra mostrar. Em vez de cada tela lidar com esse
// 404 sozinha, o portal inteiro mostra um aviso único aqui.
export function ClientPortalGate({ children }: { children: ReactNode }) {
  const { customer, loading, error } = useMyCustomer();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-[#e6e4df] border-t-accent" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-[#e6e4df] bg-white px-8 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fdecee]">
          <AlertCircle className="h-6 w-6 text-[#e0333f]" />
        </div>
        <h1 className="mt-5 text-xl font-semibold text-[#0d1831]">Você ainda não é cliente de nenhuma barbearia</h1>
        <p className="mt-2 max-w-md text-sm text-[#98a2b3]">
          {error ?? "Peça para a barbearia cadastrar seu e-mail em Clientes — sua conta se conecta automaticamente no próximo login."}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
