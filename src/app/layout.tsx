import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema de Rifas - Participa y Gana',
  description: 'Participa en nuestras rifas, elige tus números y gana increíbles premios. Sorteos transparentes y seguros.',
  keywords: 'rifas, sorteos, premios, concursos, números, ganar',
  authors: [{ name: 'Sistema de Rifas' }],
  creator: 'Sistema de Rifas',
  publisher: 'Sistema de Rifas',
  openGraph: {
    title: 'Sistema de Rifas - Participa y Gana',
    description: 'Participa en nuestras rifas, elige tus números y gana increíbles premios',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    siteName: 'Sistema de Rifas',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sistema de Rifas - Participa y Gana',
    description: 'Participa en nuestras rifas, elige tus números y gana increíbles premios',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={cn(inter.className, "min-h-full bg-background text-foreground")}>
        <div className="flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
