"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, CreditCard, Mail, Plug, Settings, Shield, UserRound } from "lucide-react";
import {
  FieldInput,
  SaveBar,
  SectionCard,
  ToggleRow,
} from "@/components/ui/SettingsPrimitives";
import { AvatarUpload } from "@/components/ui/AvatarUpload";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiFetch, ApiError } from "@/lib/api";

type MeResponse = { photoData: string | null };

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

type Integracao = {
  nome: string;
  descricao: string;
  status: "Conectado" | "Pendente" | "Desconectado";
  acao: string;
};

const integracoes: Integracao[] = [
  { nome: "Stripe", descricao: "Pagamentos e cobranças recorrentes", status: "Conectado", acao: "Editar" },
  { nome: "Twilio (WhatsApp)", descricao: "Envio de SMS e mensagens WhatsApp", status: "Conectado", acao: "Editar" },
  { nome: "SendGrid", descricao: "E-mail transacional", status: "Conectado", acao: "Editar" },
  { nome: "AWS S3", descricao: "Armazenamento de arquivos e imagens", status: "Conectado", acao: "Editar" },
  { nome: "Sentry", descricao: "Monitoramento de erros", status: "Pendente", acao: "Configurar" },
  { nome: "DataDog", descricao: "APM e observabilidade", status: "Desconectado", acao: "Configurar" },
];

const integracaoStyles: Record<Integracao["status"], { bg: string; color: string }> = {
  Conectado: { bg: "#e8f7f1", color: "#27865b" },
  Pendente: { bg: "#fdf3e3", color: "#d28b27" },
  Desconectado: { bg: "#f0efea", color: "#686a73" },
};

export function SuperAdminConfiguracoesPage() {
  const { data: session, update: updateSession } = useSession();
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

  return (
    <div className="flex w-full flex-col items-end gap-4">
      <div className="flex w-full flex-col gap-4">
        <SectionCard icon={UserRound} title="Conta">
          <div className="flex justify-center">
            <AvatarUpload
              photoData={photoData}
              initials={initialsFor(nome || session?.user?.email || "")}
              onChange={setPhotoData}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <SectionCard icon={Settings} title="Geral">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldInput label="Nome da plataforma" defaultValue="LINEUP" />
            <FieldInput label="E-mail de suporte" defaultValue="suporte@lineup.com" />
            <FieldInput label="Fuso horário padrão" defaultValue="America/Sao_Paulo (BRT)" />
            <FieldInput
              label="Dias de trial para novos ADMINs"
              defaultValue="14"
              hint="Período gratuito ao criar uma nova barbearia."
            />
          </div>
          <ToggleRow
            title="Modo manutenção"
            hint="Bloqueia o acesso de todos os usuários não-SUPER_ADMIN."
            defaultOn={false}
            border={false}
          />
        </SectionCard>

        <SectionCard icon={CreditCard} title="Planos e cobrança">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldInput label="Moeda" defaultValue="BRL — Real brasileiro" />
            <FieldInput
              label="Carência após inadimplência (dias)"
              defaultValue="3"
              hint="Dias antes de bloquear automaticamente."
            />
          </div>
          <div className="flex flex-col">
            <ToggleRow
              title="Bloquear automaticamente após carência"
              hint="Suspende o acesso da barbearia se não regularizar."
              defaultOn
            />
            <ToggleRow
              title="Enviar e-mail de cobrança automaticamente"
              hint="Notifica o responsável quando a fatura está próxima do vencimento."
              defaultOn
              border={false}
            />
          </div>
        </SectionCard>

        <SectionCard icon={Bell} title="Notificações internas">
          <div className="flex flex-col">
            <ToggleRow
              title="Nova barbearia cadastrada"
              hint="Alerta quando um ADMIN completa o onboarding."
              defaultOn
            />
            <ToggleRow title="Falha no pagamento" hint="Quando uma cobrança automática é recusada." defaultOn />
            <ToggleRow
              title="Alertas de sistema"
              hint="Falhas, latência elevada e incidentes detectados."
              defaultOn
            />
            <ToggleRow
              title="Resumo semanal por e-mail"
              hint="Relatório consolidado toda segunda-feira às 8h."
              defaultOn={false}
              border={false}
            />
          </div>
          <FieldInput
            label="Webhook para alertas (Slack / Discord)"
            defaultValue=""
            hint="Envia alertas automáticos para o canal configurado."
          />
        </SectionCard>

        <SectionCard icon={Shield} title="Segurança">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldInput
              label="Timeout de sessão (minutos)"
              defaultValue="480"
              hint="Sessão encerrada após inatividade."
            />
            <FieldInput
              label="Máx. tentativas de login"
              defaultValue="5"
              hint="Conta bloqueada temporariamente após esse número."
            />
          </div>
          <ToggleRow
            title="Exigir 2FA para SUPER_ADMIN"
            hint="Obrigatório para todos com acesso ao painel global."
            defaultOn={false}
          />
          <FieldInput
            label="Whitelist de IPs para SUPER_ADMIN"
            defaultValue="191.248.12.44, 200.137.8.91"
            hint="Deixe vazio para não restringir. Separe por vírgula."
          />
        </SectionCard>

        <SectionCard icon={Plug} title="Integrações">
          <div className="flex flex-col">
            {integracoes.map((i, idx) => (
              <div
                key={i.nome}
                className={`flex items-center gap-4 py-3 ${idx !== integracoes.length - 1 ? "border-b border-[#e6e4df]" : ""}`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#0d1831]">{i.nome}</p>
                  <p className="text-xs text-[#686a73]">{i.descricao}</p>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: integracaoStyles[i.status].bg, color: integracaoStyles[i.status].color }}
                >
                  {i.status}
                </span>
                <button
                  type="button"
                  className="flex h-8 items-center justify-center rounded-[10px] px-3 text-sm text-[#686a73] transition hover:bg-[#f7f6f2]"
                >
                  {i.acao}
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={Mail} title="E-mails transacionais">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldInput label="Nome do remetente" defaultValue="LINEUP" />
            <FieldInput label="E-mail de envio" defaultValue="noreply@lineup.com" />
            <FieldInput label="E-mail de resposta (reply-to)" defaultValue="suporte@lineup.com" />
            <FieldInput label="Domínio verificado" defaultValue="mail.lineup.com" hint="Verificado via DNS." />
          </div>
        </SectionCard>
      </div>

      <SaveBar />
      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
