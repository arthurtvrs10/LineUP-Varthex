"use client";

import { useState } from "react";
import {
  Plus,
  Bell,
  CheckCircle2,
  MessageCircle,
  RotateCcw,
  Gift,
  UserX,
  Eye,
} from "lucide-react";

const metrics = [
  { label: "Mensagens enviadas", value: "611", trend: "+18% vs mês ant." },
  { label: "Taxa de entrega", value: "98,4%" },
  { label: "Automações ativas", value: "4" },
  { label: "Clientes alcançados", value: "284" },
];

type Automation = {
  icon: typeof Bell;
  name: string;
  active: boolean;
  message: string;
  trigger: string;
  stats: string;
};

const automations: Automation[] = [
  {
    icon: Bell,
    name: "Lembrete de agendamento",
    active: true,
    message: "Olá {nome}! Lembrando do seu agendamento amanhã às {hora} com {barbeiro}.",
    trigger: "24h antes do horário",
    stats: "148 enviados · 99% entregues",
  },
  {
    icon: CheckCircle2,
    name: "Confirmação de agendamento",
    active: true,
    message: "Agendamento confirmado! {servico} em {data} às {hora}.",
    trigger: "Imediatamente após agendar",
    stats: "312 enviados · 99% entregues",
  },
  {
    icon: MessageCircle,
    name: "Pós-atendimento",
    active: true,
    message: "Como foi seu atendimento, {nome}? Sua opinião é muito importante para nós.",
    trigger: "2h após concluir",
    stats: "87 enviados · 98% entregues",
  },
  {
    icon: RotateCcw,
    name: "Lembrete de retorno",
    active: false,
    message: "Está na hora do corte, {nome}! Agende agora e ganhe um desconto especial.",
    trigger: "25 dias sem visita",
    stats: "23 enviados · 87% entregues",
  },
  {
    icon: Gift,
    name: "Aniversário",
    active: true,
    message: "Feliz aniversário, {nome}! 🎉 Um presente especial te espera.",
    trigger: "Dia do aniversário",
    stats: "41 enviados · 100% entregues",
  },
  {
    icon: UserX,
    name: "Recuperação de inativo",
    active: false,
    message: "Sentimos sua falta, {nome}! Volte e ganhe um benefício exclusivo.",
    trigger: "60 dias sem visita",
    stats: "9 enviados · 78% entregues",
  },
];

type Template = {
  name: string;
  category: string;
  message: string;
  vars: string[];
};

const templates: Template[] = [
  {
    name: "Lembrete padrão",
    category: "Agendamento",
    message: "Olá {nome}! Seu agendamento é amanhã às {hora} com {barbeiro}.",
    vars: ["{nome}", "{hora}", "{barbeiro}"],
  },
  {
    name: "Promoção mensal",
    category: "Marketing",
    message: "Este mês na {barbearia}: novidades especiais esperam por você.",
    vars: ["{nome}", "{barbearia}"],
  },
  {
    name: "Recuperação de cliente",
    category: "Retenção",
    message: "Saudades de você, {nome}! Que tal agendar um horário?",
    vars: ["{nome}"],
  },
  {
    name: "Aniversário",
    category: "Relacionamento",
    message: "Feliz aniversário, {nome}! 🎂 Um presente especial te espera.",
    vars: ["{nome}"],
  },
  {
    name: "Pós-atendimento",
    category: "Avaliação",
    message: "Obrigado pela visita, {nome}! Como foi seu atendimento com {barbeiro}?",
    vars: ["{nome}", "{barbeiro}"],
  },
];

type ContactHistory = {
  initials: string;
  name: string;
  phone: string;
  message: string;
  date: string;
};

const history: ContactHistory[] = [
  { initials: "TP", name: "Thiago Pereira", phone: "(11) 94567-8901", message: "Lembrete de agendamento", date: "14/08/2026" },
  { initials: "JS", name: "João Silva", phone: "(11) 96543-2109", message: "Lembrete de retorno", date: "14/08/2026" },
  { initials: "MR", name: "Mateus Rodrigues", phone: "(11) 95678-1234", message: "Confirmação de agendamento", date: "14/08/2026" },
  { initials: "DM", name: "Diego Martins", phone: "(11) 91234-5678", message: "Lembrete de retorno", date: "14/08/2026" },
  { initials: "RC", name: "Rafael Costa", phone: "(11) 92345-6789", message: "Pós-atendimento", date: "14/08/2026" },
  { initials: "TP", name: "Thiago Pereira", phone: "(11) 94567-8901", message: "Lembrete de agendamento", date: "14/08/2026" },
  { initials: "BF", name: "Bruno Ferreira", phone: "(11) 93456-7890", message: "Lembrete de agendamento", date: "14/08/2026" },
  { initials: "JS", name: "João Silva", phone: "(11) 96543-2109", message: "Lembrete de retorno", date: "14/08/2026" },
  { initials: "MR", name: "Mateus Rodrigues", phone: "(11) 95678-1234", message: "Aniversário", date: "14/08/2026" },
  { initials: "TP", name: "Thiago Pereira", phone: "(11) 94567-8901", message: "Lembrete de retorno", date: "14/08/2026" },
];

export function AdminCrmPage() {
  const [activeAutomations, setActiveAutomations] = useState(
    () => new Set(automations.filter((a) => a.active).map((a) => a.name)),
  );

  function toggleAutomation(name: string) {
    setActiveAutomations((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const activeCount = activeAutomations.size;

  return (
    <div className="flex w-full flex-col items-start">
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="font-['Manrope',sans-serif] text-2xl font-bold tracking-[-0.48px] text-[#0d1831]">
            CRM & WhatsApp
          </h1>
          <p className="pt-0.5 text-sm text-[#686a73]">Relacionamento e comunicação automatizada com clientes</p>
        </div>
        <button
          type="button"
          className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#7247f3] px-4 text-sm font-medium text-white transition hover:bg-[#5c2ee0]"
        >
          <Plus size={16} strokeWidth={2} />
          Nova campanha
        </button>
      </div>

      <div className="grid w-full grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-sm text-[#686a73]">{metric.label}</p>
            <p className="pt-1 font-['Manrope',sans-serif] text-2xl font-bold text-[#0d1831]">{metric.value}</p>
            {metric.trend && <p className="pt-1.5 text-xs text-[#27865b]">{metric.trend}</p>}
          </div>
        ))}
      </div>

      <div className="flex w-full items-center justify-between pt-8">
        <h2 className="text-lg font-semibold text-[#0d1831]">
          Automações <span className="text-sm font-normal text-[#686a73]">— {activeCount} de {automations.length} ativas</span>
        </h2>
        <button
          type="button"
          className="flex items-center gap-2 rounded-[8px] border border-[#e6e4df] bg-white px-3 py-1.5 text-sm font-medium text-[#0d1831] transition hover:bg-[#f7f6f2]"
        >
          <Plus size={13} strokeWidth={2} />
          Nova automação
        </button>
      </div>

      <div className="flex w-full flex-col gap-3 pt-4">
        {automations.map((automation) => {
          const Icon = automation.icon;
          const isActive = activeAutomations.has(automation.name);
          return (
            <div key={automation.name} className="flex items-start gap-4 rounded-[12px] border border-[#e6e4df] bg-white p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#ede9fd] text-[#7247f3]">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#0d1831]">{automation.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      isActive ? "bg-[#e8f7f1] text-[#27865b]" : "bg-[#f0efea] text-[#686a73]"
                    }`}
                  >
                    {isActive ? "Ativa" : "Pausada"}
                  </span>
                </div>
                <p className="pt-2 rounded-[8px] bg-[#f7f6f2] px-3 py-2 text-sm text-[#686a73]">{automation.message}</p>
                <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-[#686a73]">
                  <span>{automation.trigger}</span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={12} />
                    WhatsApp
                  </span>
                  <span>{automation.stats}</span>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => toggleAutomation(automation.name)}
                className={`relative h-5 w-9 shrink-0 rounded-full transition ${isActive ? "bg-[#7247f3]" : "bg-[#e6e4df]"}`}
              >
                <span
                  className={`absolute top-0.5 size-4 rounded-full bg-white transition ${
                    isActive ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex w-full items-center justify-between pt-8">
        <h2 className="text-lg font-semibold text-[#0d1831]">Modelos de mensagem</h2>
        <button
          type="button"
          className="flex items-center gap-2 rounded-[8px] border border-[#e6e4df] bg-white px-3 py-1.5 text-sm font-medium text-[#0d1831] transition hover:bg-[#f7f6f2]"
        >
          <Plus size={13} strokeWidth={2} />
          Novo modelo
        </button>
      </div>

      <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        {templates.map((template) => (
          <div key={template.name} className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-[#0d1831]">{template.name}</p>
                <span className="mt-1.5 inline-block rounded-full bg-[#f0efea] px-2 py-0.5 text-xs font-medium text-[#686a73]">
                  {template.category}
                </span>
              </div>
              <button
                type="button"
                className="rounded-[8px] border border-[#e6e4df] bg-white px-2.5 py-1 text-xs font-medium text-[#0d1831] transition hover:bg-[#f7f6f2]"
              >
                Editar
              </button>
            </div>
            <p className="mt-4 rounded-[8px] bg-[#f7f6f2] px-3 py-2.5 text-sm text-[#686a73]">{template.message}</p>
            <div className="flex flex-wrap gap-1 pt-3">
              {template.vars.map((v) => (
                <span key={v} className="rounded-full bg-[#ede9fd] px-2 py-0.5 text-xs font-medium text-[#7247f3]">
                  {v}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2 className="pt-8 text-lg font-semibold text-[#0d1831]">Histórico de contatos</h2>
      <div className="w-full pt-4">
        <div className="w-full overflow-x-auto rounded-[12px] border border-[#e6e4df] bg-white">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e6e4df] bg-[#f7f6f2] text-xs font-medium text-[#686a73]">
                <th className="sticky left-0 z-10 bg-white px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Mensagem enviada</th>
                <th className="px-4 py-3 font-medium">Canal</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {history.map((item, i) => (
                <tr key={i} className="border-b border-[#e6e4df] last:border-b-0">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#ede9fd] text-xs font-semibold text-[#7247f3]">
                        {item.initials}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-[#0d1831]">{item.name}</p>
                        <p className="text-xs text-[#686a73]">{item.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#0d1831]">{item.message}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-sm text-[#686a73]">
                      <MessageCircle size={13} className="text-[#27865b]" />
                      WhatsApp
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#686a73]">{item.date}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#e8f7f1] px-2 py-0.5 text-xs font-medium text-[#27865b]">
                      Entregue
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" aria-label="Ver detalhes" className="text-[#b0afa8] transition hover:text-[#686a73]">
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
