import { Edit3 } from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function NotesSection({
  notes,
  editing,
  onEdit,
  onChange,
  onSave,
}: {
  notes: string
  editing: boolean
  onEdit: () => void
  onChange: (v: string) => void
  onSave: () => void
}) {
  const hasText = notes?.trim().length > 0

  return (
    <Card className="border-blue-500/20 bg-blue-500/10">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-blue-400 flex items-center gap-2">
          📝 My Notes
          <Button size="sm" variant="ghost" onClick={onEdit} aria-label="Edit note">
            <Edit3 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-2">
            <textarea
              className="w-full p-2 border rounded bg-background text-foreground"
              rows={3}
              aria-label="Edit notes"
              value={notes}
              onChange={(e) => onChange(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={onSave} disabled={!hasText}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={onEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p>{hasText ? notes : <em>No notes yet.</em>}</p>
        )}
      </CardContent>
    </Card>
  )
}
