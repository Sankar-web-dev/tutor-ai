'use client'

import { driveService, DriveFile } from '@/services/drive.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, FolderOpen, File, RefreshCw, Upload, FolderPlus, MoreVertical, Trash2, Edit2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
    setCurrentFolderId(previousFolder || undefined)
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
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading files...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <FolderOpen className="h-12 w-12 text-muted-foreground" />
        <p className="text-red-500 font-medium">Failed to load files</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  const folders = files?.filter(f => driveService.isFolder(f)) || []
  const regularFiles = files?.filter(f => !driveService.isFolder(f)) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentFolderId && (
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground mt-1">
              {folders.length} folders, {regularFiles.length} files
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isRefetching} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FolderPlus className="h-4 w-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFolder} disabled={createFolderMutation.isPending}>
                    {createFolderMutation.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {selectedFile.name} ({driveService.formatFileSize(selectedFile.size.toString())})
                      </p>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleFileUpload} disabled={!selectedFile || uploadFileMutation.isPending}>
                        {uploadFileMutation.isPending ? 'Uploading...' : 'Upload'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Folders Section */}
          {folders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Folders</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {folders.map((folder) => (
                  <Card
                    key={folder.id}
                    className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                    onClick={() => handleFolderClick(folder.id)}
                  >
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <div className="text-4xl mb-2">📁</div>
                      <p className="text-sm font-medium truncate w-full">{folder.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
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
            <div>
              <h3 className="text-lg font-semibold mb-3">Files</h3>
              <div className="space-y-2">
                {regularFiles.map((file) => (
                  <Card key={file.id} className="hover:border-primary/50 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="text-3xl">{driveService.getFileIcon(file.mimeType)}</div>
                          <div className="flex-1 min-w-0">
                            {isRenaming && renamingFileId === file.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={newFileName}
                                  onChange={(e) => setNewFileName(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
                                  className="h-8"
                                  autoFocus
                                />
                                <Button size="sm" onClick={handleRenameSubmit} disabled={renameFileMutation.isPending}>
                                  Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setIsRenaming(false)}>
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <>
                                <p className="font-medium truncate">{file.name}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                  <span>{driveService.formatFileSize(file.size)}</span>
                                  <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRename(file.id, file.name)} className="gap-2">
                              <Edit2 className="h-4 w-4" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(file.id)} className="gap-2 text-red-600">
                              <Trash2 className="h-4 w-4" />
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
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <FolderOpen className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No files or folders</p>
              <div className="flex gap-2">
                <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FolderPlus className="h-4 w-4" />
                      Create Folder
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Folder</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Folder name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateFolder} disabled={createFolderMutation.isPending}>
                          {createFolderMutation.isPending ? 'Creating...' : 'Create'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload File
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload File</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                      />
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground">
                          Selected: {selectedFile.name} ({driveService.formatFileSize(selectedFile.size.toString())})
                        </p>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleFileUpload} disabled={!selectedFile || uploadFileMutation.isPending}>
                          {uploadFileMutation.isPending ? 'Uploading...' : 'Upload'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </div>
      )
    }
