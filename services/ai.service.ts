export interface ParsedEvent {
  title: string
  description?: string
  start: string // ISO datetime string
  end: string // ISO datetime string
  location?: string
}

function parseWithLocalLogic(input: string): ParsedEvent {
  const now = new Date()
  const lowerInput = input.toLowerCase()

  // Extract title - look for "named" or "called" or just the main subject
  let title = input
  const namedMatch = input.match(/(?:named|called|titled)\s+["']?([^"'\.]+)/i)
  if (namedMatch) {
    title = namedMatch[1].trim()
  } else {
    // Extract first meaningful phrase as title
    const words = input.split(/\s+/)
    const stopWords = ['schedule', 'create', 'add', 'set', 'a', 'an', 'the', 'meeting', 'event', 'appointment']
    const titleWords = words.filter(w => !stopWords.includes(w.toLowerCase()))
    title = titleWords.slice(0, 5).join(' ') || 'Untitled Event'
  }

  // Extract location
  let location: string | undefined
  const locationMatch = input.match(/(?:at|in|@)\s+([^,\.\d]+)/i)
  if (locationMatch) {
    location = locationMatch[1].trim()
  }

  // Parse date and time
  let startDate = new Date(now)
  let endDate = new Date(now)
  let hours = 12 // Default to noon
  let minutes = 0

  // Parse time
  const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (timeMatch) {
    hours = parseInt(timeMatch[1])
    minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0
    const meridiem = timeMatch[3]?.toLowerCase()
    
    if (meridiem === 'pm' && hours !== 12) {
      hours += 12
    } else if (meridiem === 'am' && hours === 12) {
      hours = 0
    }
  }

  // Parse date
  if (lowerInput.includes('tomorrow')) {
    startDate.setDate(startDate.getDate() + 1)
  } else if (lowerInput.includes('today')) {
    // Keep current date
  } else if (lowerInput.includes('next')) {
    if (lowerInput.includes('monday')) {
      startDate = getNextDayOfWeek(startDate, 1)
    } else if (lowerInput.includes('tuesday')) {
      startDate = getNextDayOfWeek(startDate, 2)
    } else if (lowerInput.includes('wednesday')) {
      startDate = getNextDayOfWeek(startDate, 3)
    } else if (lowerInput.includes('thursday')) {
      startDate = getNextDayOfWeek(startDate, 4)
    } else if (lowerInput.includes('friday')) {
      startDate = getNextDayOfWeek(startDate, 5)
    } else if (lowerInput.includes('saturday')) {
      startDate = getNextDayOfWeek(startDate, 6)
    } else if (lowerInput.includes('sunday')) {
      startDate = getNextDayOfWeek(startDate, 0)
    }
  }

  // Set the time
  startDate.setHours(hours, minutes, 0, 0)
  
  // Set end time (default 1 hour duration)
  endDate = new Date(startDate)
  endDate.setHours(endDate.getHours() + 1)

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    description: input,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    location,
  }
}

function getNextDayOfWeek(date: Date, dayOfWeek: number): Date {
  const result = new Date(date)
  const currentDay = result.getDay()
  const daysUntilNext = (dayOfWeek - currentDay + 7) % 7
  if (daysUntilNext === 0) {
    // If it's the same day, go to next week
    result.setDate(result.getDate() + 7)
  } else {
    result.setDate(result.getDate() + daysUntilNext)
  }
  return result
}

export const aiService = {
  async parseNaturalLanguageEvent(input: string): Promise<ParsedEvent> {
    try {
      return parseWithLocalLogic(input)
    } catch (error) {
      console.error('Error parsing natural language:', error)
      throw error
    }
  },
}
