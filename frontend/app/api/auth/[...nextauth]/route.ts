import NextAuth, { type NextAuthOptions, type User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

type BackendUser = User & { backendJwt: string; role: string };

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
    async jwt({ token, account, user }) {
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
        token.role = backendUser.role;
      }

      return token;
    },
    async session({ session, token }) {
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
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
