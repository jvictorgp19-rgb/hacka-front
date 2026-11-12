import { Suspense } from "react";
import LocationObserver from "@/components/layout/LocationObserver";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WorkspaceShell from "@/components/layout/WorkspaceShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Raiz IQ | Inteligência empresarial",
  description:
    "Consulte documentos, entenda suas fontes e transforme conhecimento em decisões.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Suspense fallback={null}><LocationObserver/></Suspense>
        <WorkspaceShell>{children}</WorkspaceShell>
      </body>
    </html>
  );
}
