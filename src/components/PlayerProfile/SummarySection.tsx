'use client'

import { Bell, Share2, Plus } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function SummarySection({
  username,
  summary,
  tags,
  isWatchlisted,
  onToggleWatch,
  onShare,
}: {
  username: string
  summary: string
  tags: string[]
  isWatchlisted: boolean
  onToggleWatch: () => void
  onShare: () => void
}) {
  return (
    <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20 mb-8">
      <CardHeader className="flex flex-col lg:flex-row lg:justify-between gap-6">
        {/* Left block */}
        <div>
          <CardTitle className="text-3xl font-bold text-green-400 mb-2">
            {username}
          </CardTitle>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {summary}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            {(tags ?? []).map((t) => (
              <Badge key={t} className="bg-green-600 text-white text-xs">
                {t}
              </Badge>
            ))}
            <Button
              variant="outline"
              size="sm"
              aria-label="Share profile"
              className="h-6 w-6 p-0 rounded-full border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
              onClick={onShare}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            aria-label={isWatchlisted ? 'Unwatch player' : 'Watch player'}
            className={`flex items-center gap-2 ${
              isWatchlisted ? 'bg-yellow-500 text-black' : 'bg-green-600 text-white'
            }`}
            onClick={onToggleWatch}
          >
            <Bell className="h-4 w-4" />
            {isWatchlisted ? 'Unwatch' : 'Watch'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onShare}
            aria-label="Share player profile"
          >
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}
