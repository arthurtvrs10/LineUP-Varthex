import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    // Roda logo após o Google validar o login. `account.id_token` é o ID
    // token assinado pelo Google (JWT) — é isso, e só isso, que mandamos
    // para o backend. O backend valida a assinatura contra as chaves
    // públicas do Google antes de confiar no e-mail; nunca repassamos
    // email/nome soltos, que qualquer chamador poderia forjar.
    async jwt({ token, account }) {
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
          } else {
            console.error("Falha ao comunicar com o backend:", res.status);
          }
        } catch (error) {
          console.error("Erro no social login:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.backendJwt) {
        session.user.accessToken = token.backendJwt as string;
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
