'use client'

import { useState } from 'react'
import { JDInput } from '@/components/jd/jd-input'
import { JDDetailsDisplay } from '@/components/jd/jd-details-display'
import { jdExtractionService, JDDetails } from '@/services/jd-extraction.service'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Briefcase } from 'lucide-react'
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
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">JD Analyzer</h1>
        <p className="text-muted-foreground mt-2">
          Extract key details from job descriptions including company, role, salary, and more
        </p>
      </div>

      {!details ? (
        <div className="max-w-3xl">
          <JDInput 
            onJDSubmit={handleJDSubmit}
            isLoading={extractMutation.isPending}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>Job Description Analyzed</span>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-primary hover:underline"
            >
              Analyze Another JD
            </button>
          </div>

          {extractMutation.isPending ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Extracting JD details...</p>
            </div>
          ) : (
            <JDDetailsDisplay details={details} />
          )}
        </div>
      )}
    </div>
  )
}
