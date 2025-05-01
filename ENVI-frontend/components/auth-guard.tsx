"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") {
      return
    }

    setIsLoading(false)

    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [router, status])

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0a0014]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 dark:text-cyan-400" />
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "authenticated") {
    return <>{children}</>
  }

  return null
}
