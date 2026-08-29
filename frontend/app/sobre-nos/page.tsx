import type { Metadata } from "next";
import { AboutPage } from "@/components/about/AboutPage";

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "Conheça o propósito, a missão, a visão e os valores da LINEUP.",
};

export default function SobreNosPage() {
  return <AboutPage />;
}
