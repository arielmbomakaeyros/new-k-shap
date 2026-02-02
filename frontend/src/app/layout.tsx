import React from "react"
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
// import { Analytics } from '@vercel/analytics/next';
// import { RootProvider } from '@/components/providers/RootProvider';
import './globals.css';
import { RootProvider } from "../components/providers/RootProvider";

const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'K-shap - Enterprise Financial Management',
  description: 'K-shap: Track and manage enterprise disbursements and cash inflow',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_geist.className} font-sans antialiased`}>
        <RootProvider>{children}</RootProvider>
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
