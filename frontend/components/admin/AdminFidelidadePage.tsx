"use client";

import { Gift } from "lucide-react";
import { PaginaEmBreve } from "@/components/ui/PaginaEmBreve";

export function AdminFidelidadePage() {
  return (
    <PaginaEmBreve
      icon={Gift}
      title="Fidelidade"
      description="Programa de pontos, recompensas e cashback ainda não existe no sistema."
      voltarHref="/admin/dashboard"
    />
  );
}
