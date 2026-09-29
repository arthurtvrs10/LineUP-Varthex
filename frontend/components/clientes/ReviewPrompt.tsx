"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Star } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { apiFetch } from "@/lib/api";
import { useMyCustomer } from "./MyCustomerContext";
import { reviewPromptSession } from "@/lib/review-prompt-session";

export type PendingReview = { appointmentId: string; barberId: string; barberName: string; endAt: string };
const promptSession = reviewPromptSession({ getItem: key => sessionStorage.getItem(key), setItem: (key,value) => sessionStorage.setItem(key,value) });

export function ReviewForm({ appointmentId, onSaved }: { appointmentId: string; onSaved: () => void }) {
  const [rating, setRating] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  return <form className="space-y-4" onSubmit={async event => {
    event.preventDefault();
    if (busy) return;
    if (!rating) { setError("Escolha uma nota de 1 a 5."); return; }
    const comment = String(new FormData(event.currentTarget).get("comment") ?? "");
    setBusy(true); setError(undefined);
    try { await apiFetch("/commercial/reviews", { method: "POST", body: { appointmentId, rating, comment } }); onSaved(); }
    catch (err) { setError(err instanceof Error ? err.message : "Não foi possível enviar sua avaliação."); }
    finally { setBusy(false); }
  }}>
    <fieldset disabled={busy}><legend className="mb-2 text-sm font-medium text-ink">Como foi seu atendimento?</legend>
      <div className="flex gap-2">{[1,2,3,4,5].map(value => <button key={value} type="button" aria-label={`${value} de 5 estrelas`} aria-pressed={rating === value} onClick={() => setRating(value)} className="grid size-11 place-items-center rounded-[10px] text-accent-strong hover:bg-surface-sunken focus-visible:outline-accent"><Star size={30} fill={rating >= value ? "currentColor" : "none"} /></button>)}</div>
    </fieldset>
    <label className="flex flex-col gap-2 text-sm text-ink">Comentário (opcional)<textarea name="comment" maxLength={1000} rows={3} disabled={busy} className="rounded-[10px] border border-fog p-3 outline-none focus:border-accent" placeholder="Conte como foi sua experiência" /></label>
    {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    <button disabled={busy} className="h-11 w-full rounded-[10px] bg-accent px-4 font-semibold text-on-accent disabled:opacity-50">{busy ? "Enviando…" : "Enviar avaliação"}</button>
  </form>;
}

export function ReviewPrompt() {
  const { data: session } = useSession();
  const { shop, customer, loading } = useMyCustomer();
  const pathname = usePathname();
  const token = session?.user?.accessToken;
  const [pending, setPending] = useState<PendingReview>();
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(false), 3000);
    return () => window.clearTimeout(timer);
  }, [success]);
  const known = useRef<Set<string> | undefined>(undefined);

  useEffect(() => {
    if (loading || !shop || !customer || !token) return;
    let active = true;
    let checking = false;
    known.current = undefined;
    async function check() {
      if (checking || document.visibilityState === "hidden") return;
      checking = true;
      try {
        // Once per browser-tab session/login, including page reloads. No access token is stored.
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
        const key = "lineup-review-prompt:" + Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,"0")).join("");
        if (!active || promptSession.has(key)) return;
        const list = await apiFetch<PendingReview[]>("/commercial/reviews/pending");
        if (!active) return;
        const newlyCompleted = known.current && list.find(item => !known.current!.has(item.appointmentId));
        known.current = new Set(list.map(item => item.appointmentId));
        const item = pathname === "/clientes/agendamento" ? list[0] : newlyCompleted;
        if (!item) return;
        promptSession.mark(key);
        setPending(item);
      } catch { /* A failed reminder never blocks booking. Retry while the portal stays open. */ }
      finally { checking = false; }
    }
    void check();
    const timer = window.setInterval(() => void check(), 30000);
    const onFocus = () => void check();
    window.addEventListener("focus", onFocus);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, [loading, shop, customer, token, pathname]);

  if (!pending) return success ? <p role="status" className="fixed bottom-4 right-4 z-50 rounded-[10px] border border-fog bg-white p-4 text-sm text-success shadow-popover">Obrigado pela sua avaliação!</p> : null;
  return <Modal open title="Avalie seu atendimento" description={`${pending.barberName} · ${shop?.name} · ${new Date(pending.endAt).toLocaleDateString("pt-BR")}`} onClose={() => setPending(undefined)} size="sm">
    <ReviewForm appointmentId={pending.appointmentId} onSaved={() => { setPending(undefined); setSuccess(true); }} />
    <button type="button" onClick={() => setPending(undefined)} className="mt-3 h-11 w-full rounded-[10px] border border-fog text-sm font-medium text-secondary">Agora não</button>
    <p className="mt-3 text-xs text-secondary">Você pode continuar agendando e avaliar depois pelo histórico.</p>
  </Modal>;
}
