"use client";

import { Star } from "lucide-react";
import { PaginaEmBreve } from "@/components/ui/PaginaEmBreve";

export function AdminAvaliacoesPage() {
  return (
    <PaginaEmBreve
      icon={Star}
      title="Avaliações"
      description="Coleta e exibição de avaliações de clientes ainda não existe no sistema."
      voltarHref="/admin/dashboard"
    />
  );
}
