import Image from "next/image";

const screens = {
  dashboard: { width: 1440, height: 1100, alt: "Painel do LineUp com indicadores, agenda do dia e desempenho da equipe" },
  agenda: { width: 1200, height: 988, alt: "Agenda do LineUp organizada por profissional, horário e status do atendimento" },
  equipe: { width: 1200, height: 481, alt: "Gestão da equipe no LineUp com profissionais, serviços concluídos e percentuais de comissão" },
  clientes: { width: 1200, height: 614, alt: "Clientes do LineUp com visitas, próximos agendamentos e pagamentos registrados" },
};

export function SystemScreenshot({ screen, className = "" }: { screen: keyof typeof screens; className?: string }) {
  const image = screens[screen];
  return (
    <figure className={className}>
      <a href={`/images/landing/${screen}.webp`} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-[#e7eaf0] bg-[#f7f6f2] shadow-xl shadow-[#0d1831]/5 transition hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent" aria-label={`Ampliar imagem: ${image.alt} (abre em nova aba)`}>
        <Image src={`/images/landing/${screen}.webp`} alt={image.alt} width={image.width} height={image.height} sizes={screen === "dashboard" ? "(max-width: 1024px) 100vw, 980px" : "(max-width: 1024px) 100vw, 560px"} preload={screen === "dashboard"} className="h-auto w-full" />
      </a>
      <figcaption className="mt-3 text-center text-xs text-[#5f6f87]">Tela do sistema com dados fictícios · Clique para ampliar</figcaption>
    </figure>
  );
}
