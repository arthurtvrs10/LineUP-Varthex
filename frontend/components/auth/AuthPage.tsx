"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserRound,
} from "lucide-react";
import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { Logo } from "@/components/brand/Logo";

type AuthPageProps = {
  mode: "login" | "register";
};

type FormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  remember: boolean;
  terms: boolean;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  remember: false,
  terms: false,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: FormValues, registering: boolean): FormErrors {
  const errors: FormErrors = {};

  if (registering && values.name.trim().length < 2) {
    errors.name = "Informe seu nome completo.";
  }

  if (!emailPattern.test(values.email)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (values.password.length < 6) {
    errors.password = "A senha deve ter pelo menos 6 caracteres.";
  }

  if (registering && values.confirmPassword !== values.password) {
    errors.confirmPassword = "As senhas não coincidem.";
  }

  if (registering && !values.terms) {
    errors.terms = "É necessário aceitar os termos para continuar.";
  }

  return errors;
}

type AuthFieldProps = {
  id: string;
  label: string;
  name: string;
  placeholder: string;
  type: "email" | "password" | "text";
  autoComplete: string;
  icon: ReactNode;
  value: string;
  error?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  rightSlot?: ReactNode;
};

function AuthField({
  id,
  label,
  name,
  placeholder,
  type,
  autoComplete,
  icon,
  value,
  error,
  onChange,
  rightSlot,
}: AuthFieldProps) {
  return (
    <div>
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
          value={value}
          onChange={onChange}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-full w-full rounded-lg border bg-white px-4 pl-11 text-[13px] text-[#1c1c26] outline-none transition placeholder:text-[#a7acc4] focus:ring-3 ${
            rightSlot ? "pr-11" : ""
          } ${
            error
              ? "border-[#e0333f] focus:border-[#e0333f] focus:ring-[#e0333f]/10"
              : "border-[#d9dce5] focus:border-[#7247f3] focus:ring-[#7247f3]/10"
          }`}
        />
        {rightSlot && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightSlot}
          </span>
        )}
      </div>
      {error && (
        <p
          className="mt-1.5 text-[11px] font-medium text-[#e0333f]"
          id={`${id}-error`}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
      className="text-[#8c94aa] transition hover:text-[#4b5468]"
      onClick={onToggle}
      type="button"
    >
      {visible ? (
        <EyeOff size={16} strokeWidth={1.7} />
      ) : (
        <Eye size={16} strokeWidth={1.7} />
      )}
    </button>
  );
}

export function AuthPage({ mode }: AuthPageProps) {
  const registering = mode === "register";

  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function updateValue<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values, registering);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    await new Promise((resolve) => setTimeout(resolve, 900));
    setStatus("success");
  }

  async function handleGoogleAuth() {
    setGoogleLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setGoogleLoading(false);
    setStatus("success");
  }

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center px-6 py-16">
        <Link href="/" className="mb-9 inline-flex self-start">
          <Logo variant="horizontal" height={28} className="text-ink" />
        </Link>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#e3e5eb] bg-[#f8fafc] px-6 py-11 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-[#e6f7ec] text-[#189155]">
              <CheckCircle2 size={26} />
            </span>
            <div>
              <h1 className="text-base font-bold text-[#1c1c26]">
                {registering
                  ? "Conta criada com sucesso!"
                  : "Login realizado com sucesso!"}
              </h1>
              <p className="mt-1.5 text-[12px] leading-6 text-[#667085]">
                {registering
                  ? "Enviamos um e-mail de confirmação para você concluir o cadastro."
                  : "Você será redirecionado para o seu painel em instantes."}
              </p>
            </div>
            <Link
              className="mt-1 text-[11px] font-semibold text-[#7247f3] hover:underline"
              href={registering ? "/login" : "/"}
            >
              {registering ? "Ir para o login" : "Voltar para o início"}
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-9 text-[28px] font-bold text-[#1c1c26]">
              {registering ? "Registre-se" : "Login"}
            </h1>

            <form
              className="flex flex-col gap-3.5"
              noValidate
              onSubmit={handleSubmit}
            >
              {registering && (
                <AuthField
                  autoComplete="name"
                  error={errors.name}
                  icon={<UserRound size={16} strokeWidth={1.7} />}
                  id="register-name"
                  label="Nome"
                  name="name"
                  onChange={(event) => updateValue("name", event.target.value)}
                  placeholder="Digite seu nome"
                  type="text"
                  value={values.name}
                />
              )}

              <AuthField
                autoComplete="email"
                error={errors.email}
                icon={<Mail size={16} strokeWidth={1.7} />}
                id={registering ? "register-email" : "email"}
                label="E-mail"
                name="email"
                onChange={(event) => updateValue("email", event.target.value)}
                placeholder="seu@email.com"
                type="email"
                value={values.email}
              />

              <AuthField
                autoComplete={registering ? "new-password" : "current-password"}
                error={errors.password}
                icon={<Lock size={16} strokeWidth={1.7} />}
                id={registering ? "register-password" : "password"}
                label="Senha"
                name="password"
                onChange={(event) =>
                  updateValue("password", event.target.value)
                }
                placeholder="Digite sua senha"
                rightSlot={
                  <PasswordToggle
                    onToggle={() => setShowPassword((v) => !v)}
                    visible={showPassword}
                  />
                }
                type={showPassword ? "text" : "password"}
                value={values.password}
              />

              {registering && (
                <AuthField
                  autoComplete="new-password"
                  error={errors.confirmPassword}
                  icon={<Lock size={16} strokeWidth={1.7} />}
                  id="register-confirm-password"
                  label="Confirmar senha"
                  name="confirmPassword"
                  onChange={(event) =>
                    updateValue("confirmPassword", event.target.value)
                  }
                  placeholder="Confirme sua senha"
                  rightSlot={
                    <PasswordToggle
                      onToggle={() => setShowConfirmPassword((v) => !v)}
                      visible={showConfirmPassword}
                    />
                  }
                  type={showConfirmPassword ? "text" : "password"}
                  value={values.confirmPassword}
                />
              )}

              {registering ? (
                <div>
                  <label className="grid grid-cols-[auto_1fr] items-start gap-2.5 text-[11px] leading-5 text-[#5b6472]">
                    <input
                      checked={values.terms}
                      className="mt-0.5 size-3.5 shrink-0 rounded border-[#d9dce5] text-[#7247f3] focus:ring-[#7247f3]/30"
                      onChange={(event) =>
                        updateValue("terms", event.target.checked)
                      }
                      type="checkbox"
                    />
                    <span>
                      Eu concordo com os{" "}
                      <Link className="font-semibold text-[#7247f3] hover:underline" href="/termos">
                        Termos de uso
                      </Link>{" "}
                      e a{" "}
                      <Link className="font-semibold text-[#7247f3] hover:underline" href="/privacidade">
                        Política de privacidade
                      </Link>
                      .
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="mt-1.5 text-[11px] font-medium text-[#e0333f]">
                      {errors.terms}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[11px] font-medium text-[#5b6472]">
                    <input
                      checked={values.remember}
                      className="size-3.5 rounded border-[#d9dce5] text-[#7247f3] focus:ring-[#7247f3]/30"
                      onChange={(event) =>
                        updateValue("remember", event.target.checked)
                      }
                      type="checkbox"
                    />
                    Lembrar de mim
                  </label>
                  <Link
                    className="text-[11px] font-semibold text-[#5326d7] hover:underline"
                    href="/esqueceu-senha"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              )}

              <button
                className="mt-0.5 flex h-11 w-full items-center justify-center rounded-lg bg-[#7247f3] text-xs font-semibold text-white transition hover:bg-[#5c2ee0] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#7247f3]/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={status === "submitting" || googleLoading}
                type="submit"
              >
                {status === "submitting" ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : registering ? (
                  "Registrar-se"
                ) : (
                  "Entrar"
                )}
              </button>

              <div className="my-3 flex items-center gap-3.5 text-[10px] text-[#9298ad]">
                <span className="h-px flex-1 bg-[#e3e5eb]" />
                ou
                <span className="h-px flex-1 bg-[#e3e5eb]" />
              </div>

              <button
                className="flex h-10.5 w-full items-center justify-center gap-2.5 rounded-lg border border-[#d9dce5] bg-white text-[11px] font-semibold text-[#1c1c26] transition hover:border-[#b8bdcd] hover:bg-[#fafafa] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#7247f3]/25 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={status === "submitting" || googleLoading}
                onClick={handleGoogleAuth}
                type="button"
              >
                {googleLoading ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-[#d9dce5] border-t-[#4b5468]" />
                ) : (
                  <>
                    <Image src="/icons/google.svg" alt="" width={18} height={18} />
                    Google
                  </>
                )}
              </button>

              <p className="mt-3 text-[11px] text-[#9da3b8]">
                {registering
                  ? "Já tem uma conta? "
                  : "Ainda não tem uma conta? "}
                <Link
                  className="font-semibold text-[#7247f3] hover:underline"
                  href={registering ? "/login" : "/cadastro"}
                >
                  {registering ? "Login" : "Registre-se"}
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
