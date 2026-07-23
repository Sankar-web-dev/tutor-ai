'use client'

import { useState } from 'react'
import { QuestionInput } from '@/components/doubt-solver/question-input'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Sparkles } from 'lucide-react'

export default function DoubtSolverPage() {
  const [currentAnswer, setCurrentAnswer] = useState<{ question: string; answer: string } | null>(null)

  const handleAnswer = (question: string, answer: string) => {
    setCurrentAnswer({ question, answer })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI Doubt Solver</h1>
        <p className="text-muted-foreground mt-2">
          Ask questions and get instant AI-powered answers
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <QuestionInput onAnswer={handleAnswer} />
        </div>

        <div>
          {currentAnswer ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>Question</span>
                  </div>
                  <p className="font-semibold">{currentAnswer.question}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    <span>Answer</span>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{currentAnswer.answer}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Ask a question to see the answer here
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
