"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { SparklesCore } from "@/components/sparkles"

// Generate dummy sales data
const generateDummyData = () => {
  const data = []
  for (let i = 1; i <= 1000; i++) {
    data.push({
      id: i,
      product: `Product ${Math.ceil(Math.random() * 50)}`,
      region: ["North", "South", "East", "West"][Math.floor(Math.random() * 4)],
      sales: Math.floor(Math.random() * 10000) + 5000,
      unitsSold: Math.floor(Math.random() * 500) + 100,
      date: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
    })
  }
  return data
}

export default function DataPreview() {
  const { resolvedTheme } = useTheme()
  const router = useRouter()
  const [itemsPerPage, setItemsPerPage] = useState(100)
  const [currentPage] = useState(1)
  const [data] = useState(generateDummyData())
  const [mounted, setMounted] = useState(false)

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

  if (!mounted) return null

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  const handleLoadData = () => {
    // Store the data in localStorage for the visualization page
    localStorage.setItem("visualizationData", JSON.stringify(data))
    router.push("/visualization")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen transition-colors duration-300 bg-white dark:bg-black"
    >
      <div className="relative min-h-screen antialiased overflow-hidden">
        {/* Navigation */}
        <div className="absolute top-6 left-6 z-50">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 text-gray-400 hover:text-purple-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 max-w-7xl mx-auto pt-24">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Data Preview
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1} - {Math.min(endIndex, data.length)} of {data.length} records
            </p>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 mb-6 justify-center items-center"
          >
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className={`rounded-xl px-4 py-2 ${
                resolvedTheme === "dark"
                  ? "bg-gray-800/50 border-purple-500/40 text-white"
                  : "bg-white border-purple-200 text-gray-800"
              } focus:border-purple-400 focus:ring-1 focus:ring-purple-300`}
            >
              {[100, 200, 400, 600, 800, 1000].map((size) => (
                <option key={size} value={size}>
                  {size} entries
                </option>
              ))}
            </select>

            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              onClick={handleLoadData}
            >
              Load Data
            </Button>
          </motion.div>

          {/* Data Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden shadow-lg"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
                  className={`bg-gradient-to-r from-purple-500/10 to-pink-500/10 ${
                    resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <tr>
                    <th className="px-6 py-3 text-left">ID</th>
                    <th className="px-6 py-3 text-left">Product</th>
                    <th className="px-6 py-3 text-left">Region</th>
                    <th className="px-6 py-3 text-left">Sales</th>
                    <th className="px-6 py-3 text-left">Units Sold</th>
                    <th className="px-6 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-t border-purple-500/10 ${
                        resolvedTheme === "dark" ? "hover:bg-gray-800/20" : "hover:bg-gray-100"
                      } transition-colors`}
                    >
                      <td className="px-6 py-4">{item.id}</td>
                      <td className="px-6 py-4">{item.product}</td>
                      <td className="px-6 py-4">{item.region}</td>
                      <td className="px-6 py-4">${item.sales.toLocaleString()}</td>
                      <td className="px-6 py-4">{item.unitsSold}</td>
                      <td className="px-6 py-4">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Background Sparkles */}
        <div className="h-full w-full absolute inset-0">
          <SparklesCore
            id="tsparticlespreview"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor={resolvedTheme === "light" ? "#000000" : "#FFFFFF"}
          />
        </div>
      </div>
    </motion.div>
  )
}

