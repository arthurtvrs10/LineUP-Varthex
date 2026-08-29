"use client";

import Link from "next/link";
import { CheckCircle2, ChevronLeft, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Logo } from "@/components/brand/Logo";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!emailPattern.test(email)) {
      setError("Informe um e-mail válido.");
      return;
    }

    setError(undefined);
    setStatus("submitting");
    await new Promise((resolve) => setTimeout(resolve, 900));
    setStatus("success");
  }

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-6 py-16">
        <Link href="/" className="mb-9 inline-flex self-start">
          <Logo variant="horizontal" height={28} className="text-ink" />
        </Link>

        {status === "success" ? (
          <div className="flex flex-col items-start gap-4">
            <span className="grid size-12 place-items-center rounded-full bg-[#e6f7ec] text-[#189155]">
              <CheckCircle2 size={26} />
            </span>
            <div>
              <h1 className="text-[22px] font-bold text-[#1c1c26]">
                Verifique seu e-mail
              </h1>
              <p className="mt-2 text-[13px] leading-6 text-[#667085]">
                Se <strong className="font-semibold text-[#1c1c26]">{email}</strong>{" "}
                estiver cadastrado, você vai receber um link para redefinir
                sua senha em instantes.
              </p>
            </div>
            <Link
              className="text-[12px] font-semibold text-[#7247f3] hover:underline"
              href="/login"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <Link
              aria-label="Voltar para o login"
              className="mb-6 inline-flex size-9 items-center justify-center self-start rounded-full border border-[#d9dce5] text-[#4b5468] transition hover:border-[#b8bdcd] hover:text-[#1c1c26]"
              href="/login"
            >
              <ChevronLeft size={18} strokeWidth={2} />
            </Link>

            <h1 className="text-[22px] font-bold text-[#1c1c26]">
              Encontre sua conta
            </h1>
            <p className="mt-2 text-[13px] leading-6 text-[#667085]">
              Digite o e-mail cadastrado na sua conta para receber um link de
              redefinição de senha.
            </p>

            <form
              className="mt-7 flex flex-col gap-3.5"
              noValidate
              onSubmit={handleSubmit}
            >
              <div>
                <div className="relative h-12">
                  <label className="sr-only" htmlFor="recovery-email">
                    E-mail ou telefone
                  </label>
                  <span
                    className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#8c94aa]"
                    aria-hidden="true"
                  >
                    <Mail size={17} strokeWidth={1.7} />
                  </span>
                  <input
                    id="recovery-email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) setError(undefined);
                    }}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    required
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "recovery-email-error" : undefined}
                    className={`h-full w-full rounded-lg border bg-white px-4 pl-11 text-sm text-[#1c1c26] outline-none transition placeholder:text-[#a7acc4] focus:ring-3 ${
                      error
                        ? "border-[#e0333f] focus:border-[#e0333f] focus:ring-[#e0333f]/10"
                        : "border-[#d9dce5] focus:border-[#7247f3] focus:ring-[#7247f3]/10"
                    }`}
                  />
                </div>
                {error && (
                  <p
                    className="mt-1.5 text-[11px] font-medium text-[#e0333f]"
                    id="recovery-email-error"
                  >
                    {error}
                  </p>
                )}
              </div>

              <button
                className="mt-1 flex h-12 w-full items-center justify-center rounded-lg bg-[#7247f3] text-sm font-semibold text-white transition hover:bg-[#5c2ee0] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#7247f3]/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={status === "submitting"}
                type="submit"
              >
                {status === "submitting" ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  "Continuar"
                )}
              </button>

              <p className="mt-1 text-[12px] text-[#9da3b8]">
                Lembrou a senha?{" "}
                <Link
                  className="font-semibold text-[#7247f3] hover:underline"
                  href="/login"
                >
                  Voltar para o login
                </Link>
              </p>
            </form>
          </>
        )}
      </div>

      <footer className="mx-auto flex w-full max-w-[1216px] flex-col items-center gap-3 border-t border-[#eaecf0] px-5 py-7 text-[11px] text-[#8d97a7] sm:flex-row sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} LINEUP</p>
        <div className="flex gap-6">
          <Link className="transition hover:text-[#4b5468]" href="/sobre-nos">
            Sobre nós
          </Link>
          <Link className="transition hover:text-[#4b5468]" href="/privacidade">
            Privacidade
          </Link>
          <Link className="transition hover:text-[#4b5468]" href="/termos">
            Termos de uso
          </Link>
        </div>
      </footer>
    </main>
  );
}
