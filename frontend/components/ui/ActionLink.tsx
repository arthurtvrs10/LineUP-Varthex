import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type ActionLinkProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "dark";
  className?: string;
};

export function ActionLink({
  children,
  href,
  variant = "primary",
  className = "",
}: ActionLinkProps) {
  const colors =
    variant === "primary"
      ? "border-transparent bg-accent text-on-accent hover:bg-accent-hover"
      : variant === "dark"
        ? "border-transparent bg-[#0d1831] text-white hover:bg-[#1a2740]"
        : "border-[#d0d5dd] bg-white text-[#0d1831] hover:border-accent hover:text-accent-strong";

  return (
    <Link
      href={href}
      className={`group inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-bold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${colors} ${className}`}
    >
      {children}
      <ArrowRight
        className="transition-transform duration-150 group-hover:translate-x-0.5"
        size={16}
        aria-hidden="true"
      />
    </Link>
  );
}
