'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface CompletionChartProps {
  data: Record<string, number>
  height?: number
}

export function CompletionChart({ data, height = 300 }: CompletionChartProps) {
  const chartData = Object.entries(data).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Completed: count,
  }))

  return (
    <div className="w-full h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af" 
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#fff' }}
            formatter={(value) => [`${value} tasks`, 'Completed']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Completed"
            stroke="#3b82f6"
            dot={false}
            strokeWidth={2}
            name="Tasks Completed"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
