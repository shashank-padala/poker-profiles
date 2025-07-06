// src/components/PlayerProfile/StatsCard.tsx
'use client'

import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export default function StatsSection({
  title,
  hands,
  data,
  colorClass,
}: {
  title: string
  hands: number
  data: { label: string; value: number | string; gto: number | string }[]
  colorClass: string       // e.g. 'text-blue-400' or 'text-purple-400'
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:justify-between">
        <CardTitle className={`font-semibold ${colorClass}`}>{title}</CardTitle>
        <p className="text-xs text-muted-foreground mt-1 sm:mt-0">
          Based on {hands.toLocaleString()} hands
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((s) => {
          const val = typeof s.value === 'number' ? `${s.value}%` : s.value
          const gto = typeof s.gto === 'number' ? `${s.gto}%` : s.gto
          const percent = typeof s.value === 'number' ? s.value : 0
          const marker = typeof s.gto === 'number' ? s.gto : 0

          return (
            <div key={s.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{s.label}</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-medium">{val}</span>
                  <span className="text-xs text-muted-foreground">GTO: {gto}</span>
                </div>
              </div>
              <div className="relative h-2 bg-slate-700 rounded">
                <div
                  className="absolute h-2 bg-white rounded"
                  style={{ width: `${percent}%` }}
                />
                <div
                  className={`absolute h-2 w-px bg-orange-400`}
                  style={{ left: `${marker}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
