import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { FrontendProvider } from '@/contexts/FrontendContext'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'


const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'Tarly CV Editor',
  description: 'Cursor for Resumes',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange>
          <TooltipProvider>
            <FrontendProvider>
              <div className="hidden md:block">
                {children}
              </div>
            </FrontendProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
