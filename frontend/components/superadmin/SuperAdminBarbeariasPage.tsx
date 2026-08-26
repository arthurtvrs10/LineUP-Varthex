"use client";

import { Search, ChevronDown, FolderPlus } from "lucide-react";

type Barbearia = {
  name: string;
  cnpj: string;
  responsavel: string;
  plano: "pro" | "free";
  usuarios: number;
  criacao: string;
  ultimoAcesso: string;
  status: "Ativo" | "Bloqueado";
  color: string;
};

const barbearias: Barbearia[] = [
  {
    name: "Barbearia Estilo Único",
    cnpj: "12.345.678/0001-90",
    responsavel: "Rafael Mendes",
    plano: "pro",
    usuarios: 8,
    criacao: "15/01/2024",
    ultimoAcesso: "15/01/2024",
    status: "Ativo",
    color: "#4fd1c5",
  },
  {
    name: "Corte & Arte",
    cnpj: "23.456.789/0001-11",
    responsavel: "Marcos Vieira",
    plano: "free",
    usuarios: 3,
    criacao: "02/03/2024",
    ultimoAcesso: "01/08/2026",
    status: "Bloqueado",
    color: "#c84a4a",
  },
  {
    name: "Studio Navalha de Ouro",
    cnpj: "34.567.890/0001-22",
    responsavel: "Camila Duarte",
    plano: "pro",
    usuarios: 6,
    criacao: "18/05/2024",
    ultimoAcesso: "24/08/2026",
    status: "Ativo",
    color: "#4318ff",
  },
  {
    name: "Barba Boa",
    cnpj: "45.678.901/0001-33",
    responsavel: "Diego Almeida",
    plano: "free",
    usuarios: 2,
    criacao: "09/09/2024",
    ultimoAcesso: "20/08/2026",
    status: "Ativo",
    color: "#d28b27",
  },
  {
    name: "Barbearia Vintage",
    cnpj: "56.789.012/0001-44",
    responsavel: "Renata Souza",
    plano: "pro",
    usuarios: 5,
    criacao: "27/11/2024",
    ultimoAcesso: "22/08/2026",
    status: "Ativo",
    color: "#48bb78",
  },
  {
    name: "Clube do Corte",
    cnpj: "67.890.123/0001-55",
    responsavel: "Felipe Nogueira",
    plano: "free",
    usuarios: 4,
    criacao: "14/02/2025",
    ultimoAcesso: "19/08/2026",
    status: "Ativo",
    color: "#8f7bf5",
  },
];

const planoStyles: Record<Barbearia["plano"], string> = {
  pro: "bg-[#48bb78] text-white",
  free: "bg-[#a0aec0] text-white",
};

export function SuperAdminBarbeariasPage() {
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <div className="flex w-full items-center gap-3">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-[15px] border border-[#e2e8f0] bg-white px-4">
          <Search size={15} strokeWidth={1.8} className="text-[#a0aec0]" />
          <input
            type="text"
            placeholder="Buscar por nome ou responsável..."
            className="h-full flex-1 bg-transparent text-xs text-[#2d3748] placeholder:text-[#a0aec0] focus:outline-none"
          />
        </div>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-[15px] border border-[#e2e8f0] bg-white px-4 text-xs text-[#2d3748]"
        >
          Todos os status
          <ChevronDown size={14} strokeWidth={2} className="text-[#a0aec0]" />
        </button>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-[15px] border border-[#e2e8f0] bg-white px-4 text-xs text-[#2d3748]"
        >
          Todos os planos
          <ChevronDown size={14} strokeWidth={2} className="text-[#a0aec0]" />
        </button>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-[15px] bg-[#4318ff] px-4 text-xs font-medium text-white transition hover:bg-[#3712d1]"
        >
          <FolderPlus size={18} strokeWidth={1.8} />
          Nova barbearia
        </button>
      </div>

      <div className="w-full rounded-[15px] bg-white p-6 shadow-[0px_3.5px_5.5px_rgba(0,0,0,0.02)]">
        <p className="text-lg font-bold text-[#2d3748]">Barbearias recentes</p>
        <div className="w-full overflow-x-auto">
          <table className="mt-4 w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e2e8f0] text-[10px] font-bold text-[#a0aec0]">
                <th className="pb-2 pr-3 font-bold">BARBEARIA</th>
                <th className="pb-2 pr-3 text-center font-bold">RESPONSÁVEL</th>
                <th className="pb-2 pr-3 text-center font-bold">PLANO</th>
                <th className="pb-2 pr-3 text-center font-bold">USUÁRIOS</th>
                <th className="pb-2 pr-3 text-center font-bold">CRIAÇÃO</th>
                <th className="pb-2 pr-3 text-center font-bold">ÚLTIMO ACESSO</th>
                <th className="pb-2 pr-3 text-center font-bold">STATUS</th>
                <th className="pb-2 pr-3 text-center font-bold">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {barbearias.map((b) => (
                <tr key={b.name} className="border-b border-[#eef0f3] last:border-b-0">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="grid size-10 place-items-center rounded-[12px] text-xs font-bold text-white shadow-[0px_3.5px_5.5px_rgba(0,0,0,0.02)]"
                        style={{ backgroundColor: b.color }}
                      >
                        {b.name
                          .split(" ")
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join("")}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#2d3748]">{b.name}</p>
                        <p className="text-sm text-[#718096]">{b.cnpj}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-center text-sm text-[#8e9cae]">{b.responsavel}</td>
                  <td className="py-3 pr-3 text-center">
                    <span className={`rounded-[8px] px-2.5 py-1 text-sm ${planoStyles[b.plano]}`}>{b.plano}</span>
                  </td>
                  <td className="py-3 pr-3 text-center text-sm text-[#8e9cae]">{b.usuarios}</td>
                  <td className="py-3 pr-3 text-center text-sm text-[#8e9cae]">{b.criacao}</td>
                  <td className="py-3 pr-3 text-center text-sm text-[#8e9cae]">{b.ultimoAcesso}</td>
                  <td className="py-3 pr-3 text-center">
                    <span
                      className={`rounded-[11px] px-2.5 py-0.5 text-[10px] ${
                        b.status === "Ativo"
                          ? "bg-[#48bb78]/50 text-[#388e5c]"
                          : "bg-[#b32323]/30 text-[#b32323]"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center justify-center gap-3">
                      <button type="button" className="text-sm text-[#8e9cae] transition hover:text-[#2d3748]">
                        Ver
                      </button>
                      {b.status === "Ativo" ? (
                        <button
                          type="button"
                          className="rounded-[8px] bg-[#b32323] px-3 py-1 text-sm font-bold text-white transition hover:bg-[#951c1c]"
                        >
                          Bloquear
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="rounded-[8px] border border-[#b7c2cf] px-3 py-1 text-sm text-[#2d3748] transition hover:bg-[#f8f9fa]"
                        >
                          Ativar
                        </button>
                      )}
                    </div>
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
