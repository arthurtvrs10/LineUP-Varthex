"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X, type LucideIcon } from "lucide-react";
import { Brand } from "@/components/brand/Brand";

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
};

function NavRow({
  href,
  label,
  icon: Icon,
  active,
  activeColor,
  onNavigate,
}: PortalNavItem & { active: boolean; activeColor: string; onNavigate: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-2.5 rounded-[7px] px-2.5 py-[7px] text-[13px] font-semibold tracking-[-0.1px] transition ${
        active ? "text-white" : "text-white/60 hover:bg-white/5 hover:text-white/90"
      }`}
      style={active ? { backgroundColor: activeColor } : undefined}
    >
      <Icon size={17} strokeWidth={1.8} />
      {label}
    </Link>
  );
}

function GroupLabel({ children }: { children: string }) {
  return (
    <p className="px-2.5 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white/30">
      {children}
    </p>
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
        className="fixed left-3 top-3 z-50 grid size-9 place-items-center rounded-[8px] border border-white/10 bg-[#101116] text-white shadow-lg lg:hidden"
      >
        {open ? <X size={18} strokeWidth={1.8} /> : <Menu size={18} strokeWidth={1.8} />}
      </button>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={close} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col overflow-hidden bg-[#101116] transition-transform duration-200 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center border-b border-white/10 px-4">
          <Link href={homeHref} onClick={close}>
            <Brand light align="start" />
          </Link>
        </div>

        <div className="shrink-0 border-b border-white/10 px-4 py-2.5">
          <p className="truncate text-[13px] font-medium text-white">{subtitleLine1}</p>
          <p className="truncate text-[11px] text-white/40">{subtitleLine2}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-3 px-3 py-3">
          {groups.map((group, gi) => (
            <div key={group.label ?? gi} className="flex flex-col gap-0.5">
              {group.label && <GroupLabel>{group.label}</GroupLabel>}
              {group.items.map((item) => (
                <NavRow
                  key={item.href}
                  {...item}
                  active={pathname === item.href}
                  activeColor={activeColor}
                  onNavigate={close}
                />
              ))}
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/10 px-3 py-3">
          {bottomLinks.length > 0 && (
            <div className="flex flex-col gap-0.5">
              {bottomLinks.map((item) => (
                <NavRow
                  key={item.href}
                  {...item}
                  active={pathname === item.href}
                  activeColor={activeColor}
                  onNavigate={close}
                />
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center gap-2 rounded-[7px] px-2 py-2">
            <span
              className="grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold"
              style={{ backgroundColor: user.avatarBg ?? "#fdf3e3", color: user.avatarColor ?? "#d28b27" }}
            >
              {user.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-white">{user.name}</p>
              <p className="truncate text-[11px] text-white/40">{user.email}</p>
            </div>
            <ChevronDown size={13} className="shrink-0 text-white/40" />
          </div>
        </div>
      </aside>
    </>
  );
}
