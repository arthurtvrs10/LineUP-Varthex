import Image from "next/image";
import Link from "next/link";
import styles from "../auth.module.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function LoginPage() {
  return (
    <main className={`${styles.page} ${poppins.className}`}>
      <section className={styles.formSection}>
        <div className={styles.formContainer}>
          <h1>Login</h1>

          <form className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.srOnly} htmlFor="email">
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
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.srOnly} htmlFor="password">
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
                id="password"
                name="password"
                type="password"
                placeholder="Digite sua senha"
              />
            </div>

            <button className={styles.loginButton} type="submit">
              Log In
            </button>

            <Link className={styles.forgotPassword} href="#">
              Esqueceu a senha?
            </Link>

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
              Ainda não tem uma conta?{" "}
              <Link href="/cadastro">Registre-se</Link>
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