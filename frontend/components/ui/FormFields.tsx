"use client";

import { useId, type ReactNode } from "react";

/** Campos de formulário dos modais. Mesma anatomia em todos os painéis. */

const baseInput =
  "h-11 w-full rounded-[10px] border border-[#e6e4df] bg-white px-3 text-sm text-[#0d1831] outline-none transition placeholder:text-[#98a2b3] focus:border-[#7247f3]";

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
      <label htmlFor={id} className="text-sm font-medium text-[#0d1831]">
        {label}
        {required && <span className="ml-0.5 text-[#c84a4a]">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[#686a73]">{hint}</p>}
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
}: {
  label: string;
  hint?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint} required={required}>
      <input
        id={id}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={baseInput}
      />
    </Wrapper>
  );
}

export function SelectField({
  label,
  options,
  hint,
  required,
  defaultValue,
}: {
  label: string;
  options: string[];
  hint?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint} required={required}>
      <select id={id} required={required} defaultValue={defaultValue} className={baseInput}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}

export function TextAreaField({
  label,
  hint,
  placeholder,
  rows = 3,
}: {
  label: string;
  hint?: string;
  placeholder?: string;
  rows?: number;
}) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint}>
      <textarea
        id={id}
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
          className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-[#e6e4df] px-3.5 py-3 transition hover:bg-[#f7f6f2] has-[:checked]:border-[#7247f3] has-[:checked]:bg-[#ede9fd]"
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            defaultChecked={o.value === defaultValue}
            className="mt-0.5 size-4 shrink-0 accent-[#7247f3]"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-[#0d1831]">{o.label}</span>
            {o.hint && <span className="block text-xs text-[#686a73]">{o.hint}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}
