"use client";

import { Search, ChevronDown, Download } from "lucide-react";

const metrics = [
  { label: "Eventos hoje", value: "6" },
  { label: "Falhas registradas", value: "1" },
  { label: "Ações críticas", value: "3" },
  { label: "Usuários distintos", value: "5" },
];

type Role = "Super Admin" | "Admin" | "Sistema" | "Barbeiro";

const roleStyles: Record<Role, { bg: string; color: string }> = {
  "Super Admin": { bg: "#ede9fd", color: "#7247f3" },
  Admin: { bg: "#ede9fd", color: "#7247f3" },
  Sistema: { bg: "#f0efea", color: "#686a73" },
  Barbeiro: { bg: "#f0efea", color: "#686a73" },
};

type LogEntry = {
  titulo: string;
  role: Role;
  falha?: boolean;
  descricao: string;
  ator: string;
  atorEmail: string;
  recurso: string;
  ip: string;
  data: string;
  iconBg: string;
  iconColor: string;
};

const entries: LogEntry[] = [
  {
    titulo: "Bloqueou barbearia",
    role: "Super Admin",
    descricao: 'Barbearia "Navalha Dourada" bloqueada por inadimplência',
    ator: "Carlos Varthex",
    atorEmail: "superadmin@varthex.com",
    recurso: "Barbershop-bs3",
    ip: "191.248.12.44",
    data: "14/08/2026 14:32:11",
    iconBg: "#fdeaea",
    iconColor: "#c84a4a",
  },
  {
    titulo: "Alterou plano",
    role: "Super Admin",
    descricao: "Plano atualizado de Pro para Enterprise",
    ator: "Carlos Varthex",
    atorEmail: "superadmin@varthex.com",
    recurso: "Barbershop-bs1",
    ip: "191.248.12.44",
    data: "14/08/2026 13:55:02",
    iconBg: "#ede9fd",
    iconColor: "#7247f3",
  },
  {
    titulo: "Criou barbearia",
    role: "Admin",
    descricao: 'Nova barbearia "Estilo Único" criada via onboarding',
    ator: "Pedro Alves",
    atorEmail: "newadmin@varthex.com",
    recurso: "Barbershop-bs5",
    ip: "200.137.8.91",
    data: "14/08/2026 11:20:48",
    iconBg: "#e8f7f1",
    iconColor: "#27865b",
  },
  {
    titulo: "Cadastrou barbeiro",
    role: "Admin",
    descricao: 'Usuário "Rafael Costa" criado com role BARBER',
    ator: "Marcos Oliveira",
    atorEmail: "admin@varthex.com",
    recurso: "User-u8",
    ip: "177.82.55.102",
    data: "14/08/2026 10:08:33",
    iconBg: "#eaf2fb",
    iconColor: "#3478c9",
  },
  {
    titulo: "Login falhou",
    role: "Sistema",
    falha: true,
    descricao: "Tentativa de login com credenciais inválidas (3ª tentativa)",
    ator: "Sistema",
    atorEmail: "system@varthex.com",
    recurso: "Auth-—",
    ip: "45.230.118.7",
    data: "14/08/2026 09:41:17",
    iconBg: "#fdeaea",
    iconColor: "#c84a4a",
  },
  {
    titulo: "Login realizado",
    role: "Super Admin",
    descricao: "Sessão iniciada com sucesso",
    ator: "Carlos Varthex",
    atorEmail: "superadmin@varthex.com",
    recurso: "Auth-—",
    ip: "191.248.12.44",
    data: "14/08/2026 09:15:04",
    iconBg: "#e8f7f1",
    iconColor: "#27865b",
  },
  {
    titulo: "Editou configurações",
    role: "Admin",
    descricao: "Horário de funcionamento atualizado (segunda a sexta)",
    ator: "Marcos Oliveira",
    atorEmail: "admin@varthex.com",
    recurso: "Barbershop-bs1",
    ip: "177.82.55.102",
    data: "13/08/2026 18:30:22",
    iconBg: "#ede9fd",
    iconColor: "#7247f3",
  },
  {
    titulo: "Ativou barbearia",
    role: "Super Admin",
    descricao: 'Barbearia "Corte & Arte" reativada após regularização',
    ator: "Carlos Varthex",
    atorEmail: "superadmin@varthex.com",
    recurso: "Barbershop-bs4",
    ip: "191.248.12.44",
    data: "13/08/2026 16:05:48",
    iconBg: "#e8f7f1",
    iconColor: "#27865b",
  },
  {
    titulo: "Removeu serviço",
    role: "Admin",
    descricao: 'Serviço "Relaxamento" desativado permanentemente',
    ator: "Marcos Oliveira",
    atorEmail: "admin@varthex.com",
    recurso: "Service-svc9",
    ip: "177.82.55.102",
    data: "13/08/2026 14:22:10",
    iconBg: "#fdeaea",
    iconColor: "#c84a4a",
  },
  {
    titulo: "Logout",
    role: "Barbeiro",
    descricao: "Sessão encerrada pelo usuário",
    ator: "João Barbeiro",
    atorEmail: "barber@varthex.com",
    recurso: "Auth-—",
    ip: "189.40.77.3",
    data: "13/08/2026 11:50:37",
    iconBg: "#eaf2fb",
    iconColor: "#3478c9",
  },
  {
    titulo: "Criou plano",
    role: "Super Admin",
    descricao: "Novo plano Enterprise configurado com acesso a API e SLA",
    ator: "Carlos Varthex",
    atorEmail: "superadmin@varthex.com",
    recurso: "Plan-plan-enterprise",
    ip: "191.248.12.44",
    data: "12/08/2026 17:44:19",
    iconBg: "#fbf4e8",
    iconColor: "#c8a86b",
  },
  {
    titulo: "Bloqueou usuário",
    role: "Sistema",
    descricao: "Conta bloqueada automaticamente após 5 tentativas de login",
    ator: "Sistema",
    atorEmail: "system@varthex.com",
    recurso: "User-u12",
    ip: "—",
    data: "12/08/2026 15:10:55",
    iconBg: "#f0efea",
    iconColor: "#686a73",
  },
];

export function SuperAdminAuditoriasPage() {
  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="grid w-full grid-cols-2 lg:grid-cols-4 gap-[5px]">
        {metrics.map((m) => (
          <div key={m.label} className="flex-1 rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-sm text-[#686a73]">{m.label}</p>
            <p className="pt-1 text-2xl font-bold text-[#0d1831]">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="flex w-full flex-wrap items-center gap-3 pt-2">
        <div className="flex h-9 flex-1 max-w-[384px] items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-3">
          <Search size={15} strokeWidth={1.8} className="text-[#b0afa8]" />
          <input
            type="text"
            placeholder="Buscar por ator, ação ou detalhe..."
            className="h-full flex-1 bg-transparent text-sm text-[#0d1831] placeholder:text-[#b0afa8] focus:outline-none"
          />
        </div>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-3 text-sm text-[#0d1831]"
        >
          Todos os tipos
          <ChevronDown size={12} strokeWidth={2} className="text-[#686a73]" />
        </button>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-3 text-sm text-[#0d1831]"
        >
          Todos os resultados
          <ChevronDown size={12} strokeWidth={2} className="text-[#686a73]" />
        </button>
        <div className="flex-1" />
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-4 text-sm text-[#0d1831] transition hover:bg-[#f7f6f2]"
        >
          <Download size={16} strokeWidth={1.8} />
          Exportar log
        </button>
      </div>

      <div className="flex w-full flex-col gap-3">
        {entries.map((e, i) => (
          <div
            key={i}
            className={`flex w-full items-start gap-4 rounded-[12px] border bg-white p-4 ${
              e.falha ? "border-[rgba(200,74,74,0.3)]" : "border-[#e6e4df]"
            }`}
          >
            <span
              className="grid size-9 shrink-0 place-items-center rounded-[8px] text-sm font-semibold"
              style={{ backgroundColor: e.iconBg, color: e.iconColor }}
            >
              {e.titulo.charAt(0)}
            </span>
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#0d1831]">{e.titulo}</p>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: roleStyles[e.role].bg, color: roleStyles[e.role].color }}
                >
                  {e.role}
                </span>
                {e.falha && (
                  <span className="rounded-full bg-[#fdeaea] px-2 py-0.5 text-xs font-medium text-[#c84a4a]">
                    Falha
                  </span>
                )}
              </div>
              <p className="text-sm text-[#686a73]">{e.descricao}</p>
              <div className="flex items-center gap-3 pt-1 text-xs text-[#686a73]">
                <span>
                  {e.ator} · {e.atorEmail}
                </span>
                <span style={{ fontFamily: "Consolas, monospace" }}>{e.recurso}</span>
                <span style={{ fontFamily: "Consolas, monospace" }}>IP {e.ip}</span>
              </div>
            </div>
            <span className="shrink-0 text-xs text-[#686a73]">{e.data}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
