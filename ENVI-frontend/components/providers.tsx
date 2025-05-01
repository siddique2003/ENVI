'use client'

import { ThemeProvider } from "@/components/theme-provider"
// import { ThemeToggle } from "@/components/theme-toggle"
import { LoadingProvider } from "@/lib/contexts/loading-context"
import { SessionProvider, useSession, signOut } from "next-auth/react"
import { AuthProvider } from "@/lib/contexts/auth-context"
import type { ReactNode } from "react"
import { useEffect, useRef, useCallback } from "react"

const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes in milliseconds

// Internal component to handle inactivity logic
function InactivityHandler() {
  const { status } = useSession()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const logoutUser = useCallback(() => {
    console.log("Inactivity timeout reached. Logging out.")
    signOut({ redirect: true, callbackUrl: '/login?error=session_expired' })
  }, [])

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(logoutUser, INACTIVITY_TIMEOUT)
  }, [logoutUser])

  const handleActivity = useCallback(() => {
    // console.log("Activity detected, resetting timer."); // Optional: for debugging
    resetTimer()
  }, [resetTimer])

  useEffect(() => {
    // Only run if authenticated
    if (status === 'authenticated') {
      const events = ['mousemove', 'keydown', 'click', 'scroll']
      
      // Initial setup
      resetTimer() // Start the timer initially
      events.forEach(event => window.addEventListener(event, handleActivity))
      
      // Cleanup
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        events.forEach(event => window.removeEventListener(event, handleActivity))
      }
    } else {
       // Clear timer if status changes to something other than authenticated
       if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
    }
  }, [status, resetTimer, handleActivity]) // Rerun effect if status changes

  return null // This component doesn't render anything
}

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
      {/* SessionProvider needs to be outside InactivityHandler so useSession works */}
      <SessionProvider>
        <AuthProvider>
          <LoadingProvider>
            {/* <ThemeToggle /> REMOVED FROM HERE */}
            <InactivityHandler /> {/* Add the inactivity handler */} 
            {children}
          </LoadingProvider>
        </AuthProvider>
      </SessionProvider>
    </ThemeProvider>
  )
} 