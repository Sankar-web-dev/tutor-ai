'use client'

import { useState } from 'react'
import { aiService, ParsedEvent } from '@/services/ai.service'
import { calendarService, CreateEventInput } from '@/services/calendar.service'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Sparkles, Calendar, Clock, MapPin } from 'lucide-react'
import { toast } from 'sonner'

interface EventFormProps {
  onSuccess?: () => void
}

export function EventForm({ onSuccess }: EventFormProps) {
  const [naturalInput, setNaturalInput] = useState('')
  const [parsedEvent, setParsedEvent] = useState<ParsedEvent | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    location: '',
  })

  const parseMutation = useMutation({
    mutationFn: aiService.parseNaturalLanguageEvent,
    onSuccess: (parsed) => {
      setParsedEvent(parsed)
      setFormData({
        title: parsed.title,
        description: parsed.description || '',
        start: parsed.start.slice(0, 16), // Format for datetime-local input
        end: parsed.end.slice(0, 16),
        location: parsed.location || '',
      })
      toast.success('Event parsed successfully!')
    },
    onError: (error) => {
      toast.error('Failed to parse event. Please try again.')
      console.error('Parse error:', error)
    },
  })

  const createEventMutation = useMutation({
    mutationFn: (event: CreateEventInput) => calendarService.createEvent(event),
    onSuccess: () => {
      toast.success('Event created successfully!')
      setNaturalInput('')
      setParsedEvent(null)
      setFormData({ title: '', description: '', start: '', end: '', location: '' })
      onSuccess?.()
    },
    onError: () => {
      toast.error('Failed to create event')
    },
  })

  const handleParse = () => {
    if (naturalInput.trim()) {
      setIsParsing(true)
      parseMutation.mutate(naturalInput, {
        onSettled: () => setIsParsing(false),
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.start || !formData.end) {
      toast.error('Please fill in required fields')
      return
    }

    const event: CreateEventInput = {
      summary: formData.title,
      description: formData.description || undefined,
      start: new Date(formData.start).toISOString(),
      end: new Date(formData.end).toISOString(),
      location: formData.location || undefined,
    }

    createEventMutation.mutate(event)
  }

  const handleClear = () => {
    setNaturalInput('')
    setParsedEvent(null)
    setFormData({ title: '', description: '', start: '', end: '', location: '' })
  }

  return (
    <div className="space-y-6">
      {!parsedEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Event Creator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="natural-input">Describe your event</Label>
              <textarea
                id="natural-input"
                placeholder="e.g., 'Schedule a meeting named team sync tomorrow at 2pm' or 'Create a study session next Sunday at 10am'"
                value={naturalInput}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNaturalInput(e.target.value)}
                rows={3}
                className="mt-2 w-full p-3 border rounded-md resize-none"
              />
            </div>
            <Button 
              onClick={handleParse} 
              disabled={!naturalInput.trim() || isParsing || parseMutation.isPending}
              className="gap-2"
            >
              {isParsing || parseMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Parse with AI
            </Button>
          </CardContent>
        </Card>
      )}

      {parsedEvent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Review & Create Event</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Event title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description"
                  rows={3}
                  className="w-full p-3 border rounded-md resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Start Time *
                  </Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={formData.start}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, start: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    End Time *
                  </Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={formData.end}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, end: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Event location"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={createEventMutation.isPending}
              >
                {createEventMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Event
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
