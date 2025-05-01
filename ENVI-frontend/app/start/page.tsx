"use client"

import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect, useRef } from "react"
import { useLoading } from "@/lib/contexts/loading-context"

export default function StartPage() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { isLoading } = useLoading()
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [glitchActive, setGlitchActive] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Trigger glitch effect randomly
    const glitchInterval = setInterval(
      () => {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 200)
      },
      Math.random() * 5000 + 3000,
    )

    return () => clearInterval(glitchInterval)
  }, [])

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

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <AnimatePresence mode="wait">
      {!isLoading && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: {
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
          exit={{ opacity: 0 }}
          className="min-h-screen antialiased relative overflow-hidden transition-colors duration-700 bg-gray-100 dark:bg-[#0a0014]"
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
            <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
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

          {/* Navigation */}
          <div className="absolute top-6 left-6 z-20">
            <Link href="/">
              <Button
                variant="ghost"
                className="gap-2 text-gray-400 hover:text-purple-500 dark:hover:text-cyan-400 transition-colors duration-300 relative group"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
              </Button>
            </Link>
          </div>

          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-12 max-w-3xl w-full"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.7 }}
                  className="relative inline-block"
                >
                  {/* Glitch effect container */}
                  <div className={`relative ${glitchActive ? "glitch" : ""}`}>
                    <h1 className="text-6xl md:text-7xl font-bold mb-4 text-black dark:text-white">
                      Welcome to{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-600 dark:from-purple-400 dark:via-cyan-300 dark:to-purple-500">
                        ENVI
                      </span>
                    </h1>

                    {/* Glitch layers */}
                    <div className="absolute inset-0 hidden glitch-active">
                      <h1 className="text-6xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-600 dark:from-purple-400 dark:via-cyan-300 dark:to-purple-500 glitch-layer-1">
                        Welcome to ENVI
                      </h1>
                    </div>
                    <div className="absolute inset-0 hidden glitch-active">
                      <h1 className="text-6xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-600 dark:from-purple-400 dark:via-cyan-300 dark:to-purple-500 glitch-layer-2">
                        Welcome to ENVI
                      </h1>
                    </div>
                  </div>

                  {/* Animated highlight line */}
                  <motion.div
                    className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-600 dark:from-purple-400 dark:via-cyan-300 dark:to-purple-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                  />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.7 }}
                  className="text-xl text-gray-600 dark:text-gray-400"
                >
                  Choose your path to start transforming your data with AI precision
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.7 }}
                className="grid gap-6 md:grid-cols-2 w-full max-w-2xl mx-auto px-4"
              >
                {/* Sign In Card */}
                <div className="h-full md:col-span-1">
                  <Link href="/login" className="group h-full block">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="relative h-full w-full overflow-hidden rounded-2xl bg-white/10 dark:bg-black/40 backdrop-blur-sm border border-purple-300/30 dark:border-cyan-400/30 shadow-lg transition-all duration-500"
                    >
                      {/* Animated border glow */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/50 to-cyan-500/50 rounded-2xl blur-md"></div>
                      </div>

                      {/* Hover gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Content */}
                      <div className="relative p-6 text-left h-full flex flex-col justify-between z-10">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-purple-600 dark:group-hover:text-cyan-400 transition-colors">
                            Sign In
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                            Already have an account?
                            <br />
                            Continue your journey with us
                          </p>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 dark:bg-cyan-500/20 flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-purple-500 dark:text-cyan-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          <div className="h-px w-1/2 bg-gradient-to-r from-purple-500/50 to-transparent dark:from-cyan-500/50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </div>

                {/* Sign Up Card */}
                <div className="h-full md:col-span-1">
                  <Link href="/signup" className="group h-full block">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="relative h-full w-full overflow-hidden rounded-2xl transition-all duration-500"
                    >
                      {/* Background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Animated glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-cyan-400 opacity-0 group-hover:opacity-80 blur-xl transition-all duration-500"></div>

                      {/* Cyberpunk circuit pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <svg width="100%" height="100%" className="absolute inset-0">
                          <pattern
                            id="circuitPattern"
                            patternUnits="userSpaceOnUse"
                            width="100"
                            height="100"
                            patternTransform="scale(0.5) rotate(0)"
                          >
                            <path
                              d="M20,0 L20,20 L0,20"
                              fill="none"
                              stroke="rgba(255,255,255,0.3)"
                              strokeWidth="1"
                            ></path>
                            <path
                              d="M80,0 L80,80 L0,80"
                              fill="none"
                              stroke="rgba(255,255,255,0.3)"
                              strokeWidth="1"
                            ></path>
                            <path
                              d="M50,0 L50,50 L0,50"
                              fill="none"
                              stroke="rgba(255,255,255,0.3)"
                              strokeWidth="1"
                            ></path>
                            <circle cx="80" cy="80" r="2" fill="rgba(255,255,255,0.5)"></circle>
                            <circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.5)"></circle>
                            <circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.5)"></circle>
                          </pattern>
                          <rect x="0" y="0" width="100%" height="100%" fill="url(#circuitPattern)"></rect>
                        </svg>
                      </div>

                      {/* Content */}
                      <div className="relative p-6 text-left h-full flex flex-col justify-between z-10">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">Sign Up</h3>
                          <p className="text-white/80 text-sm">
                            New to ENVI?
                            <br />
                            Create your account and start exploring
                          </p>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          <div className="h-px w-1/2 bg-gradient-to-r from-white/50 to-transparent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
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
              0%, 100% { opacity: 0.1; transform: scale(1); }
              50% { opacity: 0.2; transform: scale(1.05); }
            }
            
            @keyframes draw-path {
              0% { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
              100% { stroke-dashoffset: 0; }
            }
            
            .animate-float-slow {
              animation: float-slow 15s ease-in-out infinite;
            }
            
            .animate-float-slow-reverse {
              animation: float-slow-reverse 18s ease-in-out infinite;
            }
            
            .animate-pulse-slow {
              animation: pulse-slow 10s ease-in-out infinite;
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
            .glitch .glitch-active {
              display: block;
            }
            
            .glitch-layer-1 {
              left: -2px;
              top: -2px;
              color: #ff00ea;
              clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
              transform: translate(-0.025em, -0.0125em);
              opacity: 0.8;
              animation: glitch-anim 0.2s ease-in-out alternate-reverse;
            }
            
            .glitch-layer-2 {
              left: 2px;
              top: 2px;
              color: #00fff9;
              clip-path: polygon(0 80%, 100% 20%, 100% 100%, 0 100%);
              transform: translate(0.025em, 0.0125em);
              opacity: 0.8;
              animation: glitch-anim 0.2s ease-in-out alternate-reverse;
            }
            
            @keyframes glitch-anim {
              0% {
                transform: translate(0);
              }
              25% {
                transform: translate(-1px, 1px);
              }
              50% {
                transform: translate(-1px, -1px);
              }
              75% {
                transform: translate(1px, 1px);
              }
              100% {
                transform: translate(1px, -1px);
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
