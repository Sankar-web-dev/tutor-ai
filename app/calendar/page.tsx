'use client'

import { CalendarView } from '@/components/calendar/calendar-view'

export default function CalendarPage() {
  const handleEventClick = (event: any) => {
    // Could navigate to event details or show edit dialog
    console.log('Event clicked:', event)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Calendar</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your events
        </p>
      </div>
      <CalendarView onEventClick={handleEventClick} />
    </div>
  )
}
