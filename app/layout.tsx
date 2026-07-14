import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://healthblueprint.app'
const TITLE = 'The Health Blueprint Labs · Interactive Health Simulations'
const DESCRIPTION =
  'See how everyday habits actually change your body, through simple simulations you can play with. Sleep, energy, and stress, made something you can see.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: 'The Health Blueprint',
  keywords: ['teen health', 'sleep', 'energy', 'stress', 'interactive science', 'health education'],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'The Health Blueprint',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  // Icons come from app/icon.tsx and app/apple-icon.tsx, generated from the
  // brand mark so the favicon can never drift from the logo.
}

export const viewport: Viewport = {
  themeColor: '#F5F7FB',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
