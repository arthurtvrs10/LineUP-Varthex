"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, CalendarCog, Scissors, UserRound } from "lucide-react";
import { FieldInput, SectionCard } from "@/components/ui/SettingsPrimitives";
import { AvatarUpload } from "@/components/ui/AvatarUpload";
import { EmBreve } from "@/components/ui/EmBreve";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiFetch, ApiError } from "@/lib/api";

type BarberMeResponse = {
  id: string;
  displayName: string;
  bio: string | null;
  defaultCommissionPercent: number;
  version: number;
};

type MeResponse = { photoData: string | null };

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function BarberConfiguracoesPage() {
  const { data: session, update: updateSession } = useSession();
  const [barber, setBarber] = useState<BarberMeResponse>();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [nome, setNome] = useState("");
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [savingConta, setSavingConta] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (session?.user?.name) setNome(session.user.name);
  }, [session?.user?.name]);

  useEffect(() => {
    apiFetch<MeResponse>("/users/me").then((me) => setPhotoData(me.photoData)).catch(() => {});
  }, []);

  async function salvarConta() {
    setSavingConta(true);
    try {
      await apiFetch("/users/me", { method: "PATCH", body: { name: nome, photoData } });
      await updateSession?.({ name: nome });
      toast.mostrar("Perfil atualizado!");
    } catch (err) {
      toast.mostrar(err instanceof ApiError ? err.message : "Não foi possível salvar.", "erro");
    } finally {
      setSavingConta(false);
    }
  }

  useEffect(() => {
    apiFetch<BarberMeResponse>("/barbers/me")
      .then((data) => {
        setBarber(data);
        setDisplayName(data.displayName);
        setBio(data.bio ?? "");
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar seu perfil de barbeiro."));
  }, []);

  async function salvarPerfil() {
    if (!barber) return;
    setSaving(true);
    try {
      const updated = await apiFetch<BarberMeResponse>(`/barbers/${barber.id}`, {
        method: "PATCH",
        body: { displayName, bio: bio || null },
      });
      setBarber(updated);
      toast.mostrar("Perfil profissional atualizado!");
    } catch (err) {
      toast.mostrar(err instanceof ApiError ? err.message : "Não foi possível salvar.", "erro");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {error && (
        <p className="rounded-[10px] bg-[#fdecee] px-3 py-2 text-sm text-[#e0333f]">{error}</p>
      )}

      <SectionCard icon={UserRound} title="Conta">
        <div className="flex justify-center">
          <AvatarUpload
            photoData={photoData}
            initials={initialsFor(nome || session?.user?.email || "")}
            onChange={setPhotoData}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldInput label="Nome" value={nome} onChange={setNome} />
          <FieldInput label="E-mail" value={session?.user?.email ?? ""} onChange={() => {}} disabled type="email" />
        </div>
        <div className="flex justify-end">
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

      <SectionCard icon={Scissors} title="Perfil profissional">
        <FieldInput
          label="Nome de exibição"
          value={displayName}
          onChange={setDisplayName}
          hint="Aparece para clientes e para a equipe."
        />
        <FieldInput
          label="Bio"
          value={bio}
          onChange={setBio}
          hint="Pequena descrição do seu trabalho, especialidades etc."
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={salvarPerfil}
            disabled={saving || !barber}
            className="flex h-10 items-center gap-2 rounded-[10px] bg-accent px-4 text-sm font-medium text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </SectionCard>

      <SectionCard icon={CalendarCog} title="Agenda">
        <EmBreve text="Preferências de agenda (encaixes, fila automática, bloqueio fora do expediente) ainda não estão disponíveis." />
      </SectionCard>

      <SectionCard icon={Bell} title="Notificações">
        <EmBreve text="Você já é avisado no app a cada novo agendamento ou horário liberado. Aviso por e-mail para a equipe ainda não existe — por enquanto não há nada pra configurar aqui." />
      </SectionCard>

      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
