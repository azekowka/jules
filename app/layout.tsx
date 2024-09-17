import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { FrontendProvider } from '@/contexts/FrontendContext'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'Jules',
  description: 'AI LaTeX Editor',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange>
          <TooltipProvider>
            <FrontendProvider>
              {children}</FrontendProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
      </html>
    </ClerkProvider>
  )
}
