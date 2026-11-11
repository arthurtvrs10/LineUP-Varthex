import type { Metadata } from "next";
import { EmailVerificationPage } from "@/components/auth/EmailVerificationPage";
export const metadata: Metadata = { title: "Confirmar e-mail", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function Page() { return <EmailVerificationPage/>; }
