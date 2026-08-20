import Link from "next/link";
import { Poppins } from "next/font/google";
import styles from "./sobre.module.css";
import Image from "next/image";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function SobreNosPage() {
  return (
    <main className={`${styles.page} ${poppins.className}`}>
      <header className={styles.header}>
        <nav className={styles.navigation}>
            <Link
            className={styles.brand}
            href="/"
            aria-label="Varthex Barber - Página inicial"
            >
            <Image
                className={styles.logo}
                src="/icons/logo-varthex.jpeg"
                alt="Varthex Barber"
                width={160}
                height={48}
                priority
            />
            </Link>

        <div className={styles.links}>
        <a href="#proposito">Propósito</a>
        <a href="#missao">Missão</a>
        <a href="#visao">Visão</a>
        <a href="#valores">Valores</a>
        </div>

        <Link className={styles.registerLink} href="/cadastro">
        Cadastro
        </Link>
        </nav>
      </header>

      <section className={styles.hero}>

        <h1>
          Uma gestão mais simples para quem vive de{" "}
          <strong>atender bem.</strong>
        </h1>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Integer vitae justo sed lorem malesuada tincidunt. Sed
          dignissim sapien at feugiat aliquet.
        </p>

      </section>

      <section className={styles.purpose} id="proposito">

        <div className={styles.sectionContent}>
          <span className={styles.sectionLabel}>Nosso propósito</span>

          <h2>Propósito</h2>

          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe et ducimus dolores, totam culpa voluptatibus, corporis consequatur accusamus porro quibusdam dolorem nostrum veritatis neque expedita. Accusantium nulla provident ad delectus.
          </p>
        </div>
      </section>

      <section className={styles.missionVision}>
        <article className={styles.infoCard} id="missao">
          <h2>Missão</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Mauris consequat, justo sed luctus tincidunt, arcu libero
            malesuada augue.
          </p>
        </article>

        <article className={styles.infoCard} id="visao">
          <h2>Visão</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Mauris consequat, justo sed luctus tincidunt, arcu libero
            malesuada augue.
          </p>
        </article>
      </section>

      <section className={styles.values} id="valores">
        <div className={styles.valuesHeading}>
          <span className={styles.sectionLabel}>O que nos orienta</span>
          <h2>Nossos valores</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Nulla facilisi praesent vitae.
          </p>
        </div>

        <div className={styles.valuesGrid}>
          <article className={styles.valueCard}>
            <span>01</span>
            <h3>Valor 01</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </article>

          <article className={styles.valueCard}>
            <span>02</span>
            <h3>Valor 02</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </article>

          <article className={styles.valueCard}>
            <span>03</span>
            <h3>Valor 03</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </article>

          <article className={styles.valueCard}>
            <span>04</span>
            <h3>Valor 04</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
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