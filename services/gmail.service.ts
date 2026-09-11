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

  extractEventDate(email: GmailEmail): { date: Date; hasTime: boolean } | null {
    const text = `${email.subject} ${email.snippet} ${email.body || ''}`
    const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/&\w+;/g, ' ')

    // Common date patterns
    const patterns = [
      // dd/mm/yyyy or dd-mm-yyyy or dd.mm.yyyy
      /\b(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})\b/,
      // yyyy-mm-dd
      /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/,
      // 10 Oct 2026 or 10 October 2026
      /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[,\s]+(\d{4})\b/i,
      // Oct 10, 2026
      /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})[,\s]+(\d{4})\b/i,
      // 10/10/26
      /\b(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2})\b/,
    ]

    for (const pattern of patterns) {
      const match = cleanText.match(pattern)
      if (match) {
        let day: number, month: number, year: number

        if (pattern.source.includes('yyyy') && pattern.source.includes('\\d{4}') && pattern.source.startsWith('(\\d{4})')) {
          // yyyy-mm-dd
          year = parseInt(match[1])
          month = parseInt(match[2]) - 1
          day = parseInt(match[3])
        } else if (pattern.source.includes('January|February')) {
          // Named month
          if (/^\d/.test(match[0])) {
            // 10 Oct 2026
            day = parseInt(match[1])
            month = this.monthToNumber(match[2])
            year = parseInt(match[3])
          } else {
            // Oct 10, 2026
            month = this.monthToNumber(match[1])
            day = parseInt(match[2])
            year = parseInt(match[3])
          }
        } else {
          // dd/mm/yyyy, prefer dd/mm
          const first = parseInt(match[1])
          const second = parseInt(match[2])
          year = parseInt(match[3])
          if (year < 100) year += 2000

          if (first > 12) {
            day = first
            month = second - 1
          } else if (second > 12) {
            day = first
            month = second - 1
          } else {
            // Ambiguous: default to dd/mm/yyyy (Indian format)
            day = first
            month = second - 1
          }
        }

        const parsedDate = new Date(year, month, day)
        if (!isNaN(parsedDate.getTime())) {
          // Try to find a time nearby
          const timeMatch = this.findTimeInText(cleanText)
          if (timeMatch) {
            parsedDate.setHours(timeMatch.hours, timeMatch.minutes)
          }
          return { date: parsedDate, hasTime: !!timeMatch }
        }
      }
    }

    return null
  },

  monthToNumber(monthName: string): number {
    const months: { [key: string]: number } = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    }
    const short = monthName.substring(0, 3).toLowerCase()
    return months[short] ?? 0
  },

  findTimeInText(text: string): { hours: number; minutes: number } | null {
    const timePatterns = [
      // 10:00 AM / 10:00 am / 10:00AM
      /\b(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)\b/,
      // 10 AM / 10 am
      /\b(\d{1,2})\s*(AM|PM|am|pm)\b/,
      // 14:00 (24h)
      /\b(\d{1,2}):(\d{2})\b/,
    ]

    for (const pattern of timePatterns) {
      const match = text.match(pattern)
      if (match) {
        if (match[3]) {
          let hours = parseInt(match[1])
          const minutes = parseInt(match[2] || '0')
          const period = match[3].toUpperCase()
          if (period === 'PM' && hours !== 12) hours += 12
          if (period === 'AM' && hours === 12) hours = 0
          return { hours, minutes }
        } else {
          const hours = parseInt(match[1])
          const minutes = parseInt(match[2])
          if (hours < 24 && minutes < 60) {
            return { hours, minutes }
          }
        }
      }
    }

    return null
  },

  async fetchPlacementEmails(maxResults: number = 100): Promise<GmailEmail[]> {
    const accessToken = await authService.getGoogleAccessToken()
    
    if (!accessToken) {
      throw new Error('No access token available')
    }

    try {
      // Search for placement-related emails with additional filtering
      const query = 'in:inbox AND (placement OR "job opening" OR "job opportunity" OR interview OR "recruitment process" OR "hiring" OR "career" OR "internship" OR "offer letter" OR "selected" OR "shortlisted")'
      
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
      console.log('Gmail placement query found', messages.length, 'messages')

      let kept = 0
      let filtered = 0

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
          const email = this.parseMessage(messageData)
          
          // Check for spam indicators using ML
          const isSpam = await this.isSpamEmail(email)
          if (isSpam) {
            filtered++
            return null
          }
          
          kept++
          return email
        })
      )

      const result = emails.filter((email): email is GmailEmail => email !== null)
      console.log(`Placement emails filtered: ${filtered} spam, ${kept} kept, ${result.length} total`)
      return result
    } catch (error) {
      console.error('Error fetching placement emails:', error)
      throw error
    }
  },

  async isSpamEmail(email: GmailEmail): Promise<boolean> {
    const mlApiUrl = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000'
    
    try {
      const response = await fetch(`${mlApiUrl}/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: email.id,
          subject: email.subject,
          from_email: email.from,
          snippet: email.snippet,
          body: email.body,
        }),
      })

      if (!response.ok) {
        return this.isSpamEmailRuleBased(email)
      }

      const result = await response.json()
      console.log('ML classifier response:', result)
      return !result.is_placement
    } catch (error) {
      console.error('Error calling ML classifier:', error)
      return this.isSpamEmailRuleBased(email)
    }
  },

  isSpamEmailRuleBased(email: GmailEmail): boolean {
    const spamKeywords = [
      'unsubscribe',
      'promotional',
      'limited time',
      'buy now',
      'click here',
      'discount',
      'offer ends',
      'free gift',
      'congratulations you won',
      'claim your prize',
      'urgent action required',
      'verify your account',
      'suspicious activity',
      'lottery',
      'winner',
      'cash prize',
      'act now',
      'exclusive deal',
      'special promotion',
      'marketing',
    ]

    const fromLower = email.from.toLowerCase()
    const subjectLower = email.subject.toLowerCase()
    const snippetLower = email.snippet.toLowerCase()
    const textToCheck = `${subjectLower} ${snippetLower}`

    if (spamKeywords.some(keyword => textToCheck.includes(keyword))) {
      return true
    }

    return false
  },

  decodeBase64(data: string): string {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(base64)
    try {
      return decodeURIComponent(escape(decoded))
    } catch {
      return decoded
    }
  },
}
