import React from 'react'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import clsx from 'clsx'

interface SectionProps {
  title: string
  onCopy: () => void
  children: React.ReactNode
  variant?: 'default' | 'blue' | 'orange'
}

export default function Section({
  title,
  onCopy,
  children,
  variant = 'default',
}: SectionProps) {
  const bgColor = clsx({
    'bg-card': variant === 'default',
    'bg-[#0D2438]': variant === 'blue',    // 💙 blue-toned for Notes / Summary
    'bg-[#2B1D0F]': variant === 'orange',  // 🧡 warm-toned for Exploit Strategy
  })

  const shadowColor = clsx({
    'shadow-[#00f2ff22] hover:shadow-[#00f2ff55]': variant === 'default',
    'shadow-[#0ea5e922] hover:shadow-[#0ea5e966]': variant === 'blue',
    'shadow-[#f9731622] hover:shadow-[#f97316aa]': variant === 'orange',
  })

  const isEmpty =
    !children ||
    (typeof children === 'string' && children.trim().length === 0) ||
    (Array.isArray(children) && children.length === 0)

  return (
    <div
      className={clsx(
        'border border-border rounded-xl p-4 shadow-md transition-all',
        bgColor,
        shadowColor
      )}
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-base font-semibold text-white">{title}</h4>
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            onCopy()
          }}
          className="text-muted-foreground hover:text-white"
        >
          <Copy className="w-4 h-4" />
        </Button>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {isEmpty ? (
          <span className="italic">No information available.</span>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
