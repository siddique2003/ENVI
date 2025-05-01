"use client"

import { motion } from "framer-motion"

const RoboAnimation = () => {
  return (
    <div className="relative w-full h-full">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <div className="relative">
          <motion.div
            className="absolute -inset-4 bg-purple-500/20 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="w-32 h-32 text-purple-500"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <path d="M8 0a8 8 0 0 0-2.527 15.59c.4.075.547-.174.547-.388 0-.194-.008-.709-.014-1.391-2.226.47-2.694-1.07-2.694-1.07-.362-.923-.886-1.17-.886-1.17-.723-.493.055-.484.055-.484.799.056 1.219.82 1.219.82.692 1.179 1.814.838 2.258.642.071-.501.271-.838.492-1.032-1.575-.18-3.22-.79-3.22-3.51 0-.776.278-1.412.732-1.907-.073-.18-.317-.922.069-1.92 0 0 .595-.191 1.956.734.568-.158 1.167-.238 1.77-.238s1.202.08 1.77.238c1.362-.925 1.956-.734 1.956-.734.388.998.142 1.742.069 1.92.454.495.732 1.13.732 1.907 0 2.727-1.648 3.33-3.222 3.51.278.233.524.688.524 1.392 0 1.01-.008 1.826-.008 2.07 0 .216.147.464.55.387A8 8 0 0 0 8 0z"/>
          </motion.svg>
        </div>
      </motion.div>
    </div>
  )
}

export default RoboAnimation