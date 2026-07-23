'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, Sparkles } from 'lucide-react'

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Job Description
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          value={jdText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJdText(e.target.value)}
          placeholder="Paste the job description here..."
          rows={10}
          className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        />
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!jdText.trim() || isLoading}
            className="gap-2 flex-1"
          >
            <Sparkles className="h-4 w-4" />
            Analyze
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={isLoading}
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
