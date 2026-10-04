'use client'

import { driveService, DriveFile } from '@/services/drive.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  FolderOpen,
  File,
  RefreshCw,
  Upload,
  FolderPlus,
  MoreVertical,
  Trash2,
  Edit2,
  ArrowLeft,
  Folder,
  FileText,
  Calendar,
  HardDrive
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useState, useRef } from 'react'
import { toast } from 'sonner'

interface DriveFileManagerProps {
  folderId?: string
  title: string
}

export function DriveFileManager({ folderId, title }: DriveFileManagerProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(folderId)
  const [folderHistory, setFolderHistory] = useState<string[]>([])
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null)
  const [newFileName, setNewFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const queryClient = useQueryClient()

  const { data: files, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['drive-files', currentFolderId],
    queryFn: () => driveService.listFiles(currentFolderId),
  })

  const createFolderMutation = useMutation({
    mutationFn: ({ name, parentId }: { name: string; parentId?: string }) =>
      driveService.createFolder(name, parentId),
    onSuccess: () => {
      toast.success('Folder created successfully')
      setIsCreateFolderOpen(false)
      setNewFolderName('')
      queryClient.invalidateQueries({ queryKey: ['drive-files'] })
    },
    onError: () => {
      toast.error('Failed to create folder')
    },
  })

  const uploadFileMutation = useMutation({
    mutationFn: ({ file, parentId }: { file: File; parentId?: string }) =>
      driveService.uploadFile(file, parentId),
    onSuccess: () => {
      toast.success('File uploaded successfully')
      setIsUploadOpen(false)
      setSelectedFile(null)
      queryClient.invalidateQueries({ queryKey: ['drive-files'] })
    },
    onError: () => {
      toast.error('Failed to upload file')
    },
  })

  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) => driveService.deleteFile(fileId),
    onSuccess: () => {
      toast.success('File deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['drive-files'] })
    },
    onError: () => {
      toast.error('Failed to delete file')
    },
  })

  const renameFileMutation = useMutation({
    mutationFn: ({ fileId, newName }: { fileId: string; newName: string }) =>
      driveService.renameFile(fileId, newName),
    onSuccess: () => {
      toast.success('File renamed successfully')
      setIsRenaming(false)
      setRenamingFileId(null)
      setNewFileName('')
      queryClient.invalidateQueries({ queryKey: ['drive-files'] })
    },
    onError: () => {
      toast.error('Failed to rename file')
    },
  })

  const handleFolderClick = (folderId: string) => {
    setFolderHistory([...folderHistory, currentFolderId || 'root'])
    setCurrentFolderId(folderId)
  }

  const handleBack = () => {
    const previousFolder = folderHistory.pop()
    setCurrentFolderId(previousFolder === 'root' ? undefined : previousFolder || undefined)
    setFolderHistory([...folderHistory])
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolderMutation.mutate({ name: newFolderName, parentId: currentFolderId })
    }
  }

  const handleFileUpload = () => {
    if (selectedFile) {
      uploadFileMutation.mutate({ file: selectedFile, parentId: currentFolderId })
    }
  }

  const handleDelete = (fileId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteFileMutation.mutate(fileId)
    }
  }

  const handleRename = (fileId: string, currentName: string) => {
    setRenamingFileId(fileId)
    setNewFileName(currentName)
    setIsRenaming(true)
  }

  const handleRenameSubmit = () => {
    if (renamingFileId && newFileName.trim()) {
      renameFileMutation.mutate({ fileId: renamingFileId, newName: newFileName })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Accessing Google Drive storage...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border border-border/70 max-w-md mx-auto my-12 text-center p-8 space-y-4">
        <div className="size-14 rounded-2xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
          <FolderOpen className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Drive Connection Failed</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {error instanceof Error ? error.message : 'Please check your Google Drive permissions'}
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </Card>
    )
  }

  const folders = files?.filter(f => driveService.isFolder(f)) || []
  const regularFiles = files?.filter(f => !driveService.isFolder(f)) || []

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {currentFolderId && (
            <Button variant="outline" size="sm" onClick={handleBack} className="gap-1.5 rounded-xl text-xs h-9">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <HardDrive className="size-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            </div>
            <p className="text-xs text-muted-foreground">
              {folders.length} directories, {regularFiles.length} documents stored in cloud
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm" 
            disabled={isRefetching} 
            className="rounded-xl h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>

          {/* New Folder Modal */}
          <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl h-9 text-xs">
                <FolderPlus className="h-4 w-4 text-amber-500" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border-border/70 backdrop-blur-xl bg-card/95 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg">Create Cloud Folder</DialogTitle>
                <DialogDescription className="text-xs">
                  Create a new directory in your current Google Drive hierarchy.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  placeholder="e.g. Placement Prep, Resume Versions..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  className="rounded-xl h-10 border-border/70 bg-background/50 text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)} className="rounded-xl h-9 text-xs">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFolder} disabled={createFolderMutation.isPending || !newFolderName.trim()} className="rounded-xl h-9 text-xs font-semibold">
                    {createFolderMutation.isPending ? 'Creating...' : 'Create Folder'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Upload Modal */}
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 rounded-xl h-9 text-xs font-semibold shadow-xs">
                <Upload className="h-4 w-4" />
                Upload PDF / Doc
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border-border/70 backdrop-blur-xl bg-card/95 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg">Upload to Google Drive</DialogTitle>
                <DialogDescription className="text-xs">
                  Choose a document to store and index for Drive Q&A RAG searches.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="rounded-xl border-border/70 bg-background/50 text-xs"
                />
                {selectedFile && (
                  <p className="text-xs text-muted-foreground p-2 rounded-lg bg-muted/40 font-mono">
                    Selected: {selectedFile.name} ({driveService.formatFileSize(selectedFile.size.toString())})
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsUploadOpen(false)} className="rounded-xl h-9 text-xs">
                    Cancel
                  </Button>
                  <Button onClick={handleFileUpload} disabled={!selectedFile || uploadFileMutation.isPending} className="rounded-xl h-9 text-xs font-semibold shadow-xs">
                    {uploadFileMutation.isPending ? 'Uploading...' : 'Confirm Upload'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Folders Section */}
      {folders.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight text-foreground uppercase tracking-wider text-muted-foreground">
            Directories ({folders.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {folders.map((folder) => (
              <Card
                key={folder.id}
                className="group cursor-pointer border border-border/70 bg-card/80 hover:bg-card hover:border-amber-500/50 hover:shadow-md transition-all rounded-2xl"
                onClick={() => handleFolderClick(folder.id)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                  <div className="size-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Folder className="size-6" />
                  </div>
                  <p className="text-xs font-semibold truncate w-full text-foreground group-hover:text-primary transition-colors">
                    {folder.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(folder.createdTime).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      {regularFiles.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight text-foreground uppercase tracking-wider text-muted-foreground">
            Documents & Files ({regularFiles.length})
          </h2>
          <div className="space-y-2">
            {regularFiles.map((file) => (
              <Card
                key={file.id}
                className="group border border-border/70 bg-card/85 backdrop-blur-sm hover:border-primary/50 hover:shadow-md transition-all rounded-2xl"
              >
                <CardContent className="p-3.5 sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="size-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                        <FileText className="size-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {isRenaming && renamingFileId === file.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={newFileName}
                              onChange={(e) => setNewFileName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
                              className="h-8 text-xs rounded-lg"
                              autoFocus
                            />
                            <Button size="sm" onClick={handleRenameSubmit} disabled={renameFileMutation.isPending} className="h-8 px-2.5 text-xs rounded-lg">
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setIsRenaming(false)} className="h-8 px-2 text-xs rounded-lg">
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <p className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                              {file.name}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <span className="font-mono text-[11px]">{driveService.formatFileSize(file.size)}</span>
                              <span>•</span>
                              <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 rounded-lg text-muted-foreground hover:text-foreground">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-border/60">
                        <DropdownMenuItem onClick={() => handleRename(file.id, file.name)} className="gap-2 text-xs cursor-pointer">
                          <Edit2 className="size-3.5" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(file.id)} className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer">
                          <Trash2 className="size-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {folders.length === 0 && regularFiles.length === 0 && (
        <Card className="border border-border/70 max-w-md mx-auto my-12 text-center p-8 space-y-4">
          <div className="size-14 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground">
            <FolderOpen className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Empty Directory</h3>
            <p className="text-xs text-muted-foreground mt-1">Upload syllabus, PDF documents, or create subfolders.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
