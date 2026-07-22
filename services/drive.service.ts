import { authService } from './auth.service'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  kind: string
  parents?: string[]
  webViewLink?: string
  webContentLink?: string
  size?: string
  createdTime: string
  modifiedTime: string
  description?: string
}

export interface DriveFolder {
  id: string
  name: string
  mimeType: string
  createdTime: string
}

export const driveService = {
  async listFiles(folderId?: string): Promise<DriveFile[]> {
    const accessToken = await authService.getGoogleAccessToken()
    
    if (!accessToken) {
      throw new Error('No access token available')
    }

    try {
      const query = folderId 
        ? `'${folderId}' in parents and trashed=false`
        : 'trashed=false'
      
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,kind,parents,webViewLink,webContentLink,size,createdTime,modifiedTime,description)`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to list files')
      }

      const data = await response.json()
      return data.files || []
    } catch (error) {
      console.error('Error listing files:', error)
      throw error
    }
  },

  async createFolder(name: string, parentFolderId?: string): Promise<DriveFile> {
    const accessToken = await authService.getGoogleAccessToken()
    
    if (!accessToken) {
      throw new Error('No access token available')
    }

    try {
      const metadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentFolderId && { parents: [parentFolderId] }),
      }

      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metadata),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to create folder')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating folder:', error)
      throw error
    }
  },

  async uploadFile(
    file: File,
    parentFolderId?: string,
    onProgress?: (progress: number) => void
  ): Promise<DriveFile> {
    const accessToken = await authService.getGoogleAccessToken()
    
    if (!accessToken) {
      throw new Error('No access token available')
    }

    try {
      // First, create the file metadata
      const metadata = {
        name: file.name,
        ...(parentFolderId && { parents: [parentFolderId] }),
      }

      const metadataResponse = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metadata),
        }
      )

      if (!metadataResponse.ok) {
        throw new Error('Failed to initiate upload')
      }

      const uploadUrl = metadataResponse.headers.get('Location')
      if (!uploadUrl) {
        throw new Error('No upload URL received')
      }

      // Upload the actual file
      const fileResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      })

      if (!fileResponse.ok) {
        throw new Error('Failed to upload file')
      }

      return await fileResponse.json()
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  },

  async deleteFile(fileId: string): Promise<void> {
    const accessToken = await authService.getGoogleAccessToken()
    
    if (!accessToken) {
      throw new Error('No access token available')
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete file')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  },

  async renameFile(fileId: string, newName: string): Promise<DriveFile> {
    const accessToken = await authService.getGoogleAccessToken()
    
    if (!accessToken) {
      throw new Error('No access token available')
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newName }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to rename file')
      }

      return await response.json()
    } catch (error) {
      console.error('Error renaming file:', error)
      throw error
    }
  },

  isFolder(file: DriveFile): boolean {
    return file.mimeType === 'application/vnd.google-apps.folder'
  },

  formatFileSize(bytes?: string): string {
    if (!bytes) return 'N/A'
    const size = parseInt(bytes)
    if (size === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(size) / Math.log(k))
    return Math.round(size / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  },

  getFileIcon(mimeType: string): string {
    if (mimeType === 'application/vnd.google-apps.folder') return '📁'
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('image')) return '🖼️'
    if (mimeType.includes('video')) return '🎬'
    if (mimeType.includes('audio')) return '🎵'
    if (mimeType.includes('text')) return '📝'
    if (mimeType.includes('spreadsheet')) return '📊'
    if (mimeType.includes('presentation')) return '📽️'
    return '📎'
  },
}
