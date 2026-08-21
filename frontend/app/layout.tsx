import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const manrope = localFont({
  src: "./fonts/a343f882a40d2cc9-s.p.1sj6eobyi31rd.woff2",
  variable: "--font-manrope",
  display: "swap",
});

const display = localFont({
  src: "./fonts/0c8f209abc35ee02-s.p.0c0g8ifvh7k7-.woff2",
  variable: "--font-display",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Varthex Barber | Gestão sob controle",
    template: "%s | Varthex Barber",
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
      className={`${manrope.variable} ${display.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-[#fcfdff] font-[var(--font-manrope)] text-[#0d1831] antialiased selection:bg-[#7247f3]/20">
        {children}
      </body>
    </html>
  );
}
