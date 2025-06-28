import { AuthProvider } from '@/contexts/AuthContext'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hodor - AI Job Search Engine',
  description: 'Transform your job search with AI. Find perfect matches, optimize your applications, and land your dream job faster.',
  keywords: ['job search', 'AI', 'career', 'resume', 'applications'],
  authors: [{ name: 'Hodor Team' }],
  metadataBase: new URL('https://hodor.com'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Hodor - AI-Powered Job Search',
    description: 'Transform your job search with AI. Find perfect matches, optimize your applications, and land your dream job faster.',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'Hodor Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hodor - AI-Powered Job Search',
    description: 'Transform your job search with AI. Find perfect matches, optimize your applications, and land your dream job faster.',
    images: ['/android-chrome-512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <div className="min-h-screen bg-black">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
