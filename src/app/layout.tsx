import { Suspense } from 'react';
import LocationObserver from '@/components/layout/LocationObserver';
import type { Metadata } from 'next';
import { Geist_Mono, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import WorkspaceShell from '@/components/layout/WorkspaceShell';

// Fallback web das fontes proprietárias "BancoDoBrasil Textos/Titulos" do uniDS
// (declaradas primeiro na pilha em globals.css e usadas quando instaladas).
const dsFallback = Source_Sans_3({
  variable: '--font-ds-fallback',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BBTS | Zero Click — Inteligência empresarial',
  description: 'Consulte documentos, entenda suas fontes e transforme conhecimento em decisões.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${dsFallback.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Suspense fallback={null}>
          <LocationObserver />
        </Suspense>
        <WorkspaceShell>{children}</WorkspaceShell>
      </body>
    </html>
  );
}
