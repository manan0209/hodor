import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hodor - AI-Powered Job Search',
  description: 'Transform your job search with AI. Find perfect matches, optimize your applications, and land your dream job faster.',
  keywords: ['job search', 'AI', 'career', 'resume', 'applications'],
  authors: [{ name: 'Hodor Team' }],
  metadataBase: new URL('https://hodor.com'),
  openGraph: {
    title: 'Hodor - AI-Powered Job Search',
    description: 'Transform your job search with AI. Find perfect matches, optimize your applications, and land your dream job faster.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hodor - AI-Powered Job Search',
    description: 'Transform your job search with AI. Find perfect matches, optimize your applications, and land your dream job faster.',
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
        <div className="min-h-screen bg-black">
          {children}
        </div>
      </body>
    </html>
  )
}
