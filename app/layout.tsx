import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'), // Para desarrollo
  // metadataBase: new URL('https://tu-dominio.com'), // Para producción
  title: 'Feria del Empleo Tecmilenio Campus San Nicolás',
  description: 'Registra tus datos para participar en nuestra rifa y ganar un premio',
  openGraph: {
    title: 'Feria del Empleo Tecmilenio',
    description: 'Registra tus datos para participar en nuestra rifa y ganar un premio',
    images: [{
      url: '/feria.jpg', // Ahora será resuelto correctamente con metadataBase
      width: 1200,
      height: 630,
      alt: 'Feria del Empleo Tecmilenio',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Feria del Empleo Tecmilenio',
    description: 'Registra tus datos para participar en nuestra rifa y ganar un premio',
    images: ['/feria.jpg'], // También será resuelto correctamente
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster />
        <Analytics />
        {children}
      </body>
    </html>
  );
}