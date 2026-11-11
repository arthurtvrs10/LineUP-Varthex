"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export function EmailVerificationPage() {
  return <Suspense fallback={<p className="p-8 text-center">Carregando…</p>}><Verification/></Suspense>;
}
function Verification() {
  const query = useSearchParams();
  const [email, setEmail] = useState(query.get("email") ?? "");
  const [token, setToken] = useState("");
  const [loginHref, setLoginHref] = useState("/login");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    const raw = new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
    // Read the fragment once; confirmation requires a deliberate click, not an email scanner GET.
    Promise.resolve().then(() => {
      setToken(raw);
      const params = new URLSearchParams(window.location.search);
      try {
        const saved = new URLSearchParams(sessionStorage.getItem("lineup-email-verification-context") ?? "");
        for (const key of ["plano", "barbearia", "contratar"]) if (!params.has(key) && saved.has(key)) params.set(key, saved.get(key)!);
      } catch { /* Context is optional. */ }
      const login = new URLSearchParams();
      for (const key of ["plano", "barbearia", "contratar"]) if (params.has(key)) login.set(key, params.get(key)!);
      setLoginHref("/login" + (login.size ? "?" + login.toString() : ""));
    });
  }, []);
  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);
  async function request(path: string, body: object) {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) { const data = await response.json().catch(() => ({})); throw Error(data.message || "Não foi possível concluir. Tente novamente."); }
  }
  async function confirm() {
    if (busy) return; setBusy(true); setError("");
    try {
      await request("/auth/email-verification/confirm", { token }); setDone(true); setToken("");
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      try { sessionStorage.removeItem("lineup-email-verification-context"); } catch { /* Optional context. */ }
    } catch (e) { setError(e instanceof Error ? e.message : "Link inválido."); }
    finally { setBusy(false); }
  }
  async function resend() {
    if (busy || cooldown) return; setBusy(true); setError(""); setFeedback("");
    try {
      await request("/auth/email-verification/resend", { email }); setCooldown(60);
      setFeedback("Se houver uma conta aguardando confirmação, o envio será solicitado. Confira sua caixa de entrada e o spam; aguarde um minuto entre pedidos.");
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível enviar."); }
    finally { setBusy(false); }
  }
  return <main className="flex min-h-dvh items-center justify-center bg-surface-sunken px-5 py-10"><section className="w-full max-w-lg space-y-5 rounded-2xl border border-fog bg-surface p-6 sm:p-8">
    <Logo/>
    {done ? <><CheckCircle2 className="text-success" size={32}/><h1 className="text-xl font-semibold">E-mail confirmado!</h1><p className="text-sm text-secondary">Agora você pode entrar com seu e-mail e senha para continuar.</p><Link className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 font-semibold text-on-accent" href={loginHref}>Entrar na minha conta</Link></> : <>
      <Mail className="text-accent" size={32}/><h1 className="text-xl font-semibold">Confirme seu e-mail</h1>
      <p className="text-sm leading-6 text-secondary">{token ? "Clique abaixo para confirmar o endereço de e-mail da sua conta no LineUp." : "Seu acesso será liberado após a confirmação do e-mail. Confira a caixa de entrada e o spam do endereço informado no cadastro."} O link vale por 30 minutos e pode ser utilizado uma vez.</p>
      {token && <button disabled={busy} onClick={confirm} className="min-h-11 w-full rounded-lg bg-accent px-5 font-semibold text-on-accent disabled:opacity-50">{busy ? "Aguarde…" : "Confirmar meu e-mail"}</button>}
      {error && <p role="alert" className="rounded-lg bg-danger-subtle p-3 text-sm text-danger">{error}</p>}
      <form className="space-y-3 border-t border-fog pt-5" onSubmit={e => { e.preventDefault(); void resend(); }}><p className="text-sm font-medium">Não recebeu ou o link expirou?</p><label className="block text-sm">E-mail do cadastro<input required type="email" autoComplete="email" maxLength={180} value={email} onChange={e => setEmail(e.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-fog px-3"/></label><button disabled={busy || cooldown > 0} className="min-h-11 rounded-lg border border-fog px-4 text-sm font-semibold disabled:opacity-50">{cooldown ? `Reenviar em ${cooldown}s` : "Reenviar confirmação"}</button></form>
      {feedback && <p role="status" className="text-sm text-secondary">{feedback}</p>}
      <Link href={loginHref} className="inline-block text-sm text-accent underline">Voltar para o login</Link>
    </>}
  </section></main>;
}
