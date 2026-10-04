'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, X, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ResumeUploadProps {
  onFileSelect: (file: File, text: string) => void
  isLoading?: boolean
}

export function ResumeUpload({ onFileSelect, isLoading }: ResumeUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = (file: File) => {
    // Check file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'text/plain']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF, image, or text file')
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)

    // Extract text from file
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setExtractedText(text)
        onFileSelect(file, text)
      }
      reader.onerror = () => {
        toast.error('Failed to read file')
      }
      reader.readAsText(file)
    } catch (error) {
      toast.error('Failed to process file')
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleClear = () => {
    setSelectedFile(null)
    setExtractedText('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="border border-border/70 bg-card/80 backdrop-blur-sm shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <FileText className="size-4" />
            </div>
            1. Candidate Resume
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            Step 1 of 2
          </Badge>
        </div>
        <CardDescription>
          Upload your resume in PDF, TXT or image format to extract skills and projects.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
        {!selectedFile ? (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border/80 hover:border-primary/50 hover:bg-muted/30'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="size-14 rounded-2xl bg-primary/10 text-primary mx-auto mb-3 flex items-center justify-center">
              <Upload className="size-6" />
            </div>
            <p className="font-semibold text-sm text-foreground mb-1">
              Drag & drop your resume here
            </p>
            <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
              Supports PDF, PNG, JPG, or TXT documents up to 5MB
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.txt"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />

            <Button
              type="button"
              disabled={isLoading}
              size="sm"
              className="gap-2 rounded-xl shadow-sm"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Resume...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Browse Files
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-muted/40 border border-border/70 rounded-2xl">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready for matching
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                disabled={isLoading}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {extractedText && (
              <div className="p-3.5 bg-background/60 border border-border/60 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-medium flex items-center gap-1">
                    <Sparkles className="size-3 text-primary" /> Extracted Resume Buffer
                  </span>
                  <span>{extractedText.length} characters</span>
                </div>
                <p className="text-xs text-muted-foreground/90 font-mono line-clamp-3 leading-relaxed bg-muted/30 p-2 rounded-lg">
                  {extractedText.slice(0, 240)}...
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
