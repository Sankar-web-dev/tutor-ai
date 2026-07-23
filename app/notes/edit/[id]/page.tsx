'use client'

import { NoteForm } from '@/components/notes/note-form'
import { notesService, Note } from '@/services/notes.service'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

export default function EditNotePage({ params }: { params: { id: string } }) {
  const { data: note, isLoading, error } = useQuery({
    queryKey: ['note', params.id],
    queryFn: () => notesService.getNote(params.id),
  })

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading note...</p>
        </div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-red-500 font-medium">Failed to load note</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <NoteForm note={note} />
    </div>
  )
}
