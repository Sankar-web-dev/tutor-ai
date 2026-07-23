'use client'

import { useState } from 'react'
import { notesService, CreateNoteInput, UpdateNoteInput, Note } from '@/services/notes.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface NoteFormProps {
  note?: Note
  onSuccess?: () => void
}

export function NoteForm({ note, onSuccess }: NoteFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')

  const createMutation = useMutation({
    mutationFn: (input: CreateNoteInput) => notesService.createNote(input),
    onSuccess: () => {
      toast.success('Note created successfully!')
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      onSuccess?.()
      router.push('/notes')
    },
    onError: () => {
      toast.error('Failed to create note')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNoteInput }) =>
      notesService.updateNote(id, input),
    onSuccess: () => {
      toast.success('Note updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['note', note?.id] })
      onSuccess?.()
      router.push('/notes')
    },
    onError: () => {
      toast.error('Failed to update note')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (note) {
      updateMutation.mutate({
        id: note.id,
        input: { title, content },
      })
    } else {
      createMutation.mutate({ title, content })
    }
  }

  const handleBack = () => {
    router.push('/notes')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Notes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{note ? 'Edit Note' : 'Create New Note'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="Note title"
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                placeholder="Write your note here..."
                rows={12}
                className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="gap-2"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {note ? 'Update Note' : 'Create Note'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
