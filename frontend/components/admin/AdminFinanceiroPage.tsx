"use client";

import { Wallet } from "lucide-react";
import { PaginaEmBreve } from "@/components/ui/PaginaEmBreve";

export function AdminFinanceiroPage() {
  return (
    <PaginaEmBreve
      icon={Wallet}
      title="Financeiro"
      description="Caixa, pagamentos e reconciliação financeira ainda não existem no sistema — hoje a comissão é o único dado financeiro real, disponível na Agenda e no Dashboard."
      voltarHref="/admin/dashboard"
    />
  );
}
