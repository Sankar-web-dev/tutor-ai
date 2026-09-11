import { driveService, DriveFile } from './drive.service'
import { driveQAService, QAResult } from './drive-qa.service'

export interface RagAnswer {
  answer: string
  references: { title: string; url: string }[]
}

const RAG_API_URL = 'http://localhost:8001/rag'

export const ragService = {
  async askRAGFromFiles(files: DriveFile[], question: string): Promise<RagAnswer> {
    const loaded = await driveQAService.loadSelectedFiles(files)
    if (loaded.length === 0) {
      throw new Error('No readable files selected')
    }

    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_KEY
    if (!apiKey) {
      throw new Error('OpenRouter API key not found')
    }

    const response = await fetch(RAG_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documents: loaded.map((f) => ({ id: f.id, name: f.name, content: f.content })),
        question,
        api_key: apiKey,
        k: 5,
        max_tokens: 2048,
        model: 'mistralai/mistral-nemo',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`RAG service error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return {
      answer: data.answer || 'No answer received.',
      references: Array.isArray(data.references) ? data.references : [],
    }
  },
}
