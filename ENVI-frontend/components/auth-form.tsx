"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import { SparklesCore } from "@/components/sparkles"
import { Mail, GitlabIcon as GitHub, CircleUser } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AuthForm({ type }: { type: "login" | "register" }) {
  const { resolvedTheme } = useTheme()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  // Hardcoded login credentials
  const MOCK_EMAIL = "test@envi.com"
  const MOCK_PASSWORD = "envi123"

  useEffect(() => setMounted(true), [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
      try {
        // Set both cookie and localStorage
        document.cookie = "isLoggedIn=true; path=/"
        localStorage.setItem("isLoggedIn", "true")
        
        // Store user information
        localStorage.setItem("user", JSON.stringify({ email: MOCK_EMAIL }))

        // Use router.push with a slight delay to ensure cookie is set
        setTimeout(() => {
          router.push("/dashboard")
        }, 100)
      } catch (error) {
        console.error("Navigation error:", error)
        setErrorMessage("Error navigating to dashboard")
        setShowError(true)
      } finally {
        setIsLoading(false)
      }
    } else {
      setErrorMessage("Invalid credentials\nUse:\nEmail: test@envi.com\nPassword: envi123")
      setShowError(true)
      setIsLoading(false)
    }
  }

  const socialProviders = [
    {
      name: "Email",
      icon: <Mail className="w-5 h-5" />,
      bg: "bg-purple-500 hover:bg-purple-600",
      action: () => setIsHovered(true),
    },
    {
      name: "GitHub",
      icon: <GitHub className="w-5 h-5" />,
      bg: "bg-gray-800 hover:bg-gray-900",
      action: () => console.log("GitHub login"),
    },
    {
      name: "Guest",
      icon: <CircleUser className="w-5 h-5" />,
      bg: "bg-pink-500 hover:bg-pink-600",
      action: () => console.log("Guest login"),
    },
  ]

  if (!mounted) return null

  return (
    <div className={`min-h-screen relative overflow-hidden ${resolvedTheme === "dark" ? "bg-black" : "bg-white"}`}>
      {/* Sparkles Background */}
      <div className="fixed inset-0 z-0">
        <SparklesCore
          id="tsparticles"
          particleColor={resolvedTheme === "dark" ? "#FFFFFF" : "#000000"}
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={50}
        />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center space-y-2"
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-4 text-black dark:text-white">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">ENVI</span>
          </h1>
          <p className={`text-xl ${resolvedTheme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            {type === "login" ? "Sign in to continue" : "Create your account"}
          </p>
        </motion.div>

        {/* Modified Interactive Auth Card */}
        <motion.div
          className={`relative cursor-pointer rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl
            ${
              resolvedTheme === "dark"
                ? "bg-gray-900/40 border border-purple-500/30"
                : "bg-white/80 border border-purple-200"
            }
            transition-all duration-300`}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 25px 50px -12px rgba(168, 85, 247, 0.15)",
          }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          style={{
            width: isHovered ? 400 : 200,
            height: isHovered ? 500 : 60,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            mass: 0.5,
          }}
        >
          <AnimatePresence>
            {!isHovered && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent">
                  {type === "login" ? "LOGIN" : "SIGN UP"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="p-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`rounded-xl ${resolvedTheme === "dark" ? "bg-gray-800/50 border-purple-500/40 text-white" : "bg-white border-purple-200 text-gray-800"} focus:border-purple-400 focus:ring-1 focus:ring-purple-300`}
                      required
                    />
                  </motion.div>

                  {/* Password Input */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`rounded-xl ${resolvedTheme === "dark" ? "bg-gray-800/50 border-purple-500/40 text-white" : "bg-white border-purple-200 text-gray-800"} focus:border-purple-400 focus:ring-1 focus:ring-purple-300`}
                      required
                    />
                  </motion.div>

                  {/* Modified Submit Button */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                      disabled={isLoading}
                    >
                      {isLoading ? "Loading..." : "Continue"}
                    </Button>
                  </motion.div>
                </form>

                {/* Account Prompt */}
                <motion.div
                  className="mt-8 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className={`${resolvedTheme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    {type === "login" ? "No account? " : "Already have an account? "}
                    <Link
                      href={type === "login" ? "/auth/sign-up" : "/login"}
                      className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                    >
                      {type === "login" ? "Sign up" : "Sign in"}
                    </Link>
                  </p>
                </motion.div>

                {/* Social Icons */}
                <motion.div
                  className="flex justify-center gap-4 mt-10" // Changed from mt-6 to mt-10
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {socialProviders.map((provider) => (
                    <motion.button
                      key={provider.name}
                      className={`${provider.bg} text-white rounded-xl p-3 h-auto w-14 border-0 transition-all duration-200`}
                      onClick={provider.action}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {provider.icon}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Error Modal */}
      <AnimatePresence>
        {showError && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-md mx-4"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
            >
              <div className="text-red-500 dark:text-red-400 mb-4">
                {errorMessage.split("\n").map((line, i) => (
                  <p key={i} className="text-center">
                    {line}
                  </p>
                ))}
              </div>
              <Button onClick={() => setShowError(false)} className="w-full bg-purple-500 hover:bg-purple-600">
                Try Again
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

