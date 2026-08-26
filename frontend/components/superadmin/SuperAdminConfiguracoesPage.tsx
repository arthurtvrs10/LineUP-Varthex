"use client";

import { Settings, CreditCard, Bell, Shield, Plug, Mail, Save } from "lucide-react";

function Toggle({ on }: { on: boolean }) {
  return (
    <div className={`relative h-5 w-9 shrink-0 rounded-full ${on ? "bg-[#6c4cf1]" : "bg-[#d4d2cc]"}`}>
      <div
        className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-all ${on ? "left-[18px]" : "left-0.5"}`}
      />
    </div>
  );
}

function FieldInput({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium text-[#17181d]">{label}</p>
      <div className="flex h-10 items-center rounded-[10px] border border-[#e6e4df] bg-white px-3">
        <p className="text-sm text-[#17181d]">{value}</p>
      </div>
      {hint && <p className="text-xs text-[#686a73]">{hint}</p>}
    </div>
  );
}

function ToggleRow({ title, hint, on, border = true }: { title: string; hint: string; on: boolean; border?: boolean }) {
  return (
    <div className={`flex items-center gap-6 py-3 ${border ? "border-b border-[#e6e4df]" : ""}`}>
      <div className="flex-1">
        <p className="text-sm font-medium text-[#17181d]">{title}</p>
        <p className="pt-0.5 text-xs text-[#686a73]">{hint}</p>
      </div>
      <Toggle on={on} />
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Settings;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col rounded-[12px] border border-[#e6e4df] bg-white p-6">
      <div className="flex items-center gap-3 border-b border-[#e6e4df] pb-3">
        <div className="grid size-8 place-items-center rounded-[8px] bg-[#ede9fd]">
          <Icon size={16} strokeWidth={1.8} className="text-[#6c4cf1]" />
        </div>
        <p className="text-sm font-bold tracking-[-0.28px] text-[#17181d]">{title}</p>
      </div>
      <div className="flex flex-col gap-4 pt-5">{children}</div>
    </div>
  );
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
  return (
    <div className="flex w-full flex-col items-end gap-4">
      <div className="flex w-full flex-col gap-4">
        <SectionCard icon={Settings} title="Geral">
          <div className="grid grid-cols-2 gap-4">
            <FieldInput label="Nome da plataforma" value="Varthex Barber" />
            <FieldInput label="E-mail de suporte" value="suporte@varthex.com" />
            <FieldInput label="Fuso horário padrão" value="America/Sao_Paulo (BRT)" />
            <FieldInput
              label="Dias de trial para novos ADMINs"
              value="14"
              hint="Período gratuito ao criar uma nova barbearia."
            />
          </div>
          <ToggleRow
            title="Modo manutenção"
            hint="Bloqueia o acesso de todos os usuários não-SUPER_ADMIN."
            on={false}
            border={false}
          />
        </SectionCard>

        <SectionCard icon={CreditCard} title="Planos e cobrança">
          <div className="grid grid-cols-2 gap-4">
            <FieldInput label="Moeda" value="BRL — Real brasileiro" />
            <FieldInput
              label="Carência após inadimplência (dias)"
              value="3"
              hint="Dias antes de bloquear automaticamente."
            />
          </div>
          <div className="flex flex-col">
            <ToggleRow
              title="Bloquear automaticamente após carência"
              hint="Suspende o acesso da barbearia se não regularizar."
              on={true}
            />
            <ToggleRow
              title="Enviar e-mail de cobrança automaticamente"
              hint="Notifica o responsável quando a fatura está próxima do vencimento."
              on={true}
              border={false}
            />
          </div>
        </SectionCard>

        <SectionCard icon={Bell} title="Notificações internas">
          <div className="flex flex-col">
            <ToggleRow
              title="Nova barbearia cadastrada"
              hint="Alerta quando um ADMIN completa o onboarding."
              on={true}
            />
            <ToggleRow title="Falha no pagamento" hint="Quando uma cobrança automática é recusada." on={true} />
            <ToggleRow
              title="Alertas de sistema"
              hint="Falhas, latência elevada e incidentes detectados."
              on={true}
            />
            <ToggleRow
              title="Resumo semanal por e-mail"
              hint="Relatório consolidado toda segunda-feira às 8h."
              on={false}
              border={false}
            />
          </div>
          <FieldInput
            label="Webhook para alertas (Slack / Discord)"
            value=""
            hint="Envia alertas automáticos para o canal configurado."
          />
        </SectionCard>

        <SectionCard icon={Shield} title="Segurança">
          <div className="grid grid-cols-2 gap-4">
            <FieldInput
              label="Timeout de sessão (minutos)"
              value="480"
              hint="Sessão encerrada após inatividade."
            />
            <FieldInput
              label="Máx. tentativas de login"
              value="5"
              hint="Conta bloqueada temporariamente após esse número."
            />
          </div>
          <ToggleRow
            title="Exigir 2FA para SUPER_ADMIN"
            hint="Obrigatório para todos com acesso ao painel global."
            on={false}
          />
          <FieldInput
            label="Whitelist de IPs para SUPER_ADMIN"
            value="191.248.12.44, 200.137.8.91"
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
                  <p className="text-sm font-medium text-[#17181d]">{i.nome}</p>
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
          <div className="grid grid-cols-2 gap-4">
            <FieldInput label="Nome do remetente" value="Varthex Barber" />
            <FieldInput label="E-mail de envio" value="noreply@varthex.com" />
            <FieldInput label="E-mail de resposta (reply-to)" value="suporte@varthex.com" />
            <FieldInput label="Domínio verificado" value="mail.varthex.com" hint="Verificado via DNS." />
          </div>
        </SectionCard>
      </div>

      <button
        type="button"
        className="flex h-10 items-center gap-2 rounded-[10px] bg-[#6c4cf1] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#5a3fd6]"
      >
        <Save size={15} strokeWidth={1.8} />
        Salvar alterações
      </button>
    </div>
  );
}
