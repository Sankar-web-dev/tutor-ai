'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { driveService, DriveFile } from '@/services/drive.service'
import { QAResult } from '@/services/drive-qa.service'
import { ragService } from '@/services/rag.service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  FolderOpen,
  ArrowLeft,
  MessageSquare,
  BookOpen,
  ExternalLink,
  BrainCircuit,
  FileText,
  Folder,
  CheckSquare,
  Square,
  Sparkles,
  Send
} from 'lucide-react'
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
      toast.success('Answer synthesized from Drive documents!')
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
      toast.error('Please select at least one file from your Drive')
      return
    }
    setResult(null)
    qaMutation.mutate()
  }

  const folders = files?.filter((f) => driveService.isFolder(f)) || []
  const regularFiles = files?.filter((f) => !driveService.isFolder(f)) || []

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <BrainCircuit className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Drive Document Q&A</h1>
            <p className="text-xs text-muted-foreground">
              Retrieval-Augmented Generation (RAG) assistant indexing course notes, company PDFs, and drive files
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Drive Document File Selector Card */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <FolderOpen className="size-4 text-primary" />
                  Select Source Docs
                </CardTitle>
                <Badge variant={selectedFiles.length > 0 ? "success" : "outline"} className="text-[10px]">
                  {selectedFiles.length} Selected
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Pick PDFs or notes for the AI to cite
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {folderId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="gap-1.5 rounded-xl text-xs h-8 w-full"
                >
                  <ArrowLeft className="size-3.5" />
                  Up to parent folder
                </Button>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <p className="text-xs">Scanning Google Drive...</p>
                </div>
              ) : error ? (
                <div className="text-center p-4 border border-destructive/20 rounded-xl bg-destructive/5 space-y-2">
                  <p className="text-xs font-semibold text-destructive">Failed to load Drive files</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs h-7">
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-transparent hover:border-border/60 hover:bg-muted/50 cursor-pointer transition-colors text-xs font-medium text-foreground"
                      onClick={() => handleFolderClick(folder.id)}
                    >
                      <Folder className="size-4 text-amber-500 shrink-0" />
                      <span className="truncate flex-1">{folder.name}</span>
                    </div>
                  ))}

                  {regularFiles.map((file) => {
                    const isSelected = selectedFiles.includes(file.id)
                    return (
                      <div
                        key={file.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                          isSelected
                            ? 'border-primary/40 bg-primary/10 text-foreground font-medium'
                            : 'border-border/50 hover:border-border hover:bg-muted/30 text-foreground/80'
                        }`}
                        onClick={() => toggleFile(file.id)}
                      >
                        <div className="shrink-0 text-primary">
                          {isSelected ? (
                            <CheckSquare className="size-4 text-primary" />
                          ) : (
                            <Square className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <FileText className="size-4 text-sky-500 shrink-0" />
                        <span className="truncate flex-1">{file.name}</span>
                      </div>
                    )
                  })}

                  {folders.length === 0 && regularFiles.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      No documents found in this directory
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Q&A Chat & Synthesis Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <MessageSquare className="size-4 text-primary" />
                Query Selected Documents
              </CardTitle>
              <CardDescription className="text-xs">
                Ask specific questions like interview dates, package requirements, or exam concepts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. What are the key topics covered in Unit IV or eligibility criteria for the drive?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                  className="rounded-xl border-border/70 text-xs sm:text-sm h-10 bg-background/50 focus:ring-primary/30"
                />
                <Button
                  onClick={handleAsk}
                  disabled={qaMutation.isPending || !question.trim() || selectedFiles.length === 0}
                  className="gap-2 rounded-xl h-10 px-5 text-xs sm:text-sm font-semibold shadow-sm shrink-0"
                >
                  {qaMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Retrieving...
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5" />
                      Ask
                    </>
                  )}
                </Button>
              </div>

              {selectedFiles.length === 0 && (
                <p className="text-[11px] text-amber-500 font-medium flex items-center gap-1">
                  * Please check at least one source file from the list on the left to activate RAG search.
                </p>
              )}
            </CardContent>
          </Card>

          {/* AI Response Output */}
          {result && (
            <Card className="border border-primary/20 bg-gradient-to-br from-card via-card/90 to-primary/5 shadow-sm backdrop-blur-sm animate-in fade-in duration-300">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base text-foreground">
                    <Sparkles className="size-4 text-primary" />
                    AI Synthesized Answer
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                    TF-IDF Verified
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-foreground font-sans bg-muted/20 p-4 rounded-2xl border border-border/50">
                  {result.easy}
                </div>

                {result.references?.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Reference Sources & Links
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {result.references.map((ref, idx) => (
                        <a
                          key={idx}
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:text-primary transition-all text-xs group"
                        >
                          <span className="truncate font-medium flex items-center gap-2">
                            <BookOpen className="size-3.5 text-primary shrink-0" />
                            {ref.title}
                          </span>
                          <ExternalLink className="size-3.5 opacity-60 group-hover:opacity-100 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
