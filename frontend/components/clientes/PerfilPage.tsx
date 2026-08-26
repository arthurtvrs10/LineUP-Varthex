"use client";

import { useState, type FormEvent } from "react";
import { ChevronRight, KeyRound, Monitor } from "lucide-react";

export function PerfilPage() {
  const [name, setName] = useState("Paulo Roberto");
  const [email, setEmail] = useState("pauloroberto@exemplo.com");
  const [whatsapp, setWhatsapp] = useState("(61) 99876-5432");
  const [birthDate, setBirthDate] = useState("1998-08-15");
  const [saved, setSaved] = useState(false);

  const [reminders, setReminders] = useState(true);
  const [offers, setOffers] = useState(false);

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#101828]">Meu perfil</h1>
        <p className="mt-1 text-sm text-[#475467]">
          Gerencie seus dados, preferências e acesso à sua conta.
        </p>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-[#eaecf0] bg-white p-6">
        <div className="flex items-center gap-4">
          <span className="grid size-20 place-items-center rounded-full bg-[#e8e6ff] text-2xl font-bold text-[#293aa3]">
            PR
          </span>
          <div>
            <p className="text-xl font-bold text-[#101828]">{name}</p>
            <p className="text-sm text-[#475467]">Cliente</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#e6f7ec] px-3 py-1 text-xs font-bold text-[#085d3a]">
              <span className="size-1.5 rounded-full bg-current" />
              Conta ativa
            </span>
          </div>
        </div>
        <div className="border-l border-[#eaecf0] pl-6 text-sm">
          <p className="text-xs text-[#475467]">Último acesso</p>
          <p className="mt-1 font-bold text-[#101828]">Hoje, 10:42</p>
          <p className="mt-1 text-xs text-[#475467]">Este dispositivo</p>
        </div>
      </section>

      <section className="rounded-2xl border border-[#eaecf0] bg-white p-6">
        <h2 className="text-xl font-bold text-[#101828]">Dados pessoais</h2>
        <p className="mt-1 text-sm text-[#475467]">Mantenha suas informações de contato atualizadas.</p>

        <form onSubmit={handleSave} className="mt-6 grid grid-cols-1 gap-5 border-t border-[#eaecf0] pt-6 sm:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-[#344054]" htmlFor="nome-completo">
              Nome completo
            </label>
            <input
              id="nome-completo"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-[#d0d5dd] px-3.5 text-sm text-[#101828] outline-none focus:border-[#7247f3] focus:ring-3 focus:ring-[#7247f3]/10"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-[#344054]" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-[#d0d5dd] px-3.5 text-sm text-[#101828] outline-none focus:border-[#7247f3] focus:ring-3 focus:ring-[#7247f3]/10"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-[#344054]" htmlFor="whatsapp">
              WhatsApp
            </label>
            <input
              id="whatsapp"
              value={whatsapp}
              onChange={(event) => setWhatsapp(event.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-[#d0d5dd] px-3.5 text-sm text-[#101828] outline-none focus:border-[#7247f3] focus:ring-3 focus:ring-[#7247f3]/10"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-[#344054]" htmlFor="nascimento">
              Data de nascimento
            </label>
            <input
              id="nascimento"
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-[#d0d5dd] px-3.5 text-sm text-[#101828] outline-none focus:border-[#7247f3] focus:ring-3 focus:ring-[#7247f3]/10"
            />
          </div>

          <div className="flex items-center justify-end gap-3 sm:col-span-2">
            {saved && <span className="text-xs font-bold text-[#085d3a]">Alterações salvas!</span>}
            <button
              type="submit"
              className="rounded-lg bg-[#3448c5] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#293aa3]"
            >
              Salvar alterações
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-[#eaecf0] bg-white p-6">
        <h2 className="text-xl font-bold text-[#101828]">Preferências de comunicação</h2>
        <p className="mt-1 text-sm text-[#475467]">Escolha como você prefere receber atualizações.</p>

        <div className="mt-6 divide-y divide-[#eaecf0] border-t border-[#eaecf0]">
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-bold text-[#101828]">Lembretes de agendamento</p>
              <p className="mt-0.5 text-xs text-[#475467]">Receba confirmação e lembrete da sua reserva.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={reminders}
              onClick={() => setReminders((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                reminders ? "bg-[#3448c5]" : "bg-[#d0d5dd]"
              }`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${
                  reminders ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 py-4">
            <p className="text-sm font-bold text-[#101828]">Novidades e ofertas</p>
            <button
              type="button"
              role="switch"
              aria-checked={offers}
              onClick={() => setOffers((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                offers ? "bg-[#3448c5]" : "bg-[#d0d5dd]"
              }`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${
                  offers ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#eaecf0] bg-white p-6">
        <h2 className="text-xl font-bold text-[#101828]">Segurança e acesso</h2>
        <p className="mt-1 text-sm text-[#475467]">
          Proteja sua conta e gerencie seus dispositivos conectados.
        </p>

        <div className="mt-6 divide-y divide-[#eaecf0] border-t border-[#eaecf0]">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-[#f2f4f7] text-[#475467]">
                <KeyRound size={18} strokeWidth={1.8} />
              </span>
              <div>
                <p className="text-sm font-bold text-[#101828]">Senha</p>
                <p className="text-xs text-[#475467]">Atualize sua senha regularmente.</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg border border-[#d0d5dd] px-4 py-2.5 text-sm font-bold text-[#344054] transition hover:bg-[#f9fafb]"
            >
              Alterar senha
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-[#f2f4f7] text-[#475467]">
                <Monitor size={18} strokeWidth={1.8} />
              </span>
              <div>
                <p className="text-sm font-bold text-[#101828]">Sessões e dispositivos</p>
                <p className="text-xs text-[#475467]">Veja ou encerre sessões conectadas à sua conta.</p>
              </div>
            </div>
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-bold text-[#3448c5] transition hover:underline"
            >
              Gerenciar
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
