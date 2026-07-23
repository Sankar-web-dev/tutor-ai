'use client'

import { doubtSolverService, Question } from '@/services/doubt-solver.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2, MessageSquare, Clock, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface HistoryListProps {
  onQuestionClick?: (question: Question) => void
}

export function HistoryList({ onQuestionClick }: HistoryListProps) {
  const queryClient = useQueryClient()

  const { data: questions, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['questions'],
    queryFn: () => doubtSolverService.getQuestions(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => doubtSolverService.deleteQuestion(id),
    onSuccess: () => {
      toast.success('Question deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
    onError: () => {
      toast.error('Failed to delete question')
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <MessageSquare className="h-12 w-12 text-muted-foreground" />
        <p className="text-red-500 font-medium">Failed to load history</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <MessageSquare className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No questions yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Question History</h2>
          <p className="text-muted-foreground mt-1">{questions.length} questions</p>
        </div>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          size="sm"
          disabled={isRefetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((q) => (
          <Card key={q.id} className="hover:border-primary/50 transition-all">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-2">{q.question}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">{q.answer}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(q.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(q.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
