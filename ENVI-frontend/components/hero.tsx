"use client"

import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function Hero() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
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

  const handleBeginJourney = () => {
    router.push("/start")
  }

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <main
      ref={containerRef}
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

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full 
                      ${i % 2 === 0 ? "bg-purple-400 dark:bg-purple-500" : "bg-cyan-400 dark:bg-cyan-500"}`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3,
              animation: `float-particle ${Math.random() * 10 + 10}s linear infinite`,
            }}
          ></div>
        ))}
      </div>

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

      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8"
        >
          <div className="text-center space-y-16 max-w-4xl">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="relative inline-block"
              >
                {/* Glitch effect container */}
                <div className={`relative ${glitchActive ? "glitch" : ""}`}>
                  <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-black dark:text-white">
                    <span>Welcome to </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-600 dark:from-purple-400 dark:via-cyan-300 dark:to-purple-500">
                      ENVI
                    </span>
                  </h1>

                  {/* Glitch layers */}
                  <div className="absolute inset-0 hidden glitch-active">
                    <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-600 dark:from-purple-400 dark:via-cyan-300 dark:to-purple-500 glitch-layer-1">
                      <span>Welcome to </span>
                      <span>ENVI</span>
                    </h1>
                  </div>
                  <div className="absolute inset-0 hidden glitch-active">
                    <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-600 dark:from-purple-400 dark:via-cyan-300 dark:to-purple-500 glitch-layer-2">
                      <span>Welcome to </span>
                      <span>ENVI</span>
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
                className="text-gray-700 dark:text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
              >
                Use ENVI for intelligent data visualization in a neon-powered, immersive future.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              className="flex flex-col items-center space-y-8"
            >
              {/* Animated button with hover effects */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-500 dark:from-purple-500 dark:to-cyan-400 rounded-lg blur-md opacity-70 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                <Button
                  onClick={handleBeginJourney}
                  size="lg"
                  className="relative px-12 py-7 bg-gray-900 dark:bg-gray-800 text-white text-lg font-semibold rounded-lg 
                             border border-purple-500/30 dark:border-cyan-500/30
                             shadow-[0_0_15px_rgba(138,43,226,0.3)] dark:shadow-[0_0_15px_rgba(0,255,255,0.3)]
                             hover:shadow-[0_0_25px_rgba(138,43,226,0.5)] dark:hover:shadow-[0_0_25px_rgba(0,255,255,0.5)]
                             transition-all duration-300 ease-out transform hover:-translate-y-1 group-hover:bg-gray-800 dark:group-hover:bg-gray-900"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 dark:from-purple-300 dark:to-cyan-300 group-hover:from-purple-300 group-hover:to-cyan-300 dark:group-hover:from-purple-200 dark:group-hover:to-cyan-200 transition-all duration-300">
                    Begin Your Journey
                  </span>
                  <span className="absolute inset-0 rounded-lg overflow-hidden">
                    <span className="absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_50%_120%,rgba(138,43,226,0.1),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(0,255,255,0.1),transparent_70%)]"></span>
                  </span>
                </Button>
              </div>

              {/* Theme toggle with cyberpunk styling */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                whileHover={{ opacity: 1 }}
                className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400"
              >
                <button
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="flex items-center gap-2 px-3 py-1 rounded-full border border-purple-300/30 dark:border-cyan-400/30 hover:border-purple-400/50 dark:hover:border-cyan-500/50 transition-all duration-300"
                >
                  <span className="text-xs uppercase tracking-wider">Switch to {isDark ? "Light" : "Dark"} Mode</span>
                  <div
                    className={`w-4 h-4 rounded-full ${isDark ? "bg-cyan-400" : "bg-purple-400"} shadow-[0_0_5px_rgba(0,255,255,0.7)]`}
                  ></div>
                </button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

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
        
        @keyframes float-particle {
          0% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-30vh) translateX(10vw); }
          50% { transform: translateY(-50vh) translateX(0); }
          75% { transform: translateY(-70vh) translateX(-10vw); }
          100% { transform: translateY(-100vh) translateX(0); opacity: 0; }
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
    </main>
  )
}
