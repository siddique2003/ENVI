// components/navbar.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkLoginStatus = () => {
      const status = localStorage.getItem("isLoggedIn") === "true"
      setIsLoggedIn(status)
    }

    checkLoginStatus()
    window.addEventListener("storage", checkLoginStatus)

    return () => {
      window.removeEventListener("storage", checkLoginStatus)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    router.push("/login") // Redirect to login page
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-foreground/10 dark:border-white/10"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center flex-shrink-0">
        <motion.span
          whileHover={{ scale: 1.05 }}
          className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent italic"
        >
          ENVI
        </motion.span>
      </Link>

      {/* Navigation Buttons */}
      <motion.div className="flex items-center space-x-4">
        {isLoggedIn && (
          <Link href="/dashboard">
            <Button variant="ghost" className="text-foreground hover:text-purple-500">
              Dashboard
            </Button>
          </Link>
        )}
        
        <Button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          variant="ghost"
          size="icon"
          className="text-foreground hover:bg-foreground/5"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {isLoggedIn ? (
          <Button
            onClick={handleLogout}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Logout
          </Button>
        ) : (
          <>
            <Link href="/auth/sign-in">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button variant="outline" className="text-foreground border-foreground/20 hover:bg-foreground/5">
                Get Started
              </Button>
            </Link>
          </>
        )}
      </motion.div>
    </motion.nav>
  )
}