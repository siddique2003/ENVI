"use client"
import { useEffect, useRef, useState } from "react"
import { useMousePosition } from "@/lib/hooks/use-mouse-position"

interface SparklesProps {
  id?: string
  background?: string
  minSize?: number
  maxSize?: number
  particleDensity?: number
  className?: string
  particleColor?: string
  darkMode?: boolean
}

export const SparklesCore = ({
  id = "tsparticles",
  background = "transparent",
  minSize = 0.3,
  maxSize = 1.5,
  particleDensity = 50,
  className = "h-full w-full",
  particleColor = "#FFFFFF",
  darkMode = false,
}: SparklesProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mousePosition = useMousePosition()
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 })
  
  useEffect(() => {
    if (typeof window === "undefined") return
    
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    let animationFrameId: number
    let particles: Particle[] = []
    let meteors: Meteor[] = []
    
    class Particle {
      x: number
      y: number
      size: number
      color: string
      brightness: number
      twinkleSpeed: number
      twinklePhase: number
      twinkleAmplitude: number
      
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        
        this.size = Math.random() * (maxSize - minSize) + minSize
        
        this.color = this.getStarColor()
        this.brightness = 0.5 + Math.random() * 0.5
        
        // Twinkle properties
        this.twinkleSpeed = 0.01 + Math.random() * 0.03
        this.twinklePhase = Math.random() * Math.PI * 2 // Random starting phase
        this.twinkleAmplitude = 0.3 + Math.random() * 0.4 // How much it twinkles
      }
      
      getStarColor() {
        // Different color palettes for dark and light modes
        if (darkMode) {
          const colors = [
            "255, 255, 255", // White
            "255, 250, 240", // Warm white
            "240, 248, 255", // Cold white
            "176, 224, 230", // Light blue
            "230, 230, 250", // Lavender
            "255, 240, 245", // Pink
            "240, 255, 240"  // Light green
          ]
          return colors[Math.floor(Math.random() * colors.length)]
        } else {
          // More visible colors for light mode
          const colors = [
            "70, 70, 70",    // Dark gray
            "60, 60, 90",    // Dark blue-gray
            "90, 60, 60",    // Dark red-gray
            "60, 90, 60",    // Dark green-gray
            "90, 60, 90",    // Dark purple
            "60, 80, 100",   // Slate blue
            "100, 60, 80"    // Burgundy
          ]
          return colors[Math.floor(Math.random() * colors.length)]
        }
      }
      
      update() {
        // Just update twinkle phase, no movement based on mouse
        this.twinklePhase += this.twinkleSpeed
        if (this.twinklePhase > Math.PI * 2) {
          this.twinklePhase -= Math.PI * 2
        }
      }
      
      draw() {
        // Calculate current brightness based on twinkle phase
        const currentBrightness = this.brightness * 
          (1 + Math.sin(this.twinklePhase) * this.twinkleAmplitude)
        
        // Smaller glow effect (reduced from *3 to *1.5)
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 1.5
        )
        
        gradient.addColorStop(0, `rgba(${this.color}, ${currentBrightness})`)
        gradient.addColorStop(0.5, `rgba(${this.color}, ${currentBrightness * 0.3})`)
        gradient.addColorStop(1, `rgba(${this.color}, 0)`)
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2)
        ctx.fill()
        
        // Star center
        ctx.fillStyle = `rgba(${this.color}, ${currentBrightness * 1.2})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        
        // Add subtle cross rays for prettier stars
        const rayLength = this.size * (1 + this.twinkleAmplitude * Math.sin(this.twinklePhase))
        ctx.strokeStyle = `rgba(${this.color}, ${currentBrightness * 0.7})`
        ctx.lineWidth = this.size * 0.2
        
        // Horizontal ray
        ctx.beginPath()
        ctx.moveTo(this.x - rayLength, this.y)
        ctx.lineTo(this.x + rayLength, this.y)
        ctx.stroke()
        
        // Vertical ray
        ctx.beginPath()
        ctx.moveTo(this.x, this.y - rayLength)
        ctx.lineTo(this.x, this.y + rayLength)
        ctx.stroke()
        
        // Diagonal rays (for bigger stars only)
        if (this.size > minSize * 1.5) {
          const diagonalRayLength = rayLength * 0.7
          
          ctx.beginPath()
          ctx.moveTo(this.x - diagonalRayLength * 0.7, this.y - diagonalRayLength * 0.7)
          ctx.lineTo(this.x + diagonalRayLength * 0.7, this.y + diagonalRayLength * 0.7)
          ctx.stroke()
          
          ctx.beginPath()
          ctx.moveTo(this.x - diagonalRayLength * 0.7, this.y + diagonalRayLength * 0.7)
          ctx.lineTo(this.x + diagonalRayLength * 0.7, this.y - diagonalRayLength * 0.7)
          ctx.stroke()
        }
      }
    }
    
    class Meteor {
      x: number
      y: number
      size: number
      speed: number
      angle: number
      tailLength: number
      opacity: number
      
      constructor() {
        // Fix meteor starting positions to be more distributed
        this.x = Math.random() * canvas.width * 1.5 - canvas.width * 0.25
        this.y = -50 - Math.random() * 100 // Vary starting heights
        this.size = Math.random() * 2 + 2
        this.speed = Math.random() * 5 + 3 // Increased speed range
        this.angle = Math.random() * Math.PI / 4 + Math.PI / 4 // Angled fall
        this.tailLength = Math.random() * 20 + 15 // Longer tails
        this.opacity = darkMode ? 0.8 : 0.6 // Lower opacity for light mode
      }
      
      update() {
        this.x += Math.cos(this.angle) * this.speed
        this.y += Math.sin(this.angle) * this.speed
        
        // Add a slight random movement
        this.x += (Math.random() - 0.5) * 0.5
      }
      
      draw() {
        // Create gradient for meteor tail
        const gradient = ctx.createLinearGradient(
          this.x, this.y,
          this.x - Math.cos(this.angle) * this.tailLength, 
          this.y - Math.sin(this.angle) * this.tailLength
        )
        
        if (darkMode) {
          gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`)
          gradient.addColorStop(1, `rgba(240, 240, 255, 0)`)
        } else {
          gradient.addColorStop(0, `rgba(70, 70, 70, ${this.opacity})`)
          gradient.addColorStop(1, `rgba(70, 70, 70, 0)`)
        }
        
        ctx.strokeStyle = gradient
        ctx.lineWidth = this.size
        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(
          this.x - Math.cos(this.angle) * this.tailLength, 
          this.y - Math.sin(this.angle) * this.tailLength
        )
        ctx.stroke()
      }
    }
    
    // Initialize particles
    const init = () => {
      particles = []
      meteors = []
      for (let i = 0; i < particleDensity; i++) {
        particles.push(new Particle())
      }
    }
    
    // Clear canvas initially
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return
      
      // Fade out previous frame with trails effect
      // Different fade for dark/light modes
      ctx.fillStyle = darkMode 
        ? 'rgba(0, 0, 0, 0.2)' 
        : 'rgba(255, 255, 255, 0.3)' // More opaque for light mode to fade faster
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Add new meteors periodically (adjusted frequency)
      if (Math.random() < 0.02) { // Reduced from 0.05 to make meteors less frequent
        meteors.push(new Meteor())
      }
      
      // Update and draw meteors
      meteors = meteors.filter(meteor => {
        meteor.update()
        meteor.draw()
        
        // Remove meteors that have left the canvas
        return !(meteor.y > canvas.height + 50 || 
                meteor.x < -50 || 
                meteor.x > canvas.width + 50)
      })
      
      // Update and draw particles
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })
      
      animationFrameId = requestAnimationFrame(animate)
    }
    
    init()
    animationFrameId = requestAnimationFrame(animate)
    
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
      init() // Reinitialize particles when resizing
    }
    
    window.addEventListener("resize", handleResize)
    
    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [maxSize, minSize, particleColor, particleDensity, darkMode])
  
  return (
    <canvas
      ref={canvasRef}
      id={id}
      style={{ background }}
      className={className}
      width={dimensions.width}
      height={dimensions.height}
    />
  )
}