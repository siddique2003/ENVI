"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useSession } from "next-auth/react"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { resolvedTheme } = useTheme()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [glitchActive, setGlitchActive] = useState(false)
  const [formFocus, setFormFocus] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check if already logged in
    if (status === "authenticated") {
      router.push("/dashboard")
    }

    // Trigger glitch effect randomly
    const glitchInterval = setInterval(
      () => {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 200)
      },
      Math.random() * 5000 + 3000,
    )

    return () => clearInterval(glitchInterval)
  }, [router, status])

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

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    // In a real app, you would send this data to your API
    // For demo purposes, we'll just simulate success and redirect
    setTimeout(() => {
      setIsLoading(false)
      // Redirect to login page with success message
      router.push("/login?registered=true")
    }, 1500)
  }

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error(`${provider} login error:`, error)
      setError(`An error occurred with ${provider} login`)
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0a0014] p-4 antialiased relative overflow-hidden transition-colors duration-700"
    >
      {/* Cyberpunk Grid Background */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#8a2be212_1px,transparent_1px),linear-gradient(to_bottom,#8a2be212_1px,transparent_1px)] bg-[size:30px_30px] 
                   dark:bg-[linear-gradient(to_right,#bf00ff12_1px,transparent_1px),linear-gradient(to_bottom,#bf00ff12_1px,transparent_1px)] 
                   [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)] -z-10"
      ></div>

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 dark:bg-purple-600/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 dark:bg-cyan-600/20 rounded-full blur-3xl animate-float-slow-reverse"></div>
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

      {/* Signup Form */}
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
              <p className="mt-2 text-gray-600 dark:text-gray-400">Join the future of data visualization</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Signup Form */}
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
            <div className="relative bg-white/90 dark:bg-gray-900/50 backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-gray-200 dark:border-purple-500/20">
              <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">
                Create an Account
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Create a password"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Confirm your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-medium rounded-lg shadow-lg hover:shadow-purple-500/20 dark:hover:shadow-cyan-500/20 transition-all duration-300 disabled:opacity-70"
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link href="/login" className="text-purple-600 dark:text-cyan-400 hover:underline">
                    Login
                  </Link>
                </p>
              </div>
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
