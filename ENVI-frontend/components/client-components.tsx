// components/client-components.tsx
"use client"

import Navbar from "@/components/Navbar"
import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"

export function ClientWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="min-h-screen bg-background text-foreground"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}