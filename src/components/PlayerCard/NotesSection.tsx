import React, { ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Pencil } from 'lucide-react'

interface NotesSectionProps {
  notes: string
  editing: boolean
  draft: string
  onStartEdit: () => void
  onDraftChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onSave: () => void
  onCancel: () => void
}

export default function NotesSection({
  notes,
  editing,
  draft,
  onStartEdit,
  onDraftChange,
  onSave,
  onCancel,
}: NotesSectionProps) {
  const hasNotes = notes && notes.trim().length > 0

  return (
    <div className="bg-[#101c33] p-4 rounded-xl border border-[#2a395b]">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-L font-semibold text-blue-300">📝 My Notes</h4>
        <div className="flex gap-1">
          {editing ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="text-green-400"
                onClick={(e) => {
                  e.stopPropagation()
                  onSave()
                }}
              >
                ✓
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-400"
                onClick={(e) => {
                  e.stopPropagation()
                  onCancel()
                }}
              >
                ✕
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onStartEdit()
              }}
              className="text-muted-foreground hover:text-white"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {editing ? (
        <Textarea
          rows={3}
          value={draft}
          onChange={onDraftChange}
          onClick={(e) => e.stopPropagation()}
          className="bg-background text-foreground border border-border"
          placeholder="Write your notes here..."
        />
      ) : hasNotes ? (
        <p className="text-m text-white whitespace-pre-wrap">{notes}</p>
      ) : (
        <p className="text-sm italic text-muted-foreground">
          No notes added yet. Click the pencil to add notes.
        </p>
      )}
    </div>
  )
}
