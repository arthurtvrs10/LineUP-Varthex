"use client";

import { BarChart3 } from "lucide-react";
import { PaginaEmBreve } from "@/components/ui/PaginaEmBreve";

export function SuperAdminMetricasPage() {
  return (
    <PaginaEmBreve
      icon={BarChart3}
      title="Métricas"
      description="Métricas de crescimento, receita e engajamento da plataforma ainda não existem no sistema. Números básicos (barbearias e usuários) já aparecem na Dashboard."
      voltarHref="/superadmin/dashboard"
    />
  );
}
