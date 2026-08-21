import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Brand } from "@/components/brand/Brand";

type AuthPageProps = {
  mode: "login" | "register";
};

type AuthFieldProps = {
  id: string;
  label: string;
  name: string;
  placeholder: string;
  type: "email" | "password" | "text";
  autoComplete: string;
  icon: ReactNode;
};

function AuthField({
  id,
  label,
  name,
  placeholder,
  type,
  autoComplete,
  icon,
}: AuthFieldProps) {
  return (
    <div className="relative h-11">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <span
        className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#8c94aa]"
        aria-hidden="true"
      >
        {icon}
      </span>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="h-full w-full rounded-lg border border-[#d9dce5] bg-white px-4 pl-11 text-[13px] text-[#1c1c26] outline-none transition placeholder:text-[#a7acc4] focus:border-[#7247f3] focus:ring-3 focus:ring-[#7247f3]/10"
      />
    </div>
  );
}

function IconImage({ src }: { src: string }) {
  return <Image src={src} alt="" width={16} height={16} />;
}

export function AuthPage({ mode }: AuthPageProps) {
  const registering = mode === "register";

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[48%_52%]">
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-[380px]">
          <Link href="/" className="mb-10 inline-flex">
            <Brand />
          </Link>
          <h1 className="mb-9 text-[28px] font-bold text-[#1c1c26]">
            {registering ? "Registre-se" : "Login"}
          </h1>

          <form className="flex flex-col gap-3.5">
            {registering && (
              <AuthField
                id="register-name"
                name="name"
                label="Nome"
                type="text"
                placeholder="Digite seu nome"
                autoComplete="name"
                icon={<UserRound size={16} strokeWidth={1.7} />}
              />
            )}

            <AuthField
              id={registering ? "register-email" : "email"}
              name="email"
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              icon={<IconImage src="/icons/email.svg" />}
            />

            <AuthField
              id={registering ? "register-password" : "password"}
              name="password"
              label="Senha"
              type="password"
              placeholder="Digite sua senha"
              autoComplete={registering ? "new-password" : "current-password"}
              icon={<IconImage src="/icons/key.svg" />}
            />

            {registering && (
              <AuthField
                id="register-confirm-password"
                name="confirmPassword"
                label="Confirmar senha"
                type="password"
                placeholder="Confirme sua senha"
                autoComplete="new-password"
                icon={<IconImage src="/icons/key.svg" />}
              />
            )}

            <button
              className="mt-0.5 h-11 w-full rounded-lg bg-[#7247f3] text-xs font-semibold text-white transition hover:bg-[#5c2ee0] active:scale-[0.99] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#7247f3]/25"
              type="submit"
            >
              {registering ? "Registrar-se" : "Entrar"}
            </button>

            {!registering && (
              <Link
                className="self-end text-[11px] font-semibold text-[#5326d7] hover:underline"
                href="#"
              >
                Esqueceu a senha?
              </Link>
            )}

            <div className="my-3 flex items-center gap-3.5 text-[10px] text-[#9298ad]">
              <span className="h-px flex-1 bg-[#e3e5eb]" />
              ou
              <span className="h-px flex-1 bg-[#e3e5eb]" />
            </div>

            <button
              className="flex h-[42px] w-full items-center justify-center gap-2.5 rounded-lg border border-[#d9dce5] bg-white text-[11px] font-semibold text-[#1c1c26] transition hover:border-[#b8bdcd] hover:bg-[#fafafa] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#7247f3]/25"
              type="button"
            >
              <Image src="/icons/google.svg" alt="" width={18} height={18} />
              Google
            </button>

            <p className="mt-3 text-[11px] text-[#9da3b8]">
              {registering ? "Já tem uma conta? " : "Ainda não tem uma conta? "}
              <Link
                className="font-semibold text-[#7247f3] hover:underline"
                href={registering ? "/login" : "/cadastro"}
              >
                {registering ? "Login" : "Registre-se"}
              </Link>
            </p>
          </form>
        </div>
      </section>

      <section
        className="relative hidden min-h-screen overflow-hidden bg-gradient-to-r from-[#fafafa] to-[#f3f4f7] lg:block"
        aria-hidden="true"
      >
        <Image
          className="object-cover object-left drop-shadow-[0_20px_25px_rgba(0,0,0,0.18)]"
          src="/dashboard-auth.png"
          alt=""
          fill
          priority
          sizes="52vw"
        />
      </section>
    </main>
  );
}
