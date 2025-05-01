"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BarChart, PieChart, LineChart, ScatterChart } from "lucide-react"

const FloatingChart = ({ count = 5 }) => {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 })
  const [isClient, setIsClient] = useState(false)

  const chartTypes = [BarChart, PieChart, LineChart, ScatterChart]

  useEffect(() => {
    setIsClient(true)
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!isClient) return null

  return (
    <div className="relative w-full h-full">
      {Array.from({ length: count }).map((_, i) => {
        const RandomChart = chartTypes[Math.floor(Math.random() * chartTypes.length)]

        return (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * dimensions.width,
              y: Math.random() * dimensions.height,
            }}
            animate={{
              x: [
                Math.random() * dimensions.width,
                Math.random() * dimensions.width,
                Math.random() * dimensions.width,
              ],
              y: [
                Math.random() * dimensions.height,
                Math.random() * dimensions.height,
                Math.random() * dimensions.height,
              ],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <div className="relative w-16 h-20 bg-foreground/5 dark:bg-background/5 backdrop-blur-sm rounded-lg border border-border dark:border-white/10 flex items-center justify-center transform hover:scale-110 transition-transform">
              <RandomChart className="w-8 h-8 text-primary/50 dark:text-purple-400/50" />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default FloatingChart