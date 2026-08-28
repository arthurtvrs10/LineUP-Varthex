"use client";

import { useState } from "react";
import { Search, ChevronDown, Download, AlertTriangle, CheckCircle2, XCircle, Clock, RotateCw } from "lucide-react";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/ui/Modal";
import { RadioCards, SelectField } from "@/components/ui/FormFields";
import { Toast, useToast } from "@/components/ui/Toast";

const metrics = [
  { label: "MRR atual", value: "R$ 217,00", color: "#0d1831" },
  { label: "Assinaturas ativas", value: "2", color: "#27865b" },
  { label: "Inadimplentes", value: "1", color: "#c84a4a" },
  { label: "Em trial", value: "1", color: "#3478c9" },
];

type Status = "Ativo" | "Inadimplente" | "Cancelado" | "Trial";

type Assinatura = {
  initials: string;
  name: string;
  responsavel: string;
  avatarBg: string;
  avatarColor: string;
  plano: "Pro" | "Enterprise" | "Starter";
  planoBg: string;
  planoColor: string;
  valor: string;
  status: Status;
  atraso?: string;
  pagamento: string;
  proximaCobranca: string;
};

const assinaturas: Assinatura[] = [
  {
    initials: "BE",
    name: "Barbearia Estilo Único",
    responsavel: "Rafael Mendes",
    avatarBg: "#ede9fd",
    avatarColor: "#7247f3",
    plano: "Pro",
    planoBg: "#ede9fd",
    planoColor: "#7247f3",
    valor: "R$ 119,00",
    status: "Ativo",
    pagamento: "Cartão de crédito",
    proximaCobranca: "04/09/2026",
  },
  {
    initials: "BP",
    name: "BarberKing Premium",
    responsavel: "Carlos Drummond",
    avatarBg: "#ede9fd",
    avatarColor: "#7247f3",
    plano: "Enterprise",
    planoBg: "#fbf4e8",
    planoColor: "#c8a86b",
    valor: "R$ 299,00",
    status: "Inadimplente",
    atraso: "(12d)",
    pagamento: "Boleto bancário",
    proximaCobranca: "05/09/2026",
  },
  {
    initials: "C&",
    name: "Corte & Arte",
    responsavel: "Pedro Alves",
    avatarBg: "#ede9fd",
    avatarColor: "#7247f3",
    plano: "Starter",
    planoBg: "#f0efea",
    planoColor: "#686a73",
    valor: "R$ 49,00",
    status: "Ativo",
    pagamento: "PIX",
    proximaCobranca: "06/09/2026",
  },
  {
    initials: "SN",
    name: "Studio Nobre",
    responsavel: "André Nobre",
    avatarBg: "#ede9fd",
    avatarColor: "#7247f3",
    plano: "Pro",
    planoBg: "#ede9fd",
    planoColor: "#7247f3",
    valor: "R$ 119,00",
    status: "Cancelado",
    pagamento: "Cartão de crédito",
    proximaCobranca: "—",
  },
  {
    initials: "BH",
    name: "Barber House Sul",
    responsavel: "Gustavo Ramos",
    avatarBg: "#ede9fd",
    avatarColor: "#7247f3",
    plano: "Starter",
    planoBg: "#f0efea",
    planoColor: "#686a73",
    valor: "R$ 49,00",
    status: "Trial",
    pagamento: "Boleto bancário",
    proximaCobranca: "08/09/2026",
  },
];

const statusConfig: Record<Status, { bg: string; color: string; icon: typeof CheckCircle2 }> = {
  Ativo: { bg: "#e8f7f1", color: "#27865b", icon: CheckCircle2 },
  Inadimplente: { bg: "#fdeaea", color: "#c84a4a", icon: AlertTriangle },
  Cancelado: { bg: "#f0efea", color: "#686a73", icon: XCircle },
  Trial: { bg: "#eaf2fb", color: "#3478c9", icon: Clock },
};

export function SuperAdminAssinaturasPage() {
  const inadimplentesCount = assinaturas.filter((a) => a.status === "Inadimplente").length;
  const [exportarAberto, setExportarAberto] = useState(false);
  const toast = useToast();

  function exportar(event: React.FormEvent) {
    event.preventDefault();
    setExportarAberto(false);
    toast.mostrar("Exportação iniciada. O arquivo chega por e-mail em instantes.");
  }

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="grid w-full grid-cols-2 lg:grid-cols-4 gap-[5px]">
        {metrics.map((m) => (
          <div key={m.label} className="flex-1 rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-sm text-[#686a73]">{m.label}</p>
            <p className="pt-1 text-2xl font-bold" style={{ color: m.color }}>
              {m.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex w-full flex-wrap items-center gap-3 pt-2">
        <div className="flex h-9 flex-1 max-w-[384px] items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-3">
          <Search size={15} strokeWidth={1.8} className="text-[#b0afa8]" />
          <input
            type="text"
            placeholder="Buscar barbearia ou responsável..."
            className="h-full flex-1 bg-transparent text-sm text-[#0d1831] placeholder:text-[#b0afa8] focus:outline-none"
          />
        </div>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-3 text-sm text-[#0d1831]"
        >
          Todos os status
          <ChevronDown size={12} strokeWidth={2} className="text-[#686a73]" />
        </button>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-3 text-sm text-[#0d1831]"
        >
          Todos os planos
          <ChevronDown size={12} strokeWidth={2} className="text-[#686a73]" />
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setExportarAberto(true)}
          className="flex h-10 items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-[#7247f3] px-4 text-sm font-medium text-white transition hover:bg-[#5c2ee0]"
        >
          <Download size={16} strokeWidth={1.8} />
          Exportar
        </button>
      </div>

      {inadimplentesCount > 0 && (
        <div className="flex w-full items-start gap-3 rounded-[10px] border border-[#c84a4a]/20 bg-[#fdeaea] p-4">
          <AlertTriangle size={16} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[#c84a4a]" />
          <div>
            <p className="text-sm font-medium text-[#c84a4a]">{inadimplentesCount} assinatura(s) inadimplente(s)</p>
            <p className="pt-0.5 text-xs text-[#c84a4a]/80">
              Barbearias com pagamento em atraso podem perder acesso à plataforma automaticamente após 30 dias.
            </p>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto rounded-[12px] border border-[#e6e4df] bg-white">
        <table className="w-full min-w-[1000px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#e6e4df] bg-[#f7f6f2] text-xs font-medium text-[#686a73]">
              <th className="sticky left-0 z-10 bg-white px-4 py-3 font-medium">Barbearia</th>
              <th className="px-4 py-3 font-medium">Plano</th>
              <th className="px-4 py-3 text-center font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-center font-medium">Pagamento</th>
              <th className="px-4 py-3 text-right font-medium">Próxima cobrança</th>
              <th className="px-4 py-3 text-center font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {assinaturas.map((a) => {
              const StatusIcon = statusConfig[a.status].icon;
              return (
                <tr key={a.name} className="border-b border-[#e6e4df] last:border-b-0">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold"
                        style={{ backgroundColor: a.avatarBg, color: a.avatarColor }}
                      >
                        {a.initials}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-[#0d1831]">{a.name}</p>
                        <p className="text-xs text-[#686a73]">{a.responsavel}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: a.planoBg, color: a.planoColor }}
                    >
                      {a.plano}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-medium text-[#0d1831]">{a.valor}</span>
                    <span className="text-xs text-[#686a73]">/mês</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <StatusIcon size={13} strokeWidth={1.8} style={{ color: statusConfig[a.status].color }} />
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: statusConfig[a.status].bg, color: statusConfig[a.status].color }}
                      >
                        {a.status}
                      </span>
                      {a.atraso && <span className="text-xs text-[#c84a4a]">{a.atraso}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-[#686a73]">{a.pagamento}</td>
                  <td className="px-4 py-3 text-right text-sm text-[#686a73]">{a.proximaCobranca}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-3">
                      {a.status === "Inadimplente" && (
                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-sm text-[#686a73] transition hover:text-[#0d1831]"
                        >
                          <RotateCw size={13} strokeWidth={1.8} />
                          Cobrar
                        </button>
                      )}
                      <button type="button" className="text-sm text-[#686a73] transition hover:text-[#0d1831]">
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={exportarAberto}
        onClose={() => setExportarAberto(false)}
        title="Exportar assinaturas"
        description={`${assinaturas.length} assinaturas no filtro atual.`}
        size="sm"
        footer={
          <>
            <ModalCancelButton onClick={() => setExportarAberto(false)} />
            <ModalSubmitButton form="form-exportar-assinaturas">Exportar</ModalSubmitButton>
          </>
        }
      >
        <form id="form-exportar-assinaturas" onSubmit={exportar} className="flex flex-col gap-5">
          <div>
            <p className="mb-2 text-sm font-medium text-[#0d1831]">Formato</p>
            <RadioCards
              name="formato"
              defaultValue="csv"
              options={[
                { value: "csv", label: "CSV", hint: "Abre no Excel e no Google Sheets." },
                { value: "xlsx", label: "Excel (.xlsx)", hint: "Mantém formatação e tipos." },
                { value: "pdf", label: "PDF", hint: "Para arquivo e envio." },
              ]}
            />
          </div>
          <SelectField
            label="Escopo"
            options={[
              "Somente as assinaturas filtradas",
              "Todas as assinaturas",
              "Somente inadimplentes",
            ]}
          />
        </form>
      </Modal>

      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
