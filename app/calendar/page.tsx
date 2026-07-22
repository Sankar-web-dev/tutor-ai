import { EventList } from '@/components/calendar/event-list'

export default function CalendarPage() {
  return (
    <div className="container mx-auto p-6">
      <EventList title="My Calendar" />
    </div>
  )
}
