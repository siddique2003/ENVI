"use client"
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
  return (
    <div className="absolute inset-0 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-purple-500">Edit Visualization</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={chart.title} onChange={(e) => onUpdateChart(chart.instanceId, { title: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label>X-Axis Field</Label>
          <Select value={chart.xKey} onValueChange={(value) => onUpdateChart(chart.instanceId, { xKey: value })}>
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
          <Label>Y-Axis Field</Label>
          <Select value={chart.yKey} onValueChange={(value) => onUpdateChart(chart.instanceId, { yKey: value })}>
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

        {(chart.type === "bar" || chart.type === "line") && (
          <div className="space-y-2">
            <Label>Chart Color</Label>
            <Input
              type="color"
              value={chart.color || "#8B5CF6"}
              onChange={(e) => onUpdateChart(chart.instanceId, { color: e.target.value })}
              className="h-10 px-2"
            />
          </div>
        )}
      </div>
    </div>
  )
}

