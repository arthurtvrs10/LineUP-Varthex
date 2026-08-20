import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import styles from "../auth.module.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function CadastroPage() {
  return (
    <main className={`${styles.page} ${poppins.className}`}>
      <section className={styles.formSection}>
        <div className={styles.formContainer}>
          <h1>Registre-se</h1>

          <form className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.srOnly} htmlFor="register-email">
                E-mail
              </label>

              <Image
                className={styles.inputIcon}
                src="/icons/email.svg"
                alt=""
                width={16}
                height={16}
              />

              <input
                id="register-email"
                name="email"
                type="email"
                placeholder="seu@email.com"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.srOnly} htmlFor="register-password">
                Senha
              </label>

              <Image
                className={styles.inputIcon}
                src="/icons/key.svg"
                alt=""
                width={16}
                height={16}
              />

              <input
                id="register-password"
                name="password"
                type="password"
                placeholder="Digite sua senha"
              />
            </div>

            <div className={styles.inputGroup}>
              <label
                className={styles.srOnly}
                htmlFor="register-confirm-password"
              >
                Confirmar senha
              </label>

              <Image
                className={styles.inputIcon}
                src="/icons/key.svg"
                alt=""
                width={16}
                height={16}
              />

              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
              />
            </div>

            <button className={styles.loginButton} type="submit">
              Registrar-se
            </button>

            <div className={styles.divider}>
              <span />
              <p>ou</p>
              <span />
            </div>

            <button className={styles.googleButton} type="button">
              <Image
                className={styles.googleLogo}
                src="/icons/google.svg"
                alt=""
                width={18}
                height={18}
              />
              Google
            </button>

            <p className={styles.registerText}>
              Já tem uma conta? <Link href="/login">Login</Link>
            </p>
          </form>
        </div>
      </section>

      <section className={styles.imageSection} aria-hidden="true">
        <Image
          className={styles.dashboardImage}
          src="/dashboard-auth.png"
          alt=""
          fill
          priority
          sizes="55vw"
        />
      </section>
    </main>
  );
}