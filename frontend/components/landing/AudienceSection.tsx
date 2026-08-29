"use client";

import { Bell, Check, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

type ProfileKey = "owner" | "barber" | "client" | "network";

const profiles = {
  owner: {
    label: "Dono",
    eyebrow: "Para quem conduz o negócio",
    title: "Visibilidade para decidir. Controle para crescer.",
    description:
      "Acompanhe agenda, faturamento, ocupação e comissão sem depender de planilhas ou mensagens espalhadas.",
    benefits: [
      "Indicadores diários, semanais e mensais",
      "Visão completa da equipe",
      "Comissões calculadas por atendimento",
    ],
    stat: "Hoje",
    statLabel: "Sua operação em uma visão",
  },
  barber: {
    label: "Barbeiro",
    eyebrow: "Para quem transforma horários em experiência",
    title: "Uma agenda clara. Um dia de trabalho mais leve.",
    description:
      "Veja os próximos atendimentos, bloqueie horários e acompanhe sua comissão em uma área simples e objetiva.",
    benefits: [
      "Agenda individual atualizada",
      "Bloqueios e disponibilidade",
      "Histórico de atendimentos e comissão",
    ],
    stat: "6",
    statLabel: "Atendimentos confirmados",
  },
  client: {
    label: "Cliente",
    eyebrow: "Para quem quer praticidade",
    title: "Agendar um corte deve levar menos de um minuto.",
    description:
      "O cliente escolhe serviço, profissional e horário disponível sem troca interminável de mensagens.",
    benefits: [
      "Agendamento simples e rápido",
      "Lembretes automáticos",
      "Histórico e preferência de atendimento",
    ],
    stat: "10:30",
    statLabel: "Próximo horário disponível",
  },
  network: {
    label: "Rede / Super Admin",
    eyebrow: "Para operações com mais de uma unidade",
    title: "Cada unidade no lugar certo. A rede inteira sob controle.",
    description:
      "Gerencie barbearias, usuários e indicadores com isolamento de dados e visão consolidada da operação.",
    benefits: [
      "Gestão multiunidade",
      "Perfis e permissões separados",
      "Indicadores consolidados da rede",
    ],
    stat: "4",
    statLabel: "Unidades conectadas",
  },
};

export function AudienceSection() {
  const [selected, setSelected] = useState<ProfileKey>("owner");
  const profile = profiles[selected];

  return (
    <section
      className="mx-auto w-full max-w-[1216px] scroll-mt-20 px-5 py-16 sm:px-6 lg:py-24"
      id="publicos"
    >
      <Reveal className="max-w-2xl">
        <SectionLabel>Para quem</SectionLabel>
        <h2 className="mt-3 font-[var(--font-display)] text-[clamp(2rem,3.5vw,2.75rem)] leading-tight font-normal tracking-[-0.03em]">
          Uma plataforma, quatro experiências.
        </h2>
        <p className="mt-3 text-[15px] leading-7 text-[#5f6f87]">
          Cada pessoa vê o que precisa, sem carregar a complexidade da
          operação inteira.
        </p>
      </Reveal>

      <div
        className="mt-8 flex justify-start gap-1 overflow-x-auto border-b border-[#e2e7f0]"
        role="tablist"
        aria-label="Perfis atendidos"
      >
        {(Object.keys(profiles) as ProfileKey[]).map((key) => (
          <button
            className={`min-h-11 shrink-0 border-b-2 px-4 text-[13px] font-bold transition ${
              selected === key
                ? "border-accent text-[#0d1831]"
                : "border-transparent text-[#8290a2] hover:text-[#4e5d73]"
            }`}
            id={`tab-${key}`}
            role="tab"
            aria-selected={selected === key}
            aria-controls="profile-panel"
            onClick={() => setSelected(key)}
            key={key}
          >
            {profiles[key].label}
          </button>
        ))}
      </div>

      <div
        className="mt-10 grid items-center gap-10 rounded-2xl border border-[#e2e7f0] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:p-12"
        id="profile-panel"
        role="tabpanel"
        aria-labelledby={`tab-${selected}`}
      >
        <div>
          <span className="text-[11px] font-bold tracking-[0.08em] text-accent-strong uppercase">
            {profile.eyebrow}
          </span>
          <h3 className="mt-3 font-[var(--font-display)] text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-normal tracking-[-0.03em]">
            {profile.title}
          </h3>
          <p className="mt-4 text-sm leading-7 text-[#5f6f87]">{profile.description}</p>
          <ul className="mt-6 grid gap-3">
            {profile.benefits.map((benefit) => (
              <li className="flex items-center gap-2.5 text-xs text-[#4f5e73]" key={benefit}>
                <Check className="rounded-full bg-accent p-0.5 text-on-accent" size={16} />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative min-h-[390px] overflow-hidden rounded-xl border border-[#e2e7f0] bg-[#fafbfc] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <Logo variant="symbol" height={24} className="text-ink" />
            <span className="grid size-8 place-items-center rounded-lg border border-[#e5e9f0] bg-white text-[#718096]">
              <Bell size={14} />
            </span>
          </div>
          <div className="mx-auto mt-9 grid w-[80%] gap-2 rounded-xl border border-[#e0e3eb] bg-white p-5">
            <small className="text-[7px] font-extrabold tracking-[0.08em] text-[#9da5b3]">
              {profile.statLabel}
            </small>
            <strong className="text-3xl">{profile.stat}</strong>
            <em className="inline-flex items-center gap-1 text-[8px] font-bold text-[#1fa87a] not-italic">
              <TrendingUp size={13} /> Atualizado agora
            </em>
          </div>
          <div className="mt-5 flex h-36 items-end gap-3 rounded-t-xl border border-[#e3e6ed] bg-white px-4 pt-4">
            {[64, 88, 45, 76, 92, 58, 82].map((height, index) => (
              <i
                className="flex-1 rounded-t bg-accent"
                key={index}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between px-4 py-2 text-[6px] text-[#9aa3b0]">
            {["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
