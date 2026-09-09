"use client";

import { MessageSquare } from "lucide-react";
import { PaginaEmBreve } from "@/components/ui/PaginaEmBreve";

export function AdminCrmPage() {
  return (
    <PaginaEmBreve
      icon={MessageSquare}
      title="CRM & WhatsApp"
      description="Campanhas, segmentação de clientes e integração com WhatsApp ainda não existem no sistema — notificações hoje são só por e-mail e no app."
      voltarHref="/admin/dashboard"
    />
  );
}
