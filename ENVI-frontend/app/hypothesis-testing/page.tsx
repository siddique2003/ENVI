"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { SparklesCore } from "@/components/sparkles"
import { ArrowLeft, LogOut, FlaskConical, ChevronRight, Database, LineChart, BarChart2 } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

export default function HypothesisTestingPage() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [fields, setFields] = useState<string[]>([])
  const [field1, setField1] = useState("")
  const [field2, setField2] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [fieldMap, setFieldMap] = useState<Record<string, string>>({})
  const [suggestedYFields, setSuggestedYFields] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [glitchActive, setGlitchActive] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const label = (key: string) => fieldMap[key] || key

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
    const saved = localStorage.getItem("visualizationData")
    if (!saved) {
      router.replace("/dashboard")
      return
    }

    const { preview = [] } = JSON.parse(saved)
    const previewRows = preview.slice(0, 5)
    setPreviewData(previewRows)

    if (!Array.isArray(preview) || preview.length === 0) {
      router.replace("/dashboard")
      return
    }

    const sample = preview[0]
    const map: Record<string, string> = {}
    Object.keys(sample).forEach((orig) => {
      const cleaned = orig
        .toLowerCase()
        .replace(/%/g, "percent")
        .replace(/[^\w]+/g, "_")
        .replace(/^_+|_+$/g, "")
      map[cleaned] = orig
    })

    setFieldMap(map)
    const cleanedKeys = Object.keys(map)
    setFields(cleanedKeys)

    // Run recommendations
    const numericFields = cleanedKeys.filter((key) => typeof preview[0][map[key]] === "number")

    // Sort numerics by variance
    const fieldStats = numericFields.map((field) => {
      const values = preview.map((row) => Number(row[map[field]]) || 0)
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((acc, val) => acc + (val - mean) ** 2, 0) / values.length
      return { field, variance }
    })

    fieldStats.sort((a, b) => b.variance - a.variance)
    const recommended = fieldStats.slice(0, 3).map((f) => f.field)
    setSuggestedYFields(recommended)
  }, [router])

  const handleSubmit = async () => {
    if (!field1 || !field2) {
      return alert("Please select both fields")
    }
    setLoading(true)
    setGlitchActive(true)
    setTimeout(() => setGlitchActive(false), 300)

    try {
      const res = await fetch("http://127.0.0.1:8000/api/test-hypotheses/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field1: fieldMap[field1],
          field2: fieldMap[field2]
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }

      const data = await res.json()
      setResult(data)
      
      // Scroll to results after a short delay
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
    } catch (e: any) {
      setResult({ error: e.message || "Something went wrong" })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("visualizationData")
    localStorage.removeItem("selectedFields")
    localStorage.removeItem("user")
    localStorage.removeItem("isLoggedIn")
    document.cookie = "isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push("/login")
  }

  const handleAutomatedVisualization = () => {
    router.push("/select-fields")
  }

  const handleManualVisualization = () => {
    router.push("/visualization")
  }

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-100 dark:bg-[#0a0014] text-black dark:text-white relative transition-colors duration-700"
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

      {/* Background Sparkles */}
      <div className="absolute inset-0 -z-10">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor={resolvedTheme === "dark" ? "#FFFFFF" : "#000000"}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              className="flex items-center gap-1 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft size={16} /> Back to Home
            </Button>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
              onClick={handleLogout}
            >
              <LogOut size={16} /> Logout
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className={`mb-8 ${glitchActive ? "glitch" : ""}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <FlaskConical className="w-8 h-8 text-purple-500 dark:text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Hypothesis Testing
            </h1>
          </div>
          <motion.div
            className="h-1 w-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "200px" }}
            transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
          />
        </motion.div>

        {/* Main Content */}
        <div className="space-y-10">
          {/* Hypothesis Testing Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 dark:bg-black/30 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-purple-500/20 p-6 space-y-6 transition-colors"
          >
            {suggestedYFields.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg text-purple-600 dark:text-purple-300 font-semibold mb-1 flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  <span>Suggested Fields (Y-Axis)</span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  These fields show high variance or likely correlation:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {suggestedYFields.map((f, index) => (
                    <motion.div
                      key={f}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        className="text-purple-600 dark:text-purple-400 border-purple-400 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-600/20 hover:text-purple-800 dark:hover:text-white transition-colors"
                        onClick={() => setField2(f)}
                      >
                        {label(f)}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-6 mb-6">
              <motion.div 
                className="flex-1 min-w-[200px]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <label className="block mb-1 text-purple-600 dark:text-purple-300 flex items-center gap-1">
                  <Database className="w-4 h-4" />
                  <span>Field 1 (Independent)</span>
                </label>
                <div className="relative">
                  <select
                    value={field1}
                    onChange={(e) => setField1(e.target.value)}
                    className="w-full bg-white/80 dark:bg-gray-900/80 border border-purple-300 dark:border-purple-500 p-2 rounded text-black dark:text-white transition-colors focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                  >
                    <option value="">-- Select --</option>
                    {fields.map((f) => {
                      const rawField = fieldMap[f];
                      const sampleValue = previewData?.[0]?.[rawField];
                      const isNumeric = typeof sampleValue === "number";

                      return (
                        <option key={f} value={f}>
                          {label(f)} {isNumeric ? "(Numerical)" : "(Categorical)"}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-purple-500/50 to-cyan-500/50 transform scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left"></div>
                </div>
              </motion.div>

              <motion.div 
                className="flex-1 min-w-[200px]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label className="block mb-1 text-purple-600 dark:text-purple-300 flex items-center gap-1">
                  <BarChart2 className="w-4 h-4" />
                  <span>Field 2 (Dependent)</span>
                </label>
                <div className="relative">
                  <select
                    value={field2}
                    onChange={(e) => setField2(e.target.value)}
                    className="w-full bg-white/80 dark:bg-gray-900/80 border border-purple-300 dark:border-purple-500 p-2 rounded text-black dark:text-white transition-colors focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                  >
                    <option value="">-- Select --</option>
                    {fields.map((f) => {
                      const rawField = fieldMap[f];
                      const sampleValue = previewData?.[0]?.[rawField];
                      const isNumeric = typeof sampleValue === "number";

                      return (
                        <option key={f} value={f}>
                          {label(f)} {isNumeric ? "(Numerical)" : "(Categorical)"}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-purple-500/50 to-cyan-500/50 transform scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left"></div>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-end"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !field1 || !field2}
                    className="relative bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded transition-all duration-300 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <span>Run Test</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Test Results Section - Now positioned ABOVE the data preview */}
          <AnimatePresence mode="wait">
            {result?.error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-red-50 dark:bg-red-900/30 p-4 rounded mt-4 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/20 transition-colors"
              >
                {result.error}
              </motion.div>
            )}

            {result?.p_value !== undefined && (
              <motion.div
                ref={resultsRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-white/50 dark:bg-gray-900/50 p-6 rounded-lg border border-gray-200 dark:border-purple-500/20 space-y-4 backdrop-blur-sm transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 dark:bg-purple-600/20 flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-300">Test Results</h2>
                </div>

                <div className="pl-12 space-y-4">
                  <p className="text-gray-800 dark:text-gray-200 transition-colors">
                    <strong>Hypothesis:</strong> Is there a relationship between{" "}
                    <span className="text-purple-600 dark:text-purple-400">{label(field1)}</span> and{" "}
                    <span className="text-purple-600 dark:text-purple-400">{label(field2)}</span>?
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-200">p-value:</div>
                    <div className="text-xl font-mono bg-gray-100 dark:bg-black/40 px-3 py-1 rounded-md text-purple-600 dark:text-purple-400">
                      {result.p_value}
                    </div>
                  </div>

                  <div className="text-gray-800 dark:text-gray-200 transition-colors">
                    <strong>Interpretation:</strong>
                    {result.p_value < 0.05 ? (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">✓</div>
                          <p className="font-medium">
                            A <em>statistically significant</em> relationship exists (p = {result.p_value}) between{" "}
                            <span className="text-purple-600 dark:text-purple-400">{label(field1)}</span> and{" "}
                            <span className="text-purple-600 dark:text-purple-400">{label(field2)}</span>.
                          </p>
                        </div>
                        <div className="ml-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/30 rounded-lg">
                          <p className="italic text-gray-700 dark:text-gray-300">
                            <strong className="text-green-700 dark:text-green-400">Business Insight:</strong> This suggests that changes in{" "}
                            <span className="text-purple-600 dark:text-purple-400">{label(field1)}</span> meaningfully affect{" "}
                            <span className="text-purple-600 dark:text-purple-400">{label(field2)}</span>. If{" "}
                            <span className="text-purple-600 dark:text-purple-400">{label(field1)}</span> represents time (like
                            Year or Month), this insight can drive forecasting models and time-based KPIs. If it's categorical
                            (like Region or Product Line), consider segment-specific strategies to optimize{" "}
                            <span className="text-purple-600 dark:text-purple-400">{label(field2)}</span>.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white">✕</div>
                          <p className="font-medium">
                            There is <em>no statistically significant</em> relationship (p = {result.p_value}) between{" "}
                            <span className="text-purple-600 dark:text-purple-400">{label(field1)}</span> and{" "}
                            <span className="text-purple-600 dark:text-purple-400">{label(field2)}</span>.
                          </p>
                        </div>
                        <div className="ml-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-lg">
                          <p className="italic text-gray-700 dark:text-gray-300">
                            <strong className="text-red-700 dark:text-red-400">Business Insight:</strong> The variation in{" "}
                            <span className="text-purple-600 dark:text-purple-400">{label(field2)}</span> is likely not explained
                            by <span className="text-purple-600 dark:text-purple-400">{label(field1)}</span>. Consider focusing
                            your analysis on stronger predictors and exclude{" "}
                            <span className="text-purple-600 dark:text-purple-400">{label(field1)}</span> from priority models or
                            business decisions.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {result?.tests && result.tests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-white/50 dark:bg-gray-900/50 p-6 rounded-lg border border-gray-200 dark:border-purple-500/20 space-y-6 backdrop-blur-sm transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 dark:bg-purple-600/20 flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-300">Detailed Test Results</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {result.tests.map((test: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                      className="border border-purple-300 dark:border-purple-700 p-4 rounded-md space-y-2 bg-white/30 dark:bg-black/30 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 dark:bg-purple-600/20 flex items-center justify-center">
                          <FlaskConical className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                          {test.test}
                        </p>
                      </div>

                      {test.error ? (
                        <p className="text-red-600 dark:text-red-300 flex items-center gap-1">
                          <span className="text-lg">⚠️</span> Error: {test.error}
                        </p>
                      ) : (
                        <>
                          <p className="text-gray-800 dark:text-gray-200">
                            <strong>Statistic:</strong> {test.statistic?.toFixed(4)}
                          </p>
                          <p className="text-gray-800 dark:text-gray-200">
                            <strong>p-value:</strong> {test.p_value?.toFixed(4)}
                          </p>
                          <p className="text-gray-800 dark:text-gray-200">
                            <strong>Interpretation:</strong> {test.interpretation}
                          </p>
                          {test.insight && (
                            <p className="italic text-gray-600 dark:text-gray-400">
                              <strong>Business Insight:</strong> {test.insight}
                            </p>
                          )}
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Data Preview Section - Now positioned BELOW the test results */}
          {previewData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/50 dark:bg-gray-900/50 p-6 rounded-lg border border-gray-200 dark:border-purple-500/20 space-y-4 overflow-x-auto backdrop-blur-sm transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 dark:bg-purple-600/20 flex items-center justify-center">
                  <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-300">Data Preview</h2>
              </div>
              
              <div className="relative overflow-x-auto rounded-lg border border-gray-200 dark:border-purple-500/10">
                <table className="min-w-full text-left table-auto">
                  <thead className="bg-gray-100/80 dark:bg-black/50 transition-colors">
                    <tr>
                      {Object.keys(previewData[0]).map((key) => (
                        <th
                          key={key}
                          className="px-3 py-2 border-b border-gray-200 dark:border-purple-500/10 text-gray-700 dark:text-gray-300 transition-colors"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <motion.tr 
                        key={idx} 
                        className="hover:bg-gray-50 dark:hover:bg-black/30 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                      >
                        {Object.values(row).map((val, i) => (
                          <td
                            key={i}
                            className="px-3 py-1 border-b border-gray-200 dark:border-purple-500/10 text-gray-800 dark:text-gray-200 transition-colors"
                          >
                            {String(val)}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Visualization Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16"
          >
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-300 text-center">
                Choose Your Visualization Path
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Automated Visualization Card */}
                <motion.div
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onClick={handleAutomatedVisualization}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] dark:hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]"
                >
                  {/* Background with gradient and animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-pink-600/80 opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 opacity-0 group-hover:opacity-80 blur-xl transition-all duration-500" />

                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/10 blur-xl group-hover:bg-white/20 transition-all duration-500" />
                  <div className="absolute bottom-8 left-8 w-16 h-16 rounded-full bg-white/10 blur-xl group-hover:bg-white/20 transition-all duration-500" />

                  {/* Content */}
                  <div className="relative p-8 h-full flex flex-col justify-between z-10">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Automated Visualization</h3>
                      <p className="text-white/80 mb-6">
                        Let AI analyze your data and generate optimized visualizations based on your selected fields.
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Select fields to generate charts</span>
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white transform group-hover:translate-x-1 transition-transform duration-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Manual Visualization Card */}
                <motion.div
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onClick={handleManualVisualization}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] dark:hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]"
                >
                  {/* Background with gradient and animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-indigo-600/80 opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-80 blur-xl transition-all duration-500" />

                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/10 blur-xl group-hover:bg-white/20 transition-all duration-500" />
                  <div className="absolute bottom-8 left-8 w-16 h-16 rounded-full bg-white/10 blur-xl group-hover:bg-white/20 transition-all duration-500" />

                  {/* Content */}
                  <div className="relative p-8 h-full flex flex-col justify-between z-10">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Manual Visualization</h3>
                      <p className="text-white/80 mb-6">
                        Take full control of your data visualization with a drag-and-drop interface and customizable charts.
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Create and customize your own charts</span>
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white transform group-hover:translate-x-1 transition-transform duration-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
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
