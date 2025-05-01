export interface FieldOption {
    value: string
    label: string
    disabled?: boolean
    description?: string
  }
  
  export interface ChartFieldRequirements {
    xAxis: {
      type: "categorical" | "temporal" | "numerical"
      description: string
    }
    yAxis: {
      type: "numerical"
      description: string
    }
  }
  
  export const CHART_REQUIREMENTS: Record<string, ChartFieldRequirements> = {
    bar: {
      xAxis: {
        type: "categorical",
        description: "Category or group (e.g., product, region)",
      },
      yAxis: {
        type: "numerical",
        description: "Numeric values (e.g., sales, quantity)",
      },
    },
    line: {
      xAxis: {
        type: "temporal",
        description: "Time-based field (e.g., date, month)",
      },
      yAxis: {
        type: "numerical",
        description: "Numeric values to track over time",
      },
    },
    pie: {
      xAxis: {
        type: "categorical",
        description: "Categories to compare",
      },
      yAxis: {
        type: "numerical",
        description: "Values for each category",
      },
    },
    scatter: {
      xAxis: {
        type: "numerical",
        description: "Numeric values for X coordinate",
      },
      yAxis: {
        type: "numerical",
        description: "Numeric values for Y coordinate",
      },
    },
    area: {
      xAxis: {
        type: "temporal",
        description: "Time-based field for trends",
      },
      yAxis: {
        type: "numerical",
        description: "Numeric values to show area",
      },
    },
    bubble: {
      xAxis: {
        type: "numerical",
        description: "Numeric values for X coordinate",
      },
      yAxis: {
        type: "numerical",
        description: "Numeric values for Y coordinate",
      },
    },
    heatmap: {
      xAxis: {
        type: "categorical",
        description: "First category for grouping",
      },
      yAxis: {
        type: "numerical",
        description: "Values for intensity",
      },
    },
    treemap: {
      xAxis: {
        type: "categorical",
        description: "Hierarchical categories",
      },
      yAxis: {
        type: "numerical",
        description: "Size values for rectangles",
      },
    },
  }
  
  export const isNumericField = (data: any[], field: string): boolean => {
    return data.some((item) => typeof item[field] === "number")
  }
  
  export const isTemporalField = (data: any[], field: string): boolean => {
    return data.some((item) => !isNaN(Date.parse(item[field])))
  }
  
  export const isCategoricalField = (data: any[], field: string): boolean => {
    return data.some((item) => typeof item[field] === "string" && !isTemporalField(data, field))
  }
  
  export const getFieldType = (data: any[], field: string): "numerical" | "temporal" | "categorical" => {
    if (isNumericField(data, field)) return "numerical"
    if (isTemporalField(data, field)) return "temporal"
    return "categorical"
  }
  
  export const getCompatibleFields = (data: any[], chartType: string, axis: "xAxis" | "yAxis"): FieldOption[] => {
    const requirements = CHART_REQUIREMENTS[chartType]
    if (!requirements) return []
  
    return Object.keys(data[0] || {}).map((field) => ({
      value: field,
      label: field,
      disabled: getFieldType(data, field) !== requirements[axis].type,
      description: requirements[axis].description,
    }))
  }
  
  export const getBestFields = (data: any[], chartType: string): { xField: string; yField: string } => {
    const fields = Object.keys(data[0] || {})
    const requirements = CHART_REQUIREMENTS[chartType]
  
    if (!requirements) return { xField: "", yField: "" }
  
    const xField = fields.find((field) => getFieldType(data, field) === requirements.xAxis.type) || ""
    const yField = fields.find((field) => getFieldType(data, field) === requirements.yAxis.type) || ""
  
    return { xField, yField }
  }
  
  