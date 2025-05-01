/**
 * OBSOLETE FILE - DO NOT USE
 * This file is no longer used in the application.
 * The ThemeProvider in theme-provider.tsx is used directly in the root layout instead.
 */
"use client"

import { ThemeProvider } from "next-themes"
import { useEffect, useState } from "react"
import type React from "react"

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Only set mounted to true after the component has mounted
    // This ensures hydration is complete before rendering content
    setMounted(true)
    
    // Force dark mode on the document element
    document.documentElement.classList.add('dark')
  }, [])

  // Return a loading state on server-side or during initial client-side render
  // This prevents hydration mismatch issues
  if (!mounted) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
        <div className="min-h-screen bg-black"></div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={false}
    >
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    </ThemeProvider>
  )
}

