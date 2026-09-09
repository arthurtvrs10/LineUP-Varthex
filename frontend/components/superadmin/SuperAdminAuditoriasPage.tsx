"use client";

import { ClipboardList } from "lucide-react";
import { PaginaEmBreve } from "@/components/ui/PaginaEmBreve";

export function SuperAdminAuditoriasPage() {
  return (
    <PaginaEmBreve
      icon={ClipboardList}
      title="Auditoria"
      description="Trilha de auditoria (quem fez o quê, quando) ainda não existe no sistema."
      voltarHref="/superadmin/dashboard"
    />
  );
}
