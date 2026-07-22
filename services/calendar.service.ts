import { authService } from './auth.service'

export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
  location?: string
  created: string
  updated: string
  status: string
}

export interface CreateEventInput {
  summary: string
  description?: string
  start: string // ISO datetime string
  end: string // ISO datetime string
  location?: string
}

export const calendarService = {
  async listEvents(timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    const accessToken = await authService.getGoogleAccessToken()
    
    if (!accessToken) {
      throw new Error('No access token available')
    }

    try {
      let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime'
      
      if (timeMin) {
        url += `&timeMin=${encodeURIComponent(timeMin)}`
      }
      if (timeMax) {
        url += `&timeMax=${encodeURIComponent(timeMax)}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to list events')
      }

      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error('Error listing events:', error)
      throw error
    }
  },

  async createEvent(event: CreateEventInput): Promise<CalendarEvent> {
    const accessToken = await authService.getGoogleAccessToken()
    
    if (!accessToken) {
      throw new Error('No access token available')
    }

    try {
      const calendarEvent = {
        summary: event.summary,
        description: event.description,
        start: {
          dateTime: event.start,
        },
        end: {
          dateTime: event.end,
        },
        location: event.location,
      }

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(calendarEvent),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to create event')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  },

  async updateEvent(eventId: string, event: Partial<CreateEventInput>): Promise<CalendarEvent> {
    const accessToken = await authService.getGoogleAccessToken()
    
    if (!accessToken) {
      throw new Error('No access token available')
    }

    try {
      const calendarEvent: any = {}
      
      if (event.summary) calendarEvent.summary = event.summary
      if (event.description !== undefined) calendarEvent.description = event.description
      if (event.start) calendarEvent.start = { dateTime: event.start }
      if (event.end) calendarEvent.end = { dateTime: event.end }
      if (event.location !== undefined) calendarEvent.location = event.location

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(calendarEvent),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update event')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    }
  },

  async deleteEvent(eventId: string): Promise<void> {
    const accessToken = await authService.getGoogleAccessToken()
    
    if (!accessToken) {
      throw new Error('No access token available')
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      throw error
    }
  },

  async getEvent(eventId: string): Promise<CalendarEvent> {
    const accessToken = await authService.getGoogleAccessToken()
    
    if (!accessToken) {
      throw new Error('No access token available')
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to get event')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting event:', error)
      throw error
    }
  },

  formatEventDate(event: CalendarEvent): { start: string; end: string } {
    const start = event.start.dateTime || event.start.date
    const end = event.end.dateTime || event.end.date
    
    if (!start || !end) {
      return { start: 'N/A', end: 'N/A' }
    }

    const startDate = new Date(start)
    const endDate = new Date(end)
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    // If it's an all-day event
    if (!event.start.dateTime) {
      return {
        start: formatDate(startDate),
        end: formatDate(endDate),
      }
    }

    // If it's on the same day
    if (startDate.toDateString() === endDate.toDateString()) {
      return {
        start: `${formatDate(startDate)} ${formatTime(startDate)}`,
        end: formatTime(endDate),
      }
    }

    // Different days
    return {
      start: `${formatDate(startDate)} ${formatTime(startDate)}`,
      end: `${formatDate(endDate)} ${formatTime(endDate)}`,
    }
  },
}
