import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'

export default function CommunityReview({ items }: { items: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🗣 Community Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((line, i) => (
          <div key={i} className="flex items-start gap-2">
            <span>•</span>
            <span className="text-sm">{line}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
