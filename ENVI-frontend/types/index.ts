export interface User {
  email: string
  password: string
}

export interface Dataset {
  id: string
  name: string
  data: any[]
}

export interface Visualization {
  id: number
  type: "bar" | "line" | "pie"
  data: any[]
}

export interface ChartData {
  name: string
  value: number
}

