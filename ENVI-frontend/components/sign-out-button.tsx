"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useClerk, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export function SignOutButton() {
  const { signOut } = useClerk()
  const router = useRouter()
  const { isSignedIn } = useUser()

  if (!isSignedIn) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Button
        variant="ghost"
        onClick={() => signOut(() => router.push("/"))}
        className="group rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-white transition-all"
      >
        Sign Out
        <span className="ml-2 opacity-70 group-hover:opacity-100 transition-opacity">
          ←
        </span>
      </Button>
    </motion.div>
  )
}