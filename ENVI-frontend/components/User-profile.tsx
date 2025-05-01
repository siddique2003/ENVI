"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"

export function UserProfile() {
  const { isLoaded, user } = useUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isLoaded) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col">
        <p className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          {user?.fullName || user?.username}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
      </div>
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            userButtonAvatarBox: "border-2 border-cyan-400",
            userButtonPopoverCard: "bg-black/80 backdrop-blur-xl border border-purple-500/30",
            userButtonPopoverActionButton: "hover:bg-purple-500/20",
            userButtonPopoverActionButtonText: "text-white",
            userButtonPopoverFooter: "border-t border-purple-500/30",
          },
        }}
      />
    </div>
  )
}
