import type { Metadata } from "next";
import { SitemapPage } from "@/components/sitemap/SitemapPage";

export const metadata: Metadata = {
  title: "Mapa do site",
  description: "Todas as páginas do LINEUP: site institucional e os quatro painéis do sistema.",
};

export default function MapaDoSitePage() {
  return <SitemapPage />;
}
