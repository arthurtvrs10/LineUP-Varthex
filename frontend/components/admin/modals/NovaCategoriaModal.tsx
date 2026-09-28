"use client";

import { useState } from "react";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/FormFields";
import { ApiError } from "@/lib/api";

export type CategoryOption = { id: string; name: string };

export function NovaCategoriaModal({ onClose, onCriar, onCreated }: {
  onClose: () => void;
  onCriar: (name: string) => Promise<CategoryOption>;
  onCreated: (category: CategoryOption) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const close = () => { if (!saving) onClose(); };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    if (!name) { setError("Informe o nome da categoria."); return; }
    if (name.length > 120) { setError("O nome deve ter no máximo 120 caracteres."); return; }
    setSaving(true);
    setError(undefined);
    try {
      const category = await onCriar(name);
      onCreated(category);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível criar a categoria. Tente novamente.");
      setSaving(false);
    }
  }

  return <Modal open onClose={close} title="Nova categoria" size="sm"
    description="Organize os serviços da sua barbearia."
    footer={<><ModalCancelButton onClick={close} /><ModalSubmitButton form="form-nova-categoria" disabled={saving}>{saving ? "Salvando…" : "Criar categoria"}</ModalSubmitButton></>}>
    <form id="form-nova-categoria" onSubmit={submit} className="flex flex-col gap-4">
      <TextField name="name" label="Nome da categoria" required placeholder="Ex.: Cortes" />
      {error && <p role="alert" className="rounded-[10px] bg-danger-subtle px-3 py-2 text-sm text-danger">{error}</p>}
    </form>
  </Modal>;
}
