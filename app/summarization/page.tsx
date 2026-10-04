'use client'

import { useState } from 'react'
import { ResumeUpload } from '@/components/jd/resume-upload'
import { JDInput } from '@/components/jd/jd-input'
import { ComparisonResults } from '@/components/jd/comparison-results'
import { jdService, JDComparisonResult } from '@/services/jd.service'
import { useMutation } from '@tanstack/react-query'
import { Loader2, FileText, Briefcase, Sparkles, RotateCcw, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function SummarizationPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState<string>('')
  const [jdText, setJdText] = useState<string>('')
  const [results, setResults] = useState<JDComparisonResult | null>(null)

  const compareMutation = useMutation({
    mutationFn: ({ resume, jd }: { resume: string; jd: string }) =>
      jdService.compareResumeWithJD(resume, jd),
    onSuccess: (data) => {
      setResults(data)
      toast.success('Analysis completed successfully!')
    },
    onError: () => {
      toast.error('Failed to analyze resume. Please try again.')
    },
  })

  const handleResumeSelect = (file: File, text: string) => {
    setResumeFile(file)
    setResumeText(text)
    setResults(null)
  }

  const handleJDSubmit = (jd: string) => {
    setJdText(jd)
    setResults(null)
    
    if (resumeText && jd) {
      compareMutation.mutate({ resume: resumeText, jd })
    } else {
      toast.error('Please upload a resume first')
    }
  }

  const handleReset = () => {
    setResumeFile(null)
    setResumeText('')
    setJdText('')
    setResults(null)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                ATS Resume vs JD Analyzer
              </h1>
              <p className="text-xs text-muted-foreground">
                Benchmark your candidate profile against role requirements using advanced AI match scoring
              </p>
            </div>
          </div>
        </div>

        {results && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2 rounded-xl h-9"
          >
            <RotateCcw className="size-3.5" />
            Analyze Another Job
          </Button>
        )}
      </div>

      {!results ? (
        <div className="grid md:grid-cols-2 gap-6">
          <ResumeUpload 
            onFileSelect={handleResumeSelect}
            isLoading={compareMutation.isPending}
          />
          <JDInput 
            onJDSubmit={handleJDSubmit}
            isLoading={compareMutation.isPending}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <FileText className="h-4 w-4 text-primary" />
                <span className="truncate max-w-[200px]">{resumeFile?.name || 'Resume Uploaded'}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Briefcase className="h-4 w-4 text-purple-500" />
                <span>Job Description Parsed</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-primary hover:text-primary gap-1.5 h-8 px-2"
            >
              <ArrowLeft className="size-3.5" /> Modify Inputs
            </Button>
          </div>

          {compareMutation.isPending ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Evaluating keyword density & skill coverage...</p>
              <p className="text-xs text-muted-foreground">Comparing candidate experience against requirements</p>
            </div>
          ) : (
            <ComparisonResults results={results} />
          )}
        </div>
      )}
    </div>
  )
}
