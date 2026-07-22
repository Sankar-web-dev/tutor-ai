import { authService } from './auth.service'

export interface GmailMessage {
  id: string
  threadId: string
  snippet: string
  payload: {
    headers: Array<{ name: string; value: string }>
    body?: { data: string }
    parts?: Array<{
      mimeType: string
      body?: { data: string }
      parts?: Array<{
        mimeType: string
        body?: { data: string }
      }>
    }>
  }
  internalDate: string
}

export interface GmailEmail {
  id: string
  threadId: string
  subject: string
  from: string
  to: string
  date: string
  snippet: string
  body?: string
}

export const gmailService = {
  async fetchEmails(maxResults: number = 20): Promise<GmailEmail[]> {
    const accessToken = await authService.getGoogleAccessToken()
    
    if (!accessToken) {
      throw new Error('No access token available')
    }

    try {
      // Fetch messages list
      const messagesResponse = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!messagesResponse.ok) {
        throw new Error('Failed to fetch messages')
      }

      const messagesData = await messagesResponse.json()
      const messages = messagesData.messages || []

      // Fetch full message details for each message
      const emails = await Promise.all(
        messages.map(async (message: { id: string }) => {
          const messageResponse = await fetch(
            `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          )

          if (!messageResponse.ok) {
            return null
          }

          const messageData: GmailMessage = await messageResponse.json()
          return this.parseMessage(messageData)
        })
      )

      return emails.filter((email): email is GmailEmail => email !== null)
    } catch (error) {
      console.error('Error fetching emails:', error)
      throw error
    }
  },

  async fetchEmailsByQuery(query: string, maxResults: number = 20): Promise<GmailEmail[]> {
    const accessToken = await authService.getGoogleAccessToken()
    
    if (!accessToken) {
      throw new Error('No access token available')
    }

    try {
      const messagesResponse = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!messagesResponse.ok) {
        throw new Error('Failed to fetch messages')
      }

      const messagesData = await messagesResponse.json()
      const messages = messagesData.messages || []

      const emails = await Promise.all(
        messages.map(async (message: { id: string }) => {
          const messageResponse = await fetch(
            `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          )

          if (!messageResponse.ok) {
            return null
          }

          const messageData: GmailMessage = await messageResponse.json()
          return this.parseMessage(messageData)
        })
      )

      return emails.filter((email): email is GmailEmail => email !== null)
    } catch (error) {
      console.error('Error fetching emails by query:', error)
      throw error
    }
  },

  parseMessage(message: GmailMessage): GmailEmail {
    const headers = message.payload.headers
    const getHeader = (name: string) => 
      headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''

    const subject = getHeader('Subject')
    const from = getHeader('From')
    const to = getHeader('To')
    const date = new Date(parseInt(message.internalDate)).toLocaleString()

    // Extract body from message
    let body = ''
    if (message.payload.body?.data) {
      body = this.decodeBase64(message.payload.body.data)
    } else if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = this.decodeBase64(part.body.data)
          break
        }
        if (part.parts) {
          for (const subPart of part.parts) {
            if (subPart.mimeType === 'text/plain' && subPart.body?.data) {
              body = this.decodeBase64(subPart.body.data)
              break
            }
          }
        }
        if (body) break
      }
    }

    return {
      id: message.id,
      threadId: message.threadId,
      subject,
      from,
      to,
      date,
      snippet: message.snippet,
      body: body || undefined,
    }
  },

  decodeBase64(data: string): string {
    // Gmail uses URL-safe base64 encoding
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(base64)
    // Try to decode as UTF-8
    try {
      return decodeURIComponent(escape(decoded))
    } catch {
      return decoded
    }
  },
}
