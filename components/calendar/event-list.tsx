'use client'

import { calendarService, CalendarEvent } from '@/services/calendar.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  Trash2,
  Edit2,
  MoreVertical,
  CalendarDays,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { toast } from 'sonner'

interface EventListProps {
  title: string
}

export function EventList({ title }: EventListProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    summary: '',
    description: '',
    start: '',
    end: '',
    location: '',
  })

  const queryClient = useQueryClient()

  const { data: events, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: () => calendarService.listEvents(),
  })

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => calendarService.deleteEvent(eventId),
    onSuccess: () => {
      toast.success('Event deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
    onError: () => {
      toast.error('Failed to delete event')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ eventId, event }: { eventId: string; event: any }) =>
      calendarService.updateEvent(eventId, event),
    onSuccess: () => {
      toast.success('Event updated successfully')
      setIsEditDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
    onError: () => {
      toast.error('Failed to update event')
    },
  })

  const handleDelete = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate(eventId)
    }
  }

  const handleEdit = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setEditFormData({
      summary: event.summary,
      description: event.description || '',
      start: event.start.dateTime?.slice(0, 16) || event.start.date || '',
      end: event.end.dateTime?.slice(0, 16) || event.end.date || '',
      location: event.location || '',
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent) return

    const event: any = {
      summary: editFormData.summary,
      description: editFormData.description || undefined,
      start: editFormData.start ? new Date(editFormData.start).toISOString() : undefined,
      end: editFormData.end ? new Date(editFormData.end).toISOString() : undefined,
      location: editFormData.location || undefined,
    }

    updateMutation.mutate({ eventId: selectedEvent.id, event })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Synchronizing Google Calendar events...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border border-border/70 max-w-md mx-auto my-12 text-center p-8 space-y-4">
        <div className="size-14 rounded-2xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
          <Calendar className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Failed to Load Events</h3>
          <p className="text-xs text-muted-foreground mt-1">Please check your Google OAuth calendar permissions</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </Card>
    )
  }

  if (!events || events.length === 0) {
    return (
      <Card className="border border-border/70 max-w-md mx-auto my-12 text-center p-8 space-y-4">
        <div className="size-14 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground">
          <Calendar className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">No Upcoming Events</h3>
          <p className="text-xs text-muted-foreground mt-1">
            No placement rounds or deadlines found on your schedule.
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </Card>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <CalendarDays className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
              <p className="text-xs text-muted-foreground">{events.length} schedule commitments recorded</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          size="sm"
          disabled={isRefetching}
          className="gap-2 rounded-xl h-9 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {events.map((event) => {
          const formatted = calendarService.formatEventDate(event)
          return (
            <Card
              key={event.id}
              className="group border border-border/70 bg-card/85 backdrop-blur-sm hover:border-primary/50 hover:shadow-md transition-all duration-200 rounded-2xl"
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="size-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                      <Calendar className="size-5" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h3 className="font-semibold text-base text-foreground truncate group-hover:text-primary transition-colors">
                        {event.summary}
                      </h3>

                      {event.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                        <div className="flex items-center gap-1.5 font-medium text-foreground/80">
                          <Clock className="size-3.5 text-primary" />
                          <span>{formatted.start}</span>
                          {formatted.end !== formatted.start && (
                            <span className="text-muted-foreground">→ {formatted.end}</span>
                          )}
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                            <MapPin className="size-3.5 text-rose-500 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8 rounded-lg text-muted-foreground hover:text-foreground">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-border/60">
                      <DropdownMenuItem onClick={() => handleEdit(event)} className="gap-2 text-xs cursor-pointer">
                        <Edit2 className="size-3.5" />
                        Edit Event
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(event.id)} className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer">
                        <Trash2 className="size-3.5" />
                        Delete Event
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-2xl border-border/70 backdrop-blur-xl bg-card/95 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Edit Calendar Event</DialogTitle>
            <DialogDescription className="text-xs">
              Update event details on your Google Workspace calendar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title" className="text-xs font-semibold">Event Title *</Label>
              <Input
                id="edit-title"
                value={editFormData.summary}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({ ...editFormData, summary: e.target.value })}
                className="rounded-xl h-10 border-border/70 bg-background/50 text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-description" className="text-xs font-semibold">Description</Label>
              <textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditFormData({ ...editFormData, description: e.target.value })}
                rows={3}
                className="w-full p-3 border border-border/70 bg-background/50 rounded-xl resize-none text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 font-sans"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-start" className="text-xs font-semibold">Start Time</Label>
                <Input
                  id="edit-start"
                  type="datetime-local"
                  value={editFormData.start}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({ ...editFormData, start: e.target.value })}
                  className="rounded-xl h-9 border-border/70 bg-background/50 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-end" className="text-xs font-semibold">End Time</Label>
                <Input
                  id="edit-end"
                  type="datetime-local"
                  value={editFormData.end}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({ ...editFormData, end: e.target.value })}
                  className="rounded-xl h-9 border-border/70 bg-background/50 text-xs"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-location" className="text-xs font-semibold">Location / Meeting Link</Label>
              <Input
                id="edit-location"
                value={editFormData.location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({ ...editFormData, location: e.target.value })}
                placeholder="Google Meet, Auditorium, etc."
                className="rounded-xl h-10 border-border/70 bg-background/50 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl h-9 text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="rounded-xl h-9 text-xs font-semibold shadow-xs">
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
