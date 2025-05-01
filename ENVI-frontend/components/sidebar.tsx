"use client"

import { motion } from "framer-motion"
import { BarChart2, Settings, PieChart, TrendingUp, Database, Share2, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useCallback, useRef, useEffect } from "react"

const menuItems = [
  {
    title: "Analytics",
    icon: BarChart2,
    href: "/dashboard",
    description: "Overview & key metrics",
  },
  {
    title: "Data Trends",
    icon: TrendingUp,
    href: "/dashboard/trends",
    description: "Pattern analysis",
  },
  {
    title: "Visualizations",
    icon: PieChart,
    href: "/dashboard/visualizations",
    description: "Interactive charts",
  },
  {
    title: "Data Sources",
    icon: Database,
    href: "/dashboard/sources",
    description: "Manage connections",
  },
  {
    title: "Share & Export",
    icon: Share2,
    href: "/dashboard/share",
    description: "Collaboration tools",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    description: "Preferences",
  },
]

interface SidebarProps {
  onExpand: (expanded: boolean) => void
}

export function Sidebar({ onExpand }: SidebarProps) {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const expandTimeoutRef = useRef<NodeJS.Timeout>()
  const collapseTimeoutRef = useRef<NodeJS.Timeout>()
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    onExpand(isExpanded)
  }, [isExpanded, onExpand])

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    if (!sidebarRef.current) return
    const sidebarRect = sidebarRef.current.getBoundingClientRect()
    const mouseX = e.clientX - sidebarRect.left

    if (!isExpanded && mouseX > sidebarRect.width * 0.75) return

    clearTimeouts()
    expandTimeoutRef.current = setTimeout(() => setIsExpanded(true), 150)
  }, [isExpanded])

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    if (!sidebarRef.current) return

    const sidebarRect = sidebarRef.current.getBoundingClientRect()
    const mouseX = e.clientX
    const mouseY = e.clientY

    if (mouseX > sidebarRect.left && 
        mouseX < sidebarRect.right &&
        mouseY > sidebarRect.top && 
        mouseY < sidebarRect.bottom) return

    clearTimeouts()
    collapseTimeoutRef.current = setTimeout(() => setIsExpanded(false), 200)
  }, [])

  const clearTimeouts = () => {
    clearTimeout(expandTimeoutRef.current)
    clearTimeout(collapseTimeoutRef.current)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        ref={sidebarRef}
        initial="collapsed"
        animate={isExpanded ? "expanded" : "collapsed"}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        variants={{
          expanded: { width: 256 },
          collapsed: { width: 72 },
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="fixed left-0 top-16 z-20 flex h-[calc(100vh-64px)] flex-col border-r border-t border-foreground/10 bg-background/80 backdrop-blur-xl overflow-x-hidden"
      >
        <div className="flex flex-1 flex-col gap-2 p-3 relative overflow-hidden">
          <motion.div
            variants={{
              expanded: { opacity: 0 },
              collapsed: { opacity: 0.5 },
            }}
            transition={{ duration: 0.2 }}
            className="absolute right-2 top-3 text-muted-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.div>

          <nav className="flex-1 space-y-2 pt-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        "hover:bg-foreground/5",
                        isActive && "bg-foreground/5 text-purple-500",
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 rounded-lg border border-purple-500/50 bg-purple-500/10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <item.icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isActive ? "text-purple-500" : "text-muted-foreground group-hover:text-purple-500",
                        )}
                      />
                      <motion.span
                        variants={{
                          expanded: { opacity: 1, display: "block" },
                          collapsed: { opacity: 0, display: "none" },
                        }}
                        transition={{ duration: 0.2 }}
                        className="relative whitespace-nowrap"
                      >
                        {item.title}
                      </motion.span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-foreground/5 backdrop-blur-lg border-foreground/10">
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </nav>
        </div>

        <motion.div
          variants={{
            expanded: { opacity: 1, display: "block" },
            collapsed: { opacity: 0, display: "none" },
          }}
          transition={{ duration: 0.2 }}
          className="border-t border-foreground/10 p-4"
        >
          <div className="rounded-lg bg-foreground/5 p-3">
            <p className="text-xs text-muted-foreground">
              Need help with ENVI? Check out our{" "}
              <Link href="/docs" className="text-purple-500 hover:text-purple-400 hover:underline">
                documentation
              </Link>
              .
            </p>
          </div>
        </motion.div>
      </motion.aside>
    </TooltipProvider>
  )
}