'use client'

import { useState } from 'react'
import { notesService, CreateNoteInput, UpdateNoteInput, Note } from '@/services/notes.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, ArrowLeft, StickyNote } from 'lucide-react'
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

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 rounded-xl text-xs">
          <ArrowLeft className="h-4 w-4" />
          Back to Notes
        </Button>
      </div>

      <Card className="border border-border/70 bg-card/85 backdrop-blur-sm shadow-sm rounded-2xl">
        <CardHeader className="pb-4 border-b border-border/40">
          <CardTitle className="text-xl flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <StickyNote className="size-4" />
            </div>
            {note ? 'Edit Note' : 'Create Smart Note'}
          </CardTitle>
          <CardDescription className="text-xs">
            Save interview strategies, aptitude formulas, or company research notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold text-foreground">Note Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="e.g. Google System Design Cheatsheet, HR Questions..."
                className="rounded-xl h-10 border-border/70 bg-background/50 text-sm focus:ring-primary/30"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content" className="text-xs font-semibold text-foreground">Content</Label>
              <textarea
                id="content"
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                placeholder="Write your note notes, bullet points, code snippets, or interview checklist..."
                rows={12}
                className="w-full p-4 border border-border/70 bg-background/50 rounded-2xl resize-none text-sm leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-sans"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                type="submit"
                disabled={isSaving}
                className="gap-2 rounded-xl h-10 px-5 text-sm font-semibold shadow-sm shadow-primary/20"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Note...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {note ? 'Update Note' : 'Save Note'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSaving}
                className="rounded-xl h-10 text-sm"
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
