import NextAuth, { type NextAuthOptions, type User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

type BackendUser = User & { backendJwt: string; backendRefreshToken: string; role: string };

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) {
          return null;
        }

        const data = await res.json();

        const user: BackendUser = {
          id: data.id,
          email: data.email,
          name: data.name,
          backendJwt: data.accessToken,
          backendRefreshToken: data.refreshToken,
          role: data.role,
        };

        return user;
      },
    }),
  ],
  callbacks: {
    // Roda logo após o Google validar o login. `account.id_token` é o ID
    // token assinado pelo Google (JWT) — é isso, e só isso, que mandamos
    // para o backend. O backend valida a assinatura contra as chaves
    // públicas do Google antes de confiar no e-mail; nunca repassamos
    // email/nome soltos, que qualquer chamador poderia forjar.
    async jwt({ token, account, user, trigger, session }) {
      // Disparado por updateSession({ name }) no client (ex.: PerfilPage
      // depois de um PATCH /users/me) — sem isso o nome editado nunca
      // entra no cookie da sessão e volta pro valor antigo a cada reload.
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      // Explícito de propósito, sem depender do merge implícito padrão do
      // NextAuth (este projeto tem breaking changes documentados vs. a
      // versão "normal") — sem isso, e-mail (e em alguns casos nome) some
      // da sessão depois do primeiro login.
      if (user) {
        if (user.name) token.name = user.name;
        if (user.email) token.email = user.email;
      }

      if (account?.provider === "google" && account.id_token) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/social-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: account.id_token }),
          });

          if (res.ok) {
            const data = await res.json();
            token.backendJwt = data.accessToken;
            token.backendRefreshToken = data.refreshToken;
            token.role = data.role;
          } else {
            console.error("Falha ao comunicar com o backend:", res.status);
          }
        } catch (error) {
          console.error("Erro no social login:", error);
        }
      }

      if (account?.provider === "credentials" && user) {
        const backendUser = user as BackendUser;
        token.backendJwt = backendUser.backendJwt;
        token.backendRefreshToken = backendUser.backendRefreshToken;
        token.role = backendUser.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.name) {
        session.user.name = token.name as string;
      }
      if (token.email) {
        session.user.email = token.email as string;
      }
      if (token.backendJwt) {
        session.user.accessToken = token.backendJwt as string;
      }
      if (token.role) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  events: {
    // Sem isso, o refresh token da sessão fica válido no backend por até
    // 30 dias mesmo depois do usuário clicar em "Sair" — signOut() do
    // NextAuth só apaga o cookie local, nunca chamou o backend.
    async signOut({ token }) {
      const refreshToken = token?.backendRefreshToken as string | undefined;
      if (!refreshToken) return;
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error("Falha ao revogar sessão no backend:", error);
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
