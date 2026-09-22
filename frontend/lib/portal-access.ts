const portals: Record<string, string> = {
  ADMIN: "/admin", BARBER: "/barbeiro", CLIENT: "/clientes", SUPER_ADMIN: "/superadmin",
};

export function portalForRole(role: unknown): string | undefined {
  const portal = typeof role === "string" && Object.hasOwn(portals, role) ? portals[role] : undefined;
  return portal ? `${portal}/dashboard` : undefined;
}

export function canAccessPortal(role: unknown, pathname: string): boolean {
  const home = portalForRole(role);
  if (!home) return false;
  const portal = home.slice(0, home.lastIndexOf("/"));
  return pathname === portal || pathname.startsWith(`${portal}/`);
}
