'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Sparkles, Loader2, Trash2 } from 'lucide-react'

interface JDInputProps {
  onJDSubmit: (jdText: string) => void
  isLoading?: boolean
}

export function JDInput({ onJDSubmit, isLoading }: JDInputProps) {
  const [jdText, setJdText] = useState('')

  const handleSubmit = () => {
    if (jdText.trim()) {
      onJDSubmit(jdText.trim())
    }
  }

  const handleClear = () => {
    setJdText('')
  }

  return (
    <Card className="border border-border/70 bg-card/80 backdrop-blur-sm shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Briefcase className="size-4" />
            </div>
            2. Target Job Description
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            Step 2 of 2
          </Badge>
        </div>
        <CardDescription>
          Paste the job posting requirements, roles, required tech stacks, and qualifications.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
        <div className="relative flex-1">
          <textarea
            value={jdText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJdText(e.target.value)}
            placeholder="Paste complete Job Description here (Role, Responsibilities, Required Skills, Eligibility criteria)..."
            rows={9}
            className="w-full p-4 border border-border/80 bg-background/50 rounded-2xl resize-none text-xs sm:text-sm leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-sans"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 mt-1">
            <span>{jdText.length > 0 ? `${jdText.length} characters entered` : 'Ready for input'}</span>
            {jdText.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
              >
                <Trash2 className="size-3" /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2.5 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!jdText.trim() || isLoading}
            className="gap-2 flex-1 rounded-xl shadow-md shadow-primary/20 h-10 font-semibold text-xs sm:text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Computing ATS Score & Gaps...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze Match with AI
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={isLoading || !jdText}
            className="rounded-xl h-10 px-4 text-xs"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
