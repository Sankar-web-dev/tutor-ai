'use client'

import { useState } from 'react'
import { JDInput } from '@/components/jd/jd-input'
import { JDDetailsDisplay } from '@/components/jd/jd-details-display'
import { jdExtractionService, JDDetails } from '@/services/jd-extraction.service'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Briefcase, Sparkles, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function JDAnalyzerPage() {
  const [jdText, setJdText] = useState<string>('')
  const [details, setDetails] = useState<JDDetails | null>(null)

  const extractMutation = useMutation({
    mutationFn: (jd: string) => jdExtractionService.extractJDDetails(jd),
    onSuccess: (data) => {
      setDetails(data)
      toast.success('JD details extracted successfully!')
    },
    onError: () => {
      toast.error('Failed to extract JD details. Please try again.')
    },
  })

  const handleJDSubmit = (jd: string) => {
    setJdText(jd)
    setDetails(null)
    extractMutation.mutate(jd)
  }

  const handleReset = () => {
    setJdText('')
    setDetails(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Briefcase className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Job Description Intelligence
              </h1>
              <p className="text-xs text-muted-foreground">
                Instant AI breakdown of CTC salary, service bonds, required tech stack, and interview criteria
              </p>
            </div>
          </div>
        </div>

        {details && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2 rounded-xl h-9"
          >
            <RotateCcw className="size-3.5" />
            Analyze Another JD
          </Button>
        )}
      </div>

      {!details ? (
        <div className="max-w-3xl mx-auto">
          <JDInput 
            onJDSubmit={handleJDSubmit}
            isLoading={extractMutation.isPending}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {extractMutation.isPending ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Extracting Job Criteria & Packages...</p>
              <p className="text-xs text-muted-foreground">Structuring role parameters with OpenRouter LLM</p>
            </div>
          ) : (
            <JDDetailsDisplay details={details} />
          )}
        </div>
      )}
    </div>
  )
}
