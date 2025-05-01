"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"

interface AuthModalProps {
  onClose: () => void
}

export function AuthModal({ onClose }: AuthModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black"
        onClick={onClose}
      />

      {/* Welcome Text */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="absolute top-20 text-4xl font-bold text-center text-white w-full"
      >
        Welcome to{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">ENVI</span>
      </motion.h2>

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5, delay: 0.4 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        <div className="p-8 text-center space-y-6">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-white"
          >
            Choose Your Path
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-300"
          >
            Begin your journey into data visualization with AI precision
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid gap-4 sm:grid-cols-2 mt-8"
          >
            <Link href="/login">
              <Button
                variant="outline"
                className="w-full p-6 h-auto flex flex-col gap-2 bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
              >
                <span className="text-xl font-semibold text-white">Sign In</span>
                <span className="text-sm text-gray-300">Already have an account? Continue your journey with us</span>
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="w-full p-6 h-auto flex flex-col gap-2 bg-purple-600 hover:bg-purple-700 text-white border-0 transition-colors">
                <span className="text-xl font-semibold">Sign Up</span>
                <span className="text-sm text-purple-100">New to ENVI? Create your account and start exploring</span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

