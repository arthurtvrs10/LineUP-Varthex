"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, CalendarCog, Store, UserRound, Wallet } from "lucide-react";
import {
  FieldInput,
  SectionCard,
  ToggleRow,
} from "@/components/ui/SettingsPrimitives";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiFetch, ApiError } from "@/lib/api";

type TenantResponse = {
  id: string;
  tradeName: string;
  legalName: string | null;
  document: string | null;
  status: string;
  defaultTimeZone: string;
  locale: string;
  currency: string;
  email: string | null;
  phone: string | null;
  logoUrl: string | null;
  slug: string | null;
  version: number;
};

type UnitResponse = {
  id: string;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  country: string;
  timeZone: string;
  active: boolean;
  version: number;
};

type BarbeariaForm = {
  tradeName: string;
  document: string;
  phone: string;
  street: string;
  number: string;
  city: string;
  state: string;
};

export function AdminConfiguracoesPage() {
  const { data: session, update: updateSession } = useSession();
  const [nome, setNome] = useState("");
  const [savingConta, setSavingConta] = useState(false);
  const [tenant, setTenant] = useState<TenantResponse>();
  const [unit, setUnit] = useState<UnitResponse>();
  const [form, setForm] = useState<BarbeariaForm>({
    tradeName: "",
    document: "",
    phone: "",
    street: "",
    number: "",
    city: "",
    state: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const toast = useToast();

  useEffect(() => {
    if (session?.user?.name) setNome(session.user.name);
  }, [session?.user?.name]);

  async function salvarConta() {
    setSavingConta(true);
    try {
      await apiFetch("/users/me", { method: "PATCH", body: { name: nome } });
      await updateSession?.({ name: nome });
      toast.mostrar("Perfil atualizado!");
    } catch (err) {
      toast.mostrar(err instanceof ApiError ? err.message : "Não foi possível salvar.", "erro");
    } finally {
      setSavingConta(false);
    }
  }

  async function carregar() {
    try {
      const [t, u] = await Promise.all([
        apiFetch<TenantResponse>("/tenant"),
        apiFetch<UnitResponse>("/unit"),
      ]);
      setTenant(t);
      setUnit(u);
      setForm({
        tradeName: t.tradeName,
        document: t.document ?? "",
        phone: t.phone ?? "",
        street: u.street ?? "",
        number: u.number ?? "",
        city: u.city ?? "",
        state: u.state ?? "",
      });
      setError(undefined);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível carregar os dados da barbearia.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function campo<K extends keyof BarbeariaForm>(chave: K) {
    return (valor: string) => setForm((prev) => ({ ...prev, [chave]: valor }));
  }

  async function salvar() {
    if (!tenant || !unit) return;

    setSaving(true);
    try {
      const tenantAtualizado = await apiFetch<TenantResponse>("/tenant", {
        method: "PATCH",
        body: {
          tradeName: form.tradeName,
          legalName: tenant.legalName,
          document: form.document || null,
          defaultTimeZone: tenant.defaultTimeZone,
          locale: tenant.locale,
          currency: tenant.currency,
          email: tenant.email,
          phone: form.phone || null,
          version: tenant.version,
        },
      });

      const unitAtualizada = await apiFetch<UnitResponse>("/unit", {
        method: "PATCH",
        body: {
          name: unit.name,
          document: unit.document,
          email: unit.email,
          phone: unit.phone,
          street: form.street || null,
          number: form.number || null,
          complement: unit.complement,
          district: unit.district,
          city: form.city || null,
          state: form.state || null,
          country: unit.country,
          timeZone: unit.timeZone,
          active: unit.active,
        },
      });

      setTenant(tenantAtualizado);
      setUnit(unitAtualizada);
      toast.mostrar("Dados da barbearia atualizados.");
    } catch (err) {
      toast.mostrar(
        err instanceof ApiError ? err.message : "Não foi possível salvar as alterações.",
        "erro",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <SectionCard icon={UserRound} title="Conta">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldInput label="Nome" value={nome} onChange={setNome} />
          <FieldInput label="E-mail" value={session?.user?.email ?? ""} onChange={() => {}} type="email" disabled />
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={salvarConta}
            disabled={savingConta}
            className="flex h-10 items-center gap-2 rounded-[10px] bg-accent px-4 text-sm font-medium text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingConta ? "Salvando…" : "Salvar perfil"}
          </button>
        </div>
      </SectionCard>

      <SectionCard icon={Store} title="Barbearia">
        {error && (
          <p className="mb-4 rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">
            {error}
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldInput
            label="Nome da barbearia"
            value={form.tradeName}
            onChange={campo("tradeName")}
            disabled={loading}
          />
          <FieldInput
            label="CNPJ/CPF"
            value={form.document}
            onChange={campo("document")}
            disabled={loading}
          />
          <FieldInput
            label="Telefone de contato"
            value={form.phone}
            onChange={campo("phone")}
            disabled={loading}
          />
          <FieldInput
            label="Rua"
            value={form.street}
            onChange={campo("street")}
            disabled={loading}
          />
          <FieldInput
            label="Número"
            value={form.number}
            onChange={campo("number")}
            disabled={loading}
          />
          <FieldInput
            label="Cidade"
            value={form.city}
            onChange={campo("city")}
            disabled={loading}
          />
          <FieldInput
            label="Estado (UF)"
            value={form.state}
            onChange={campo("state")}
            disabled={loading}
          />
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={salvar}
            disabled={loading || saving}
            className="flex h-10 items-center gap-2 rounded-[10px] bg-accent px-4 text-sm font-medium text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Salvando…" : "Salvar barbearia"}
          </button>
        </div>
      </SectionCard>

      <SectionCard icon={CalendarCog} title="Agendamento">
        <p className="mb-4 text-sm text-secondary">
          Depende do domínio de Scheduling, ainda não construído no backend. Campos abaixo são só
          visuais.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldInput
            label="Antecedência mínima (horas)"
            defaultValue="2"
            hint="Tempo mínimo entre a reserva e o atendimento."
            disabled
          />
          <FieldInput
            label="Prazo de cancelamento (horas)"
            defaultValue="12"
            hint="Depois disso o cliente não cancela sozinho."
            disabled
          />
        </div>
      </SectionCard>

      <SectionCard icon={Wallet} title="Financeiro e comissões">
        <p className="mb-4 text-sm text-secondary">
          Depende do domínio de Commissions, ainda não construído no backend. Campos abaixo são só
          visuais.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldInput
            label="Comissão padrão do barbeiro (%)"
            defaultValue="40"
            hint="Aplicada a novos profissionais."
            disabled
          />
          <FieldInput label="Dia de fechamento do caixa" defaultValue="Último dia do mês" disabled />
        </div>
      </SectionCard>

      <SectionCard icon={Bell} title="Notificações">
        <p className="mb-4 text-sm text-secondary">
          Depende do domínio de Notifications, ainda não construído no backend. Toggles abaixo são
          só visuais.
        </p>
        <div className="flex flex-col opacity-60">
          <ToggleRow
            title="Novo agendamento"
            hint="Avisa quando um cliente reserva um horário."
            defaultOn
          />
          <ToggleRow title="Cancelamento" hint="Avisa quando um horário é liberado." defaultOn border={false} />
        </div>
      </SectionCard>

      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
