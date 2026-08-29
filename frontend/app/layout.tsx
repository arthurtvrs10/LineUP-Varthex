import type { Metadata } from "next";
import { Archivo, Work_Sans } from "next/font/google";
import "./globals.css";

// Self-hosted pelo next/font: sem chamada ao Google em runtime, sem layout shift.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LINEUP | Gestão de barbearia",
    template: "%s | LINEUP",
  },
  description:
    "Agenda, equipe, clientes, comissões e indicadores em uma única plataforma para barbearias.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${workSans.variable} scroll-smooth`}
    >
      <body className="min-h-screen antialiased selection:bg-accent/20">
        {children}
      </body>
    </html>
  );
}
