
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Poppins } from 'next/font/google';
import { LoaderProvider } from '@/hooks/use-loader';
import { GlobalLoader } from '@/components/dashboard/global-loader';

/*
export const metadata: Metadata = {
  title: 'Lacort Produção',
  description: 'Sistema de Acompanhamento de Produção',
  icons: {
    icon: '/favicon.svg',
  },
  manifest: "/manifest.webmanifest",
};
*/

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-headline',
});

const inter = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>Uai Uniformes - Produção</title>
        <meta name="description" content="Sistema de Acompanhamento de Produção - Uai Uniformes" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#1A1A1A" />
      </head>
      <body className={`${poppins.variable} ${inter.variable} font-body antialiased`}>
        <LoaderProvider>
          <GlobalLoader />
          {children}
        </LoaderProvider>
        <Toaster />
      </body>
    </html>
  );
}
