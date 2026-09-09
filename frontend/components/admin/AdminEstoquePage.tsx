"use client";

import { Package } from "lucide-react";
import { PaginaEmBreve } from "@/components/ui/PaginaEmBreve";

export function AdminEstoquePage() {
  return (
    <PaginaEmBreve
      icon={Package}
      title="Estoque"
      description="Controle de produtos, movimentação e giro de estoque ainda não existe no sistema."
      voltarHref="/admin/dashboard"
    />
  );
}
