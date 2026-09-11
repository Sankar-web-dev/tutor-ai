'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { driveService, DriveFile } from '@/services/drive.service'
import { QAResult } from '@/services/drive-qa.service'
import { ragService } from '@/services/rag.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, FolderOpen, ArrowLeft, MessageSquare, BookOpen, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export default function QAFromDrivePage() {
  const [folderId, setFolderId] = useState<string | undefined>(undefined)
  const [folderHistory, setFolderHistory] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<QAResult | null>(null)

  const { data: files, isLoading, error, refetch } = useQuery({
    queryKey: ['qa-drive-files', folderId],
    queryFn: () => driveService.listFiles(folderId),
  })

  const qaMutation = useMutation({
    mutationFn: async () => {
      if (!files) throw new Error('No files loaded')
      const chosenFiles = files.filter((f) => selectedFiles.includes(f.id) && !driveService.isFolder(f))
      if (chosenFiles.length === 0) throw new Error('No readable files selected')
      return ragService.askRAGFromFiles(chosenFiles, question)
    },
    onSuccess: (data) => {
      setResult({ rag: '', easy: data.answer, references: data.references })
      toast.success('Answer generated!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate answer')
    },
  })

  const handleFolderClick = (id: string) => {
    setFolderHistory([...folderHistory, folderId || 'root'])
    setFolderId(id)
    setSelectedFiles([])
    setResult(null)
  }

  const handleBack = () => {
    const previous = folderHistory.pop()
    setFolderId(previous === 'root' ? undefined : previous)
    setFolderHistory([...folderHistory])
    setSelectedFiles([])
    setResult(null)
  }

  const toggleFile = (id: string) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleAsk = () => {
    if (!question.trim()) {
      toast.error('Please enter a question')
      return
    }
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file')
      return
    }
    setResult(null)
    qaMutation.mutate()
  }

  const folders = files?.filter((f) => driveService.isFolder(f)) || []
  const regularFiles = files?.filter((f) => !driveService.isFolder(f)) || []

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">QA from Drive Notes</h1>
        <p className="text-muted-foreground mt-2">
          Select Google Drive files and ask questions. Get a strict RAG answer from your notes and an easy AI explanation with internet references.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FolderOpen className="h-5 w-5" />
                Select Files
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {folderId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading files...
                </div>
              ) : error ? (
                <div className="text-center text-red-500">
                  <p className="font-medium">Failed to load files</p>
                  <p className="text-xs mt-1">
                    {error instanceof Error ? error.message : 'Unknown error'}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer"
                      onClick={() => handleFolderClick(folder.id)}
                    >
                      <span className="text-xl">📁</span>
                      <span className="text-sm font-medium">{folder.name}</span>
                    </div>
                  ))}

                  {regularFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted"
                    >
                      <input
                        id={file.id}
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => toggleFile(file.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-xl">{driveService.getFileIcon(file.mimeType)}</span>
                      <label htmlFor={file.id} className="text-sm cursor-pointer flex-1">
                        {file.name}
                      </label>
                    </div>
                  ))}

                  {folders.length === 0 && regularFiles.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No files in this folder
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {selectedFiles.length} file(s) selected
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Ask a Question
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="e.g. What is the drive date for Kyndryl?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              />
              <Button
                onClick={handleAsk}
                disabled={qaMutation.isPending}
                className="gap-2"
              >
                {qaMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    Ask
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5" />
                    Easy Explanation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {result.easy}
                  </div>

                  {result.references.length > 0 && (
                    <div className="space-y-2 pt-4 border-t">
                      <p className="text-sm font-semibold">Reference Links</p>
                      <div className="space-y-2">
                        {result.references.map((ref, idx) => (
                          <a
                            key={idx}
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {ref.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
