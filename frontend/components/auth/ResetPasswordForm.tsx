"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>();
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8 || new TextEncoder().encode(password).length > 72) {
      setError("Use ao menos 8 caracteres e no máximo 72 bytes."); return;
    }
    if (password !== confirmation) { setError("As senhas não coincidem."); return; }
    setBusy(true); setError(undefined);
    try {
      const response = await fetch("/auth/password-recovery/complete", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, newPassword: password }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? "Este link pode ter expirado. Solicite um novo link.");
      }
      setSuccess(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível redefinir a senha."); }
    finally { setBusy(false); }
  }
  return <main className="flex min-h-screen items-center justify-center px-6 py-12">
    <section className="w-full max-w-[432px] rounded-2xl border border-[#e3e5eb] bg-white p-8">
      <Logo variant="horizontal" height={26} className="text-ink" />
      <h1 className="mt-6 text-[22px] font-bold text-[#1c1c26]">{success ? "Senha atualizada" : "Crie sua nova senha"}</h1>
      {success ? <><p className="mt-3 text-sm text-[#667085]">Seu e-mail foi confirmado. Volte ao login para continuar seu agendamento.</p><Link href="/login" className="mt-6 inline-block font-semibold text-accent-strong">Ir para o login</Link></>
        : <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-sm text-[#667085]">Nova senha<input type="password" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#d9dce5] px-3 text-[#1c1c26] focus:outline-accent" /></label>
          <label className="block text-sm text-[#667085]">Confirmar nova senha<input type="password" autoComplete="new-password" required value={confirmation} onChange={e => setConfirmation(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#d9dce5] px-3 text-[#1c1c26] focus:outline-accent" /></label>
          {error && <p role="alert" className="rounded-lg bg-[#fdecee] p-3 text-sm text-[#e0333f]">{error}</p>}
          <button disabled={busy} className="h-11 w-full rounded-lg bg-accent text-sm font-semibold text-on-accent disabled:opacity-60">{busy ? "Salvando…" : "Salvar nova senha"}</button>
          <Link href="/esqueceu-senha" className="inline-block text-sm font-semibold text-accent-strong">Solicitar outro link</Link>
        </form>}
    </section>
  </main>;
}
