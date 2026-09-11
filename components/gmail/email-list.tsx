'use client'

import { gmailService, GmailEmail } from '@/services/gmail.service'
import { calendarService } from '@/services/calendar.service'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, Calendar, User, RefreshCw, ArrowLeft, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

interface EmailListProps {
  query?: string
  title: string
  placement?: boolean
}

export function EmailList({ query, title, placement }: EmailListProps) {
  const [selectedEmail, setSelectedEmail] = useState<GmailEmail | null>(null)
  const [creating, setCreating] = useState<string | null>(null)

  const handleCreateReminder = async (email: GmailEmail) => {
    const eventDate = gmailService.extractEventDate(email)
    if (!eventDate) {
      alert('No event date found in this email.')
      return
    }

    const start = new Date(eventDate.date)
    if (!eventDate.hasTime) {
      start.setHours(9, 0, 0, 0)
    }

    const end = new Date(start)
    end.setHours(end.getHours() + 1)

    setCreating(email.id)
    try {
      await calendarService.createEvent({
        summary: email.subject,
        description: `${email.from}\n\n${email.body || email.snippet}`,
        start: start.toISOString(),
        end: end.toISOString(),
      })
      alert(`Reminder created for ${start.toLocaleString()}`)
    } catch (error) {
      console.error('Error creating reminder:', error)
      alert('Failed to create calendar reminder.')
    } finally {
      setCreating(null)
    }
  }

  const { data: emails, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['emails', query, placement],
    queryFn: () => {
      if (placement) return gmailService.fetchPlacementEmails()
      if (query) return gmailService.fetchEmailsByQuery(query)
      return gmailService.fetchEmails()
    },
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading emails...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-center">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-red-500 font-medium">Failed to load emails</p>
          <p className="text-sm text-muted-foreground mt-2">Please check your connection and try again</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  if (!emails || emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Mail className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No emails found</p>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  if (selectedEmail) {
    const eventDate = gmailService.extractEventDate(selectedEmail)

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedEmail(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </Button>
          {eventDate && (
            <Button
              onClick={() => handleCreateReminder(selectedEmail)}
              disabled={creating === selectedEmail.id}
              size="sm"
              className="gap-2"
            >
              {creating === selectedEmail.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              Set Reminder
            </Button>
          )}
        </div>
        <Card className="border-2">
          <CardHeader className="space-y-4">
            <div>
              <CardTitle className="text-2xl leading-tight">{selectedEmail.subject}</CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium">{selectedEmail.from}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{selectedEmail.date}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {selectedEmail.body ? (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{selectedEmail.body}</div>
              ) : (
                <p className="text-muted-foreground italic">{selectedEmail.snippet}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground mt-1">{emails.length} emails found</p>
        </div>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          size="sm"
          disabled={isRefetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      <div className="space-y-2">
        {emails.map((email, index) => (
          <Card
            key={email.id}
            className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
            onClick={() => setSelectedEmail(email)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base truncate flex-1">{email.subject}</h3>
                    <div className="flex items-center gap-2">
                      {gmailService.extractEventDate(email) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCreateReminder(email)
                          }}
                          disabled={creating === email.id}
                        >
                          {creating === email.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Bell className="h-4 w-4 text-primary" />
                          )}
                        </Button>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="truncate">{email.from}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{email.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {email.snippet}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
