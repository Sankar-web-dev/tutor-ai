'use client'

import { useState } from 'react'
import { ResumeUpload } from '@/components/jd/resume-upload'
import { JDInput } from '@/components/jd/jd-input'
import { ComparisonResults } from '@/components/jd/comparison-results'
import { jdService, JDComparisonResult } from '@/services/jd.service'
import { useMutation } from '@tanstack/react-query'
import { Loader2, FileText, Briefcase } from 'lucide-react'
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
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">JD Resume Analyzer</h1>
        <p className="text-muted-foreground mt-2">
          Compare your resume with job descriptions to get personalized feedback and suggestions
        </p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="truncate max-w-[200px]">{resumeFile?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span>Job Description</span>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-primary hover:underline"
            >
              Analyze Another
            </button>
          </div>

          {compareMutation.isPending ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Analyzing your resume...</p>
            </div>
          ) : (
            <ComparisonResults results={results} />
          )}
        </div>
      )}
    </div>
  )
}
