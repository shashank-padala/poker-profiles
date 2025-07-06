import React from 'react'

export interface Stat {
  label: string
  value: string
}

interface StatsBlockProps {
  title: string
  stats: Stat[]
  borderColor: string
  from: string
  to: string
}

export default function StatsBlock({
  title,
  stats,
  borderColor,
  from,
  to,
}: StatsBlockProps) {
  return (
    <div className={`p-3 rounded-lg border ${borderColor} bg-gradient-to-r ${from} ${to}`}>
      <h4 className="text-m font-semibold mb-2">{title}</h4>

      {stats.length === 0 ? (
        <div className="text-sm text-muted-foreground italic px-2">No stats available.</div>
      ) : (
        <div className="grid grid-cols-6 gap-4 text-s">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <span className="text-muted-foreground">{s.label}</span>
              <span className="font-medium">{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
