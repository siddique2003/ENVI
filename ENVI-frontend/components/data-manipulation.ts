export type AggregationType = "sum" | "average" | "count" | "min" | "max" | "first" | "last"
export type FilterType = "equals" | "contains" | "greater" | "less" | "between" | "in"

export interface FieldConfig {
  field: string
  aggregation: AggregationType
  format?: string
  filters?: {
    type: FilterType
    value: any
  }[]
  drillThrough?: boolean
  crossReport?: boolean
  keepFilters?: boolean
}

export const aggregateFieldData = (data: any[], config: FieldConfig) => {
  if (!data.length) return []

  const getValue = (item: any) => {
    const value = item[config.field]
    return typeof value === "number" ? value : 0
  }

  switch (config.aggregation) {
    case "sum":
      return data.reduce((sum, item) => sum + getValue(item), 0)
    case "average":
      return data.reduce((sum, item) => sum + getValue(item), 0) / data.length
    case "count":
      return data.length
    case "min":
      return Math.min(...data.map(getValue))
    case "max":
      return Math.max(...data.map(getValue))
    case "first":
      return getValue(data[0])
    case "last":
      return getValue(data[data.length - 1])
    default:
      return data
  }
}

export const formatFieldValue = (value: number, format?: string) => {
  if (!format) return value.toString()

  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
    case "percent":
      return new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 2 }).format(value / 100)
    case "number":
      return new Intl.NumberFormat("en-US").format(value)
    default:
      return value.toString()
  }
}

export const getFieldType = (data: any[], field: string) => {
  const sample = data.find((item) => item[field] !== undefined)?.[field]
  if (typeof sample === "number") return "number"
  if (typeof sample === "string") {
    if (!isNaN(Date.parse(sample))) return "date"
    return "string"
  }
  return "unknown"
}

export const getCompatibleAggregations = (fieldType: string): AggregationType[] => {
  switch (fieldType) {
    case "number":
      return ["sum", "average", "min", "max", "count", "first", "last"]
    case "date":
      return ["count", "first", "last"]
    case "string":
      return ["count"]
    default:
      return ["count"]
  }
}

