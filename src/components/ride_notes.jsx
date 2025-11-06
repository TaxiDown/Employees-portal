{/*"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, X } from "lucide-react"


export function RideNotesSection({ rideId, notes, onNotesChange }: RideNotesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Parse notes by splitting on <NOTEEND> tag
  const parsedNotes = notes
    .split("<NOTEEND>")
    .filter((note) => note.trim())
    .map((note) => {
      const [commenter, ...content] = note.trim().split(":")
      return {
        commenter: commenter.trim() || "Fleet Manager",
        content: content.join(":").trim(),
      }
    })

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const formattedNote = `Fleet Manager: ${newNote.trim()}<NOTEEND>`
    const updatedNotes = notes ? notes + formattedNote : formattedNote

    onNotesChange(rideId, updatedNotes)
    setNewNote("")
    setIsSubmitting(false)
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
      >
        <MessageSquare size={16} />
        Notes{" "}
        {parsedNotes.length > 0 && (
          <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
            {parsedNotes.length}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {parsedNotes.length > 0 && (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {parsedNotes.map((note, idx) => (
                <div key={idx} className="bg-muted p-3 rounded-lg border border-border">
                  <p className="text-xs font-semibold text-primary mb-1">{note.commenter}</p>
                  <p className="text-sm text-foreground">{note.content}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Add Note</label>
            <Textarea
              placeholder="Enter your note here..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-20 resize-none"
              disabled={isSubmitting}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddNote} disabled={!newNote.trim() || isSubmitting} size="sm" className="flex-1">
                {isSubmitting ? "Adding..." : "Add Note"}
              </Button>
              <Button onClick={() => setIsExpanded(false)} variant="outline" size="sm">
                <X size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
*/}