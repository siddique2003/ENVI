"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { getFieldType } from "./data-utils"

interface FieldOption {
  value: string
  label: string
  type: string
  compatible: boolean
}

interface FieldRequirement {
  type: string[]
  required: boolean
  description: string
}

const CHART_REQUIREMENTS: Record<string, Record<string, FieldRequirement>> = {
  bar: {
    xAxis: { type: ['categorical', 'date'], required: true, description: 'Categories or dates for grouping' },
    yAxis: { type: ['number'], required: true, description: 'Numeric values to measure' }
  },
  line: {
    xAxis: { type: ['date'], required: true, description: 'Time-based field for the X-axis' },
    yAxis: { type: ['number'], required: true, description: 'Numeric values to plot over time' }
  },
  pie: {
    xAxis: { type: ['categorical'], required: true, description: 'Categories for pie segments' },
    yAxis: { type: ['number'], required: true, description: 'Numeric values for segment sizes' }
  },
  scatter: {
    xAxis: { type: ['number'], required: true, description: 'Numeric values for X position' },
    yAxis: { type: ['number'], required: true, description: 'Numeric values for Y position' }
  },
  area: {
    xAxis: { type: ['date'], required: true, description: 'Time-based field for the X-axis' },
    yAxis: { type: ['number'], required: true, description: 'Numeric values to plot over time' }
  },
  treemap: {
    xAxis: { type: ['categorical'], required: true, description: 'Categories for grouping' },
    yAxis: { type: ['number'], required: true, description: 'Numeric values for rectangle sizes' }
  }
}

interface FieldSelectionDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (fields: { xField: string; yField: string; extraFields?: Record<string, string> }) => void
  availableFields: string[]
  chartType: string
  data: any[]
}

export function FieldSelectionDialog({
  open,
  onClose,
  onConfirm,
  availableFields,
  chartType,
  data
}: FieldSelectionDialogProps) {
  const [fields, setFields] = useState<Record<string, string>>({
    xAxis: '',
    yAxis: '',
  })

  const getFieldOptions = (axisType: string): FieldOption[] => {
    if (!data?.length || !CHART_REQUIREMENTS[chartType]) return []
    const requirements = CHART_REQUIREMENTS[chartType][axisType] || { type: [] }
    
    return availableFields.map(field => ({
      value: field,
      label: field,
      type: getFieldType(data, field),
      compatible: requirements.type.includes(getFieldType(data, field))
    }))
  }

  const canConfirm = fields.xAxis && fields.yAxis && 
    getFieldOptions('xAxis').find(f => f.value === fields.xAxis)?.compatible &&
    getFieldOptions('yAxis').find(f => f.value === fields.yAxis)?.compatible;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-black/80 border border-purple-500/20 backdrop-blur-md text-white">
        <DialogHeader>
          <DialogTitle className="text-purple-300">Configure {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {Object.entries(CHART_REQUIREMENTS[chartType] || {}).map(([axis, requirement]) => (
            <div key={axis} className="space-y-2">
              <Label className="text-purple-200">
                {axis.charAt(0).toUpperCase() + axis.slice(1)}
                {requirement.required && <span className="text-red-400 ml-1">*</span>}
              </Label>
              <Select
                value={fields[axis]}
                onValueChange={value => setFields(prev => ({ ...prev, [axis]: value }))}
              >
                <SelectTrigger className="bg-black/50 border-purple-500/30 text-purple-100">
                  <SelectValue placeholder={`Select ${axis}`} />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-purple-500/30">
                  {getFieldOptions(axis).map(option => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={!option.compatible}
                      className={option.compatible ? "text-purple-100" : "text-gray-500"}
                    >
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        {!option.compatible && (
                          <span className="text-xs text-red-400">
                            Not compatible
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-purple-300/70">
                {requirement.description}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/20"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm({ xField: fields.xAxis, yField: fields.yAxis })}
            disabled={!canConfirm}
            className="bg-purple-500/80 text-white hover:bg-purple-600/80 disabled:bg-purple-500/20"
          >
            Create Chart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}