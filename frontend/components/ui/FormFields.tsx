"use client";

import { useId, type ReactNode } from "react";

/** Campos de formulário dos modais. Mesma anatomia em todos os painéis. */

const baseInput =
  "h-11 w-full rounded-[10px] border border-fog bg-white px-3 text-sm text-ink outline-none transition placeholder:text-tertiary focus:border-accent";

function Wrapper({
  id,
  label,
  hint,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-secondary">{hint}</p>}
    </div>
  );
}

export function TextField({
  label,
  hint,
  required,
  type = "text",
  placeholder,
  defaultValue,
  name,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  name?: string;
}) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint} required={required}>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={baseInput}
      />
    </Wrapper>
  );
}

type SelectOption = string | { value: string; label: string };

export function SelectField({
  label,
  options,
  hint,
  required,
  defaultValue,
  name,
}: {
  label: string;
  options: SelectOption[];
  hint?: string;
  required?: boolean;
  defaultValue?: string;
  name?: string;
}) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint} required={required}>
      <select id={id} name={name} required={required} defaultValue={defaultValue} className={baseInput}>
        {options.map((o) => {
          const value = typeof o === "string" ? o : o.value;
          const label = typeof o === "string" ? o : o.label;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </Wrapper>
  );
}

export function TextAreaField({
  label,
  hint,
  placeholder,
  rows = 3,
  name,
}: {
  label: string;
  hint?: string;
  placeholder?: string;
  rows?: number;
  name?: string;
}) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        placeholder={placeholder}
        className={`${baseInput} h-auto py-2.5`}
      />
    </Wrapper>
  );
}

/** Grade de 2 colunas que colapsa para 1 no mobile. */
export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

/** Grupo de rádios em cartões — usado nos modais de exportação. */
export function RadioCards({
  name,
  options,
  defaultValue,
}: {
  name: string;
  options: { value: string; label: string; hint?: string }[];
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((o) => (
        <label
          key={o.value}
          className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-fog px-3.5 py-3 transition hover:bg-surface-sunken has-[:checked]:border-accent has-[:checked]:bg-accent-subtle"
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            defaultChecked={o.value === defaultValue}
            className="mt-0.5 size-4 shrink-0 accent-accent"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-ink">{o.label}</span>
            {o.hint && <span className="block text-xs text-secondary">{o.hint}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}
