'use client'

import { useState } from 'react'
import { doubtSolverService } from '@/services/doubt-solver.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, Send, Bot, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'

interface QuestionInputProps {
  onAnswer?: (question: string, answer: string) => void
}

const SAMPLE_PROMPTS = [
  "Explain Time & Space Complexity of QuickSort vs MergeSort",
  "How to structure an answer for 'Tell me about yourself' in campus placements?",
  "What are ACID properties in database transactions with real examples?",
  "Explain polymorphism in OOP with a simple code snippet"
]

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
    <Card className="border border-border/70 bg-card/85 backdrop-blur-sm shadow-sm rounded-2xl">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <div className="size-8 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center">
              <Bot className="size-4" />
            </div>
            Ask AI Career Assistant
          </CardTitle>
          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
            GPT / OpenRouter Active
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Get technical breakdowns, interview prep explanations, or concept simplifications.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Sample prompt chips */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <Lightbulb className="size-3 text-amber-500" />
            Quick prompt starters:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuestion(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-border/60 bg-muted/30 hover:border-primary/40 hover:bg-primary/5 transition-all text-left text-muted-foreground hover:text-foreground truncate max-w-full"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div>
            <Label htmlFor="question" className="text-xs font-semibold text-foreground">Your Question</Label>
            <textarea
              id="question"
              value={question}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuestion(e.target.value)}
              placeholder="Ask anything about coding, placement rounds, data structures, or interview preparation..."
              rows={4}
              className="mt-1.5 w-full p-3.5 border border-border/70 bg-background/50 rounded-2xl resize-none text-xs sm:text-sm leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-sans"
            />
          </div>

          <Button
            type="submit"
            disabled={!question.trim() || askMutation.isPending}
            className="w-full gap-2 rounded-xl h-10 text-sm font-semibold shadow-md shadow-primary/20"
          >
            {askMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Consulting AI Tutor...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Ask Assistant
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
