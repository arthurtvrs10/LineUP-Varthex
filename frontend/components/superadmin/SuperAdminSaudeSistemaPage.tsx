"use client";

import { useState } from "react";
import { Toast, useToast } from "@/components/ui/Toast";
import {
  AlertTriangle,
  RotateCw,
  CheckCircle2,
  Cpu,
  Database,
  Zap,
  Gauge,
  Activity,
  AlertOctagon,
  Wifi,
  Layers,
} from "lucide-react";

const metrics = [
  { label: "CPU (API)", value: "38%", bg: "#f0efea", color: "#686a73", icon: Cpu },
  { label: "Memória", value: "62%", bg: "#f0efea", color: "#686a73", icon: Layers },
  { label: "Req/min", value: "1.240", bg: "#f0efea", color: "#686a73", icon: Zap },
  { label: "Latência P99", value: "180ms", bg: "#f0efea", color: "#686a73", icon: Gauge },
  { label: "Conexões DB", value: "47/100", bg: "#f0efea", color: "#686a73", icon: Database },
  { label: "Uptime geral", value: "99.94%", bg: "#f0efea", color: "#686a73", icon: Activity },
  { label: "Erros 5xx (1h)", value: "3", bg: "#fdeaea", color: "#c84a4a", icon: AlertOctagon },
  { label: "Largura de banda", value: "12 MB/s", bg: "#f0efea", color: "#686a73", icon: Wifi },
];

type ServiceStatus = "Operacional" | "Degradado";

type Service = {
  nome: string;
  status: ServiceStatus;
  descricao: string;
  latencia: string;
  uptime: string;
};

const services: Service[] = [
  { nome: "API Gateway", status: "Operacional", descricao: "Todos os endpoints respondendo normalmente", latencia: "42ms", uptime: "99.98% uptime" },
  { nome: "Autenticação (Auth)", status: "Operacional", descricao: "JWT emitidos e validados sem anomalias", latencia: "18ms", uptime: "99.99% uptime" },
  { nome: "Worker de agendamentos", status: "Degradado", descricao: "Latência elevada — investigando sobrecarga de fila", latencia: "310ms", uptime: "98.42% uptime" },
  { nome: "Notificações (WhatsApp)", status: "Degradado", descricao: "Integração com provedor parcialmente indisponível", latencia: "—", uptime: "97.1% uptime" },
  { nome: "Armazenamento de arquivos", status: "Operacional", descricao: "Upload e download de imagens operacionais", latencia: "55ms", uptime: "99.95% uptime" },
  { nome: "E-mail transacional", status: "Operacional", descricao: "Taxa de entrega: 99,2%", latencia: "120ms", uptime: "99.87% uptime" },
  { nome: "Webhooks externos", status: "Operacional", descricao: "Processamento de eventos estável", latencia: "88ms", uptime: "99.81% uptime" },
];

const statusStyles: Record<ServiceStatus, { bg: string; color: string }> = {
  Operacional: { bg: "#e8f7f1", color: "#27865b" },
  Degradado: { bg: "#fdf3e3", color: "#d28b27" },
};

type Severidade = "Baixo" | "Alto";
type EstadoIncidente = "Investigando" | "Monitorando" | "Resolvido";

type Incidente = {
  severidade: Severidade;
  estado: EstadoIncidente;
  titulo: string;
  periodo: string;
  timeline: { hora: string; texto: string }[];
};

const severidadeStyles: Record<Severidade, { bg: string; color: string }> = {
  Baixo: { bg: "#eaf2fb", color: "#3478c9" },
  Alto: { bg: "#fdf3e3", color: "#d28b27" },
};

const estadoStyles: Record<EstadoIncidente, { bg: string; color: string }> = {
  Investigando: { bg: "#fdf3e3", color: "#d28b27" },
  Monitorando: { bg: "#eaf2fb", color: "#3478c9" },
  Resolvido: { bg: "#e8f7f1", color: "#27865b" },
};

const incidentes: Incidente[] = [
  {
    severidade: "Baixo",
    estado: "Investigando",
    titulo: "Worker de agendamentos com alta latência",
    periodo: "Início: 14/08/2026 13:30",
    timeline: [
      { hora: "14:40", texto: "Equipe investigando acúmulo de jobs na fila de processamento." },
      { hora: "13:30", texto: "Alerta automático disparado: latência acima de 250ms por 15 minutos." },
    ],
  },
  {
    severidade: "Alto",
    estado: "Monitorando",
    titulo: "Instabilidade na integração WhatsApp (provedor)",
    periodo: "Início: 14/08/2026 09:12",
    timeline: [
      { hora: "14:00", texto: "Provedor confirmou estabilização parcial. Monitorando reenvio de mensagens pendentes." },
      { hora: "11:45", texto: "Failover ativado para provedor secundário. Envios retomados parcialmente." },
      { hora: "09:12", texto: "Detectada falha no envio de mensagens via WhatsApp. Provedor notificado." },
    ],
  },
  {
    severidade: "Alto",
    estado: "Resolvido",
    titulo: "Lentidão geral na API (resolvido)",
    periodo: "Início: 10/08/2026 22:00 · Resolvido: 11/08/2026 00:47",
    timeline: [
      { hora: "00:47", texto: "Instância adicional provisionada. Performance normalizada." },
      { hora: "22:00", texto: "Pico de requisições detectado. Escalonamento automático ativado." },
    ],
  },
];

/** Hora no formato HH:MM:SS, como o painel já exibia. */
function horaAgora() {
  return new Date().toLocaleTimeString("pt-BR", { hour12: false });
}

export function SuperAdminSaudeSistemaPage() {
  const [atualizando, setAtualizando] = useState(false);
  // Começa fixo e só passa a refletir o relógio após o primeiro clique:
  // gerar a hora na renderização inicial divergiria entre servidor e
  // cliente e quebraria a hidratação.
  const [atualizadoEm, setAtualizadoEm] = useState("02:46:41");
  const toast = useToast();

  function atualizar() {
    setAtualizando(true);
    // Sem backend: o refetch real entra aqui.
    setTimeout(() => {
      setAtualizando(false);
      setAtualizadoEm(horaAgora());
      toast.mostrar("Status dos serviços atualizado.");
    }, 900);
  }

  return (
    <div className="flex w-full flex-col items-start gap-4">
      {/* flex-wrap + min-w-0: sem eles o botão "Atualizar" era empurrado
          para fora do card (medido: 411px numa viewport de 375). */}
      <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-3 rounded-[12px] border border-[rgba(210,139,39,0.2)] bg-[#fdf3e3] p-5">
        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#fdf3e3]">
          <AlertTriangle size={24} strokeWidth={1.8} className="text-[#d28b27]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-[#d28b27]">2 serviço(s) com degradação</p>
          <p className="pt-0.5 text-sm text-[#686a73]" aria-live="polite">
            {atualizando ? "Atualizando…" : `Atualizado às ${atualizadoEm}`} · {services.length}{" "}
            serviços monitorados
          </p>
        </div>
        <span className="rounded-full bg-[#fdf3e3] px-2 py-0.5 text-xs font-medium text-[#d28b27]">Degradado</span>
        <button
          type="button"
          onClick={atualizar}
          disabled={atualizando}
          className="flex h-10 shrink-0 items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-4 text-sm font-medium text-[#0d1831] transition hover:bg-[#f7f6f2] disabled:opacity-60"
        >
          <RotateCw
            size={15}
            strokeWidth={1.8}
            className={atualizando ? "animate-spin" : undefined}
          />
          {atualizando ? "Atualizando" : "Atualizar"}
        </button>
      </div>

      <div className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-[10px]">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="flex flex-col items-center rounded-[12px] border border-[#e6e4df] bg-white p-3">
              <div className="grid size-8 place-items-center rounded-[8px]" style={{ backgroundColor: m.bg }}>
                <Icon size={16} strokeWidth={1.8} style={{ color: m.color }} />
              </div>
              <p className="pt-2 text-center text-xs text-[#686a73]">{m.label}</p>
              <p className="pt-0.5 text-center text-sm font-bold text-[#0d1831]">{m.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid w-full grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 pt-2">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-bold tracking-[-0.28px] text-[#0d1831]">Status dos serviços</p>
          {services.map((s) => (
            <div key={s.nome} className="flex w-full items-center gap-4 rounded-[12px] border border-[#e6e4df] bg-white px-4 py-3">
              <div
                className="grid size-8 shrink-0 place-items-center rounded-[8px]"
                style={{ backgroundColor: statusStyles[s.status].bg }}
              >
                {s.status === "Operacional" ? (
                  <CheckCircle2 size={15} strokeWidth={1.8} style={{ color: statusStyles[s.status].color }} />
                ) : (
                  <AlertTriangle size={15} strokeWidth={1.8} style={{ color: statusStyles[s.status].color }} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[#0d1831]">{s.nome}</p>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: statusStyles[s.status].bg, color: statusStyles[s.status].color }}
                  >
                    {s.status}
                  </span>
                </div>
                <p className="pt-0.5 text-xs text-[#686a73]">{s.descricao}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#0d1831]" style={{ fontFamily: "Consolas, monospace" }}>
                  {s.latencia}
                </p>
                <p className="text-xs text-[#686a73]">{s.uptime}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-bold tracking-[-0.28px] text-[#0d1831]">Incidentes recentes</p>
          {incidentes.map((inc) => (
            <div key={inc.titulo} className="flex w-full flex-col rounded-[12px] border border-[#e6e4df] bg-white p-4">
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: severidadeStyles[inc.severidade].bg, color: severidadeStyles[inc.severidade].color }}
                >
                  {inc.severidade}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: estadoStyles[inc.estado].bg, color: estadoStyles[inc.estado].color }}
                >
                  {inc.estado}
                </span>
              </div>
              <p className="pt-2 text-sm font-medium text-[#0d1831]">{inc.titulo}</p>
              <p className="pt-1 text-xs text-[#686a73]">{inc.periodo}</p>
              <div className="mt-3 flex flex-col gap-2 border-l-2 border-[#e6e4df] pl-3">
                {inc.timeline.map((t, i) => (
                  <p key={i} className="text-xs text-[#686a73]">
                    <span style={{ fontFamily: "Consolas, monospace" }}>{t.hora}</span> · <span className="text-[#0d1831]">{t.texto}</span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
