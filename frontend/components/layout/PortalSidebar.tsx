"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Menu, UserRound, X, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export type PortalNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type PortalNavGroup = {
  label?: string;
  items: PortalNavItem[];
};

export type PortalSidebarUser = {
  initials: string;
  name: string;
  email: string;
  avatarBg?: string;
  avatarColor?: string;
};

type PortalSidebarProps = {
  homeHref: string;
  subtitleLine1: string;
  subtitleLine2: string;
  groups: PortalNavGroup[];
  bottomLinks?: PortalNavItem[];
  user: PortalSidebarUser;
  activeColor?: string;
  theme?: "dark" | "light";
  /** Destino de "Ver perfil" no menu de conta. */
  profileHref: string;
  /** Destino de "Sair". Não há autenticação ainda — é navegação. */
  logoutHref?: string;
};

function NavRow({
  href,
  label,
  icon: Icon,
  active,
  activeColor,
  theme,
  onNavigate,
}: PortalNavItem & { active: boolean; activeColor: string; theme: "dark" | "light"; onNavigate: () => void }) {
  const inactiveClasses =
    theme === "light"
      ? "text-[#5f6f87] hover:bg-[#f4f5f9] hover:text-[#0d1831]"
      : "text-white/60 hover:bg-white/5 hover:text-white/90";
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-2.5 rounded-[7px] px-2.5 py-[7px] text-[13px] font-semibold tracking-[-0.1px] transition ${
        active ? (theme === "light" ? "" : "text-white") : inactiveClasses
      }`}
      style={
        active
          ? theme === "light"
            ? { backgroundColor: `${activeColor}14`, color: activeColor }
            : { backgroundColor: activeColor }
          : undefined
      }
    >
      <Icon size={17} strokeWidth={1.8} />
      {label}
    </Link>
  );
}

function GroupLabel({ children, theme }: { children: string; theme: "dark" | "light" }) {
  return (
    <p
      className={`px-2.5 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] ${
        theme === "light" ? "text-[#98a2b3]" : "text-white/30"
      }`}
    >
      {children}
    </p>
  );
}

function AccountMenu({
  user,
  theme,
  profileHref,
  logoutHref,
  onNavigate,
}: {
  user: PortalSidebarUser;
  theme: "dark" | "light";
  profileHref: string;
  logoutHref: string;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const light = theme === "light";

  const itemClasses = light
    ? "text-[#0d1831] hover:bg-[#f7f6f2]"
    : "text-white/80 hover:bg-white/5 hover:text-white";

  function close() {
    setOpen(false);
    onNavigate();
  }

  return (
    <div className="relative mt-2" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex w-full items-center gap-2 rounded-[7px] px-2 py-2 text-left transition ${
          light ? "hover:bg-[#f7f6f2]" : "hover:bg-white/5"
        }`}
      >
        <span
          className="grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold"
          style={{ backgroundColor: user.avatarBg ?? "#fdf3e3", color: user.avatarColor ?? "#d28b27" }}
        >
          {user.initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-[13px] font-medium ${light ? "text-[#0d1831]" : "text-white"}`}>
            {user.name}
          </span>
          <span className={`block truncate text-[11px] ${light ? "text-[#98a2b3]" : "text-white/40"}`}>
            {user.email}
          </span>
        </span>
        <ChevronDown
          size={13}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""} ${
            light ? "text-[#98a2b3]" : "text-white/40"
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute bottom-full left-0 z-30 mb-1.5 w-full overflow-hidden rounded-[10px] border py-1.5 ${
            light
              ? "border-[#e6e4df] bg-white shadow-[0_8px_24px_rgba(13,24,49,0.08)]"
              : "border-white/10 bg-[#1a1b21] shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
          }`}
        >
          <Link
            href={profileHref}
            role="menuitem"
            onClick={close}
            className={`flex items-center gap-2.5 px-3 py-2 text-[13px] transition ${itemClasses}`}
          >
            <UserRound size={15} strokeWidth={1.8} />
            Ver perfil
          </Link>
          <Link
            href={logoutHref}
            role="menuitem"
            onClick={close}
            className={`flex items-center gap-2.5 px-3 py-2 text-[13px] transition ${
              light ? "text-[#c84a4a] hover:bg-[#fdeaea]" : "text-[#ff8a8a] hover:bg-white/5"
            }`}
          >
            <LogOut size={15} strokeWidth={1.8} />
            Sair
          </Link>
        </div>
      )}
    </div>
  );
}

export function PortalSidebar({
  homeHref,
  subtitleLine1,
  subtitleLine2,
  groups,
  bottomLinks = [],
  user,
  activeColor = "#4318ff",
  theme = "dark",
  profileHref,
  logoutHref = "/login",
}: PortalSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        className={`fixed left-3 top-3 z-50 grid size-9 place-items-center rounded-[8px] shadow-lg lg:hidden ${
          theme === "light"
            ? "border border-[#e2e7f0] bg-white text-[#0d1831]"
            : "border border-white/10 bg-[#101116] text-white"
        }`}
      >
        {open ? <X size={18} strokeWidth={1.8} /> : <Menu size={18} strokeWidth={1.8} />}
      </button>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={close} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col overflow-hidden transition-transform duration-200 ease-out lg:translate-x-0 ${
          theme === "light" ? "bg-white border-r border-[#e2e7f0]" : "bg-[#101116]"
        } ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className={`flex h-14 shrink-0 items-center border-b px-4 ${
            theme === "light" ? "border-[#e2e7f0]" : "border-white/10"
          }`}
        >
          <Link href={homeHref} onClick={close}>
            <Logo
              variant="horizontal"
              height={24}
              className={theme === "dark" ? "text-white" : "text-ink"}
            />
          </Link>
        </div>

        <div
          className={`shrink-0 border-b px-4 py-2.5 ${theme === "light" ? "border-[#e2e7f0]" : "border-white/10"}`}
        >
          <p className={`truncate text-[13px] font-medium ${theme === "light" ? "text-[#0d1831]" : "text-white"}`}>
            {subtitleLine1}
          </p>
          <p className={`truncate text-[11px] ${theme === "light" ? "text-[#98a2b3]" : "text-white/40"}`}>
            {subtitleLine2}
          </p>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
          {groups.map((group, gi) => (
            <div key={group.label ?? gi} className="flex flex-col gap-0.5">
              {group.label && <GroupLabel theme={theme}>{group.label}</GroupLabel>}
              {group.items.map((item) => (
                <NavRow
                  key={item.href}
                  {...item}
                  active={pathname === item.href}
                  activeColor={activeColor}
                  theme={theme}
                  onNavigate={close}
                />
              ))}
            </div>
          ))}
        </nav>

        <div
          className={`shrink-0 border-t px-3 py-3 ${theme === "light" ? "border-[#e2e7f0]" : "border-white/10"}`}
        >
          {bottomLinks.length > 0 && (
            <div className="flex flex-col gap-0.5">
              {bottomLinks.map((item) => (
                <NavRow
                  key={item.href}
                  {...item}
                  active={pathname === item.href}
                  activeColor={activeColor}
                  theme={theme}
                  onNavigate={close}
                />
              ))}
            </div>
          )}

          <AccountMenu
            user={user}
            theme={theme}
            profileHref={profileHref}
            logoutHref={logoutHref}
            onNavigate={close}
          />
        </div>
      </aside>
    </>
  );
}
