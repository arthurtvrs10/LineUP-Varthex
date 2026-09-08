import { withAuth } from "next-auth/middleware";

// Exige sessão pra qualquer rota dos 4 portais. Restrição por papel
// específico (ex.: só SUPER_ADMIN em /superadmin) fica pra depois — por
// enquanto só bloqueia visitante não-autenticado, redirecionando pro
// /login configurado em pages.signIn (ver app/api/auth/[...nextauth]).
export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/admin/:path*", "/barbeiro/:path*", "/clientes/:path*", "/superadmin/:path*"],
};
