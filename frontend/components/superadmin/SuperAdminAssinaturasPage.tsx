"use client";

import { FileSignature } from "lucide-react";
import { PaginaEmBreve } from "@/components/ui/PaginaEmBreve";

export function SuperAdminAssinaturasPage() {
  return (
    <PaginaEmBreve
      icon={FileSignature}
      title="Assinaturas"
      description="Cobrança recorrente, limites por plano e suspensão automática por inadimplência ainda não existem no sistema."
      voltarHref="/superadmin/dashboard"
    />
  );
}
