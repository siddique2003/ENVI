"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogOut, Upload, FileType, Database, ChevronRight, BarChart2, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showError, setShowError] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [glitchActive, setGlitchActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showSuccessEffect, setShowSuccessEffect] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)

    // Trigger glitch effect randomly
    const glitchInterval = setInterval(
      () => {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 200)
      },
      Math.random() * 8000 + 5000,
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

  useEffect(() => {
    const checkAuth = () => {
      setMounted(true)
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
      const hasAuthCookie = document.cookie.includes("isLoggedIn=true")

      if (!isLoggedIn || !hasAuthCookie) {
        router.replace("/login")
      }
    }

    checkAuth()
  }, [router])

  // Simulated upload progress
  useEffect(() => {
    if (uploading && uploadProgress < 95) {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const increment = Math.random() * 10 + 5
          return Math.min(prev + increment, 95)
        })
      }, 300)
      return () => clearInterval(interval)
    }
  }, [uploading, uploadProgress])

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (uploadedFile) {
      if (uploadedFile.name.endsWith(".csv") || uploadedFile.name.endsWith(".xlsx")) {
        setFile(uploadedFile)
        setShowError(false)

        // Trigger glitch effect on file selection
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 300)
      } else {
        alert("Please upload only CSV or XLSX files")
      }
    }
  }

  const startAnalysis = async () => {
    if (!file) {
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const uploadRes = await fetch("http://127.0.0.1:8000/api/upload-csv/", {
        method: "POST",
        body: formData,
      })

      const result = await uploadRes.json()

      if (!uploadRes.ok) {
        alert(result.error || "CSV Upload failed!")
        return
      }

      // Set upload to 100% complete
      setUploadProgress(100)

      // Show success effect
      setShowSuccessEffect(true)

      // Save visualization data
      localStorage.setItem(
        "visualizationData",
        JSON.stringify({
          table_name: result.table_name,
          columns: result.cleaned_columns,
          preview: result.preview,
        }),
      )

      // Delay redirect to show the success animation
      setTimeout(() => {
        console.log("🔁 Redirecting to /hypothesis-testing")
        router.push("/hypothesis-testing")
      }, 1500)
    } catch (error) {
      console.error("Upload error:", error)
      alert("An error occurred during upload.")
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    document.cookie = "isLoggedIn=false; path=/"
    router.replace("/")
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-100 dark:bg-[#0a0014] antialiased relative overflow-hidden transition-colors duration-700"
    >
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#8a2be212_1px,transparent_1px),linear-gradient(to_bottom,#8a2be212_1px,transparent_1px)] bg-[size:30px_30px] 
                     dark:bg-[linear-gradient(to_right,#bf00ff12_1px,transparent_1px),linear-gradient(to_bottom,#bf00ff12_1px,transparent_1px)] 
                     [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)]"
        ></div>
      </div>

      {/* 3D Floating Elements */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Top left floating cube */}
        <div className="absolute top-[15%] left-[10%] w-16 h-16 opacity-30 dark:opacity-40 animate-float-slow">
          <div className="cube">
            <div className="cube__face cube__face--front"></div>
            <div className="cube__face cube__face--back"></div>
            <div className="cube__face cube__face--right"></div>
            <div className="cube__face cube__face--left"></div>
            <div className="cube__face cube__face--top"></div>
            <div className="cube__face cube__face--bottom"></div>
          </div>
        </div>

        {/* Bottom right floating pyramid */}
        <div className="absolute bottom-[20%] right-[15%] w-20 h-20 opacity-30 dark:opacity-40 animate-float-slow-reverse">
          <div className="pyramid">
            <div className="pyramid__face pyramid__face--front"></div>
            <div className="pyramid__face pyramid__face--right"></div>
            <div className="pyramid__face pyramid__face--left"></div>
            <div className="pyramid__face pyramid__face--bottom"></div>
          </div>
        </div>

        {/* Middle floating sphere */}
        <div className="absolute top-[40%] right-[25%] opacity-20 dark:opacity-30">
          <div className="sphere animate-pulse-slow"></div>
        </div>
      </div>

      {/* Digital Rain Effect */}
      <div className="absolute inset-0 overflow-hidden opacity-20 dark:opacity-30 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`rain-${i}`}
            className="digital-rain"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 5}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            {Array.from({ length: Math.floor(Math.random() * 20) + 10 }).map((_, j) => (
              <div
                key={`rain-char-${j}`}
                className="digital-rain__char"
                style={{
                  animationDelay: `${Math.random() * 2}s`,
                }}
              >
                {String.fromCharCode(Math.floor(Math.random() * 74) + 48)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Glowing Nodes and Connections */}
      <div className="absolute inset-0 overflow-hidden opacity-30 dark:opacity-40 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0">
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Nodes */}
          <circle cx="10%" cy="20%" r="2" className="node" />
          <circle cx="30%" cy="15%" r="2" className="node" />
          <circle cx="50%" cy="10%" r="2" className="node" />
          <circle cx="70%" cy="25%" r="2" className="node" />
          <circle cx="90%" cy="15%" r="2" className="node" />

          <circle cx="15%" cy="85%" r="2" className="node" />
          <circle cx="35%" cy="90%" r="2" className="node" />
          <circle cx="55%" cy="80%" r="2" className="node" />
          <circle cx="75%" cy="85%" r="2" className="node" />
          <circle cx="95%" cy="90%" r="2" className="node" />

          {/* Connections */}
          <line x1="10%" y1="20%" x2="30%" y2="15%" className="connection" />
          <line x1="30%" y1="15%" x2="50%" y2="10%" className="connection" />
          <line x1="50%" y1="10%" x2="70%" y2="25%" className="connection" />
          <line x1="70%" y1="25%" x2="90%" y2="15%" className="connection" />

          <line x1="15%" y1="85%" x2="35%" y2="90%" className="connection" />
          <line x1="35%" y1="90%" x2="55%" y2="80%" className="connection" />
          <line x1="55%" y1="80%" x2="75%" y2="85%" className="connection" />
          <line x1="75%" y1="85%" x2="95%" y2="90%" className="connection" />
        </svg>
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

      {/* Data Stream Animation */}
      <div className="absolute left-0 top-0 w-full h-full overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
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

      {/* Navigation */}
      <div className="absolute top-6 right-8 z-50 flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-cyan-400 transition-colors relative group"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
        </Button>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md"
          >
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-500 mx-4 backdrop-blur-md">
              <AlertDescription className="text-center">Please upload a file before starting analysis</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Effect */}
      <AnimatePresence>
        {showSuccessEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="relative"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="text-white text-5xl"
                >
                  ✓
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -inset-4 rounded-full border-2 border-purple-500 animate-ping-slow opacity-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -inset-8 rounded-full border-2 border-cyan-500 animate-ping-slow opacity-30"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-6"
        >
          <div className="w-full max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8 text-center"
            >
              <div className={`relative inline-block ${glitchActive ? "glitch" : ""}`}>
                <h1 className="text-6xl md:text-7xl font-bold mb-4 text-black dark:text-white">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-600 dark:from-purple-400 dark:via-cyan-300 dark:to-purple-500">
                    ENVI
                  </span>{" "}
                  Home
                </h1>

                {/* Animated highlight line */}
                <motion.div
                  className="absolute -bottom-1 left-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-600 dark:from-purple-400 dark:via-cyan-300 dark:to-purple-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                  whileHover={{ height: "2px", opacity: 0.8 }}
                />
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mt-6"
              >
                Transform your data into immersive visual insights with statistical modeling precision
              </motion.p>
            </motion.div>

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Left Panel - Stats */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-1"
              >
                <div className="bg-white/10 dark:bg-black/30 backdrop-blur-xl rounded-2xl border border-purple-300/30 dark:border-cyan-400/30 p-6 h-full">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                    <Database className="w-5 h-5 mr-2 text-purple-500 dark:text-cyan-400" />
                    <span>Data Analytics</span>
                  </h2>

                  <div className="space-y-6">
                    {/* Stats Cards */}
                    {[
                      {
                        title: "Visualizations",
                        value: "0",
                        icon: <BarChart2 className="w-4 h-4" />,
                        color: "from-purple-500 to-pink-500",
                      },
                      {
                        title: "Datasets",
                        value: "0",
                        icon: <FileText className="w-4 h-4" />,
                        color: "from-cyan-500 to-blue-500",
                      },
                      {
                        title: "Insights",
                        value: "0",
                        icon: <Database className="w-4 h-4" />,
                        color: "from-green-500 to-emerald-500",
                      },
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="bg-white/5 dark:bg-white/5 rounded-xl p-4 border border-gray-200/10 dark:border-white/5"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
                          </div>
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center text-white`}
                          >
                            {stat.icon}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Animated Circuit Decoration */}
                    <div className="mt-8 relative h-32">
                      <svg width="100%" height="100%" className="absolute inset-0">
                        <defs>
                          <linearGradient id="statGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={isDark ? "#bf00ff40" : "#8a2be240"} />
                            <stop offset="100%" stopColor={isDark ? "#00ffff40" : "#00c8ff40"} />
                          </linearGradient>
                        </defs>
                        <circle
                          cx="50%"
                          cy="50%"
                          r="40"
                          fill="none"
                          stroke="url(#statGradient)"
                          strokeWidth="1"
                          className="animate-pulse-slow"
                        />
                        <circle
                          cx="50%"
                          cy="50%"
                          r="60"
                          fill="none"
                          stroke="url(#statGradient)"
                          strokeWidth="0.5"
                          strokeDasharray="10,5"
                          className="animate-spin-slow"
                        />
                        <path d="M30,50 L170,50" stroke="url(#statGradient)" strokeWidth="0.5" strokeDasharray="5,5" />
                        <path d="M100,20 L100,80" stroke="url(#statGradient)" strokeWidth="0.5" strokeDasharray="5,5" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                          Upload your first dataset
                          <br />
                          to begin analysis
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Panel - File Upload */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="lg:col-span-2"
              >
                <div className="bg-white/10 dark:bg-black/30 backdrop-blur-xl rounded-2xl border border-purple-300/30 dark:border-cyan-400/30 p-8 relative overflow-hidden group">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Cyberpunk Circuit Pattern */}
                  <div className="absolute inset-0 opacity-10">
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
                          stroke="rgba(138, 43, 226, 0.3)"
                          strokeWidth="1"
                        ></path>
                        <path d="M80,0 L80,80 L0,80" fill="none" stroke="rgba(0, 200, 255, 0.3)" strokeWidth="1"></path>
                        <path
                          d="M50,0 L50,50 L0,50"
                          fill="none"
                          stroke="rgba(138, 43, 226, 0.3)"
                          strokeWidth="1"
                        ></path>
                        <circle cx="80" cy="80" r="2" fill="rgba(0, 200, 255, 0.5)"></circle>
                        <circle cx="50" cy="50" r="2" fill="rgba(138, 43, 226, 0.5)"></circle>
                        <circle cx="20" cy="20" r="2" fill="rgba(0, 200, 255, 0.5)"></circle>
                      </pattern>
                      <rect x="0" y="0" width="100%" height="100%" fill="url(#circuitPattern)"></rect>
                    </svg>
                  </div>

                  <div className="relative z-10">
                    <div className="text-center space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-2"
                      >
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-600 dark:from-purple-400 dark:via-cyan-300 dark:to-purple-500">
                          Upload Your Data
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">Supported formats: XLSX, CSV</p>
                      </motion.div>

                      {/* File Upload Area */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="border-2 border-dashed border-purple-500/30 dark:border-cyan-400/30 rounded-xl p-10 bg-white/5 dark:bg-black/20 relative group cursor-pointer"
                        onClick={triggerFileInput}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Input
                          ref={fileInputRef}
                          type="file"
                          id="fileUpload"
                          className="hidden"
                          accept=".csv, .xlsx"
                          onChange={handleFileUpload}
                        />

                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-purple-500/10 dark:bg-cyan-500/10 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-purple-500 dark:text-cyan-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-gray-700 dark:text-gray-300 font-medium">
                              Drag & drop your file here or{" "}
                              <span className="text-purple-500 dark:text-cyan-400">browse</span>
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              CSV and XLSX files supported
                            </p>
                          </div>
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
                      </motion.div>

                      {/* Selected File */}
                      <AnimatePresence mode="wait">
                        {file && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white/10 dark:bg-black/20 rounded-xl p-4 border border-purple-300/30 dark:border-cyan-400/30"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-purple-500/20 dark:bg-cyan-500/20 flex items-center justify-center">
                                <FileType className="w-5 h-5 text-purple-500 dark:text-cyan-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-800 dark:text-gray-200 font-medium truncate">{file.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {(file.size / 1024).toFixed(2)} KB • {file.name.split(".").pop()?.toUpperCase()}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setFile(null)
                                }}
                                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                              >
                                Remove
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Analysis Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6"
                      >
                        <div className="relative group">
                          <div
                            className={`absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl blur opacity-75 ${file && !uploading ? "group-hover:opacity-100" : "opacity-30"} transition duration-500 group-hover:duration-200`}
                          ></div>
                          <Button
                            onClick={startAnalysis}
                            disabled={!file || uploading}
                            className="relative w-full py-6 text-xl rounded-xl bg-gray-900 dark:bg-gray-800 text-white font-semibold 
                                     border border-purple-500/30 dark:border-cyan-500/30
                                     shadow-[0_0_15px_rgba(138,43,226,0.3)] dark:shadow-[0_0_15px_rgba(0,255,255,0.3)]
                                     hover:shadow-[0_0_25px_rgba(138,43,226,0.5)] dark:hover:shadow-[0_0_25px_rgba(0,255,255,0.5)]
                                     transition-all duration-300 ease-out group-hover:bg-gray-800 dark:group-hover:bg-gray-900"
                          >
                            <span
                              className={`bg-clip-text text-transparent bg-gradient-to-r ${file && !uploading ? "from-purple-400 to-cyan-400 dark:from-purple-300 dark:to-cyan-300 group-hover:from-purple-300 group-hover:to-cyan-300 dark:group-hover:from-purple-200 dark:group-hover:to-cyan-200" : "from-purple-400/50 to-cyan-400/50"} transition-all duration-300`}
                            >
                              {uploading ? "Uploading..." : "Analyze Data"}
                            </span>
                            <ChevronRight
                              className={`absolute right-4 w-5 h-5 text-purple-400 dark:text-cyan-400 ${file && !uploading ? "opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1" : "opacity-0"} transition-all duration-300`}
                            />
                          </Button>
                        </div>

                        {/* Upload Progress Bar */}
                        <AnimatePresence>
                          {uploading && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="mt-4"
                            >
                              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${uploadProgress}%` }}
                                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                                />
                              </div>
                              <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>Uploading...</span>
                                <span>{uploadProgress.toFixed(0)}%</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
                >
                  {[
                    {
                      title: "Model-Driven Analysis",
                      description: "Automatic pattern detection and insights generation",
                      icon: (
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M3 12H4M12 3V4M20 12H21M12 20V21M5.6 5.6L6.3 6.3M18.4 5.6L17.7 6.3M17.7 17.7L18.4 18.4M6.3 17.7L5.6 18.4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ),
                    },
                    {
                      title: "Interactive Visualizations",
                      description: "Drag and drop interface for custom charts",
                      icon: (
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M8 13V17M16 11V17M12 7V17M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ),
                    },
                    {
                      title: "Hypothesis Testing",
                      description: "Statistical validation of data relationships",
                      icon: (
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ),
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-purple-300/20 dark:border-cyan-400/20 group hover:border-purple-300/40 dark:hover:border-cyan-400/40 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 dark:bg-cyan-500/10 flex items-center justify-center text-purple-500 dark:text-cyan-400 group-hover:bg-purple-500/20 dark:group-hover:bg-cyan-500/20 transition-colors">
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-gray-200">{feature.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
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
        
        @keyframes ping-slow {
          0% { transform: scale(0.8); opacity: 0.8; }
          70%, 100% { transform: scale(1.5); opacity: 0; }
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
        
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
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

        /* 3D Elements */
        .cube {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transform: rotateX(-30deg) rotateY(45deg);
          animation: cube-rotate 20s infinite linear;
        }

        .cube__face {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 1px solid rgba(138, 43, 226, 0.5);
          background: rgba(138, 43, 226, 0.1);
        }

        .dark .cube__face {
          border: 1px solid rgba(0, 255, 255, 0.5);
          background: rgba(0, 255, 255, 0.1);
        }

        .cube__face--front  { transform: rotateY(0deg) translateZ(8px); }
        .cube__face--right  { transform: rotateY(90deg) translateZ(8px); }
        .cube__face--back   { transform: rotateY(180deg) translateZ(8px); }
        .cube__face--left   { transform: rotateY(-90deg) translateZ(8px); }
        .cube__face--top    { transform: rotateX(90deg) translateZ(8px); }
        .cube__face--bottom { transform: rotateX(-90deg) translateZ(8px); }

        @keyframes cube-rotate {
          from { transform: rotateX(-30deg) rotateY(0deg); }
          to { transform: rotateX(-30deg) rotateY(360deg); }
        }

        .pyramid {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transform: rotateX(-30deg) rotateY(45deg);
          animation: pyramid-rotate 15s infinite linear reverse;
        }

        .pyramid__face {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 1px solid rgba(0, 200, 255, 0.5);
          background: rgba(0, 200, 255, 0.1);
        }

        .dark .pyramid__face {
          border: 1px solid rgba(191, 0, 255, 0.5);
          background: rgba(191, 0, 255, 0.1);
        }

        .pyramid__face--front {
          transform: rotateY(0deg) rotateX(30deg) translateZ(0) translateY(-10px);
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }

        .pyramid__face--right {
          transform: rotateY(90deg) rotateX(30deg) translateZ(10px) translateY(-10px);
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }

        .pyramid__face--left {
          transform: rotateY(-90deg) rotateX(30deg) translateZ(10px) translateY(-10px);
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }

        .pyramid__face--bottom {
          transform: rotateX(-90deg) translateZ(10px) translateY(0);
        }

        @keyframes pyramid-rotate {
          from { transform: rotateX(-20deg) rotateY(0deg); }
          to { transform: rotateX(-20deg) rotateY(360deg); }
        }

        .sphere {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(138, 43, 226, 0.4), rgba(0, 200, 255, 0.2));
          box-shadow: 0 0 20px rgba(138, 43, 226, 0.3), inset 0 0 20px rgba(0, 200, 255, 0.2);
        }

        .dark .sphere {
          background: radial-gradient(circle at 30% 30%, rgba(191, 0, 255, 0.4), rgba(0, 255, 255, 0.2));
          box-shadow: 0 0 20px rgba(191, 0, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.2);
        }

        /* Digital Rain */
        .digital-rain {
          position: absolute;
          top: -100px;
          font-family: monospace;
          color: rgba(138, 43, 226, 0.5);
          text-shadow: 0 0 5px rgba(138, 43, 226, 0.5);
          animation: digital-rain-fall linear infinite;
        }

        .dark .digital-rain {
          color: rgba(0, 255, 255, 0.5);
          text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
        }

        .digital-rain__char {
          font-size: 14px;
          line-height: 1;
          opacity: 0;
          animation: digital-rain-fade 2s linear infinite;
        }

        @keyframes digital-rain-fall {
          to { transform: translateY(calc(100vh + 100px)); }
        }

        @keyframes digital-rain-fade {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        /* Nodes and Connections */
        .node {
          fill: rgba(138, 43, 226, 0.7);
          filter: url(#glow);
          animation: node-pulse 4s ease-in-out infinite alternate;
        }

        .dark .node {
          fill: rgba(0, 255, 255, 0.7);
        }

        .connection {
          stroke: rgba(138, 43, 226, 0.3);
          stroke-width: 0.5;
          stroke-dasharray: 5,5;
          animation: connection-dash 20s linear infinite;
        }

        .dark .connection {
          stroke: rgba(0, 255, 255, 0.3);
        }

        @keyframes node-pulse {
          0%, 100% { r: 2; opacity: 0.7; }
          50% { r: 3; opacity: 1; }
        }

        @keyframes connection-dash {
          to { stroke-dashoffset: 1000; }
        }
      `}</style>
    </div>
  )
}
