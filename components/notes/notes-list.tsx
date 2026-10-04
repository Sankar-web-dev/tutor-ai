'use client'

import { notesService, Note } from '@/services/notes.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  FileText,
  RefreshCw,
  Search,
  StickyNote,
  Calendar,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'

interface NotesListProps {
  onCreateNote?: () => void
}

export function NotesList({ onCreateNote }: NotesListProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: notes, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['notes'],
    queryFn: () => notesService.getNotes(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notesService.deleteNote(id),
    onSuccess: () => {
      toast.success('Note deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
    onError: () => {
      toast.error('Failed to delete note')
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/notes/edit/${id}`)
  }

  const filteredNotes = useMemo(() => {
    if (!notes) return []
    if (!searchTerm.trim()) return notes
    const lower = searchTerm.toLowerCase()
    return notes.filter(
      (n) => n.title?.toLowerCase().includes(lower) || n.content?.toLowerCase().includes(lower)
    )
  }, [notes, searchTerm])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Loading your notes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border border-border/70 max-w-md mx-auto my-12 text-center p-8 space-y-4">
        <div className="size-12 rounded-2xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Failed to Load Notes</h3>
          <p className="text-xs text-muted-foreground mt-1">Check database connection</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </Card>
    )
  }

  if (!notes || notes.length === 0) {
    return (
      <Card className="border border-border/70 max-w-md mx-auto my-12 text-center p-8 space-y-4">
        <div className="size-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <StickyNote className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">No Notes Yet</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Capture interview tips, company requirements, and revision snippets.
          </p>
        </div>
        <Button onClick={onCreateNote} className="gap-2 rounded-xl shadow-sm">
          <Plus className="h-4 w-4" />
          Create First Note
        </Button>
      </Card>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <StickyNote className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Smart Notes</h1>
              <p className="text-xs text-muted-foreground">
                Your personal repository of interview prep, aptitude shortcuts, and placement insights
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-border/70 bg-background/50"
            />
          </div>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm"
            disabled={isRefetching}
            className="rounded-xl h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={onCreateNote} size="sm" className="gap-1.5 rounded-xl h-9 font-semibold shadow-xs">
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </div>
      </div>

      {/* Grid of Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <Card
            key={note.id}
            className="group hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer border border-border/70 bg-card/80 backdrop-blur-sm rounded-2xl flex flex-col justify-between"
            onClick={() => handleEdit(note.id)}
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors flex-1">
                  {note.title}
                </h3>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(note.id)
                    }}
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(note.id)
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed font-sans min-h-[4rem]">
                {note.content || 'Empty note content...'}
              </p>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {new Date(note.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-primary font-medium group-hover:underline">Open Note →</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
