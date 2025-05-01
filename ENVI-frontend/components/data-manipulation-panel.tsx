"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, Settings2, Filter } from 'lucide-react'
import type { FieldConfig, AggregationType } from "./data-utils"
import { getFieldType, getCompatibleAggregations } from "./data-utils"

interface DataManipulationPanelProps {
  data: any[]
  fields: string[]
  config: Record<string, FieldConfig>
  onConfigChange: (newConfig: Record<string, FieldConfig>) => void
}

export function DataManipulationPanel({
  data,
  fields,
  config,
  onConfigChange,
}: DataManipulationPanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const handleConfigChange = (field: string, updates: Partial<FieldConfig>) => {
    const newConfig = {
      ...config,
      [field]: {
        ...config[field],
        field,
        ...updates
      }
    }
    onConfigChange(newConfig)
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[calc(100vh-10rem)]">
        <div className="space-y-3 pr-4">
          {fields.map((field) => {
            const fieldType = getFieldType(data, field)
            const compatibleAggregations = getCompatibleAggregations(fieldType)
            const currentConfig = config[field]

            return (
              <div
                key={field}
                className={`rounded-lg border ${
                  expanded[field] 
                    ? 'border-purple-500/30 bg-purple-500/10' 
                    : 'border-purple-500/20 bg-black/20'
                } transition-colors`}
              >
                <div
                  className="p-3 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpanded(prev => ({ ...prev, [field]: !prev[field] }))}
                >
                  <div className="flex items-center gap-2 text-purple-200">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${expanded[field] ? "rotate-180" : ""}`}
                    />
                    <span className="font-medium">{field}</span>
                    <span className="text-sm text-purple-300/70">
                      ({fieldType})
                    </span>
                  </div>
                </div>

                {expanded[field] && (
                  <div className="p-3 border-t border-purple-500/20 space-y-4">
                    {compatibleAggregations.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-purple-200">Aggregation</Label>
                        <Select
                          value={currentConfig.aggregation}
                          onValueChange={(value: AggregationType) =>
                            handleConfigChange(field, { aggregation: value })
                          }
                        >
                          <SelectTrigger className="bg-black/50 border-purple-500/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-purple-500/30">
                            {compatibleAggregations.map((agg) => (
                              <SelectItem key={agg} value={agg} className="text-purple-100">
                                {agg.charAt(0).toUpperCase() + agg.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {fieldType === 'number' && (
                      <div className="space-y-2">
                        <Label>Format</Label>
                        <Select
                          value={currentConfig.format}
                          onValueChange={(value) =>
                            handleConfigChange(field, { format: value as FieldConfig['format'] })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="currency">Currency</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
 
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-purple-200">Drill Through</Label>
                        <Switch
                          checked={currentConfig.drillThrough}
                          onCheckedChange={(checked) =>
                            handleConfigChange(field, { drillThrough: checked })
                          }
                          className="data-[state=checked]:bg-purple-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Cross Report</Label>
                        <Switch
                          checked={currentConfig.crossReport}
                          onCheckedChange={(checked) =>
                            handleConfigChange(field, { crossReport: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Keep Filters</Label>
                        <Switch
                          checked={currentConfig.keepFilters}
                          onCheckedChange={(checked) =>
                            handleConfigChange(field, { keepFilters: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}