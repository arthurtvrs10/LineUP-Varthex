"use client";

import { Search } from "lucide-react";

type Usuario = {
  name: string;
  email: string;
  role: "Super Admin" | "Admin" | "Barbeiro" | "Cliente";
  barbearia: string;
  color: string;
  status: "Ativo";
};

const usuarios: Usuario[] = [
  { name: "Rafael Mendes", email: "admin@varthex.com", role: "Super Admin", barbearia: "—", color: "#4318ff", status: "Ativo" },
  { name: "Camila Duarte", email: "camila@navalhadeouro.com", role: "Admin", barbearia: "Studio Navalha de Ouro", color: "#8f7bf5", status: "Ativo" },
  { name: "Marcos Vieira", email: "marcos@corteearte.com", role: "Admin", barbearia: "Corte & Arte", color: "#8f7bf5", status: "Ativo" },
  { name: "Lucas Oliveira", email: "lucas@estilounico.com", role: "Barbeiro", barbearia: "Barbearia Estilo Único", color: "#4fd1c5", status: "Ativo" },
  { name: "Gabriel Santos", email: "gabriel@estilounico.com", role: "Barbeiro", barbearia: "Barbearia Estilo Único", color: "#4fd1c5", status: "Ativo" },
  { name: "João Silva", email: "joao.silva@gmail.com", role: "Cliente", barbearia: "Barbearia Estilo Único", color: "#a0aec0", status: "Ativo" },
  { name: "Thiago Pereira", email: "thiago.pereira@gmail.com", role: "Cliente", barbearia: "Studio Navalha de Ouro", color: "#a0aec0", status: "Ativo" },
];

export function SuperAdminUsuariosPage() {
  return (
    <div className="flex w-full flex-col items-start gap-5">
      <div className="flex h-10 w-[352px] items-center gap-2 rounded-[15px] border border-[#e2e8f0] bg-white px-4">
        <Search size={15} strokeWidth={1.8} className="text-[#a0aec0]" />
        <input
          type="text"
          placeholder="Buscar usuário..."
          className="h-full flex-1 bg-transparent text-xs text-[#2d3748] placeholder:text-[#a0aec0] focus:outline-none"
        />
      </div>

      <div className="w-full rounded-[15px] bg-white p-6 shadow-[0px_3.5px_5.5px_rgba(0,0,0,0.02)]">
        <p className="text-lg font-bold text-[#2d3748]">Usuários globais</p>
        <div className="w-full overflow-x-auto">
          <table className="mt-4 w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e2e8f0] text-[10px] font-bold text-[#a0aec0]">
                <th className="pb-2 pr-3 font-bold">USUÁRIO</th>
                <th className="pb-2 pr-3 text-center font-bold">ROLE</th>
                <th className="pb-2 pr-3 text-center font-bold">BARBEARIA</th>
                <th className="pb-2 pr-3 text-center font-bold">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.email} className="border-b border-[#eef0f3] last:border-b-0">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="grid size-10 place-items-center rounded-[12px] text-xs font-bold text-white shadow-[0px_3.5px_5.5px_rgba(0,0,0,0.02)]"
                        style={{ backgroundColor: u.color }}
                      >
                        {u.name
                          .split(" ")
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join("")}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#2d3748]">{u.name}</p>
                        <p className="text-sm text-[#718096]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-center text-sm text-[#64686d]">{u.role}</td>
                  <td className="py-3 pr-3 text-center text-sm text-[#64686d]">{u.barbearia}</td>
                  <td className="py-3 pr-3 text-center">
                    <span className="rounded-[11px] bg-[#48bb78]/50 px-2.5 py-0.5 text-[10px] text-[#388e5c]">
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
