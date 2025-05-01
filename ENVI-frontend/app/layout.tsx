import { Inter } from "next/font/google"
import "./globals.css"
import type { ReactNode } from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoadingProvider } from "@/lib/contexts/loading-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ENVI - Enhanced Visualization Interface",
  description: "An Automated BI Tool for Data-Driven Insights",
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          <LoadingProvider>
            <ThemeToggle />
            {children}
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
