"use client";

import { Activity } from "lucide-react";
import { PaginaEmBreve } from "@/components/ui/PaginaEmBreve";

export function SuperAdminSaudeSistemaPage() {
  return (
    <PaginaEmBreve
      icon={Activity}
      title="Saúde do sistema"
      description="Monitoramento de uptime, latência e erros da plataforma ainda não existe no sistema."
      voltarHref="/superadmin/dashboard"
    />
  );
}
