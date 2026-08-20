import Link from "next/link";
import { Poppins } from "next/font/google";
import styles from "./sobre.module.css";
import { SiteHeader } from "../components/SiteHeader";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function SobreNosPage() {
  return (
    <main className={`${styles.page} ${poppins.className}`}>
      <SiteHeader variant="about" />

      <section className={styles.hero}>

        <h1>
          Uma gestão mais simples para quem vive de{" "}
          <strong>atender bem.</strong>
        </h1>

        <p>
          O Varthex Barber é um sistema SaaS voltado para o gerenciamento de barbearias. A proposta do sistema é permitir o controle de atividades relacionadas à administração da barbearia. 
        </p>

      </section>

      <section className={styles.purpose} id="proposito">

        <div className={styles.sectionContent}>
          <span className={styles.sectionLabel}>Nosso propósito</span>

          <h2>Propósito</h2>

          <p>
            O Varthex Barber tem como propósito simplificar e modernizar a gestão de barbearias por meio da tecnologia, centralizando processos operacionais, administrativos e de relacionamento com clientes em uma única plataforma.
          </p>
        </div>
      </section>

      <section className={styles.missionVision}>
        <article className={styles.infoCard} id="missao">
          <h2>Missão</h2>
          <p>
            Oferecer uma plataforma SaaS completa, intuitiva e confiável para gestão de barbearias, auxiliando profissionais e gestores a otimizar suas operações, melhorar o relacionamento com seus clientes e acompanhar o desempenho de seus negócios, para uma melhor forma de gerir seu negócio. 
          </p>
        </article>

        <article className={styles.infoCard} id="visao">
          <h2>Visão</h2>
          <p>
            Tornar-se uma plataforma de referência em gestão de barbearias, reconhecida pela eficiência, facilidade de uso, inovação e confiabilidade, contribuindo para a digitalização e o crescimento sustentável de negócios do segmento. 
          </p>
        </article>
      </section>

      <section className={styles.values} id="valores">
        <div className={styles.valuesHeading}>
          <span className={styles.sectionLabel}>O que nos orienta</span>
          <h2>Nossos valores</h2>
        </div>

        <div className={styles.valuesGrid}>
          <article className={styles.valueCard}>
            <span>01</span>
            <h3>Foco no usuário:</h3>
            <p>
              Desenvolver soluções considerando as necessidades de gestores, barbeiros e clientes.
            </p>
          </article>

          <article className={styles.valueCard}>
            <span>02</span>
            <h3>Simplicidade</h3>
            <p>
              Tornar processos de gestão mais fáceis, organizados e acessíveis
            </p>
          </article>

          <article className={styles.valueCard}>
            <span>03</span>
            <h3>Inovação</h3>
            <p>
              Utilizar tecnologia para solucionar problemas e melhorar continuamente a experiência dos usuários
            </p>
          </article>

          <article className={styles.valueCard}>
            <span>04</span>
            <h3>Confiabilidade</h3>
            <p>
              oferecer uma plataforma estável e consistente para apoiar as operações dos estabelecimentos
            </p>
          </article>

          <article className={styles.valueCard}>
            <span>05</span>
            <h3>Segurança</h3>
            <p>
              Proteger os dados e informações dos usuários, estabelecimentos e clientes
            </p>
          </article>

          <article className={styles.valueCard}>
            <span>06</span>
            <h3>Eficiência</h3>
            <p>
              Reduzir processos manuais e otimizar o tempo e os recursos das barbearias
            </p>
          </article>

          <article className={styles.valueCard}>
            <span>07</span>
            <h3>Transparência</h3>
            <p>
              Manter relações claras e responsáveis com usuários e parceiros
            </p>
          </article>

          <article className={styles.valueCard}>
            <span>08</span>
            <h3>Evolução contínua</h3>
            <p>
              Utilizar feedbacks e resultados para aprimorar constantemente o produto
            </p>
          </article>

          <article className={styles.valueCard}>
            <span>09</span>
            <h3>Escalabilidade</h3>
            <p>
              Desenvolver uma solução preparada para atender desde pequenos estabelecimentos até operações maiores
            </p>
          </article>

          <article className={styles.valueCard}>
            <span>10</span>
            <h3>Foco no negócio</h3>
            <p>
              Garantir que a tecnologia gere valor real para a gestão, produtividade e crescimento das barbearias
            </p>
          </article>
        </div>
      </section>

      <section className={styles.callToAction}>
        <div>
          <span>Varthex Barber</span>
          <h2>Pronto para organizar sua rotina?</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>

        <Link href="/cadastro">Criar uma conta</Link>
      </section>

      <footer className={styles.footer}>
        <p>© 2026 Varthex Barber</p>

        <div>
          <Link href="#">Privacidade</Link>
          <Link href="#">Termos de uso</Link>
        </div>
      </footer>
    </main>
  );
}