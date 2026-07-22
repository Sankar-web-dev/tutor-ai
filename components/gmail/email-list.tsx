'use client'

import { gmailService, GmailEmail } from '@/services/gmail.service'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, Calendar, User, RefreshCw, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

interface EmailListProps {
  query?: string
  title: string
}

export function EmailList({ query, title }: EmailListProps) {
  const [selectedEmail, setSelectedEmail] = useState<GmailEmail | null>(null)

  const { data: emails, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['emails', query],
    queryFn: () => query ? gmailService.fetchEmailsByQuery(query) : gmailService.fetchEmails(),
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
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedEmail(null)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Button>
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
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
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
