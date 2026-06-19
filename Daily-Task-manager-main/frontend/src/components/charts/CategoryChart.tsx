'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface CategoryChartProps {
  data: Array<{
    category: string
    total: number
    completed: number
    completionRate: number
  }>
  height?: number
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#6366f1']

export function CategoryChart({ data, height = 300 }: CategoryChartProps) {
  const chartData = data.map((item) => ({
    name: item.category,
    value: item.completed,
  }))

  return (
    <div className="w-full h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} completed`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
