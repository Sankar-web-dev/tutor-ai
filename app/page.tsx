'use client'

import { authService, GoogleTokens } from '@/services/auth.service'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const [copied, setCopied] = useState(false)

  const { data: tokens, isLoading, error } = useQuery({
    queryKey: ['googleTokens'],
    queryFn: authService.getGoogleTokens,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })

  const copyToken = () => {
    if (tokens?.access_token) {
      navigator.clipboard.writeText(tokens.access_token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Error loading tokens. Please sign in again.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Access Token</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <p className="text-sm text-muted-foreground mb-2 break-all font-mono bg-muted p-3 rounded">
                  {tokens?.access_token || 'No token available'}
                </p>
                {tokens?.access_token && (
                  <Button
                    onClick={copyToken}
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Use this token for Google API calls (Calendar, Gmail, Drive)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Token Type</p>
                <p className="text-sm text-muted-foreground">{tokens?.token_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Expires In</p>
                <p className="text-sm text-muted-foreground">{tokens?.expires_in ? `${tokens.expires_in} seconds` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Refresh Token</p>
                <p className="text-sm text-muted-foreground break-all">
                  {tokens?.refresh_token ? 'Available' : 'Not available'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Available Scopes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <ScopeCard
                title="Google Calendar"
                description="Create and manage calendar events"
                icon="📅"
              />
              <ScopeCard
                title="Gmail"
                description="Read and identify placement emails"
                icon="📧"
              />
              <ScopeCard
                title="Google Drive"
                description="Upload and store study documents"
                icon="📁"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ScopeCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

