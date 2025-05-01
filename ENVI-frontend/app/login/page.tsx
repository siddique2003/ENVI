"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, ChevronRight, Github } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/contexts/auth-context"
import { signIn as nextAuthSignIn } from "next-auth/react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { resolvedTheme } = useTheme()
  const router = useRouter()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [glitchActive, setGlitchActive] = useState(false)
  const [formFocus, setFormFocus] = useState<string | null>(null)
  const { signIn: credentialSignIn } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
    const authError = searchParams.get("error")
    if (authError === "unauthorized") {
      setError("Please login to proceed.")
    } else if (authError === "session_expired") {
      setError("Your session has expired due to inactivity. Please log in again.")
    }
  }, [searchParams])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await credentialSignIn(email, password)
      if (success) {
        router.push("/dashboard")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-100 dark:bg-[#0a0014] antialiased relative overflow-hidden flex items-center justify-center transition-colors duration-700"
    >
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#8a2be212_1px,transparent_1px),linear-gradient(to_bottom,#8a2be212_1px,transparent_1px)] bg-[size:30px_30px] 
                     dark:bg-[linear-gradient(to_right,#bf00ff12_1px,transparent_1px),linear-gradient(to_bottom,#bf00ff12_1px,transparent_1px)] 
                     [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)]"
        ></div>
      </div>

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden -z-5">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/20 dark:bg-purple-600/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/20 dark:bg-cyan-600/20 rounded-full blur-3xl animate-float-slow-reverse"></div>
      </div>

      {/* Scanlines Effect */}
      <div className="absolute inset-0 bg-scanlines opacity-[0.03] dark:opacity-[0.07] pointer-events-none"></div>

      {/* Glow Effect following mouse */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: isDark
            ? `radial-gradient(circle, rgba(191, 0, 255, 0.07) 0%, rgba(0, 255, 255, 0.05) 30%, transparent 70%)`
            : `radial-gradient(circle, rgba(138, 43, 226, 0.07) 0%, rgba(0, 200, 255, 0.05) 30%, transparent 70%)`,
          left: `${mousePosition.x - 250}px`,
          top: `${mousePosition.y - 250}px`,
          transform: "translate(0, 0)",
          transition: "background 0.5s ease",
        }}
      ></div>

      {/* Digital Circuit Lines */}
      <div className="absolute inset-0 overflow-hidden opacity-10 dark:opacity-20">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? "#bf00ff" : "#8a2be2"} />
              <stop offset="100%" stopColor={isDark ? "#00ffff" : "#00c8ff"} />
            </linearGradient>
          </defs>
          <path
            d="M0,100 Q50,50 100,100 T200,100 T300,100 T400,100"
            stroke="url(#circuitGradient)"
            strokeWidth="0.5"
            fill="none"
            className="animate-draw-path"
          />
          <path
            d="M0,200 Q100,150 200,200 T400,200"
            stroke="url(#circuitGradient)"
            strokeWidth="0.5"
            fill="none"
            className="animate-draw-path-delay"
          />
          <path
            d="M100,0 Q150,100 100,200 T100,400"
            stroke="url(#circuitGradient)"
            strokeWidth="0.5"
            fill="none"
            className="animate-draw-path-delay-2"
          />
          <path
            d="M300,0 Q250,100 300,200 T300,400"
            stroke="url(#circuitGradient)"
            strokeWidth="0.5"
            fill="none"
            className="animate-draw-path-delay-3"
          />
        </svg>
      </div>

      {/* Holographic Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Left Side Holographic UI */}
        <div className="absolute left-10 top-1/4 transform -translate-y-1/2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 0.7, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-64 h-64"
          >
            <svg width="100%" height="100%" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={isDark ? "#bf00ff20" : "#8a2be220"}
                strokeWidth="1"
              />
              <circle
                cx="100"
                cy="100"
                r="60"
                fill="none"
                stroke={isDark ? "#00ffff20" : "#00c8ff20"}
                strokeWidth="1"
              />
              <circle
                cx="100"
                cy="100"
                r="40"
                fill="none"
                stroke={isDark ? "#bf00ff20" : "#8a2be220"}
                strokeWidth="1"
                className="animate-spin-slow"
              />
              <path
                d="M20,100 L180,100"
                stroke={isDark ? "#00ffff30" : "#00c8ff30"}
                strokeWidth="0.5"
                strokeDasharray="5,5"
              />
              <path
                d="M100,20 L100,180"
                stroke={isDark ? "#bf00ff30" : "#8a2be230"}
                strokeWidth="0.5"
                strokeDasharray="5,5"
              />
            </svg>
          </motion.div>
        </div>

        {/* Right Side Holographic UI */}
        <div className="absolute right-10 bottom-1/4 transform translate-y-1/2">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 0.7, x: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="w-80 h-80"
          >
            <svg width="100%" height="100%" viewBox="0 0 200 200">
              <rect
                x="40"
                y="40"
                width="120"
                height="120"
                fill="none"
                stroke={isDark ? "#00ffff20" : "#00c8ff20"}
                strokeWidth="1"
              />
              <rect
                x="60"
                y="60"
                width="80"
                height="80"
                fill="none"
                stroke={isDark ? "#bf00ff20" : "#8a2be220"}
                strokeWidth="1"
                className="animate-spin-slow-reverse"
              />
              <line
                x1="0"
                y1="0"
                x2="200"
                y2="200"
                stroke={isDark ? "#00ffff30" : "#00c8ff30"}
                strokeWidth="0.5"
                strokeDasharray="5,5"
              />
              <line
                x1="200"
                y1="0"
                x2="0"
                y2="200"
                stroke={isDark ? "#bf00ff30" : "#8a2be230"}
                strokeWidth="0.5"
                strokeDasharray="5,5"
              />
            </svg>
          </motion.div>
        </div>

        {/* Data Stream Animation */}
        <div className="absolute left-0 top-0 w-full h-full overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -100, x: Math.random() * window.innerWidth }}
              animate={{
                opacity: [0, 0.5, 0],
                y: window.innerHeight + 100,
                transition: {
                  repeat: Number.POSITIVE_INFINITY,
                  duration: Math.random() * 10 + 10,
                  delay: Math.random() * 5,
                },
              }}
              className={`absolute w-px h-20 ${i % 2 === 0 ? "bg-purple-400/30 dark:bg-purple-500/30" : "bg-cyan-400/30 dark:bg-cyan-500/30"}`}
            />
          ))}
        </div>
      </div>

      {/* Login Form */}
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl px-4 z-10 gap-8">
        {/* Left Side - Cyberpunk Illustration */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md hidden md:block"
        >
          <div className="relative">
            {/* Cyberpunk Logo/Illustration */}
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={isDark ? "#bf00ff" : "#8a2be2"} />
                    <stop offset="100%" stopColor={isDark ? "#00ffff" : "#00c8ff"} />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Outer Circle */}
                <circle cx="100" cy="100" r="90" fill="none" stroke="url(#logoGradient)" strokeWidth="1" />

                {/* Inner Hexagon */}
                <polygon
                  points="100,40 150,65 150,135 100,160 50,135 50,65"
                  fill="none"
                  stroke="url(#logoGradient)"
                  strokeWidth="1.5"
                  className="animate-spin-very-slow"
                />

                {/* Inner Circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="40"
                  fill="none"
                  stroke="url(#logoGradient)"
                  strokeWidth="2"
                  filter="url(#glow)"
                />

                {/* E Letter */}
                <text
                  x="85"
                  y="115"
                  fill="url(#logoGradient)"
                  fontSize="40"
                  fontWeight="bold"
                  filter="url(#glow)"
                  className={glitchActive ? "animate-glitch" : ""}
                >
                  E
                </text>

                {/* Decorative Lines */}
                <line x1="30" y1="100" x2="70" y2="100" stroke="url(#logoGradient)" strokeWidth="1" />
                <line x1="130" y1="100" x2="170" y2="100" stroke="url(#logoGradient)" strokeWidth="1" />

                {/* Animated Dots */}
                <circle cx="30" cy="100" r="3" fill="url(#logoGradient)" className="animate-pulse-slow" />
                <circle cx="170" cy="100" r="3" fill="url(#logoGradient)" className="animate-pulse-slow" />

                {/* Data Points */}
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i * Math.PI * 2) / 8
                  const x = 100 + 70 * Math.cos(angle)
                  const y = 100 + 70 * Math.sin(angle)
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="2"
                      fill="url(#logoGradient)"
                      className="animate-pulse-slow"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  )
                })}
              </svg>
            </div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center mt-6"
            >
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-600 dark:from-purple-400 dark:via-cyan-300 dark:to-purple-500">
                Enhanced Visualization Interface
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Transform your data into immersive experiences</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="z-10 w-full max-w-md p-8 relative"
        >
          <div className="relative">
            {/* Animated border glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/50 to-cyan-500/50 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition-all duration-500"></div>

            {/* Form Container */}
            <div className="relative bg-white/90 dark:bg-black/50 backdrop-blur-2xl rounded-2xl shadow-2xl border border-purple-300/30 dark:border-cyan-400/30 p-8 space-y-6 transition-colors duration-300">
              <div className={`text-center ${glitchActive ? "glitch" : ""}`}>
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-600 dark:from-purple-400 dark:via-cyan-300 dark:to-purple-500">
                  Welcome Back
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to your ENVI account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* Email Input */}
                  <div className="relative">
                    <div
                      className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-300 ${formFocus === "email" ? "text-purple-500 dark:text-cyan-400" : ""}`}
                    >
                      <Mail size={18} />
                    </div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFormFocus("email")}
                      onBlur={() => setFormFocus(null)}
                      className={`h-12 pl-10 rounded-xl border-gray-300 dark:border-white/20 bg-white/80 dark:bg-black/30 focus:border-purple-500 dark:focus:border-cyan-400 transition-all duration-300 ${formFocus === "email" ? "border-purple-500 dark:border-cyan-400 shadow-[0_0_10px_rgba(138,43,226,0.3)] dark:shadow-[0_0_10px_rgba(0,255,255,0.3)]" : ""}`}
                    />
                    <div
                      className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300 rounded-full ${formFocus === "email" ? "w-full" : "w-0"}`}
                    ></div>
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <div
                      className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-300 ${formFocus === "password" ? "text-purple-500 dark:text-cyan-400" : ""}`}
                    >
                      <Lock size={18} />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFormFocus("password")}
                      onBlur={() => setFormFocus(null)}
                      className={`h-12 pl-10 pr-10 rounded-xl border-gray-300 dark:border-white/20 bg-white/80 dark:bg-black/30 focus:border-purple-500 dark:focus:border-cyan-400 transition-all duration-300 ${formFocus === "password" ? "border-purple-500 dark:border-cyan-400 shadow-[0_0_10px_rgba(138,43,226,0.3)] dark:shadow-[0_0_10px_rgba(0,255,255,0.3)]" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 dark:hover:text-cyan-400 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <div
                      className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300 rounded-full ${formFocus === "password" ? "w-full" : "w-0"}`}
                    ></div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                  <Button
                    type="submit"
                    className="relative w-full h-12 rounded-xl bg-gray-900 dark:bg-gray-800 text-white text-lg font-semibold 
                               border border-purple-500/30 dark:border-cyan-500/30
                               shadow-[0_0_15px_rgba(138,43,226,0.3)] dark:shadow-[0_0_15px_rgba(0,255,255,0.3)]
                               hover:shadow-[0_0_25px_rgba(138,43,226,0.5)] dark:hover:shadow-[0_0_25px_rgba(0,255,255,0.5)]
                               transition-all duration-300 ease-out group-hover:bg-gray-800 dark:group-hover:bg-gray-900"
                    disabled={isLoading}
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 dark:from-purple-300 dark:to-cyan-300 group-hover:from-purple-300 group-hover:to-cyan-300 dark:group-hover:from-purple-200 dark:group-hover:to-cyan-200 transition-all duration-300">
                      {isLoading ? "Signing In..." : "Sign In"}
                    </span>
                    <ChevronRight className="absolute right-4 w-5 h-5 text-purple-400 dark:text-cyan-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                  </Button>
                </div>
              </form>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}

              {/* Social Login Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 px-1">
                  <Separator className="flex-1 bg-gray-300 dark:bg-gray-700" />
                  <span className="text-xs whitespace-nowrap text-gray-500 dark:text-gray-400">or continue with</span>
                  <Separator className="flex-1 bg-gray-300 dark:bg-gray-700" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Google Login */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => nextAuthSignIn("google", { callbackUrl: "/dashboard" })}
                    className="h-12 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>

                  {/* GitHub Login */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => nextAuthSignIn("github", { callbackUrl: "/dashboard" })}
                    className="h-12 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    disabled={isLoading}
                  >
                    <Github className="w-5 h-5 mr-2" />
                    GitHub
                  </Button>
                </div>
              </div>
              
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                New to ENVI?{" "}
                <Link
                  href="/signup"
                  className="text-purple-500 hover:text-purple-600 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors font-semibold relative group"
                >
                  Create account
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 dark:bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Custom CSS for animations and effects */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(10px); }
          50% { transform: translateY(-20px) translateX(0); }
          75% { transform: translateY(-10px) translateX(-10px); }
        }
        
        @keyframes float-slow-reverse {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(10px) translateX(-10px); }
          50% { transform: translateY(20px) translateX(0); }
          75% { transform: translateY(10px) translateX(10px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        
        @keyframes draw-path {
          0% { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-slow-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        
        @keyframes spin-very-slow {
          from { transform: rotate(0deg) translateZ(0); }
          to { transform: rotate(360deg) translateZ(0); }
        }
        
        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite;
        }
        
        .animate-float-slow-reverse {
          animation: float-slow-reverse 18s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 25s linear infinite;
        }
        
        .animate-spin-very-slow {
          animation: spin-very-slow 40s linear infinite;
        }
        
        .animate-draw-path {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw-path 10s linear forwards;
        }
        
        .animate-draw-path-delay {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw-path 10s linear 1s forwards;
        }
        
        .animate-draw-path-delay-2 {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw-path 10s linear 2s forwards;
        }
        
        .animate-draw-path-delay-3 {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw-path 10s linear 3s forwards;
        }
        
        .bg-scanlines {
          background: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 1px,
            rgba(0, 0, 0, 0.05) 1px,
            rgba(0, 0, 0, 0.05) 2px
          );
          background-size: 100% 4px;
        }
        
        .dark .bg-scanlines {
          background: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 1px,
            rgba(255, 255, 255, 0.05) 1px,
            rgba(255, 255, 255, 0.05) 2px
          );
          background-size: 100% 4px;
        }
        
        /* Glitch effect */
        .glitch {
          animation: glitch-skew 1s infinite linear alternate-reverse;
        }
        
        @keyframes glitch-skew {
          0% { transform: skew(0deg); }
          20% { transform: skew(0deg); }
          21% { transform: skew(3deg); }
          23% { transform: skew(0deg); }
          40% { transform: skew(-2deg); }
          41% { transform: skew(0deg); }
          100% { transform: skew(0deg); }
        }
        
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        
        .animate-glitch {
          animation: glitch 0.2s ease infinite;
        }
      `}</style>
    </div>
  )
}
