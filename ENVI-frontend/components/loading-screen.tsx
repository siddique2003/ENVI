"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { SparklesCore } from "@/components/sparkles"
import { useTheme } from "next-themes"

const loadingSteps = [
  "Initializing 3D Environment",
  "Establishing Neural Networks",
  "Transforming raw data into actionable insights...",
  "Starting ENVI",
]

// Add inspirational quotes
const quotes = [
  "Data is the new oil of the digital economy.",
  "Without big data, you are blind and deaf in the middle of a freeway.",
  "Information is the oil of the 21st century, and analytics is the combustion engine.",
  "Data really powers everything that we do.",
  "The goal is to turn data into information, and information into insight.",
]

export function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Rotate quotes
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length)
    }, 3000)

    return () => clearInterval(quoteInterval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 0.7
      })

      setCurrentStep((prev) => {
        const stepProgress = progress / (100 / loadingSteps.length)
        return Math.floor(stepProgress)
      })
    }, 30)

    return () => clearInterval(interval)
  }, [progress])

  if (!mounted) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: {
          duration: 1,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black transition-colors duration-300"
    >
      <div className="h-full w-full absolute inset-0">
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

      <div className="relative z-10 w-full max-w-lg space-y-8 text-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h1 className="text-5xl font-bold text-black dark:text-white transition-colors">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">ENVI</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">Enhanced Visualization Interface</p>
        </motion.div>

        <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="space-y-2">
            <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800 transition-colors">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-400 to-pink-600"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="h-16 flex flex-col justify-center">
              <motion.p
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-gray-600 dark:text-gray-400 transition-colors"
              >
                {loadingSteps[currentStep]}
              </motion.p>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="h-1 w-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-600 opacity-25"
                style={{
                  opacity: i <= (currentStep / loadingSteps.length) * 4 ? 1 : 0.25,
                }}
              />
            ))}
          </div>

          {/* Inspirational Quote */}
          <motion.div
            key={quoteIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 h-16 flex items-center justify-center"
          >
            <p className="text-sm italic text-gray-600 dark:text-gray-400">"{quotes[quoteIndex]}"</p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

