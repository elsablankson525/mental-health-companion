import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import AuthSessionProvider from '@/components/session-provider'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mental Health Companion - AI-Powered Support',
  description: 'A safe, empathetic space for mental health support. Track your mood, journal your thoughts, and chat with our AI companion.',
  keywords: 'mental health, AI companion, mood tracking, journal, therapy, wellness',
  authors: [{ name: 'Mental Health Companion Team' }],
  creator: 'Mental Health Companion',
  publisher: 'Mental Health Companion',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mental-health-companion.vercel.app',
    title: 'Mental Health Companion - AI-Powered Support',
    description: 'A safe, empathetic space for mental health support. Track your mood, journal your thoughts, and chat with our AI companion.',
    siteName: 'Mental Health Companion',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mental Health Companion - AI-Powered Support',
    description: 'A safe, empathetic space for mental health support. Track your mood, journal your thoughts, and chat with our AI companion.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthSessionProvider>
            <div className="min-h-screen bg-background">
              {children}
            </div>
          </AuthSessionProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
