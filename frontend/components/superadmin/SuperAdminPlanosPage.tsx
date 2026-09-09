"use client";

import { CreditCard } from "lucide-react";
import { PaginaEmBreve } from "@/components/ui/PaginaEmBreve";

export function SuperAdminPlanosPage() {
  return (
    <PaginaEmBreve
      icon={CreditCard}
      title="Planos"
      description="Catálogo comercial de planos da plataforma (SaaS) ainda não existe no sistema — hoje toda barbearia cadastrada tem o mesmo acesso."
      voltarHref="/superadmin/dashboard"
    />
  );
}
