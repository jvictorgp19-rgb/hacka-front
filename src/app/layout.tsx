import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BBTS / ACME | Plataforma de Inteligência Empresarial & Legal Design",
  description:
    "Desafio 2 Hackathon BBTS - Equipe Ctrl + Alt + Business. Governança documental NG_010, Legal Design, UX Writing, Simuladores Interativos e Co-Piloto Executivo RAG.",
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
      <body className="min-h-full flex flex-col bg-[#F4F6F9] text-slate-900">
        {children}
      </body>
    </html>
  );
}
