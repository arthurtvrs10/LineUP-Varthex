"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { KeyRound, Monitor } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { EmBreve } from "@/components/ui/EmBreve";
import { useMyCustomer } from "./MyCustomerContext";

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function PerfilPage() {
  const { data: session, update: updateSession } = useSession();
  const { customer } = useMyCustomer();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session?.user?.name]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      await apiFetch("/users/me", { method: "PATCH", body: { name } });
      await updateSession?.({ name });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  const displayName = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0d1831]">Meu perfil</h1>
        <p className="mt-1 text-sm text-[#5f6f87]">
          Gerencie seus dados e acesso à sua conta.
        </p>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-6 rounded-[12px] border border-[#e6e4df] bg-white p-6">
        <div className="flex items-center gap-4">
          <span className="grid size-20 place-items-center rounded-full bg-accent-subtle text-2xl font-bold text-accent-strong">
            {initialsFor(displayName || email)}
          </span>
          <div>
            <p className="text-xl font-bold text-[#0d1831]">{displayName || email}</p>
            <p className="text-sm text-[#5f6f87]">{customer?.tenantName ?? "Cliente"}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#e8f7f1] px-3 py-1 text-xs font-bold text-[#27865b]">
              <span className="size-1.5 rounded-full bg-current" />
              Conta ativa
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-[12px] border border-[#e6e4df] bg-white p-6">
        <h2 className="text-xl font-bold text-[#0d1831]">Dados pessoais</h2>
        <p className="mt-1 text-sm text-[#5f6f87]">O e-mail e o telefone são cadastrados pela sua barbearia.</p>

        <form onSubmit={handleSave} className="mt-6 grid grid-cols-1 gap-5 border-t border-[#e6e4df] pt-6 sm:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-[#5f6f87]" htmlFor="nome-completo">
              Nome completo
            </label>
            <input
              id="nome-completo"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 h-12 w-full rounded-[10px] border border-[#e6e4df] px-3.5 text-sm text-[#0d1831] outline-none focus:border-accent focus:ring-3 focus:ring-accent/10"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-[#5f6f87]" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="mt-2 h-12 w-full rounded-[10px] border border-[#e6e4df] bg-[#f7f6f2] px-3.5 text-sm text-[#5f6f87] outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-[#5f6f87]" htmlFor="whatsapp">
              WhatsApp
            </label>
            <input
              id="whatsapp"
              value={customer?.phone ?? "Não informado"}
              disabled
              className="mt-2 h-12 w-full rounded-[10px] border border-[#e6e4df] bg-[#f7f6f2] px-3.5 text-sm text-[#5f6f87] outline-none"
            />
          </div>

          {error && (
            <p className="rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f] sm:col-span-2">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 sm:col-span-2">
            {saved && <span className="text-xs font-bold text-[#27865b]">Alterações salvas!</span>}
            <button
              type="submit"
              disabled={saving}
              className="rounded-[10px] bg-accent px-6 py-2.5 text-sm font-bold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[12px] border border-[#e6e4df] bg-white p-6">
        <h2 className="text-xl font-bold text-[#0d1831]">Preferências de comunicação</h2>
        <p className="mt-1 text-sm text-[#5f6f87]">Escolha como você prefere receber atualizações.</p>
        <div className="mt-6 border-t border-[#e6e4df] pt-6">
          <EmBreve text="Preferências de notificação ainda não estão disponíveis." />
        </div>
      </section>

      <section className="rounded-[12px] border border-[#e6e4df] bg-white p-6">
        <h2 className="text-xl font-bold text-[#0d1831]">Segurança e acesso</h2>
        <p className="mt-1 text-sm text-[#5f6f87]">
          Proteja sua conta e gerencie seus dispositivos conectados.
        </p>

        <div className="mt-6 divide-y divide-[#eef0f3] border-t border-[#e6e4df]">
          <div className="flex items-center gap-3 py-4">
            <span className="grid size-10 place-items-center rounded-full bg-[#f7f6f2] text-[#5f6f87]">
              <KeyRound size={18} strokeWidth={1.8} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#0d1831]">Senha</p>
              <p className="text-xs text-[#5f6f87]">Troca de senha ainda não está disponível.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-4">
            <span className="grid size-10 place-items-center rounded-full bg-[#f7f6f2] text-[#5f6f87]">
              <Monitor size={18} strokeWidth={1.8} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#0d1831]">Sessões e dispositivos</p>
              <p className="text-xs text-[#5f6f87]">Gerenciamento de sessões ainda não está disponível.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
