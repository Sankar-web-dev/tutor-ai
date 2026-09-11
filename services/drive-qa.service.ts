import { authService } from './auth.service'
import { driveService, DriveFile } from './drive.service'

export interface QASelectedFile {
  id: string
  name: string
  mimeType: string
  content: string
}

export interface QAResult {
  rag: string
  easy: string
  references: { title: string; url: string }[]
}

function getTextFromContent(textContent: any): string {
  return textContent.items
    .map((item: any) => {
      if (typeof item.str === 'string') return item.str
      if (Array.isArray(item.items)) return getTextFromContent(item)
      return ''
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function loadPdfjsLib(): Promise<any> {
  const win = window as any
  if (win.pdfjsLib) {
    win.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist/build/pdf.worker.min.js'
    return Promise.resolve(win.pdfjsLib)
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist/build/pdf.min.js'
    script.async = true
    script.onload = () => {
      if (win.pdfjsLib) {
        win.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist/build/pdf.worker.min.js'
        resolve(win.pdfjsLib)
      } else {
        reject(new Error('pdfjs-dist did not load'))
      }
    }
    script.onerror = () => reject(new Error('Failed to load pdfjs-dist from CDN'))
    document.head.appendChild(script)
  })
}

export const driveQAService = {
  async listFiles(folderId?: string): Promise<DriveFile[]> {
    const files = await driveService.listFiles(folderId)
    return files.filter((f) => !driveService.isFolder(f))
  },

  async getFileContent(file: DriveFile): Promise<string> {
    const accessToken = await authService.getGoogleAccessToken()
    if (!accessToken) {
      throw new Error('No access token available')
    }

    // Google Docs, Sheets, Slides can be exported to text
    const exportMimeTypes: { [key: string]: string } = {
      'application/vnd.google-apps.document': 'text/plain',
      'application/vnd.google-apps.spreadsheet': 'text/csv',
      'application/vnd.google-apps.presentation': 'text/plain',
    }

    const exportMimeType = exportMimeTypes[file.mimeType]

    if (exportMimeType) {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=${exportMimeType}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to export file: ${file.name}`)
      }

      return await response.text()
    }

    // PDFs
    if (file.mimeType === 'application/pdf') {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to download PDF: ${file.name}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const pdfjsLib = await loadPdfjsLib()

      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
      const pdf = await loadingTask.promise

      let text = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += getTextFromContent(content) + '\n'
      }

      console.log(`[PDF] ${file.name} - extracted ${text.length} chars`)
      return text
    }

    // Plain text files
    if (
      file.mimeType.includes('text/') ||
      file.mimeType === 'application/json' ||
      file.mimeType === 'application/javascript' ||
      file.mimeType === 'application/typescript'
    ) {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to download file: ${file.name}`)
      }

      return await response.text()
    }

    throw new Error(`Unsupported file type: ${file.name} (${file.mimeType})`)
  },

  async loadSelectedFiles(files: DriveFile[]): Promise<QASelectedFile[]> {
    const results: QASelectedFile[] = []
    for (const file of files) {
      try {
        const content = await this.getFileContent(file)
        results.push({
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          content: content.slice(0, 500000), // Limit content length per file
        })
      } catch (error) {
        console.error(`Error loading file ${file.name}:`, error)
      }
    }
    return results
  },

}
