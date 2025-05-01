"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { SparklesCore } from "@/components/sparkles"
import { ArrowLeft, FlaskConical } from "lucide-react"

export default function QuickHypothesisPage() {
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

  const label = (key: string) => fieldMap[key] || key

  // Set mounted state only after component mounts on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load data after component is mounted
  useEffect(() => {
    // Only run this effect on the client side after mounting
    if (!mounted) return;
    
    // Safely access localStorage only on client side
    const loadData = () => {
      try {
        const saved = localStorage.getItem("visualizationData")
        if (!saved) {
          // Don't redirect, just handle gracefully
          console.warn("No visualization data found")
          return
        }

        const parsedData = JSON.parse(saved)
        let preview = []

        // Always try to get the complete dataset first
        if (parsedData.preview && Array.isArray(parsedData.preview)) {
          preview = parsedData.preview
        } else if (Array.isArray(parsedData)) {
          // Direct array data
          preview = parsedData
        } else if (parsedData.data && Array.isArray(parsedData.data)) {
          // Try data property
          preview = parsedData.data
        } else if (parsedData.charts) {
          // Last resort - try to reconstruct from chart data
          // This is less ideal as it might not have all columns
          const chart = Object.values(parsedData.charts)[0] as any
          if (chart && typeof chart === 'object' && 'x' in chart && 'y' in chart && 'xKey' in chart && 'yKey' in chart) {
            preview = chart.x.map((xVal: any, i: number) => ({
              [chart.xKey]: xVal,
              [chart.yKey]: chart.y[i],
            }))
          }
        }

        if (!Array.isArray(preview) || preview.length === 0) {
          console.warn("No valid preview data found")
          return
        }

        // Set preview data with first 5 rows for the preview table
        const previewRows = preview.slice(0, 5)
        setPreviewData(previewRows)

        // Process all available fields from the first row
        const sample = preview[0]
        const map: Record<string, string> = {}
        
        // Make sure we capture all columns in the sample
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

        // Run recommendations for numeric fields
        const numericFields = cleanedKeys.filter((key) => {
          const value = preview[0][map[key]];
          return typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)));
        });

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
      } catch (error) {
        console.error("Error processing visualization data:", error)
      }
    }

    loadData();
  }, [mounted]) // Add mounted as a dependency

  const handleSubmit = async () => {
    if (!field1 || !field2) {
      return alert("Please select both fields")
    }
    setLoading(true)

    try {
      const res = await fetch("http://127.0.0.1:8000/api/test-hypotheses/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field1, field2 }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }

      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setResult({ error: e.message || "Something went wrong" })
    } finally {
      setLoading(false)
    }
  }

  const handleBackToVisualization = () => {
    router.push("/visualization")
  }

  // Show nothing until component is mounted on client
  if (!mounted) return null

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-10 transition-colors duration-300">
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

      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          className="flex items-center gap-1 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
          onClick={handleBackToVisualization}
        >
          <ArrowLeft size={16} /> Back to Visualization
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <FlaskConical className="w-8 h-8 text-purple-500" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Quick Hypothesis Testing
        </h1>
      </div>

      {suggestedYFields.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg text-purple-600 dark:text-purple-300 font-semibold mb-1">
            🔍 Suggested Fields (Y-Axis)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            These fields show high variance or likely correlation:
          </p>
          <div className="flex gap-2 flex-wrap">
            {suggestedYFields.map((f) => (
              <Button
                key={f}
                variant="outline"
                className="text-purple-600 dark:text-purple-400 border-purple-400 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-600/20 hover:text-purple-800 dark:hover:text-white transition-colors"
                onClick={() => setField2(f)}
              >
                {label(f)}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white/10 dark:bg-black/30 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-purple-500/20 p-6 mb-8">
        <div className="flex flex-wrap gap-6 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-1 text-purple-600 dark:text-purple-300">Field 1 (Independent)</label>
            <select
              value={field1}
              onChange={(e) => setField1(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-purple-300 dark:border-purple-500 p-2 rounded text-black dark:text-white transition-colors"
            >
              <option value="">-- Select --</option>
              {fields.map((f) => (
                <option key={f} value={f}>
                  {label(f)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block mb-1 text-purple-600 dark:text-purple-300">Field 2 (Dependent)</label>
            <select
              value={field2}
              onChange={(e) => setField2(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-purple-300 dark:border-purple-500 p-2 rounded text-black dark:text-white transition-colors"
            >
              <option value="">-- Select --</option>
              {fields.map((f) => (
                <option key={f} value={f}>
                  {label(f)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded transition-all duration-300"
            >
              {loading ? "Running..." : "Run Test"}
            </Button>
          </div>
        </div>
      </div>

      {result?.error && (
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded mt-4 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/20 transition-colors">
          {result.error}
        </div>
      )}

      {previewData.length > 0 && (
        <div className="bg-white/50 dark:bg-gray-900/50 p-6 rounded-lg mt-6 border border-gray-200 dark:border-purple-500/20 space-y-4 overflow-x-auto backdrop-blur-sm transition-colors">
          <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-300 mb-2">Data Preview</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left table-auto">
              <thead className="bg-gray-100/80 dark:bg-black/50 transition-colors">
                <tr>
                  {Object.keys(previewData[0] || {}).map((key) => (
                    <th
                      key={key}
                      className="px-3 py-2 border-b border-gray-200 dark:border-purple-500/10 text-gray-700 dark:text-gray-300 transition-colors whitespace-nowrap"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-black/30 transition-colors">
                    {Object.values(row).map((val, i) => (
                      <td
                        key={i}
                        className="px-3 py-1 border-b border-gray-200 dark:border-purple-500/10 text-gray-800 dark:text-gray-200 transition-colors"
                      >
                        {val === null || val === undefined ? "-" : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result?.p_value !== undefined && (
        <div className="bg-white/50 dark:bg-gray-900/50 p-6 rounded-lg mt-6 border border-gray-200 dark:border-purple-500/20 space-y-4 backdrop-blur-sm transition-colors">
          <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-300 mb-2">Test Results</h2>

          <p className="text-gray-800 dark:text-gray-200 transition-colors">
            <strong>Hypothesis:</strong> Is there a relationship between{" "}
            <span className="text-purple-600 dark:text-purple-400">{label(field1)}</span> and{" "}
            <span className="text-purple-600 dark:text-purple-400">{label(field2)}</span>?
          </p>

          <p className="text-gray-800 dark:text-gray-200 transition-colors">
            <strong>p-value:</strong> {result.p_value}
          </p>

          <div className="text-gray-800 dark:text-gray-200 transition-colors">
            <strong>Interpretation:</strong>
            {result.p_value < 0.05 ? (
              <div className="mt-2 space-y-2">
                <p>
                  ✅ A <em>statistically significant</em> relationship exists (p = {result.p_value}) between{" "}
                  <span className="text-purple-600 dark:text-purple-400">{label(field1)}</span> and{" "}
                  <span className="text-purple-600 dark:text-purple-400">{label(field2)}</span>.
                </p>
                <p className="italic text-gray-600 dark:text-gray-400 transition-colors">
                  <em>Business Insight:</em> This suggests that changes in{" "}
                  <span className="text-purple-600 dark:text-purple-400">{label(field1)}</span> meaningfully affect{" "}
                  <span className="text-purple-600 dark:text-purple-400">{label(field2)}</span>. If{" "}
                  <span className="text-purple-600 dark:text-purple-400">{label(field1)}</span> represents time (like
                  Year or Month), this insight can drive forecasting models and time-based KPIs. If it's categorical
                  (like Region or Product Line), consider segment-specific strategies to optimize{" "}
                  <span className="text-purple-600 dark:text-purple-400">{label(field2)}</span>.
                </p>
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <p>
                  ❌ There is <em>no statistically significant</em> relationship (p = {result.p_value}) between{" "}
                  <span className="text-purple-600 dark:text-purple-400">{label(field1)}</span> and{" "}
                  <span className="text-purple-600 dark:text-purple-400">{label(field2)}</span>.
                </p>
                <p className="italic text-gray-600 dark:text-gray-400 transition-colors">
                  <em>Business Insight:</em> The variation in{" "}
                  <span className="text-purple-600 dark:text-purple-400">{label(field2)}</span> is likely not explained
                  by <span className="text-purple-600 dark:text-purple-400">{label(field1)}</span>. Consider focusing
                  your analysis on stronger predictors and exclude{" "}
                  <span className="text-purple-600 dark:text-purple-400">{label(field1)}</span> from priority models or
                  business decisions.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button
          onClick={handleBackToVisualization}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Return to Visualization</span>
        </Button>
      </div>
    </main>
  )
}
