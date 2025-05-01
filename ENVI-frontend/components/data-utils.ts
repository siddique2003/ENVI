import { parseISO, isValid } from 'date-fns';

export type AggregationType = 'sum' | 'average' | 'count' | 'min' | 'max' | 'none'

export interface FieldConfig {
  field: string
  aggregation: AggregationType
  format: 'number' | 'currency' | 'percentage' | 'date' | 'string'
  drillThrough?: boolean
  crossReport?: boolean
  keepFilters?: boolean
}

export interface ProcessedData {
  name: string
  value: number
}

export type FieldType = 'number' | 'string' | 'date'

export const getFieldType = (data: any[], field: string): FieldType => {
  if (!data.length) return 'string'
  const sampleValue = data[0][field]
  
  if (typeof sampleValue === 'number') return 'number'
  if (sampleValue instanceof Date || !isNaN(Date.parse(sampleValue))) return 'date'
  return 'string'
}

export const getCompatibleAggregations = (fieldType: FieldType): AggregationType[] => {
  if (fieldType === 'number') return ['sum', 'average', 'count', 'min', 'max']
  if (fieldType === 'date') return ['count']
  return []
}

interface AggregationStats {
  count: number
  sum: number
  min: number
  max: number
  values: number[]
}

export const aggregateData = (
  data: any[],
  groupBy: string,
  valueField: string,
  aggregation: AggregationType = 'sum'
): any[] => {
  const grouped = data.reduce((acc: Record<string, AggregationStats>, item) => {
    const key = String(item[groupBy] ?? 'Unknown')
    const value = Number(item[valueField]) || 0
    
    if (!acc[key]) {
      acc[key] = {
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
        values: []
      }
    }
    
    acc[key].count++
    acc[key].sum += value
    acc[key].values.push(value)
    acc[key].min = Math.min(acc[key].min, value)
    acc[key].max = Math.max(acc[key].max, value)
    
    return acc
  }, {})

  return Object.entries(grouped).map(([key, stats]) => ({
    [groupBy]: key,
    [valueField]: calculateAggregation(stats, aggregation)
  }));
}

const calculateAggregation = (
  stats: AggregationStats,
  aggregation: AggregationType
): number => {
  switch (aggregation) {
    case 'sum': return stats.sum
    case 'average': return stats.sum / stats.count
    case 'count': return stats.count
    case 'min': return stats.min
    case 'max': return stats.max
    default: return stats.sum
  }
}

export interface TimeSeriesData {
  [key: string]: number | string | Date
}

interface MonthlyStats {
  date: string
  count: number
  sum: number
  min: number
  max: number
  values: number[]
}

export const processTimeSeriesData = (
  data: any[],
  dateField: string,
  valueField: string,
  aggregation: AggregationType = 'sum'
): any[] => {
  const monthlyData = data.reduce((acc: Record<string, MonthlyStats>, item) => {
    const dateValue = item[dateField]; // Get the value first

    // Check if the value is null, undefined, or an empty string
    if (dateValue === null || dateValue === undefined || dateValue === "") {
        console.warn(`Skipping row due to null, undefined, or empty date value for field ${dateField}`);
        return acc;
    }

    const dateString = String(dateValue); // Ensure it's a string for parsing attempts
    let date: Date;

    // Try parsing the date string
    date = parseISO(dateString); // Try ISO format

    // Add more specific parsing attempts if needed, example:
    // const formatsToTry = ['MM/dd/yyyy', 'yyyy/MM/dd', 'dd-MMM-yyyy'];
    // if (!isValid(date)) {
    //   for (const format of formatsToTry) {
    //     try {
    //       date = parse(dateString, format, new Date());
    //       if (isValid(date)) break;
    //     } catch (e) { /* ignore parse error, try next format */ }
    //   }
    // }

    // Check if parsing was successful after all attempts
    if (!isValid(date)) { // Use date-fns isValid
        console.warn(`Invalid or unparseable date string found for field ${dateField}:`, dateString); // Log the string we tried to parse
        return acc; 
    }
    
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        date: monthKey + '-01', // Store as YYYY-MM-DD string
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
        values: []
      }
    }
    
    const value = Number(item[valueField]) || 0;
    acc[monthKey].sum += value;
    acc[monthKey].count++;
    acc[monthKey].values.push(value);
    acc[monthKey].min = Math.min(acc[monthKey].min, value);
    acc[monthKey].max = Math.max(acc[monthKey].max, value);
    
    return acc;
  }, {});

  return Object.values(monthlyData)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(month => ({
      [dateField]: parseISO(month.date), // Parse YYYY-MM-DD string back to Date object for chart library
      [valueField]: calculateAggregation(month, aggregation)
    }));
};

export const getTopItems = (data: ProcessedData[], limit: number = 10): ProcessedData[] => {
  return data.slice(0, limit)
}

export const CHART_COLORS = [
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#10B981", // Emerald
  "#6B7280", // Gray
  "#8B5CF6", // Purple (lighter)
  "#EC4899", // Pink (lighter)
]