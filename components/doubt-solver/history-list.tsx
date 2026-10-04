'use client'

import { doubtSolverService, Question } from '@/services/doubt-solver.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2, MessageSquare, Clock, RefreshCw, Bot, ChevronRight } from 'lucide-react'
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
      toast.success('Question removed from history')
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
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Loading inquiry history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border border-border/70 max-w-md mx-auto my-12 text-center p-8 space-y-4">
        <div className="size-14 rounded-2xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
          <MessageSquare className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Failed to Load History</h3>
          <p className="text-xs text-muted-foreground mt-1">Check network connection</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </Card>
    )
  }

  if (!questions || questions.length === 0) {
    return (
      <Card className="border border-border/70 max-w-md mx-auto my-12 text-center p-8 space-y-4">
        <div className="size-14 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground">
          <MessageSquare className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">No Questions Logged</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Questions asked to the AI Assistant will be archived here for easy revision.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Inquiry Archive</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{questions.length} queries solved</p>
        </div>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          size="sm"
          disabled={isRefetching}
          className="gap-2 rounded-xl h-9"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {questions.map((q) => (
          <Card
            key={q.id}
            className="group border border-border/70 bg-card/85 backdrop-blur-sm hover:border-primary/50 hover:shadow-md transition-all duration-200 rounded-2xl cursor-pointer"
            onClick={() => onQuestionClick?.(q)}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                        {q.question}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-3 mt-1.5 leading-relaxed font-sans">
                        {q.answer}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg text-muted-foreground hover:text-destructive shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(q.id)
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3" />
                    {new Date(q.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="text-primary font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    View Explanation <ChevronRight className="size-3" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
