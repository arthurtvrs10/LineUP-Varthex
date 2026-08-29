"use client";

import { Search } from "lucide-react";

type Usuario = {
  name: string;
  email: string;
  role: "Super Admin" | "Admin" | "Barbeiro" | "Cliente";
  barbearia: string;
  status: "Ativo";
};

const usuarios: Usuario[] = [
  { name: "Rafael Mendes", email: "admin@lineup.com", role: "Super Admin", barbearia: "—", status: "Ativo" },
  { name: "Camila Duarte", email: "camila@navalhadeouro.com", role: "Admin", barbearia: "Studio Navalha de Ouro", status: "Ativo" },
  { name: "Marcos Vieira", email: "marcos@corteearte.com", role: "Admin", barbearia: "Corte & Arte", status: "Ativo" },
  { name: "Lucas Oliveira", email: "lucas@estilounico.com", role: "Barbeiro", barbearia: "Barbearia Estilo Único", status: "Ativo" },
  { name: "Gabriel Santos", email: "gabriel@estilounico.com", role: "Barbeiro", barbearia: "Barbearia Estilo Único", status: "Ativo" },
  { name: "João Silva", email: "joao.silva@gmail.com", role: "Cliente", barbearia: "Barbearia Estilo Único", status: "Ativo" },
  { name: "Thiago Pereira", email: "thiago.pereira@gmail.com", role: "Cliente", barbearia: "Studio Navalha de Ouro", status: "Ativo" },
];

const roleStyles: Record<Usuario["role"], string> = {
  "Super Admin": "bg-accent-subtle text-accent-strong",
  Admin: "bg-accent-subtle text-accent-strong",
  Barbeiro: "bg-[#f0efea] text-[#686a73]",
  Cliente: "bg-[#f0efea] text-[#686a73]",
};

export function SuperAdminUsuariosPage() {
  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="flex h-10 w-full max-w-[352px] items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-4">
        <Search size={15} strokeWidth={1.8} className="text-[#98a2b3]" />
        <input
          type="text"
          placeholder="Buscar usuário..."
          className="h-full flex-1 bg-transparent text-xs text-[#0d1831] placeholder:text-[#98a2b3] focus:outline-none"
        />
      </div>

      <div className="w-full rounded-[12px] border border-[#e6e4df] bg-white p-6">
        <p className="text-lg font-bold text-[#0d1831]">Usuários globais</p>
        <div className="w-full overflow-x-auto">
          <table className="mt-4 w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e6e4df] text-[10px] font-bold text-[#98a2b3]">
                <th className="sticky left-0 z-10 bg-white pb-2 pr-3 font-bold">USUÁRIO</th>
                <th className="pb-2 pr-3 text-center font-bold">ROLE</th>
                <th className="pb-2 pr-3 text-center font-bold">BARBEARIA</th>
                <th className="pb-2 pr-3 text-center font-bold">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.email} className="border-b border-[#eef0f3] last:border-b-0">
                  <td className="sticky left-0 z-10 bg-white py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-[10px] bg-accent-subtle text-xs font-bold text-accent-strong">
                        {u.name
                          .split(" ")
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join("")}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#0d1831]">{u.name}</p>
                        <p className="text-sm text-[#5f6f87]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleStyles[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-center text-sm text-[#5f6f87]">{u.barbearia}</td>
                  <td className="py-3 pr-3 text-center">
                    <span className="rounded-full bg-[#e8f7f1] px-2.5 py-0.5 text-[10px] font-medium text-[#27865b]">
                      {u.status}
                    </span>
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
