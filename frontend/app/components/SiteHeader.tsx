"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

type HeaderVariant = "landing" | "about";

const landingLinks = [
  { label: "Produto", href: "/#produto" },
  { label: "Recursos", href: "/#recursos" },
  { label: "Para quem", href: "/#publicos" },
  { label: "Ajuda", href: "/#faq" },
];

const aboutLinks = [
  { label: "Propósito", href: "#proposito" },
  { label: "Missão", href: "#missao" },
  { label: "Visão", href: "#visao" },
  { label: "Valores", href: "#valores" },
];

export function SiteHeader({
  variant = "landing",
}: {
  variant?: HeaderVariant;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = variant === "about" ? aboutLinks : landingLinks;

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <Link
        className="brand-link"
        href="/"
        aria-label="Varthex Barber - Página inicial"
      >
        <span className="brand">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>

          <span className="brand-copy">
            <strong>VARTHEX</strong>
            <small>BARBER</small>
          </span>
        </span>
      </Link>

      <nav className="desktop-nav" aria-label="Navegação principal">
        {links.map((link) => (
          <Link key={link.label} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="header-actions">
        <Link className="login-link" href="/login">
          Entrar
        </Link>

        <Link className="button button-dark" href="/cadastro">
          Começar agora
        </Link>
      </div>

      <button
        className="menu-toggle"
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={21} /> : <Menu size={21} />}
      </button>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Navegação mobile">
          {links.map((link) => (
            <Link key={link.label} href={link.href} onClick={closeMenu}>
              {link.label}
            </Link>
          ))}

          <Link
            className="button button-primary"
            href="/cadastro"
            onClick={closeMenu}
          >
            Começar agora <ArrowRight size={16} />
          </Link>
        </nav>
      )}
    </header>
  );
}