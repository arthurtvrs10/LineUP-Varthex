"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import { KeyRound, Monitor, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { AvatarUpload } from "@/components/ui/AvatarUpload";
import { EmBreve } from "@/components/ui/EmBreve";
import { useMyCustomer } from "./MyCustomerContext";

type MeResponse = { photoData: string | null };
type SessionInfo = { id: string; createdAt: string; expiresAt: string; userAgent: string | null };

const sessionDateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function deviceLabel(userAgent: string | null) {
  if (!userAgent) return "Dispositivo desconhecido";
  if (/iphone|ipad/i.test(userAgent)) return "iPhone/iPad";
  if (/android/i.test(userAgent)) return "Android";
  if (/chrome/i.test(userAgent)) return "Chrome";
  if (/firefox/i.test(userAgent)) return "Firefox";
  if (/safari/i.test(userAgent)) return "Safari";
  return "Navegador";
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function PerfilPage() {
  const { data: session, update: updateSession } = useSession();
  const { customer, reload: reloadCustomer } = useMyCustomer();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();

  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [trocandoSenha, setTrocandoSenha] = useState(false);
  const [senhaSalva, setSenhaSalva] = useState(false);
  const [erroSenha, setErroSenha] = useState<string>();

  const [sessoes, setSessoes] = useState<SessionInfo[]>();
  const [encerrandoTudo, setEncerrandoTudo] = useState(false);

  function carregarSessoes() {
    apiFetch<SessionInfo[]>("/auth/sessions")
      .then(setSessoes)
      .catch(() => {});
  }

  useEffect(() => {
    carregarSessoes();
  }, []);

  async function revogarSessao(id: string) {
    try {
      await apiFetch(`/auth/sessions/${id}`, { method: "DELETE" });
      setSessoes((prev) => prev?.filter((s) => s.id !== id));
    } catch {
      carregarSessoes();
    }
  }

  async function encerrarTudo() {
    setEncerrandoTudo(true);
    try {
      await apiFetch("/auth/logout-all", { method: "POST" });
    } finally {
      await signOut({ callbackUrl: "/login" });
    }
  }

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session?.user?.name]);

  useEffect(() => {
    if (customer?.phone) setPhone(customer.phone);
  }, [customer?.phone]);

  useEffect(() => {
    apiFetch<MeResponse>("/users/me")
      .then((me) => setPhotoData(me.photoData))
      .catch(() => {});
  }, []);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      await apiFetch("/users/me", { method: "PATCH", body: { name, photoData } });
      await updateSession?.({ name });
      await apiFetch("/me/customer", { method: "PATCH", body: { phone } });
      reloadCustomer();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTrocarSenha(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroSenha(undefined);

    if (senhaNova.length < 6) {
      setErroSenha("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senhaNova !== senhaConfirmacao) {
      setErroSenha("A confirmação não bate com a nova senha.");
      return;
    }

    setTrocandoSenha(true);
    try {
      await apiFetch("/auth/password", {
        method: "PATCH",
        body: { currentPassword: senhaAtual, newPassword: senhaNova },
      });
      setSenhaAtual("");
      setSenhaNova("");
      setSenhaConfirmacao("");
      setSenhaSalva(true);
      window.setTimeout(() => setSenhaSalva(false), 2500);
    } catch (err) {
      setErroSenha(err instanceof ApiError ? err.message : "Não foi possível trocar a senha.");
    } finally {
      setTrocandoSenha(false);
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

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <section className="flex flex-wrap items-center justify-between gap-6 rounded-[12px] border border-[#e6e4df] bg-white p-6">
          <div className="flex items-center gap-4">
            <AvatarUpload photoData={photoData} initials={initialsFor(displayName || email)} onChange={setPhotoData} />
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
          <p className="mt-1 text-sm text-[#5f6f87]">O e-mail é o login da sua conta e não pode ser alterado por aqui.</p>

          <div className="mt-6 grid grid-cols-1 gap-5 border-t border-[#e6e4df] pt-6 sm:grid-cols-2">
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
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="(11) 99999-0000"
                className="mt-2 h-12 w-full rounded-[10px] border border-[#e6e4df] px-3.5 text-sm text-[#0d1831] outline-none focus:border-accent focus:ring-3 focus:ring-accent/10"
              />
            </div>
          </div>

          {error && (
            <p className="mt-5 rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">{error}</p>
          )}

          <div className="mt-5 flex items-center justify-end gap-3">
            {saved && <span className="text-xs font-bold text-[#27865b]">Alterações salvas!</span>}
            <button
              type="submit"
              disabled={saving}
              className="rounded-[10px] bg-accent px-6 py-2.5 text-sm font-bold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </section>
      </form>

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

        <form onSubmit={handleTrocarSenha} className="mt-6 flex flex-col gap-4 border-t border-[#e6e4df] pt-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f7f6f2] text-[#5f6f87]">
              <KeyRound size={18} strokeWidth={1.8} />
            </span>
            <p className="text-sm font-bold text-[#0d1831]">Trocar senha</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-bold text-[#5f6f87]" htmlFor="senha-atual">
                Senha atual
              </label>
              <input
                id="senha-atual"
                type="password"
                value={senhaAtual}
                onChange={(event) => setSenhaAtual(event.target.value)}
                className="mt-1.5 h-11 w-full rounded-[10px] border border-[#e6e4df] px-3.5 text-sm text-[#0d1831] outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#5f6f87]" htmlFor="senha-nova">
                Nova senha
              </label>
              <input
                id="senha-nova"
                type="password"
                value={senhaNova}
                onChange={(event) => setSenhaNova(event.target.value)}
                className="mt-1.5 h-11 w-full rounded-[10px] border border-[#e6e4df] px-3.5 text-sm text-[#0d1831] outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#5f6f87]" htmlFor="senha-confirmacao">
                Confirmar nova senha
              </label>
              <input
                id="senha-confirmacao"
                type="password"
                value={senhaConfirmacao}
                onChange={(event) => setSenhaConfirmacao(event.target.value)}
                className="mt-1.5 h-11 w-full rounded-[10px] border border-[#e6e4df] px-3.5 text-sm text-[#0d1831] outline-none focus:border-accent"
              />
            </div>
          </div>

          {erroSenha && (
            <p className="rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">{erroSenha}</p>
          )}

          <div className="flex items-center justify-end gap-3">
            {senhaSalva && <span className="text-xs font-bold text-[#27865b]">Senha atualizada!</span>}
            <button
              type="submit"
              disabled={trocandoSenha || !senhaAtual || !senhaNova}
              className="rounded-[10px] border border-[#e6e4df] px-5 py-2.5 text-sm font-bold text-[#0d1831] transition hover:bg-[#f7f6f2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {trocandoSenha ? "Salvando…" : "Trocar senha"}
            </button>
          </div>
        </form>

        <div className="mt-2 border-t border-[#eef0f3] pt-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f7f6f2] text-[#5f6f87]">
              <Monitor size={18} strokeWidth={1.8} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#0d1831]">Sessões e dispositivos</p>
              <p className="text-xs text-[#5f6f87]">
                {sessoes && sessoes.length > 0
                  ? `${sessoes.length} sessão(ões) ativa(s).`
                  : "Nenhuma outra sessão ativa."}
              </p>
            </div>
            {sessoes && sessoes.length > 0 && (
              <button
                type="button"
                onClick={encerrarTudo}
                disabled={encerrandoTudo}
                className="shrink-0 rounded-[10px] border border-[#e6e4df] px-3.5 py-2 text-xs font-bold text-[#c84a4a] transition hover:bg-[#fdeaea] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {encerrandoTudo ? "Saindo…" : "Sair de todos os dispositivos"}
              </button>
            )}
          </div>

          {sessoes && sessoes.length > 0 && (
            <ul className="mt-3 flex flex-col gap-2">
              {sessoes.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[#eef0f3] px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#0d1831]">{deviceLabel(s.userAgent)}</p>
                    <p className="text-[11px] text-[#98a2b3]">
                      Ativa desde {sessionDateFormatter.format(new Date(s.createdAt))}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => revogarSessao(s.id)}
                    aria-label="Encerrar sessão"
                    className="grid size-7 shrink-0 place-items-center rounded-full text-[#98a2b3] transition hover:bg-[#fdeaea] hover:text-[#c84a4a]"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
