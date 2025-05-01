"use client"

import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import type React from "react"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { DataManipulationPanel } from "@/components/data-manipulation-panel"
import {
  BarChart,
  PieChart,
  ScatterChartIcon as ScatterPlot,
  LineChart,
  GripHorizontal,
  X,
  AreaChart,
  LayoutGrid,
  Pencil,
  FlaskConical,
  SlidersHorizontal,
  SparklesIcon,
  Zap,
  MousePointerClick,
  LogOut,
} from "lucide-react"
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  ScatterChart,
  Scatter,
  Treemap,
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  AreaChart as RechartsAreaChart,
  Area,
} from "recharts"
import { aggregateData, processTimeSeriesData, type FieldConfig, type AggregationType } from "@/components/data-utils"
import { SparklesCore } from "@/components/sparkles"
import { Resizable } from "re-resizable"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import type { DropResult } from "@hello-pangea/dnd"
import type { DraggableProvided, DroppableProvided } from "@hello-pangea/dnd"
import { ThemeToggle } from "@/components/theme-toggle"

interface ColumnInfo {
  name: string
  type: "categorical" | "numerical" | "datetime" | "unknown"
}

interface ChartType {
  id: UniqueIdentifier
  type: "bar" | "pie" | "scatter" | "line" | "area" | "treemap" | "scorecard" | "filters"
  title: string
  icon: React.ReactNode
  instanceId?: number
  xKey?: string
  yKey?: string
  zKey?: string
  color?: string
  config?: {
    field: string
    aggregation: AggregationType
    format: "string" | "number" | "currency" | "percentage" | "date"
    drillThrough: boolean
    crossReport: boolean
    keepFilters: boolean
  }
  value?: number | string
  format?: "currency" | "number" | "percentage" | "date"
  position?: { x: number; y: number }
  size?: { width: number | string; height: number | string }
}

interface AISuggestion {
  id: string
  title: string
  type: ChartType["type"]
  description: string
  xKey: string
  yKey: string
  zKey?: string
}

interface ScorecardData {
  title: string
  value: string | number
  change?: number
  format?: "currency" | "number" | "percentage"
}

interface FilterConfig {
  type: "dropdown" | "time_range"
  field: string
  label: string
  options?: string[]
}

interface FieldSelectionProps {
  open: boolean
  onClose: () => void
  onConfirm: (fields: { xField?: string; yField: string }) => void
  availableFields: string[]
  chartType: string
  data: any[]
}

interface DialogOverlayProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

type ChartData = {
  charts?: Record<
    string,
    {
      type: string
      title?: string
      y: any[]
    }
  >
  length?: number
  [key: string]: any
}

type ProcessedChart = {
  id: string
  type: ChartType["type"]
  title: string
  xKey: string
  yKey: string
  instanceId: number
  color: string
  icon: React.ReactNode
  xData?: any[]
  yData?: any[]
  value?: number | string
  size?: { width: number | string; height: number | string }
  config: {
    field: string
    aggregation: AggregationType
    format: "string" | "number" | "currency" | "percentage" | "date"
    drillThrough: boolean
    crossReport: boolean
    keepFilters: boolean
  }
}

// Cyberpunk theme colors
const cyberpunkColors = {
  primary: "#FF00FF", // Magenta
  secondary: "#00FFFF", // Cyan
  accent1: "#FE53BB", // Pink
  accent2: "#F5D300", // Yellow
  accent3: "#08F7FE", // Blue
  dark1: "#2A0E61", // Dark Purple
  dark2: "#1A0B2E", // Darker Purple
  dark3: "#000B1E", // Almost Black
  light1: "#F8F7FF", // Almost White
  light2: "#EEEEFF", // Light Purple
  neon1: "#7DF9FF", // Electric Blue
  neon2: "#09FBD3", // Neon Green
  neon3: "#FE53BB", // Neon Pink
  neon4: "#F5D300", // Neon Yellow
  neon5: "#5E17EB", // Electric Purple
}

// Chart color palette that works in both light and dark modes
const chartColorPalette = [
  "url(#cyan-purple-gradient)",
  "url(#purple-blue-gradient)",
  "url(#cyan-blue-gradient)",
  "url(#blue-purple-gradient)",
  "#00DDFF", // Bright Cyan
  "#7DF9FF", // Electric Blue
  "#08F7FE", // Neon Blue
  "#5E17EB", // Electric Purple
  "#AA55FF", // Bright Purple
  "#00FFFF", // Cyan
]

const availableCharts: ChartType[] = [
  {
    id: "scorecard",
    type: "scorecard",
    title: "Scorecard",
    icon: <LayoutGrid className="w-6 h-6" />,
    color: cyberpunkColors.accent1,
  },
  {
    id: "bar-chart",
    type: "bar",
    title: "Bar Chart",
    icon: <BarChart className="w-6 h-6" />,
    color: cyberpunkColors.accent3,
  },
  {
    id: "line-chart",
    type: "line",
    title: "Line Chart",
    icon: <LineChart className="w-6 h-6" />,
    color: cyberpunkColors.accent2,
  },
  {
    id: "pie-chart",
    type: "pie",
    title: "Pie Chart",
    icon: <PieChart className="w-6 h-6" />,
    color: cyberpunkColors.neon2,
  },
  {
    id: "scatter-plot",
    type: "scatter",
    title: "Scatter Plot",
    icon: <ScatterPlot className="w-6 h-6" />,
    color: cyberpunkColors.neon5,
  },
  {
    id: "area-chart",
    type: "area",
    title: "Area Chart",
    icon: <AreaChart className="w-6 h-6" />,
    color: cyberpunkColors.primary,
  },
  {
    id: "treemap",
    type: "treemap",
    title: "Tree Map",
    icon: <LayoutGrid className="w-6 h-6" />,
    color: cyberpunkColors.secondary,
  },
  {
    id: "filters",
    type: "filters",
    title: "Filters Panel",
    icon: <SlidersHorizontal className="w-6 h-6" />,
    color: cyberpunkColors.neon4,
  },
]

const aiSuggestions: AISuggestion[] = [
  {
    id: "suggestion-1",
    title: "Sales by Region",
    type: "pie",
    description: "Distribution of sales across regions",
    xKey: "region",
    yKey: "sales",
  },
  {
    id: "suggestion-2",
    title: "Product Performance",
    type: "bar",
    description: "Revenue by product category",
    xKey: "product",
    yKey: "revenue",
  },
  {
    id: "suggestion-3",
    title: "Sales Trend",
    type: "line",
    description: "Monthly sales performance",
    xKey: "month",
    yKey: "sales",
  },
]

// Cyberpunk-themed Scorecards component
function Scorecards({ data }: { data: ScorecardData[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-6 py-4">
      {data.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="relative bg-white/10 dark:bg-black/40 backdrop-blur-sm rounded-lg p-4 flex flex-col justify-between 
                     shadow-[0_0_15px_rgba(0,255,255,0.15)] dark:shadow-[0_0_15px_rgba(255,0,255,0.2)] 
                     border border-gray-200 dark:border-purple-500/20 overflow-hidden group"
        >
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-500 dark:border-fuchsia-500 opacity-60"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-500 dark:border-fuchsia-500 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-cyan-500 dark:border-fuchsia-500 opacity-60"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan-500 dark:border-fuchsia-500 opacity-60"></div>

          {/* Animated highlight line */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 dark:via-fuchsia-500 to-transparent opacity-50 
                           animate-[scan_3s_ease-in-out_infinite]"
            ></div>
          </div>

          <span className="text-xs font-medium text-gray-400 dark:text-purple-300 z-10">{card.title}</span>
          <span className="mt-2 text-2xl font-bold text-cyan-500 dark:text-fuchsia-400 z-10 group-hover:text-cyan-400 dark:group-hover:text-fuchsia-300 transition-colors">
            {card.format === "currency" && "$"}
            {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
          </span>
          {card.change != null && (
            <span className={`mt-1 text-sm ${card.change > 0 ? "text-green-400" : "text-red-400"} z-10`}>
              {card.change > 0 ? "+" : ""}
              {card.change}%
            </span>
          )}
        </motion.div>
      ))}
    </div>
  )
}

// Cyberpunk-themed Filters Panel
function FiltersPanel({
  filters,
  onFilterChange,
}: {
  filters: FilterConfig[]
  onFilterChange: (field: string, value: any, type: "dropdown" | "time_range") => void
}) {
  return (
    <div className="space-y-4 overflow-y-auto max-h-96 pr-2 relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-fuchsia-500/5 rounded-lg"></div>

      {/* Digital circuit lines */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-[10%] left-0 w-full h-[1px] bg-cyan-400 dark:bg-fuchsia-400"></div>
        <div className="absolute top-[30%] left-0 w-[80%] h-[1px] bg-cyan-400 dark:bg-fuchsia-400"></div>
        <div className="absolute top-[70%] left-[20%] w-[80%] h-[1px] bg-cyan-400 dark:bg-fuchsia-400"></div>
        <div className="absolute top-0 left-[20%] w-[1px] h-[30%] bg-cyan-400 dark:bg-fuchsia-400"></div>
        <div className="absolute top-[30%] left-[80%] w-[1px] h-[40%] bg-cyan-400 dark:bg-fuchsia-400"></div>
        <div className="absolute top-[50%] left-[20%] w-[1px] h-[50%] bg-cyan-400 dark:bg-fuchsia-400"></div>
      </div>

      {filters.map((filter, i) => (
        <motion.div
          key={i}
          className="space-y-1 relative z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <label className="block text-xs font-medium text-gray-500 dark:text-purple-400 mb-1">{filter.label}</label>
          {filter.type === "dropdown" && (
            <select
              onChange={(e) => onFilterChange(filter.field, e.target.value, "dropdown")}
              className="w-full bg-white/20 dark:bg-black/30 p-1.5 rounded text-sm 
                         border border-gray-300 dark:border-purple-500/20 
                         focus:ring-cyan-500 dark:focus:ring-fuchsia-500 
                         focus:border-cyan-500 dark:focus:border-fuchsia-500
                         transition-all duration-300
                         hover:border-cyan-400 dark:hover:border-fuchsia-400"
            >
              <option value="">All</option>
              {filter.options
                ?.filter((opt) => opt != null && opt !== "")
                .map((opt, j) => (
                  <option key={j} value={opt}>
                    {opt}
                  </option>
                ))}
            </select>
          )}
          {filter.type === "time_range" && (
            <div className="space-y-1">
              <input
                type="date"
                placeholder="Start Date"
                onChange={(e) => onFilterChange(filter.field, { start: e.target.value }, "time_range")}
                className="w-full bg-white/20 dark:bg-black/30 p-1.5 rounded text-sm 
                           border border-gray-300 dark:border-purple-500/20 
                           focus:ring-cyan-500 dark:focus:ring-fuchsia-500 
                           focus:border-cyan-500 dark:focus:border-fuchsia-500
                           transition-all duration-300
                           hover:border-cyan-400 dark:hover:border-fuchsia-400"
              />
              <input
                type="date"
                placeholder="End Date"
                onChange={(e) => onFilterChange(filter.field, { end: e.target.value }, "time_range")}
                className="w-full bg-white/20 dark:bg-black/30 p-1.5 rounded text-sm 
                           border border-gray-300 dark:border-purple-500/20 
                           focus:ring-cyan-500 dark:focus:ring-fuchsia-500 
                           focus:border-cyan-500 dark:focus:border-fuchsia-500
                           transition-all duration-300
                           hover:border-cyan-400 dark:hover:border-fuchsia-400"
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

// Cyberpunk-themed Draggable Chart
function DraggableChart({ chart }: { chart: ChartType }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: chart.id })
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="relative p-3 bg-white/10 dark:bg-black/40 backdrop-blur-sm rounded-lg flex items-center gap-3 cursor-move 
                 border border-gray-200 dark:border-purple-500/20 
                 hover:bg-cyan-500/10 dark:hover:bg-fuchsia-500/10 transition-colors
                 text-gray-700 dark:text-purple-300 hover:text-gray-900 dark:hover:text-purple-200
                 group overflow-hidden"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated highlight */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 dark:via-cyan-500/10 to-transparent 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                     translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
      ></div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/40 dark:border-cyan-500/40"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/40 dark:border-cyan-500/40"></div>

      <GripHorizontal className="w-4 h-4 opacity-50 group-hover:text-cyan-400 dark:group-hover:text-fuchsia-400 transition-colors" />
      <div className="text-cyan-500 dark:text-cyan-500 group-hover:text-cyan-400 dark:group-hover:text-cyan-400 transition-colors">
        {chart.icon}
      </div>
      <span className="text-sm text-gray-700 dark:text-cyan-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
        {chart.title}
      </span>
    </motion.div>
  )
}

function PageTabs({
  pages,
  activePage,
  onPageChange,
  onAddPage,
  onDeletePage,
  onRenamePage,
  onHypothesisTesting,
}: {
  pages: Record<number, string>
  activePage: number
  onPageChange: (page: number) => void
  onAddPage: () => void
  onDeletePage: (page: number) => void
  onRenamePage: (page: number, name: string) => void
  onHypothesisTesting: () => void
}) {
  const [editingPage, setEditingPage] = useState<number | null>(null)
  const [editName, setEditName] = useState("")

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/10 dark:bg-black/40 backdrop-blur-lg border-t border-gray-200 dark:border-purple-500/20 p-2 z-50 transition-colors">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {Object.entries(pages).map(([pageNum, pageName]) => (
            <div
              key={pageNum}
              className={`relative group ${
                Number(pageNum) === activePage
                  ? "bg-cyan-100/50 dark:bg-fuchsia-500/20"
                  : "hover:bg-cyan-100/30 dark:hover:bg-fuchsia-500/10"
              } rounded-md transition-colors`}
            >
              {editingPage === Number(pageNum) ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => {
                    if (editName.trim()) {
                      onRenamePage(Number(pageNum), editName.trim())
                    }
                    setEditingPage(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && editName.trim()) {
                      onRenamePage(Number(pageNum), editName.trim())
                      setEditingPage(null)
                    }
                  }}
                  className="bg-transparent border-none focus:outline-none px-3 py-1 text-gray-800 dark:text-purple-100 transition-colors"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onPageChange(Number(pageNum))}
                    className="px-3 py-1 text-gray-700 dark:text-purple-200 transition-colors"
                  >
                    {pageName}
                  </button>
                  <button
                    onClick={() => {
                      setEditingPage(Number(pageNum))
                      setEditName(pageName)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-cyan-600 dark:hover:text-fuchsia-300"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              )}
              {Object.keys(pages).length > 1 && (
                <button
                  onClick={() => onDeletePage(Number(pageNum))}
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-500/20 p-1 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-red-500 dark:text-red-300" />
                </button>
              )}
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddPage}
            className="text-gray-700 dark:text-purple-300 hover:text-cyan-600 dark:hover:text-fuchsia-300 hover:bg-cyan-100/30 dark:hover:bg-fuchsia-500/20 transition-colors"
          >
            + New Page
          </Button>
        </div>

        {/* Hypothesis Testing Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onHypothesisTesting}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 
            text-white rounded-lg flex items-center gap-2 shadow-lg 
            hover:shadow-cyan-500/30 dark:hover:shadow-purple-500/30 
            transition-all duration-300 px-4 py-2 relative overflow-hidden group"
          >
            {/* Animated particles */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
              <div className="absolute h-1 w-1 bg-white rounded-full top-[20%] left-[10%] animate-pulse"></div>
              <div
                className="absolute h-1 w-1 bg-white rounded-full top-[60%] left-[15%] animate-pulse"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute h-1 w-1 bg-white rounded-full top-[40%] left-[80%] animate-pulse"
                style={{ animationDelay: "0.3s" }}
              ></div>
              <div
                className="absolute h-1 w-1 bg-white rounded-full top-[70%] left-[70%] animate-pulse"
                style={{ animationDelay: "0.7s" }}
              ></div>
            </div>

            <FlaskConical className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Hypothesis Testing</span>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

const DialogOverlay: React.FC<DialogOverlayProps> = ({ open, onClose, children }) => {
  if (!open) return null

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {children}
        </motion.div>
      </div>
    </>
  )
}

const FieldSelectionDialog: React.FC<FieldSelectionProps> = ({
  open,
  onClose,
  onConfirm,
  availableFields,
  chartType,
  data,
}) => {
  const [selectedYField, setSelectedYField] = useState("")
  const [selectedXField, setSelectedXField] = useState("")

  useEffect(() => {
    if (open) {
      setSelectedYField("")
      setSelectedXField("")
    }
  }, [open])

  const numericalFields = availableFields.filter((field) => {
    const sampleValue = data.find((item) => item[field] != null)?.[field]
    return typeof sampleValue === "number"
  })

  const handleConfirm = () => {
    if (chartType === "scorecard") {
      onConfirm({ yField: selectedYField })
    } else {
      onConfirm({ xField: selectedXField, yField: selectedYField })
    }
    onClose()
  }

  return (
    <DialogOverlay open={open} onClose={onClose}>
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg p-6 w-96 space-y-4 border border-cyan-200 dark:border-fuchsia-500/30 shadow-lg shadow-cyan-500/20 dark:shadow-fuchsia-500/20 relative overflow-hidden">
        {/* Background circuit pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-[20%] left-0 w-full h-[1px] bg-cyan-400 dark:bg-fuchsia-400"></div>
          <div className="absolute top-[60%] left-0 w-[60%] h-[1px] bg-cyan-400 dark:bg-fuchsia-400"></div>
          <div className="absolute top-0 left-[30%] w-[1px] h-[20%] bg-cyan-400 dark:bg-fuchsia-400"></div>
          <div className="absolute top-[20%] left-[30%] w-[1px] h-[40%] bg-cyan-400 dark:bg-fuchsia-400"></div>
          <div className="absolute top-[60%] left-[60%] w-[1px] h-[40%] bg-cyan-400 dark:bg-fuchsia-400"></div>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 dark:text-fuchsia-200 relative z-10 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-cyan-500 dark:text-fuchsia-400" />
          Configure {chartType}
        </h2>

        {chartType === "scorecard" ? (
          <div className="space-y-4 relative z-10">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-fuchsia-200">
                Value Field (Numerical)
              </label>
              <select
                value={selectedYField}
                onChange={(e) => setSelectedYField(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 border-cyan-200 dark:border-fuchsia-500/30 
                           focus:ring-cyan-500 dark:focus:ring-fuchsia-500 focus:border-cyan-500 dark:focus:border-fuchsia-500"
              >
                <option value="">Select a field</option>
                {numericalFields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-fuchsia-200">X-Axis Field</label>
              <select
                value={selectedXField}
                onChange={(e) => setSelectedXField(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 border-cyan-200 dark:border-fuchsia-500/30 
                           focus:ring-cyan-500 dark:focus:ring-fuchsia-500 focus:border-cyan-500 dark:focus:border-fuchsia-500"
              >
                <option value="">Select a field</option>
                {availableFields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-fuchsia-200">
                Y-Axis Field (Numerical)
              </label>
              <select
                value={selectedYField}
                onChange={(e) => setSelectedYField(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 border-cyan-200 dark:border-fuchsia-500/30 
                           focus:ring-cyan-500 dark:focus:ring-fuchsia-500 focus:border-cyan-500 dark:focus:border-fuchsia-500"
              >
                <option value="">Select a field</option>
                {numericalFields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 relative z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-4 py-2 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                       text-gray-700 dark:text-gray-200 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConfirm}
            disabled={chartType === "scorecard" ? !selectedYField : !selectedXField || !selectedYField}
            className="px-4 py-2 text-sm rounded bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white 
                       hover:from-cyan-600 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-all duration-300 shadow-md hover:shadow-cyan-500/20 dark:hover:shadow-fuchsia-500/20"
          >
            Confirm
          </motion.button>
        </div>
      </div>
    </DialogOverlay>
  )
}

const EditableTitle = ({ initialTitle, onSave }: { initialTitle: string; onSave: (newTitle: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTitle(initialTitle)
  }, [initialTitle])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    setIsEditing(false)
    if (title.trim() !== initialTitle && title.trim() !== "") {
      onSave(title.trim())
    } else {
      setTitle(initialTitle)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setIsEditing(false)
      setTitle(initialTitle)
    }
  }

  return (
    <div className="flex-grow min-w-0" onClick={() => !isEditing && setIsEditing(true)}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-b border-cyan-500 dark:border-fuchsia-500 focus:outline-none w-full text-sm font-medium text-gray-900 dark:text-white"
        />
      ) : (
        <span
          className="text-sm font-medium text-gray-900 dark:text-white whitespace-normal break-words leading-tight cursor-pointer hover:text-cyan-600 dark:hover:text-fuchsia-400 transition-colors"
          title={title}
        >
          {title}
        </span>
      )}
    </div>
  )
}

export default function Visualization() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [showFieldDialog, setShowFieldDialog] = useState(false)
  const [activeChartType, setActiveChartType] = useState<string | null>(null)
  const [availableFields, setAvailableFields] = useState<string[]>([])
  const [activePage, setActivePage] = useState<number>(1)
  const [pageCharts, setPageCharts] = useState<Record<number, ProcessedChart[]>>({ 1: [] })
  const [fieldConfigs, setFieldConfigs] = useState<Record<string, FieldConfig>>({})
  const [pages, setPages] = useState<Record<number, string>>({ 1: "Page 1" })
  const [isAutomated, setIsAutomated] = useState(false)
  const [scorecards, setScorecards] = useState<ScorecardData[]>([])
  const [filtersConfig, setFiltersConfig] = useState<FilterConfig[]>([])
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [editingChartTitle, setEditingChartTitle] = useState<number | null>(null)
  const [chartTitle, setChartTitle] = useState("")
  const [columnInfo, setColumnInfo] = useState<ColumnInfo[]>([])
  const [selectedChartInstanceId, setSelectedChartInstanceId] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [dashboardRef] = useState(useRef<HTMLDivElement>(null)) // Initialize here

  // All useEffect hooks must be at the top level
  useEffect(() => {
    setMounted(true)
  }, [])

  // Mouse follow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  // Move the glitch effect useEffect here
  useEffect(() => {
    const triggerGlitch = () => {
      const glitchElements = document.querySelectorAll(".glitch-trigger")
      const randomElement = glitchElements[Math.floor(Math.random() * glitchElements.length)]
      if (randomElement) {
        randomElement.classList.add("glitch-active")
        setTimeout(() => {
          randomElement.classList.remove("glitch-active")
        }, 500)
      }
    }

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance to trigger
        triggerGlitch()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Mouse follow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const handleExport = async () => {
    if (!dashboardRef.current) return

    const dashboardElement = dashboardRef.current

    const canvas = await html2canvas(dashboardElement, {
      scale: 2, // sharpness
      useCORS: true, // if you have external images/fonts
      scrollY: -window.scrollY, // fix scrolling cutting issues
      windowHeight: dashboardElement.scrollHeight, // capture full height
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Resize image to fit A4
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
    pdf.save("dashboard.pdf")
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const { setNodeRef: setDroppableRef } = useDroppable({ id: "canvas" })

  const getColor = (index: number) => {
    return chartColorPalette[index % chartColorPalette.length]
  }

  const smartAggregate = (data: any[], xKey: string, yKey: string) => {
    const aggregated = aggregateData(data, xKey, yKey, "sum")

    if (aggregated.length > 8) {
      const mainValues = aggregated.slice(0, 7)
      const otherValueSum = aggregated.slice(7).reduce((acc, curr) => acc + (curr[yKey] || 0), 0)

      const otherEntry = {
        [xKey]: "Other",
        [yKey]: otherValueSum,
      }

      return [...mainValues, otherEntry]
    }
    return aggregated
  }

  function chartDataToUnifiedArray(charts: any): any[] {
    const best = charts.best_chart
    if (!best) return []

    return best.x.map((xVal: any, i: number) => ({
      name: xVal,
      value: best.y[i],
    }))
  }

  const convertChartData = (key: string, chart: any, index: number): ProcessedChart => {
    // Directly use keys from backend chart data
    const xKey = chart.xKey
    const yKey = chart.yKey // Will be null for pie charts, handled later

    // DEBUG: Log the type received from backend for this specific chart key
    console.log(`convertChartData processing chart key: ${key}, received type: ${chart.type}`)

    return {
      id: key,
      type: chart.type as ChartType["type"],
      title: chart.title
        ? // remove trailing " (ANOVA)" (with any whitespace in front), case-insensitive
          chart.title.replace(/\s*$$ANOVA$$$/i, "")
        : key.replace(/_/g, " "),
      xKey: xKey, // Use backend provided xKey directl
      yKey: yKey, // Use backend provided yKey directly (can be null)
      xData: chart.x,
      yData: chart.y,
      instanceId: Date.now() + index,
      color: getColor(index),
      icon: availableCharts.find((c) => c.type === chart.type)?.icon || <LayoutGrid className="w-6 h-6" />,
      config: {
        // Use yKey for field config, default to "value" only if yKey is truly missing/null?
        // Or maybe field should just be the yKey itself, even if null?
        // Let's stick with yKey for now, panel logic filters nulls.
        field: yKey,
        aggregation: "sum",
        format: typeof chart.y?.[0] === "number" ? "number" : "string",
        drillThrough: false,
        crossReport: false,
        keepFilters: false,
      },
    }
  }

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
      const hasAuthCookie = document.cookie.includes("isLoggedIn=true")

      if (!isLoggedIn || !hasAuthCookie) {
        router.replace("/login")
        return
      }

      const savedData = localStorage.getItem("visualizationData")
      if (savedData) {
        const parsed = JSON.parse(savedData)

        if (parsed.cleaned_columns && parsed.preview) {
          setData(parsed.preview)
          const backendFields = parsed.column_types
            ? parsed.column_types.map((info: ColumnInfo) => info.name)
            : parsed.cleaned_columns
          setAvailableFields(backendFields)

          if (parsed.column_types) {
            setColumnInfo(parsed.column_types as ColumnInfo[])
            initializeFieldConfigs(parsed.column_types)
          } else {
            const inferredColumnTypes = backendFields.map((name: string) => ({
              name,
              type:
                parsed.preview.length > 0 && typeof parsed.preview[0]?.[name] === "number"
                  ? ("numerical" as const)
                  : ("categorical" as const),
            }))
            setColumnInfo(inferredColumnTypes)
            initializeFieldConfigs(inferredColumnTypes)
          }
          setIsAutomated(false)
        } else if (parsed.charts) {
          setIsAutomated(true)

          if (parsed.original_data && Array.isArray(parsed.original_data) && parsed.original_data.length > 0) {
            setData(parsed.original_data)
            const fields = Object.keys(parsed.original_data[0] || {})
            setAvailableFields(fields)
            const fieldInfo = fields.map((f) => ({
              name: f,
              type:
                typeof parsed.original_data[0]?.[f] === "number" ? ("numerical" as const) : ("categorical" as const),
            }))
            setColumnInfo(fieldInfo)
            initializeFieldConfigs(fieldInfo)

            const allCharts = Object.entries(parsed.charts).map(([key, chart]: [string, any], index: number) =>
              convertChartData(key, chart, index),
            )
            setPageCharts({ 1: allCharts })
          } else {
            console.warn(
              "Automated flow: original_data missing or empty in localStorage. Attempting to use chart data directly.",
            )

            const allCharts = Object.entries(parsed.charts).map(([key, chart]: [string, any], index: number) =>
              convertChartData(key, chart, index),
            )
            setPageCharts({ 1: allCharts })

            const unifiedData = chartDataToUnifiedArray(parsed.charts)
            if (unifiedData.length > 0) {
              setData(unifiedData)
              const fallbackFields = Object.keys(unifiedData[0])
              setAvailableFields(fallbackFields)
              const fallbackFieldInfo = fallbackFields.map((f) => ({
                name: f,
                type: typeof unifiedData[0]?.[f] === "number" ? ("numerical" as const) : ("categorical" as const),
              }))
              setColumnInfo(fallbackFieldInfo)
              initializeFieldConfigs(fallbackFieldInfo)
            } else {
              console.error("Could not derive usable data from charts object.")
            }
          }
        } else if (Array.isArray(parsed) && parsed.length > 0) {
          setData(parsed)
          const fields = Object.keys(parsed[0] || {})
          setAvailableFields(fields)
          const fieldInfo = fields.map((f) => ({
            name: f,
            type: typeof parsed[0]?.[f] === "number" ? ("numerical" as const) : ("categorical" as const),
          }))
          setColumnInfo(fieldInfo)
          initializeFieldConfigs(fieldInfo)
        }
      }
    }

    if (mounted) {
      checkAuth()
    }
  }, [mounted, router])

  // Compute a few example KPIs whenever `data` changes
  useEffect(() => {
    // getFilteredData() applies whatever dropdown/date filters you've set
    const filtered = getFilteredData()

    // 1) Total amount
    const totalAmount = filtered.reduce((acc, row) => acc + Number(row.amount || 0), 0)
    // 2) Average amount
    const avgAmount = filtered.length ? totalAmount / filtered.length : 0
    // 3) Number of orders
    const ordersCount = filtered.length
    // 4) Unique customers
    const uniqueCustomers = new Set(filtered.map((r) => r.customername)).size

    setScorecards([
      { title: "Total Amount", value: totalAmount, format: "currency" },
      { title: "Avg Amount", value: avgAmount.toFixed(2), format: "number" },
      { title: "Orders Count", value: ordersCount, format: "number" },
      { title: "Unique Cust.", value: uniqueCustomers, format: "number" },
    ])
  }, [data, activeFilters])

  useEffect(() => {
    if (columnInfo.length > 0) {
      const filtersList: FilterConfig[] = columnInfo
        .filter((info) => info.type === "categorical" || info.type === "datetime")
        .map((info) => {
          if (info.type === "datetime") {
            return {
              type: "time_range",
              field: info.name,
              label: info.name,
            }
          } else {
            const uniqueVals = Array.from(new Set(data.map((d) => d[info.name]))).filter((v) => v != null && v !== "")
            return {
              type: "dropdown",
              field: info.name,
              label: info.name,
              options: uniqueVals.map((v) => String(v)),
            }
          }
        })
      setFiltersConfig(filtersList)
    }
  }, [columnInfo, data])

  const initializeFieldConfigs = (colsInfo: ColumnInfo[]) => {
    const configs: Record<string, FieldConfig> = {}
    colsInfo.forEach((info) => {
      configs[info.name] = {
        field: info.name,
        aggregation: info.type === "numerical" ? "sum" : "none",
        format: info.type === "numerical" ? "number" : info.type === "datetime" ? "date" : "string",
        drillThrough: false,
        crossReport: false,
        keepFilters: false,
      }
    })
    setFieldConfigs(configs)
  }
  const handleConfigChange = (newConfig: Record<string, FieldConfig>) => {
    // Update the global state (still useful for the panel maybe)
    setFieldConfigs(newConfig)

    // Update pageCharts directly using newConfig, not relying on fieldConfigs state
    setPageCharts((prev) => {
      // Pass the updater function to setPageCharts
      const updated = { ...prev }
      Object.keys(updated).forEach((page) => {
        // Add explicit type annotation here
        updated[+page] = updated[+page].map((chart: ProcessedChart) => {
          // Use the newConfig passed into the outer function directly
          const yConfig = newConfig[chart.yKey || "value"]
          if (!yConfig) return chart

          return {
            ...chart,
            config: {
              ...chart.config,
              field: yConfig.field,
              aggregation: yConfig.aggregation || "sum", // Get aggregation directly from newConfig
              format: yConfig.format || "number",
              drillThrough: yConfig.drillThrough || false,
              crossReport: yConfig.crossReport || false,
              keepFilters: yConfig.keepFilters || false,
            },
          }
        })
      })
      return updated // Return the newly calculated state
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active } = event

    if (active) {
      const chart = availableCharts.find((c) => c.id === active.id)
      const aiSuggestion = aiSuggestions.find((s) => s.id === active.id)

      if (aiSuggestion) {
        addChartToPage({
          ...availableCharts.find((c) => c.type === aiSuggestion.type)!,
          instanceId: Date.now(),
          xKey: aiSuggestion.xKey,
          yKey: aiSuggestion.yKey,
          color: getColor(Math.random() * 100),
          config: {
            field: aiSuggestion.yKey,
            aggregation: "sum",
            format: "number",
            drillThrough: false,
            crossReport: false,
            keepFilters: false,
          },
        })
      } else if (chart) {
        console.log("Opening field selection dialog, availableFields:", availableFields)
        setActiveChartType(chart.type)
        setShowFieldDialog(true)
      }
    }
  }

  const addChartToPage = (chartInput: ChartType & { xKey?: string; yKey?: string }) => {
    const newChart: ProcessedChart = {
      // Ensure ID is a string
      id: String(chartInput.id),
      type: chartInput.type,
      title: chartInput.title,
      // Ensure keys are strings, even if empty (needed by ProcessedChart)
      xKey: chartInput.xKey || "",
      yKey: chartInput.yKey || "",
      // xData/yData will be undefined for manually added charts, processChartData handles this
      instanceId: chartInput.instanceId || Date.now(),
      color: chartInput.color || getColor(Math.random() * 100),
      icon: chartInput.icon,
      value: chartInput.value, // Optional value from ChartType
      size: chartInput.size,
      config: chartInput.config || {
        // Default config if needed
        field: chartInput.yKey || "",
        aggregation: "sum",
        format: "number",
        drillThrough: false,
        crossReport: false,
        keepFilters: false,
      },
    }

    setPageCharts((prev) => ({
      ...prev,
      [activePage]: [...(prev[activePage] || []), newChart], // Add the well-formed ProcessedChart
    }))
  }

  const deleteChart = (instanceId: number) => {
    setPageCharts((prev) => ({
      ...prev,
      [activePage]: prev[activePage].filter((c) => c.instanceId !== instanceId),
    }))
  }

  const handleFilterChange = (field: string, value: any, type: "dropdown" | "time_range") => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev }
      if (type === "time_range") {
        const currentRange = newFilters[field] || {}
        newFilters[field] = { ...currentRange, ...value }
        if (!newFilters[field].start && !newFilters[field].end) {
          delete newFilters[field]
        }
      } else {
        if (value === "" || value === null) {
          delete newFilters[field]
        } else {
          newFilters[field] = value
        }
      }
      return newFilters
    })
  }

  const getFilteredData = () => {
    return data.filter((item) => {
      return Object.entries(activeFilters).every(([field, value]) => {
        if (!value) return true
        if (item[field] === undefined || item[field] === null) return false

        const columnType = columnInfo.find((c) => c.name === field)?.type

        if (columnType === "datetime") {
          const { start, end } = value
          const itemDate = new Date(item[field])
          if (isNaN(itemDate.getTime())) return false

          const startDate = start ? new Date(start) : null
          const endDate = end ? new Date(end) : null

          if (endDate) endDate.setHours(23, 59, 59, 999)

          if (startDate && itemDate < startDate) return false
          if (endDate && itemDate > endDate) return false
          return true
        } else {
          return String(item[field]) === String(value)
        }
      })
    })
  }

  const processChartData = (chart: ProcessedChart, formatForTreemap = false) => {
    // Special handling for scatter plots: use raw xData/yData directly
    if (chart.type === "scatter" && chart.xData && chart.yData && chart.xKey && chart.yKey) {
      console.log(`Processing scatter plot '${chart.title}' directly from xData/yData.`)
      // Ensure lengths match before zipping
      const maxLength = Math.min(chart.xData.length, chart.yData.length)
      const scatterData = chart.xData.slice(0, maxLength).map((xVal, index) => ({
        [chart.xKey!]: xVal,
        [chart.yKey!]: chart.yData![index],
      }))
      return scatterData
    }

    if (!chart.xKey || !chart.yKey) return [] // Return early if keys are missing for non-scatter

    const filteredData = getFilteredData()
    const aggregation = chart.config?.aggregation || "sum"

    // DEBUG: Log the aggregation type being used for this chart
    console.log(`Processing chart '${chart.title}' (ID: ${chart.instanceId}) with aggregation: ${aggregation}`)

    if (chart.type === "scorecard") {
      const value = filteredData.reduce((acc: number, curr: any) => {
        return acc + (Number(curr[chart.yKey!]) || 0)
      }, 0)
      chart.value = value
      return [{ [chart.yKey]: value }]
    }

    let processedData
    if (chart.type === "pie") {
      processedData = smartAggregate(filteredData, chart.xKey, chart.yKey)
    } else if (chart.type === "line" || chart.type === "area") {
      // Use the correct processTimeSeriesData function if available, or fallback
      if (typeof processTimeSeriesData === "function") {
        processedData = processTimeSeriesData(filteredData, chart.xKey, chart.yKey, aggregation)
      } else {
        console.warn("'processTimeSeriesData' not found, using 'aggregateData' as fallback for line/area.")
        processedData = aggregateData(filteredData, chart.xKey, chart.yKey, aggregation)
      }
    } else {
      // This block now handles 'bar' and any other non-scatter, non-pie, non-line/area types
      processedData = aggregateData(filteredData, chart.xKey, chart.yKey, aggregation)
    }

    if (formatForTreemap) {
      return processedData.map((item) => ({
        name: item[chart.xKey!],
        value: item[chart.yKey!],
      }))
    }

    return processedData
  }

  const handleChartTypeChange = (instanceId: number, newType: ChartType["type"]) => {
    setPageCharts((prevData) => {
      const updatedPages = { ...prevData }
      const currentPageCharts = updatedPages[activePage] || []
      const chartIndex = currentPageCharts.findIndex((c) => c.instanceId === instanceId)

      if (chartIndex !== -1) {
        const newChartDefinition = availableCharts.find((ac) => ac.type === newType)
        if (newChartDefinition) {
          const currentChart = currentPageCharts[chartIndex]
          const updatedChart = {
            ...currentChart,
            type: newType,
            icon: newChartDefinition.icon,
            color: newChartDefinition.color || getColor(chartIndex), // Use default color if needed
          }
          // Directly update the chart in the array for the current page
          updatedPages[activePage] = currentPageCharts.map((chart) =>
            chart.instanceId === instanceId ? updatedChart : chart,
          )
        }
      }
      return updatedPages
    })
  }

  const renderChart = (
    chart: ProcessedChart,
    handleChartTypeChange: (instanceId: number, newType: ChartType["type"]) => void,
  ) => {
    const displayTitle = chart.title.replace(/^Column Chart:\s*/i, "")
    const { theme } = useTheme()
    const data = processChartData(chart, chart.type === "treemap") // Pass treemap flag
    const textColor = resolvedTheme === "dark" ? "#fff" : "#000"
    const gridColor = resolvedTheme === "dark" ? "#ffffff20" : "#00000020"

    // Find the definition for the current chart type (needed for icon/color)
    const chartDefinition = availableCharts.find((ac) => ac.type === chart.type)
    const compatibleChartTypes = availableCharts // Allow all types for now

    // Special case for filters panel
    if (chart.type === "filters") {
      return (
        <div className="h-full w-full flex flex-col">
          <div className="flex-grow overflow-auto p-4">
            <FiltersPanel filters={filtersConfig} onFilterChange={handleFilterChange} />
          </div>
        </div>
      )
    }

    // Main chart card structure
    return (
      <div
        key={chart.instanceId} // Use instanceId for key
        className="bg-white/5 dark:bg-black/20 rounded-lg shadow-lg border border-gray-200 dark:border-purple-500/10 relative flex flex-col group h-full w-full overflow-hidden" // Added h-full/w-full
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-fuchsia-500/5 pointer-events-none"></div>

        {/* Digital circuit lines */}
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute top-[20%] left-0 w-full h-[1px] bg-cyan-400 dark:bg-fuchsia-400"></div>
          <div className="absolute top-[60%] left-0 w-[80%] h-[1px] bg-cyan-400 dark:bg-fuchsia-400"></div>
          <div className="absolute top-0 left-[30%] w-[1px] h-[20%] bg-cyan-400 dark:bg-fuchsia-400"></div>
          <div className="absolute top-[20%] left-[30%] w-[1px] h-[40%] bg-cyan-400 dark:bg-fuchsia-400"></div>
          <div className="absolute top-[60%] left-[80%] w-[1px] h-[40%] bg-cyan-400 dark:bg-fuchsia-400"></div>
        </div>

        {/* Chart Header */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-purple-500/10 min-h-[40px] relative z-10">
          {/* Title container: Takes available space, shrinks, truncates */}
          <div className="flex items-center gap-2 flex-1 flex-shrink min-w-0 mr-2">
            <span className="text-cyan-500 dark:text-fuchsia-500 flex-shrink-0">{chart.icon}</span>
            <EditableTitle
              initialTitle={displayTitle}
              onSave={(newTitle) => handleChartTitleEdit(chart.instanceId, newTitle)}
            />
          </div>

          {/* Dropdown container: Doesn't shrink */}
          <div className="flex-shrink-0 ml-2">
            <select
              value={chart.type}
              onChange={(e) => handleChartTypeChange(chart.instanceId, e.target.value as ChartType["type"])}
              className={`bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs 
                          focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:focus:ring-fuchsia-500 
                          ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              style={{ maxWidth: "120px" }}
            >
              {compatibleChartTypes.map((availableChart) => (
                <option key={availableChart.id} value={availableChart.type}>
                  {availableChart.title}
                </option>
              ))}
            </select>
          </div>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 z-10"
            onClick={() => deleteChart(chart.instanceId)}
            aria-label="Delete chart"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Chart Body */}
        <div className="flex-grow p-2 overflow-visible relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            {/* Conditional Rendering Logic based on chart.type */}
            {chart.type === "scorecard" &&
              (() => {
                const displayValue = chart.value ?? data?.[0]?.[chart.yKey] ?? "N/A"
                return (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-sm text-gray-500 dark:text-purple-300 mb-1">{chart.title}</div>
                      <div className={`text-4xl font-bold text-cyan-600 dark:text-fuchsia-400`}>
                        {typeof displayValue === "number" ? displayValue.toLocaleString() : displayValue}
                      </div>
                    </div>
                  </div>
                )
              })()}

            {chart.type === "bar" &&
              Array.isArray(data) &&
              data.length > 0 &&
              (() => {
                // 1) Make a sorted copy
                const sorted = [...data].sort((a, b) => (b[chart.yKey!] as number) - (a[chart.yKey!] as number))

                return (
                  <RechartsBarChart
                    data={sorted}
                    // 2) bump bottom margin so rotated labels aren’t cut
                    margin={{ top: 5, right: 5, left: 5, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="cyan-purple-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00DDFF" stopOpacity={0.9} />
                        <stop offset="95%" stopoffset="95%" stopColor="#AA55FF" stopOpacity={0.9} />
                      </linearGradient>
                      <linearGradient id="purple-blue-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#AA55FF" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#08F7FE" stopOpacity={0.9} />
                      </linearGradient>
                      <linearGradient id="cyan-blue-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#0088FF" stopOpacity={0.9} />
                      </linearGradient>
                      <linearGradient id="blue-purple-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#08F7FE" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#5E17EB" stopOpacity={0.9} />
                      </linearGradient>
                      <radialGradient id="cyan-radial" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#00FFFF" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#00DDFF" stopOpacity={0.7} />
                      </radialGradient>
                      <radialGradient id="purple-radial" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#AA55FF" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#5E17EB" stopOpacity={0.7} />
                      </radialGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />

                    <XAxis
                      dataKey={chart.xKey}
                      stroke={textColor}
                      fontSize={10}
                      tick={{ fill: textColor }}
                      // 3) force every tick, rotate them
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      // height to accommodate the slanted labels
                      height={60}
                    />

                    <YAxis stroke={textColor} fontSize={10} tick={{ fill: textColor }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: resolvedTheme === "dark" ? "#1F2937" : "#FFFFFF",
                        border: "1px solid #4B5563",
                      }}
                      itemStyle={{ color: resolvedTheme === "dark" ? "#D1D5DB" : "#1F2937" }}
                    />

                    <Bar
                      dataKey={chart.yKey}
                      fill={chart.color || "url(#cyan-purple-gradient)"}
                      radius={[4, 4, 0, 0]}
                      minPointSize={2}
                    >
                      {/* 4) map over the sorted array, not the old data */}
                      {sorted.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColor(index)} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                )
              })()}

            {chart.type === "line" && Array.isArray(data) && data.length > 0 && (
              <RechartsLineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey={chart.xKey}
                  stroke={textColor}
                  tick={{ fill: textColor, fontSize: 10 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  tickFormatter={(val) =>
                    new Date(val).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                    })
                  }
                />
                <YAxis stroke={textColor} fontSize={10} tick={{ fill: textColor }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: resolvedTheme === "dark" ? "#1F2937" : "#FFFFFF",
                    border: "1px solid #4B5563",
                  }}
                  itemStyle={{ color: resolvedTheme === "dark" ? "#D1D5DB" : "#1F2937" }}
                />
                <Line
                  type="monotone"
                  dataKey={chart.yKey}
                  // if chart.color is a gradient URL, use a solid fallback
                  stroke={chart.color?.startsWith("url(") ? "#00DDFF" : chart.color}
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#5E17EB", stroke: "#00DDFF" }}
                  activeDot={{ r: 6, fill: "#5E17EB", stroke: "#00DDFF" }}
                  connectNulls={true} // (optional) will bridge any null gaps
                />
              </RechartsLineChart>
            )}

            {chart.type === "pie" && Array.isArray(data) && data.length > 0 && (
              <RechartsPieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <Pie
                  data={data}
                  dataKey={chart.yKey}
                  nameKey={chart.xKey}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                  strokeWidth={1}
                  stroke="#00DDFF"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(index % chartColorPalette.length)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: resolvedTheme === "dark" ? "#1F2937" : "#FFFFFF",
                    border: "1px solid #4B5563",
                  }}
                  itemStyle={{ color: resolvedTheme === "dark" ? "#D1D5DB" : "#1F2937" }}
                />
              </RechartsPieChart>
            )}

            {chart.type === "scatter" && Array.isArray(data) && data.length > 0 && (
              <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  type="number"
                  dataKey={chart.xKey}
                  name={chart.xKey}
                  stroke={textColor}
                  fontSize={10}
                  tick={{ fill: textColor }}
                  domain={["dataMin", "dataMax"]}
                />
                <YAxis
                  type="number"
                  dataKey={chart.yKey}
                  name={chart.yKey}
                  stroke={textColor}
                  fontSize={10}
                  tick={{ fill: textColor }}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: resolvedTheme === "dark" ? "#1F2937" : "#FFFFFF",
                    border: "1px solid #4B5563",
                  }}
                  itemStyle={{ color: resolvedTheme === "dark" ? "#D1D5DB" : "#1F2937" }}
                />
                <Scatter name={chart.title} data={data} fill="url(#purple-radial)" stroke="#00DDFF" strokeWidth={1} />
              </ScatterChart>
            )}

            {chart.type === "area" && Array.isArray(data) && data.length > 0 && (
              <RechartsAreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey={chart.xKey} stroke={textColor} fontSize={10} tick={{ fill: textColor }} />
                <YAxis stroke={textColor} fontSize={10} tick={{ fill: textColor }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: resolvedTheme === "dark" ? "#1F2937" : "#FFFFFF",
                    border: "1px solid #4B5563",
                  }}
                  itemStyle={{ color: resolvedTheme === "dark" ? "#D1D5DB" : "#1F2937" }}
                />
                <Area
                  type="monotone"
                  dataKey={chart.yKey}
                  stroke="#00DDFF"
                  strokeWidth={2}
                  fillOpacity={0.8}
                  fill="url(#cyan-purple-gradient)"
                />
              </RechartsAreaChart>
            )}

            {chart.type === "treemap" && Array.isArray(data) && data.length > 0 && (
              <Treemap
                data={data} // Treemap expects data with name/size keys
                dataKey="value" // Use 'value' key for value
                nameKey="name" // Use 'name' key for label
                aspectRatio={4 / 3}
                stroke={resolvedTheme === "dark" ? "#374151" : "#fff"}
                fill={resolvedTheme === "dark" ? "#1F2937" : "#ccc"}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(index)} />
                ))}
              </Treemap>
            )}

            {/* Message for empty/invalid data */}
            {(!Array.isArray(data) || data.length === 0) && chart.type !== "scorecard" && chart.type !== "filters" && (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
                No data available for this chart type.
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  const addNewPage = () => {
    const newPageNumber = Math.max(...Object.keys(pages).map(Number)) + 1
    setPages((prev) => ({ ...prev, [newPageNumber]: `Page ${newPageNumber}` }))
    setPageCharts((prev) => ({ ...prev, [newPageNumber]: [] }))
  }

  const deletePage = (pageNumber: number) => {
    if (Object.keys(pages).length <= 1) return
    const newPages = { ...pages }
    delete newPages[pageNumber]
    const newPageCharts = { ...pageCharts }
    delete newPageCharts[pageNumber]
    setPages(newPages)
    setPageCharts(newPageCharts)
    if (activePage === pageNumber) {
      setActivePage(Number(Object.keys(newPages)[0]))
    }
  }

  const renamePage = (pageNumber: number, newName: string) => {
    setPages((prev) => ({ ...prev, [pageNumber]: newName }))
  }

  const handleChartResize = (instanceId: number, size: { width: number; height: number }) => {
    setPageCharts((prev) => ({
      ...prev,
      [activePage]: prev[activePage].map((chart) => (chart.instanceId === instanceId ? { ...chart, size } : chart)),
    }))
  }

  const handleChartDrag = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(pageCharts[activePage])
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setPageCharts((prev) => ({
      ...prev,
      [activePage]: items,
    }))
  }

  const handleChartTitleEdit = (instanceId: number, newTitle: string) => {
    setPageCharts((prev) => ({
      ...prev,
      [activePage]: prev[activePage].map((chart) =>
        chart.instanceId === instanceId ? { ...chart, title: newTitle } : chart,
      ),
    }))
    setEditingChartTitle(null)
  }

  // Determine fields to show in the config panel based on selection
  const selectedChart = selectedChartInstanceId
    ? pageCharts[activePage]?.find((c) => c.instanceId === selectedChartInstanceId)
    : null
  const configPanelFields = selectedChart ? ([selectedChart.xKey, selectedChart.yKey].filter(Boolean) as string[]) : [] // Show only x/y keys of selected chart

  const { theme: currentTheme } = useTheme() // Get theme here
  const textColor = currentTheme === "dark" ? "#fff" : "#000"
  const gridColor = currentTheme === "dark" ? "#ffffff20" : "#00000020"

  // Move useEffect hook to the top level

  // Move checkAuth inside useEffect

  if (!mounted) return null

  const handleHypothesisTesting = () => {
    router.push("/hypothesis-testing")
  }

  // 2. Add the logout function inside the Visualization component, after the handleHypothesisTesting function
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    document.cookie = "isLoggedIn=false; path=/"
    router.replace("/")
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative transition-colors duration-300">
        {/* Mouse follow effect */}
        <div
          className="pointer-events-none fixed z-30 h-40 w-40 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-3xl opacity-50 dark:opacity-70 transition-opacity duration-300"
          style={{
            left: `${mousePosition.x - 80}px`,
            top: `${mousePosition.y - 80}px`,
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Background grid */}
        <div className="absolute inset-0 bg-grid-small-white/[0.2] dark:bg-grid-small-white/[0.05] -z-10" />

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 dark:bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" />
          <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-purple-500 dark:bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 dark:bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000" />
        </div>

        {/* Scanlines effect */}
        <div className="absolute inset-0 bg-scanlines opacity-[0.03] dark:opacity-[0.06] pointer-events-none -z-10" />

        {/* Background sparkle layer */}
        <div className="absolute inset-0 -z-10">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor={currentTheme === "dark" ? "#FFFFFF" : "#000000"}
          />
        </div>

        <div className="relative z-10 flex h-screen overflow-hidden pb-14">
          {/* LEFT SIDEBAR */}
          <motion.aside
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-48 flex-shrink-0 border-r border-gray-200 dark:border-purple-500/20 p-4 bg-white/10 dark:bg-black/40 backdrop-blur-md relative glitch-trigger"
          >
            {/* Digital circuit lines */}
            <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
              <div className="absolute top-[10%] left-0 w-full h-[1px] bg-cyan-400 dark:bg-fuchsia-400"></div>
              <div className="absolute top-[30%] left-0 w-[80%] h-[1px] bg-cyan-400 dark:bg-fuchsia-400"></div>
              <div className="absolute top-[70%] left-[20%] w-[80%] h-[1px] bg-cyan-400 dark:bg-fuchsia-400"></div>
              <div className="absolute top-0 left-[20%] w-[1px] h-[30%] bg-cyan-400 dark:bg-fuchsia-400"></div>
              <div className="absolute top-[30%] left-[80%] w-[1px] h-[40%] bg-cyan-400 dark:bg-fuchsia-400"></div>
              <div className="absolute top-[50%] left-[20%] w-[1px] h-[50%] bg-cyan-400 dark:bg-fuchsia-400"></div>
            </div>

            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-cyan-300 flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                Available Charts
              </h3>
              <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 100px)" }}>
                {availableCharts.map((chart) => (
                  <DraggableChart key={chart.id} chart={chart} />
                ))}
              </div>
            </div>
          </motion.aside>

          {/* MAIN CONTENT */}
          <main
            ref={setDroppableRef}
            className="flex-1 flex flex-col overflow-auto relative"
            onClick={() => setSelectedChartInstanceId(null)}
          >
            {/* Data stream animation */}
            <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden pointer-events-none">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-cyan-500 dark:via-fuchsia-500 to-transparent opacity-50 animate-[datastream_8s_linear_infinite]"></div>
            </div>

            {/* Export Button */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="px-6 py-4 flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
                <ThemeToggle />
              </div>

              <Button
                onClick={handleExport}
                className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:from-cyan-600 hover:to-fuchsia-700 text-white shadow-lg hover:shadow-cyan-500/20 dark:hover:shadow-fuchsia-500/20 transition-all duration-300"
              >
                <MousePointerClick className="w-4 h-4 mr-2" />
                Export Dashboard
              </Button>
            </motion.div>

            {/* KPI + CHARTS (this is exportable) */}
            <div ref={dashboardRef} className="px-6 pt-4 pb-10 print:bg-white print:text-black">
              {/* KPI CARDS */}
              {scorecards.length > 0 && (
                <div className="mb-6">
                  <Scorecards data={scorecards} />
                </div>
              )}

              {/* FILTERS */}
              {isAutomated && filtersConfig.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mb-6 border-b pb-4 border-gray-200 dark:border-purple-500/20"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-6">
                    {filtersConfig.map((filter, index) => (
                      <motion.div
                        key={filter.field}
                        className="flex flex-col"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                      >
                        <label className="text-sm text-gray-500 dark:text-purple-400 mb-1">{filter.label}</label>
                        {filter.type === "dropdown" && (
                          <select
                            onChange={(e) => handleFilterChange(filter.field, e.target.value, "dropdown")}
                            className="w-full bg-white/20 dark:bg-black/30 p-2 rounded text-sm 
                                      border border-gray-300 dark:border-purple-500/20 
                                      focus:ring-cyan-500 dark:focus:ring-fuchsia-500 
                                      focus:border-cyan-500 dark:focus:border-fuchsia-500
                                      transition-all duration-300
                                      hover:border-cyan-400 dark:hover:border-fuchsia-400"
                          >
                            <option value="">All</option>
                            {filter.options?.filter(Boolean).map((opt, j) => (
                              <option key={j} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}
                        {filter.type === "time_range" && (
                          <div className="flex space-x-2">
                            <input
                              type="date"
                              onChange={(e) =>
                                handleFilterChange(
                                  filter.field,
                                  { ...activeFilters[filter.field], start: e.target.value },
                                  "time_range",
                                )
                              }
                              className="w-full bg-white/20 dark:bg-black/30 p-2 rounded text-sm 
                                        border border-gray-300 dark:border-purple-500/20 
                                        focus:ring-cyan-500 dark:focus:ring-fuchsia-500 
                                        focus:border-cyan-500 dark:focus:border-fuchsia-500
                                        transition-all duration-300
                                        hover:border-cyan-400 dark:hover:border-fuchsia-400"
                            />
                            <input
                              type="date"
                              onChange={(e) =>
                                handleFilterChange(
                                  filter.field,
                                  { ...activeFilters[filter.field], end: e.target.value },
                                  "time_range",
                                )
                              }
                              className="w-full bg-white/20 dark:bg-black/30 p-2 rounded text-sm 
                                        border border-gray-300 dark:border-purple-500/20 
                                        focus:ring-cyan-500 dark:focus:ring-fuchsia-500 
                                        focus:border-cyan-500 dark:focus:border-fuchsia-500
                                        transition-all duration-300
                                        hover:border-cyan-400 dark:hover:border-fuchsia-400"
                            />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* CHARTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <DragDropContext onDragEnd={handleChartDrag}>
                  <Droppable droppableId="charts">
                    {(provided: DroppableProvided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="contents">
                        {(pageCharts[activePage] || []).map((chart, index) => (
                          <Draggable key={chart.instanceId} draggableId={String(chart.instanceId)} index={index}>
                            {(prov: DraggableProvided) => (
                              <motion.div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                style={{ width: "100%" }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className="glitch-trigger"
                              >
                                <Resizable
                                  size={chart.size || { width: "100%", height: 400 }}
                                  onResizeStop={(e, dir, ref) =>
                                    handleChartResize(chart.instanceId!, {
                                      width: Number.parseInt(ref.style.width),
                                      height: Number.parseInt(ref.style.height),
                                    })
                                  }
                                  minWidth={300}
                                  minHeight={300}
                                  maxWidth={1200}
                                  maxHeight={800}
                                  className="relative"
                                  handleComponent={{
                                    bottomRight: (
                                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-cyan-500 dark:bg-fuchsia-600 cursor-se-resize opacity-50 hover:opacity-100 rounded-full" />
                                    ),
                                  }}
                                >
                                  <motion.div
                                    {...prov.dragHandleProps}
                                    className={`rounded-xl group transition-colors h-full w-full overflow-visible ${
                                      selectedChartInstanceId === chart.instanceId
                                        ? "ring-2 ring-cyan-500 dark:ring-fuchsia-500"
                                        : ""
                                    }`}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedChartInstanceId(chart.instanceId!)
                                    }}
                                  >
                                    {renderChart(chart, handleChartTypeChange)}
                                  </motion.div>
                                </Resizable>
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
          </main>

          {/* RIGHT SIDEBAR */}
          <motion.aside
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-50 flex-shrink-0 border-l border-gray-200 dark:border-purple-500/20 p-4 bg-white/10 dark:bg-black/40 backdrop-blur-md overflow-auto relative glitch-trigger"
          >
            {/* Digital circuit lines */}
            <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
              <div className="absolute top-[10%] left-0 w-full h-[1px] bg-cyan-400 dark:bg-fuchsia-400"></div>
              <div className="absolute top-[30%] left-0 w-[80%] h-[1px] bg-cyan-400 dark:bg-fuchsia-400"></div>
              <div className="absolute top-[70%] left-[20%] w-[80%] h-[1px] bg-cyan-400 dark:bg-fuchsia-400"></div>
              <div className="absolute top-0 left-[20%] w-[1px] h-[30%] bg-cyan-400 dark:bg-fuchsia-400"></div>
              <div className="absolute top-[30%] left-[80%] w-[1px] h-[40%] bg-cyan-400 dark:bg-fuchsia-400"></div>
              <div className="absolute top-[50%] left-[20%] w-[1px] h-[50%] bg-cyan-400 dark:bg-fuchsia-400"></div>
            </div>

            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-cyan-300 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                <span className="mr-8">Field Configuration</span>
              </h3>
              <DataManipulationPanel
                data={data}
                fields={configPanelFields}
                config={fieldConfigs}
                onConfigChange={handleConfigChange}
              />
            </div>
          </motion.aside>
        </div>

        {/* DIALOGS AND TABS */}
        <AnimatePresence>
          {showFieldDialog && (
            <FieldSelectionDialog
              open={showFieldDialog}
              onClose={() => setShowFieldDialog(false)}
              onConfirm={(fields) => {
                if (activeChartType) {
                  const base = availableCharts.find((c) => c.type === activeChartType)!
                  addChartToPage({ ...base, xKey: fields.xField, yKey: fields.yField })
                }
                setShowFieldDialog(false)
              }}
              availableFields={availableFields}
              chartType={activeChartType || ""}
              data={data}
            />
          )}
        </AnimatePresence>

        <PageTabs
          pages={pages}
          activePage={activePage}
          onPageChange={setActivePage}
          onAddPage={addNewPage}
          onDeletePage={deletePage}
          onRenamePage={renamePage}
          onHypothesisTesting={handleHypothesisTesting}
        />
      </div>

      {/* CSS for glitch effect */}
      <style jsx global>{`
        @keyframes datastream {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(100%); opacity: 0.1; }
          100% { transform: translateY(0); opacity: 0.5; }
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .bg-grid-small-white {
          background-size: 30px 30px;
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
        }
        
        .bg-scanlines {
          background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.5) 51%);
          background-size: 100% 4px;
        }
        
        .glitch-active {
          animation: glitch 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
          position: relative;
        }
        
        .glitch-active::before,
        .glitch-          position: relative;
        }
        
        .glitch-active::before,
        .glitch-active::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: inherit;
          pointer-events: none;
        }
        
        .glitch-active::before {
          left: 2px;
          background: rgba(255, 0, 255, 0.2);
          animation: glitch-anim-1 0.3s infinite linear alternate-reverse;
        }
        
        .glitch-active::after {
          left: -2px;
          background: rgba(0, 255, 255, 0.2);
          animation: glitch-anim-2 0.3s infinite linear alternate-reverse;
        }
        
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        
        @keyframes glitch-anim-1 {
          0% { clip-path: inset(20% 0 80% 0); }
          20% { clip-path: inset(60% 0 40% 0); }
          40% { clip-path: inset(40% 0 60% 0); }
          60% { clip-path: inset(80% 0 20% 0); }
          80% { clip-path: inset(10% 0 90% 0); }
          100% { clip-path: inset(30% 0 70% 0); }
        }
        
        @keyframes glitch-anim-2 {
          0% { clip-path: inset(10% 0 90% 0); }
          20% { clip-path: inset(30% 0 70% 0); }
          40% { clip-path: inset(50% 0 50% 0); }
          60% { clip-path: inset(70% 0 30% 0); }
          80% { clip-path: inset(90% 0 10% 0); }
          100% { clip-path: inset(0% 0 100% 0); }
        }
      `}</style>
    </DndContext>
  )
}
