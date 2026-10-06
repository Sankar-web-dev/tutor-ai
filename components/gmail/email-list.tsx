'use client'

import { gmailService, GmailEmail } from '@/services/gmail.service'
import { calendarService } from '@/services/calendar.service'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Loader2,
  Mail,
  Calendar,
  User,
  RefreshCw,
  ArrowLeft,
  Bell,
  Search,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  GraduationCap,
  Clock,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'

interface EmailListProps {
  query?: string
  title: string
  placement?: boolean
}

export function EmailList({ query, title, placement }: EmailListProps) {
  const [selectedEmail, setSelectedEmail] = useState<GmailEmail | null>(null)
  const [creating, setCreating] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleCreateReminder = async (email: GmailEmail) => {
    const eventDate = gmailService.extractEventDate(email)
    if (!eventDate) {
      toast.error('No event date found in this email.')
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
      toast.success(`Reminder created for ${start.toLocaleDateString()} at ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
    } catch (error) {
      console.error('Error creating reminder:', error)
      toast.error('Failed to create calendar reminder.')
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

  // Local filter for search
  const filteredEmails = useMemo(() => {
    if (!emails) return []
    if (!searchTerm.trim()) return emails
    const lower = searchTerm.toLowerCase()
    return emails.filter(
      (e) =>
        e.subject?.toLowerCase().includes(lower) ||
        e.from?.toLowerCase().includes(lower) ||
        e.snippet?.toLowerCase().includes(lower)
    )
  }, [emails, searchTerm])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {placement ? 'Running ML Placement Classifier...' : 'Fetching your inbox...'}
          </p>
          <p className="text-xs text-muted-foreground">
            {placement ? 'Evaluating subjects and sender domains at localhost:8000' : 'Connecting to Gmail API'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-border/70 max-w-lg mx-auto my-12 text-center p-8 space-y-4">
        <div className="size-14 rounded-2xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
          <Mail className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Failed to Load Emails</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Please verify your connection and make sure your Python ML service (if checking placement) is running.
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </Button>
      </Card>
    )
  }

  if (!emails || emails.length === 0) {
    return (
      <Card className="border-border/70 max-w-md mx-auto my-12 text-center p-8 space-y-4">
        <div className="size-14 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground">
          <Mail className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">No Emails Found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {placement
              ? 'No placement or recruitment emails detected by the classifier.'
              : 'Your mailbox currently has no matching emails.'}
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Check Again
        </Button>
      </Card>
    )
  }

  if (selectedEmail) {
    const eventDate = gmailService.extractEventDate(selectedEmail)

    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedEmail(null)}
            className="gap-2 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to email list
          </Button>

          {eventDate && (
            <Button
              onClick={() => handleCreateReminder(selectedEmail)}
              disabled={creating === selectedEmail.id}
              size="sm"
              className="gap-2 rounded-xl shadow-md shadow-primary/20"
            >
              {creating === selectedEmail.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bell className="h-4 w-4 text-emerald-400" />
              )}
              Add Interview / Drive to Calendar
            </Button>
          )}
        </div>

        <Card className="border border-border/70 bg-card/90 shadow-sm backdrop-blur-sm">
          <CardHeader className="space-y-4 border-b border-border/50 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              {placement && (
                <Badge variant="success" className="gap-1 px-2.5 py-0.5">
                  <Sparkles className="size-3" />
                  Verified Placement Email
                </Badge>
              )}
              {eventDate && (
                <Badge variant="warning" className="gap-1 px-2.5 py-0.5">
                  <Clock className="size-3" />
                  Detected Event Date: {eventDate.hasTime
                    ? eventDate.date.toLocaleString()
                    : eventDate.date.toLocaleDateString()}
                </Badge>
              )}
            </div>

            <CardTitle className="text-xl sm:text-2xl font-bold leading-snug text-foreground">
              {selectedEmail.subject}
            </CardTitle>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                  {selectedEmail.from ? selectedEmail.from.charAt(0).toUpperCase() : 'M'}
                </div>
                <span className="font-medium text-foreground">{selectedEmail.from}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{selectedEmail.date}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {selectedEmail.body ? (
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-sans">
                  {selectedEmail.body}
                </div>
              ) : (
                <p className="text-muted-foreground italic text-sm">{selectedEmail.snippet}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
              {placement ? <GraduationCap className="size-5" /> : <Mail className="size-5" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
              <p className="text-xs text-muted-foreground">
                {placement
                  ? 'Classified using Python ML model (:8000) filtering spam & course ads'
                  : 'All incoming emails synchronized with Google Workspace'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-border/70 bg-background/50"
            />
          </div>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm"
            disabled={isRefetching}
            className="gap-2 rounded-xl h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Email count badge bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>Showing {filteredEmails.length} of {emails.length} messages</span>
        {placement && (
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Spam & irrelevant promotional ads filtered
          </span>
        )}
      </div>

      {/* Email Cards List */}
      <div className="space-y-2.5">
        {filteredEmails.map((email, index) => {
          const eventDate = gmailService.extractEventDate(email)
          const senderInitial = email.from ? email.from.charAt(0).toUpperCase() : 'M'

          return (
            <Card
              key={email.id}
              className="group cursor-pointer border border-border/70 bg-card/80 hover:bg-card hover:border-primary/50 hover:shadow-md transition-all duration-150 rounded-2xl"
              onClick={() => setSelectedEmail(email)}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  {/* Sender Avatar */}
                  <div className="hidden sm:flex shrink-0">
                    <div className="size-10 rounded-xl bg-gradient-to-tr from-indigo-500/15 to-purple-500/15 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                      {senderInitial}
                    </div>
                  </div>

                  {/* Email Content Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 truncate">
                        <h3 className="font-semibold text-sm sm:text-base text-foreground truncate group-hover:text-primary transition-colors">
                          {email.subject}
                        </h3>
                        {placement && (
                          <Badge variant="success" className="text-[10px] shrink-0 py-0 px-2 font-medium">
                            Placement
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {eventDate && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-xs rounded-lg gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCreateReminder(email)
                            }}
                            disabled={creating === email.id}
                          >
                            {creating === email.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Bell className="h-3 w-3" />
                            )}
                            <span className="hidden sm:inline">Set Reminder</span>
                          </Button>
                        )}
                        <span className="text-[11px] font-mono text-muted-foreground/70">
                          #{index + 1}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground/80 truncate max-w-xs">
                        <User className="size-3 text-muted-foreground" />
                        {email.from}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        {email.date}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pt-0.5">
                      {email.snippet}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
