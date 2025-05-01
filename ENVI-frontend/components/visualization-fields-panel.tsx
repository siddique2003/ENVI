"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface FieldsPanelProps {
  chart: any
  availableFields: string[]
  onUpdateChart: (chartId: number, updates: any) => void
  onClose: () => void
}

export function FieldsPanel({ chart, availableFields, onUpdateChart, onClose }: FieldsPanelProps) {
  const [selectedField, setSelectedField] = useState(chart.yKey)

  const handleFieldChange = (value: string) => {
    setSelectedField(value)
    onUpdateChart(chart.instanceId, { yKey: value })
  }

  return (
    <div className="absolute right-0 top-0 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l border-purple-500/20 h-full p-4 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-purple-500">Fields</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Measure Field</Label>
          <Select value={selectedField} onValueChange={handleFieldChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {availableFields.map((field) => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={chart.title}
            onChange={(e) => onUpdateChart(chart.instanceId, { title: e.target.value })}
            className="bg-white/50 dark:bg-gray-900/50"
          />
        </div>

        {chart.type === "bar" && (
          <div className="space-y-2">
            <Label>Bar Color</Label>
            <Input
              type="color"
              value="#8B5CF6"
              onChange={(e) => onUpdateChart(chart.instanceId, { color: e.target.value })}
              className="h-10 px-2"
            />
          </div>
        )}
      </div>
    </div>
  )
}

