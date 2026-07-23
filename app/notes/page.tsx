'use client'

import { useState } from 'react'
import { NotesList } from '@/components/notes/notes-list'
import { useRouter } from 'next/navigation'

export default function NotesPage() {
  const router = useRouter()

  const handleCreateNote = () => {
    router.push('/notes/create')
  }

  return (
    <div className="container mx-auto p-6">
      <NotesList onCreateNote={handleCreateNote} />
    </div>
  )
}
