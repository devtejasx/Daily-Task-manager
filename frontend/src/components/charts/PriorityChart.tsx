'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface PriorityChartProps {
  data: Array<{
    priority: string
    total: number
    completed: number
    completionRate: number
  }>
  height?: number
}

const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#3b82f6',
}

export function PriorityChart({ data, height = 300 }: PriorityChartProps) {
  const chartData = data.map((item) => ({
    priority: item.priority,
    Completed: item.completed,
    Total: item.total,
    'Completion Rate': Math.round(item.completionRate),
  }))

  return (
    <div className="w-full h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="priority" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend />
          <Bar dataKey="Completed" fill="#10b981" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Total" fill="#6b7280" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
