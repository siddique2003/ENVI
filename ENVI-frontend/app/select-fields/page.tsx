"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SparklesCore } from "@/components/sparkles"
import { useTheme } from "next-themes"
import { ArrowLeft, LogOut, ChevronRight, Database, BarChart, LineChart, PieChart } from "lucide-react"
import { getCookie } from "cookies-next"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"

function cleanFieldName(field: string) {
  return field
    .toLowerCase()
    .replace(/%/g, "percent")
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

export default function SelectFieldsPage() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [numericalFields, setNumericalFields] = useState<string[]>([])
  const [allFields, setAllFields] = useState<string[]>([])
  const [xField, setXField] = useState("")
  const [yField, setYField] = useState("")
  const [previewData, setPreviewData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHoveringX, setIsHoveringX] = useState(false)
  const [isHoveringY, setIsHoveringY] = useState(false)
  const [isHoveringButton, setIsHoveringButton] = useState(false)
  const [glitchActive, setGlitchActive] = useState(false)
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false)

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)

    // Mouse position tracking for glow effect
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)

    // Random glitch effect
    const glitchInterval = setInterval(
      () => {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 200)
      },
      Math.random() * 10000 + 5000,
    )

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearInterval(glitchInterval)
    }
  }, [])

  useEffect(() => {
    const raw = localStorage.getItem("visualizationData")

    if (!raw) {
      router.replace("/dashboard")
      return
    }

    const parsed = JSON.parse(raw)

    // Use original_data if present, otherwise fall back to preview
    const dataForFields = parsed.original_data || parsed.preview

    if (!dataForFields || !Array.isArray(dataForFields) || dataForFields.length === 0) {
      console.error("No valid original_data or preview found in localStorage")
      router.replace("/dashboard")
      return
    }

    // Use dataForFields to determine available fields
    setPreviewData(dataForFields.slice(0, 20))
    const fields = Object.keys(dataForFields[0])
    const numerical = fields.filter((key) => typeof dataForFields[0]?.[key] === "number")

    setAllFields(fields)
    setNumericalFields(numerical)
    setLoading(false)
  }, [router])

  const handleConfirm = async () => {
    if (!xField || !yField) {
      alert("Please select both fields")
      return
    }

    const cleanedX = cleanFieldName(xField)
    const cleanedY = cleanFieldName(yField)

    setLoading(true)
    setShowLoadingOverlay(true) // Show the loading overlay
    setError(null)
    try {
      const response = await fetch("/api/generate-charts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        body: JSON.stringify({
          data: previewData,
          selected_fields: [cleanedY, cleanedX],
          primary_field: cleanedY,
          secondary_field: cleanedX,
          objective: "analysisObjective",
        }),
      })

      // Clone the response to read the body multiple times
      const responseCloneForText = response.clone()
      const responseCloneForJson = response.clone()

      // Get the raw text first for debugging
      const rawText = await responseCloneForText.text()
      console.log("Raw API response text:", rawText)

      if (!response.ok) {
        // Try to parse error data as JSON, but catch if it fails
        let errorData = { error: `HTTP error! status: ${response.status}. Response body: ${rawText}` }
        try {
          // Use the second clone for JSON parsing attempt
          errorData = await responseCloneForJson.json()
        } catch (parseError) {
          console.error("Failed to parse error response as JSON:", parseError)
          // Keep the basic error message with the raw text
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      // Now attempt to parse the original response body as JSON
      const result = await response.json()

      // DEBUG: Log the raw API response before storing
      console.log("Parsed API response object:", result)

      // Combine original data with the charts from the response
      const dataToStore = {
        original_data: previewData,
        charts: result.charts,
        isLoading: true, // Add loading state to localStorage
      }

      localStorage.setItem("visualizationData", JSON.stringify(dataToStore))
      localStorage.setItem("isLoggedIn", "true")
      document.cookie = "isLoggedIn=true; path=/;"
      router.push("/visualization")
    } catch (err: any) {
      console.error("Error generating charts:", err)
      alert("Error generating charts")
      setError(err.message)
      setShowLoadingOverlay(false) // Hide loading overlay on error
    } finally {
      setLoading(false)
      // Note: We don't hide the loading overlay here because we want it to persist during navigation
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("visualizationData")
    localStorage.removeItem("selectedFields")
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (!mounted) return null

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300 ${glitchActive ? "animate-glitch" : ""}`}
    >
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-small-black/[0.2] dark:bg-grid-small-white/[0.2] -z-10" />

      {/* Animated gradient background */}
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <div
          className="absolute h-40 w-40 rounded-full bg-purple-600 opacity-20 blur-3xl animate-pulse"
          style={{
            left: `${mousePosition.x * 0.05}px`,
            top: `${mousePosition.y * 0.05}px`,
            animationDuration: "4s",
            animationDelay: "0s",
          }}
        />
        <div
          className="absolute h-60 w-60 rounded-full bg-cyan-400 opacity-20 blur-3xl animate-pulse"
          style={{
            right: `${mousePosition.x * 0.02}px`,
            bottom: `${mousePosition.y * 0.02}px`,
            animationDuration: "7s",
            animationDelay: "0.5s",
          }}
        />
      </div>

      {/* Scanlines effect */}
      <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none -z-10" />

      {/* Sparkles */}
      <div className="absolute inset-0 -z-10">
        <SparklesCore
          id="tsparticlesselect"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={70}
          className="w-full h-full"
          particleColor={resolvedTheme === "dark" ? "#FFFFFF" : "#FFFFFF"}
        />
      </div>

      {/* Mouse follow glow effect */}
      <div
        className="hidden md:block absolute w-64 h-64 bg-purple-500 dark:bg-purple-500 rounded-full opacity-5 dark:opacity-10 blur-3xl pointer-events-none z-0 transition-transform duration-300"
        style={{
          left: `${mousePosition.x - 128}px`,
          top: `${mousePosition.y - 128}px`,
        }}
      />

      <div className="container mx-auto py-10 px-4 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <Button
              variant="ghost"
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 group relative overflow-hidden"
              onClick={() => router.push("/hypothesis-testing")}
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Hypothesis Testing</span>
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-purple-500 to-cyan-500 group-hover:w-full transition-all duration-300"></div>
            </Button>
          </motion.div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 transition-colors border border-gray-300 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-400"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </Button>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-500 bg-clip-text text-transparent relative z-10">
            Select Fields for Analysis
          </h1>
          <div className="absolute -top-4 -left-2 w-12 h-12 border-t-2 border-l-2 border-purple-500 opacity-60"></div>
          <div className="absolute -bottom-4 -right-2 w-12 h-12 border-b-2 border-r-2 border-cyan-500 opacity-60"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Left column - Field selection */}
          <motion.div
            className="md:col-span-2 flex"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {loading ? (
              <Card className="bg-black/40 p-6 space-y-4 border border-purple-500/20 backdrop-blur-sm">
                <Skeleton className="h-10 w-full bg-gray-800" />
                <Skeleton className="h-10 w-full bg-gray-800" />
                <Skeleton className="h-10 w-full bg-gray-800" />
              </Card>
            ) : (
              <Card className="bg-white/80 dark:bg-black/40 p-6 space-y-6 border border-gray-200 dark:border-purple-500/20 backdrop-blur-sm relative overflow-hidden group flex-1 flex flex-col">
                {/* Decorative circuit lines */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path
                      d="M0,50 L20,50 L20,20 L80,20 L80,80 L50,80 L50,100"
                      stroke="cyan"
                      strokeWidth="0.5"
                      fill="none"
                    />
                    <path d="M0,20 L30,20 L30,70 L60,70 L60,100" stroke="purple" strokeWidth="0.5" fill="none" />
                    <circle cx="20" cy="50" r="2" fill="cyan" />
                    <circle cx="30" cy="70" r="2" fill="purple" />
                    <circle cx="80" cy="20" r="2" fill="cyan" />
                  </svg>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-purple-500/40"></div>
                  <h2 className="text-xl font-semibold mb-4 text-cyan-300">Field Selection</h2>
                  <p className="text-gray-300 mb-6">Select the fields you want to analyze from your dataset.</p>
                </div>

                <div
                  className={`relative ${isHoveringY ? "z-20" : "z-10"}`}
                  onMouseEnter={() => setIsHoveringY(true)}
                  onMouseLeave={() => setIsHoveringY(false)}
                >
                  <Label className="mb-2 block text-purple-700 dark:text-purple-200 font-medium">
                    <Database className="inline-block mr-2 h-4 w-4" />
                    Numerical Field (Y-Axis)
                  </Label>
                  <div className="relative">
                    <Select value={yField} onValueChange={setYField}>
                      <SelectTrigger className="bg-white/80 dark:bg-black/80 border border-purple-300 dark:border-purple-500/30 text-gray-800 dark:text-white focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 hover:border-purple-400">
                        <SelectValue placeholder="Select a numerical field" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-black/90 border border-purple-300 dark:border-purple-500/50 text-gray-800 dark:text-white">
                        {numericalFields.map((field) => (
                          <SelectItem
                            key={field}
                            value={field}
                            className="hover:bg-purple-900/30 focus:bg-purple-900/30"
                          >
                            {field}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div
                      className={`absolute inset-0 border border-purple-500/50 pointer-events-none transition-opacity duration-300 ${yField ? "opacity-100" : "opacity-0"}`}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Choose a numerical field for your Y-axis (values)</p>
                </div>

                <div
                  className={`relative ${isHoveringX ? "z-20" : "z-10"}`}
                  onMouseEnter={() => setIsHoveringX(true)}
                  onMouseLeave={() => setIsHoveringX(false)}
                >
                  <Label className="mb-2 block text-cyan-700 dark:text-cyan-200 font-medium">
                    <BarChart className="inline-block mr-2 h-4 w-4" />
                    Grouping Field (X-Axis)
                  </Label>
                  <div className="relative">
                    <Select value={xField} onValueChange={setXField}>
                      <SelectTrigger className="bg-white/80 dark:bg-black/80 border border-cyan-300 dark:border-cyan-500/30 text-gray-800 dark:text-white focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 hover:border-cyan-400">
                        <SelectValue placeholder="Select a grouping field" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-black/90 border border-cyan-300 dark:border-cyan-500/50 text-gray-800 dark:text-white">
                        {allFields.map((field) => (
                          <SelectItem key={field} value={field} className="hover:bg-cyan-900/30 focus:bg-cyan-900/30">
                            {field}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div
                      className={`absolute inset-0 border border-cyan-500/50 pointer-events-none transition-opacity duration-300 ${xField ? "opacity-100" : "opacity-0"}`}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Choose a field for your X-axis (categories)</p>
                </div>

                <div
                  className="relative mt-8"
                  onMouseEnter={() => setIsHoveringButton(true)}
                  onMouseLeave={() => setIsHoveringButton(false)}
                >
                  <Button
                    className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white transition-all duration-300"
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          Processing<span className="animate-pulse">...</span>
                        </>
                      ) : (
                        <>
                          Confirm and Generate Charts
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600/0 via-white/20 to-cyan-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  </Button>

                  {/* Animated border */}
                  {isHoveringButton && (
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 rounded-md animate-border-flow -z-10"></div>
                  )}
                </div>

                {error && (
                  <div className="text-red-400 bg-red-900/20 p-3 border border-red-500/30 rounded-md mt-4">{error}</div>
                )}
              </Card>
            )}
          </motion.div>

          {/* Right column - Visualization preview */}
          <motion.div
            className="md:col-span-1 flex"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/80 dark:bg-black/40 p-6 border border-gray-200 dark:border-cyan-500/20 backdrop-blur-sm relative overflow-hidden flex-1 flex flex-col">
              <div className="absolute top-0 left-0 w-32 h-32 opacity-20">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path d="M20,0 L20,30 L80,30 L80,70 L30,70 L30,100" stroke="cyan" strokeWidth="0.5" fill="none" />
                  <path d="M50,0 L50,50 L100,50" stroke="purple" strokeWidth="0.5" fill="none" />
                  <circle cx="20" cy="30" r="2" fill="cyan" />
                  <circle cx="50" cy="50" r="2" fill="purple" />
                  <circle cx="80" cy="30" r="2" fill="cyan" />
                </svg>
              </div>

              <div className="relative">
                <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-cyan-500/40"></div>
                <h2 className="text-xl font-semibold mb-4 text-purple-700 dark:text-purple-300">
                  Visualization Preview
                </h2>
              </div>

              <div className="space-y-6 mt-6 flex-1 flex flex-col justify-between">
                <div className="flex flex-col items-center justify-center flex-1 border border-dashed border-cyan-300 dark:border-cyan-500/30 rounded-md bg-white/30 dark:bg-black/30 p-4">
                  <div className="flex gap-4 mb-4">
                    <BarChart className="h-8 w-8 text-purple-400 animate-pulse" style={{ animationDuration: "3s" }} />
                    <LineChart className="h-8 w-8 text-cyan-400 animate-pulse" style={{ animationDuration: "4s" }} />
                    <PieChart className="h-8 w-8 text-pink-400 animate-pulse" style={{ animationDuration: "5s" }} />
                  </div>
                  <p className="text-center text-gray-300">Select your fields to generate visualizations</p>
                  <p className="text-center text-gray-500 text-sm mt-2">
                    Charts will be created based on your selected fields
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Available Chart Types:</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2 p-2 border border-purple-300/20 dark:border-purple-500/20 rounded-md bg-white/30 dark:bg-black/30 hover:bg-purple-100/30 dark:hover:bg-purple-900/20 transition-colors">
                      <BarChart className="h-4 w-4 text-purple-400" />
                      <span className="text-sm">Bar Charts</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 border border-cyan-300/20 dark:border-cyan-500/20 rounded-md bg-white/30 dark:bg-black/30 hover:bg-cyan-100/30 dark:hover:bg-cyan-900/20 transition-colors">
                      <LineChart className="h-4 w-4 text-cyan-400" />
                      <span className="text-sm">Line Charts</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 border border-pink-300/20 dark:border-pink-500/20 rounded-md bg-white/30 dark:bg-black/30 hover:bg-pink-100/30 dark:hover:bg-pink-900/20 transition-colors">
                      <PieChart className="h-4 w-4 text-pink-400" />
                      <span className="text-sm">Pie Charts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data stream animation */}
              <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 animate-data-stream"></div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Loading Overlay */}
        {showLoadingOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
          >
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-r-4 border-l-4 border-cyan-500 animate-spin-reverse"></div>
              <div
                className="absolute inset-4 rounded-full border-t-4 border-b-4 border-pink-500 animate-spin"
                style={{ animationDuration: "3s" }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 via-cyan-500 to-pink-500 animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="mt-8 text-white text-xl font-bold">Generating Visualizations</div>
            <div className="mt-2 text-gray-300 text-sm">Please wait while we process your data...</div>
            <div className="mt-4 flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0s" }}></div>
              <div className="w-3 h-3 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-3 h-3 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </motion.div>
        )}

        {/* Add CSS for animations */}
        <style jsx global>{`
          @keyframes data-stream {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          @keyframes spin-reverse {
            from { transform: rotate(0deg); }
            to { transform: rotate(-360deg); }
          }

          .animate-spin-reverse {
            animation: spin-reverse 2s linear infinite;
          }

          .animate-data-stream {
            animation: data-stream 3s linear infinite;
          }
          
          .bg-grid-small-white {
            background-size: 20px 20px;
            background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
          }

          .bg-grid-small-black {
            background-size: 20px 20px;
            background-image: radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px);
          }
          
          .bg-scanlines {
            background: linear-gradient(
              to bottom,
              transparent 50%,
              rgba(255, 255, 255, 0.05) 50%
            );
            background-size: 100% 4px;
          }
          
          @keyframes border-flow {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
          
          .animate-border-flow {
            animation: border-flow 2s ease infinite;
          }
          
          @keyframes glitch {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
          }
          
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
          }
          
          .animate-glitch {
            animation: glitch 0.2s ease;
          }
        `}</style>
      </div>
    </div>
  )
}
