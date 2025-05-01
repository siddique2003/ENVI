"use client"

import { motion } from "framer-motion"

export function BackgroundText({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.03, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-[40vw] font-bold text-black dark:text-white whitespace-nowrap transition-colors"
        style={{
          textShadow: "0 0 100px rgba(0,0,0,0.1)",
        }}
      >
        {text}
      </motion.span>
    </motion.div>
  )
}

