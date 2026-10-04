'use client'

import { authService } from '@/services/auth.service'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  Copy,
  Check,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  GraduationCap,
  FileCheck2,
  CalendarDays,
  BrainCircuit,
  StickyNote,
  Bot,
  ArrowUpRight,
  Activity,
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [copied, setCopied] = useState(false)
  const [showToken, setShowToken] = useState(false)

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Synchronizing Workspace credentials...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <KeyRound className="h-8 w-8" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-base font-semibold text-destructive">Google Authentication Required</p>
          <p className="text-sm text-muted-foreground">Unable to load tokens. Please reconnect your account.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/auth">Sign In Again</Link>
        </Button>
      </div>
    )
  }

  const tokenDisplay = tokens?.access_token
    ? showToken
      ? tokens.access_token
      : `${tokens.access_token.slice(0, 14)}••••••••••••••••••••••••••••${tokens.access_token.slice(-10)}`
    : 'No token available'

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 sm:p-8 shadow-sm backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 h-48 w-48 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1 border-primary/30 bg-primary/10 text-primary gap-1.5">
                <Sparkles className="size-3.5" />
                AI Career Suite 2.0
              </Badge>
              <Badge variant="success" className="gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ML Backend Active
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Welcome to <span className="gradient-text">Command Center</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              Real-time placement email classifier, ATS resume match scoring, automated interview calendar sync, and Drive RAG study assistant.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/20 gap-2">
              <Link href="/gmail/placement">
                <GraduationCap className="size-4" />
                View Placement Emails
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl gap-2">
              <Link href="/summarization">
                <FileCheck2 className="size-4" />
                Analyze Resume
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Quick Launch Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            Quick Access Workspace
          </h2>
          <span className="text-xs text-muted-foreground">Select a tool to begin</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            href="/gmail/placement"
            icon={<GraduationCap className="size-5 text-emerald-500" />}
            title="Placement Radar"
            tag="ML Classifier"
            tagColor="success"
            description="Automatic classification of campus drive, shortlist, and interview invitation emails."
          />
          <FeatureCard
            href="/summarization"
            icon={<FileCheck2 className="size-5 text-indigo-500" />}
            title="Resume vs JD Analyzer"
            tag="ATS Match"
            tagColor="default"
            description="Deep AI comparison between your resume and target job descriptions with keyword gap detection."
          />
          <FeatureCard
            href="/summarization/jd"
            icon={<Sparkles className="size-5 text-purple-500" />}
            title="JD Extractor"
            tag="Key Insights"
            tagColor="default"
            description="Extract company, eligibility, CTC package, bond criteria, and skills in seconds."
          />
          <FeatureCard
            href="/summarization/qa"
            icon={<BrainCircuit className="size-5 text-sky-500" />}
            title="Drive Document Q&A"
            tag="TF-IDF RAG"
            tagColor="default"
            description="Ask questions directly to course PDFs, slides, and syllabus notes stored on Google Drive."
          />
          <FeatureCard
            href="/calendar"
            icon={<CalendarDays className="size-5 text-amber-500" />}
            title="Interview Calendar"
            tag="Schedule"
            tagColor="warning"
            description="Track upcoming assessment deadlines, pre-placement talks, and HR rounds seamlessly."
          />
          <FeatureCard
            href="/doubt-solver"
            icon={<Bot className="size-5 text-pink-500" />}
            title="AI Doubt Solver"
            tag="Tutor AI"
            tagColor="default"
            description="Ask technical interview and code queries with instant explanations and concept breakdowns."
          />
        </div>
      </div>

      {/* Google Workspace & Security Hub */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="size-4 text-indigo-500" />
            Google Workspace Security & Credentials
          </h2>
          <span className="text-xs text-muted-foreground">Auto-refreshes every 5 mins</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Access Token Card */}
          <Card className="border border-border/70 shadow-sm bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <KeyRound className="size-4 text-primary" />
                  OAuth Access Token
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs gap-1.5"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    {showToken ? 'Mask' : 'Reveal'}
                  </Button>
                  {tokens?.access_token && (
                    <Button
                      onClick={copyToken}
                      size="sm"
                      variant="outline"
                      className="h-8 px-2.5 text-xs gap-1.5"
                    >
                      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription>
                Cryptographic session token utilized to authenticate Gmail, Calendar, and Drive API calls.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-border/60 bg-muted/50 p-3 font-mono text-xs break-all text-muted-foreground transition-all">
                {tokenDisplay}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Active Token Authorized
                </span>
                <span className="font-mono text-[11px]">Type: {tokens?.token_type || 'Bearer'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Token Details Card */}
          <Card className="border border-border/70 shadow-sm bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                Session Lifecycle & Details
              </CardTitle>
              <CardDescription>
                Current token validity and refresh rotation parameters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border/50 bg-muted/30 p-3 space-y-1">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Token Type</p>
                  <p className="text-sm font-semibold text-foreground">{tokens?.token_type || 'Bearer'}</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/30 p-3 space-y-1">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Expires In</p>
                  <p className="text-sm font-semibold text-foreground">
                    {tokens?.expires_in ? `${tokens.expires_in}s` : 'N/A'}
                  </p>
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/30 p-3 space-y-1">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Refresh Token</p>
                  <p className="text-sm font-semibold text-emerald-500 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {tokens?.refresh_token ? 'Available' : 'Cached'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                <span>Automatic Refresh Loop:</span>
                <span className="font-medium text-foreground">Every 5 Minutes</span>
              </div>
            </CardContent>
          </Card>

          {/* Scopes Overview */}
          <Card className="md:col-span-2 border border-border/70 shadow-sm bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                Connected Workspace Scopes
              </CardTitle>
              <CardDescription>
                Permissions granted to this application for reading emails, modifying calendar events, and reading drive documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <ScopeCard
                  title="Google Calendar"
                  description="Create interview reminders and manage assessment calendar events."
                  icon={<CalendarDays className="size-5 text-amber-500" />}
                  status="Full Access"
                />
                <ScopeCard
                  title="Gmail Integration"
                  description="Scan incoming recruitment emails and feed to Python ML classifier."
                  icon={<GraduationCap className="size-5 text-emerald-500" />}
                  status="Read Only"
                />
                <ScopeCard
                  title="Google Drive"
                  description="Index PDF study documents and compute TF-IDF embeddings."
                  icon={<BrainCircuit className="size-5 text-sky-500" />}
                  status="Drive Files"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  href,
  icon,
  title,
  tag,
  tagColor = "default",
  description,
}: {
  href: string
  icon: React.ReactNode
  title: string
  tag: string
  tagColor?: "default" | "success" | "warning"
  description: string
}) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full border border-border/70 bg-card/70 hover:bg-card/95 hover:border-primary/40 hover:shadow-md transition-all duration-200">
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-xl bg-accent/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                {icon}
              </div>
              <Badge variant={tagColor === 'success' ? 'success' : tagColor === 'warning' ? 'warning' : 'outline'} className="text-[10px]">
                {tag}
              </Badge>
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                {title}
                <ArrowUpRight className="size-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function ScopeCard({
  title,
  description,
  icon,
  status,
}: {
  title: string
  description: string
  icon: React.ReactNode
  status: string
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2 hover:border-border transition-colors">
      <div className="flex items-center justify-between">
        <div className="size-9 rounded-lg bg-background flex items-center justify-center shadow-xs border border-border/40">
          {icon}
        </div>
        <Badge variant="outline" className="text-[10px] text-muted-foreground">
          {status}
        </Badge>
      </div>
      <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
