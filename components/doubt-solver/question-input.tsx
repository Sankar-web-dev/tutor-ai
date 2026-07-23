'use client'

import { useState } from 'react'
import { doubtSolverService } from '@/services/doubt-solver.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Sparkles, Send } from 'lucide-react'
import { toast } from 'sonner'

interface QuestionInputProps {
  onAnswer?: (question: string, answer: string) => void
}

export function QuestionInput({ onAnswer }: QuestionInputProps) {
  const [question, setQuestion] = useState('')
  const queryClient = useQueryClient()

  const askMutation = useMutation({
    mutationFn: (q: string) => doubtSolverService.askQuestion(q),
    onSuccess: async (answer) => {
      // Save to history
      await doubtSolverService.saveQuestion({ question, answer })
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      
      toast.success('Answer received!')
      onAnswer?.(question, answer)
      setQuestion('')
    },
    onError: () => {
      toast.error('Failed to get answer. Please try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim()) {
      askMutation.mutate(question)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Ask a Question
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="question">Your Question</Label>
            <textarea
              id="question"
              value={question}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuestion(e.target.value)}
              placeholder="Ask anything about your studies, coding, or any topic..."
              rows={4}
              className="mt-2 w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button
            type="submit"
            disabled={!question.trim() || askMutation.isPending}
            className="w-full gap-2"
          >
            {askMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Ask AI
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
