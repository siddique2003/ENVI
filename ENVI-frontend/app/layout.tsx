import { Inter } from "next/font/google"
import "./globals.css"
import type { ReactNode } from "react"
import type { Metadata } from "next"
import { Providers } from "@/components/providers"

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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
