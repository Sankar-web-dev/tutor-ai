'use client'

import { JDComparisonResult } from '@/services/jd.service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Star,
  TrendingUp,
  FileEdit,
  Award,
  Sparkles,
  Target,
  ArrowRight
} from 'lucide-react'

interface ComparisonResultsProps {
  results: JDComparisonResult
}

export function ComparisonResults({ results }: ComparisonResultsProps) {
  const getRatingTheme = (score: number) => {
    if (score >= 80) return { color: 'text-emerald-500', bg: 'bg-emerald-500', badge: 'success', label: 'Strong Alignment' }
    if (score >= 60) return { color: 'text-indigo-500', bg: 'bg-indigo-500', badge: 'default', label: 'Good Potential' }
    if (score >= 40) return { color: 'text-amber-500', bg: 'bg-amber-500', badge: 'warning', label: 'Partial Fit' }
    return { color: 'text-rose-500', bg: 'bg-rose-500', badge: 'destructive', label: 'Needs Optimization' }
  }

  const overallTheme = getRatingTheme(results.overallRating)
  const matchTheme = getRatingTheme(results.matchScore)

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Overall Assessment Scorecard */}
      <Card className="border border-border/70 bg-gradient-to-br from-card via-card/90 to-primary/5 shadow-sm backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Award className="size-4" />
              </div>
              Executive ATS Match Assessment
            </CardTitle>
            <Badge variant={overallTheme.badge as any} className="px-3 py-1 font-semibold text-xs">
              {overallTheme.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Overall Rating Card */}
            <div className="p-4 rounded-2xl border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Fit Rating</span>
                <Star className={`size-4 ${overallTheme.color}`} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-foreground">{results.overallRating}</span>
                <span className="text-sm font-medium text-muted-foreground">/ 100</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${overallTheme.bg}`} 
                  style={{ width: `${Math.min(100, Math.max(0, results.overallRating))}%` }}
                />
              </div>
            </div>

            {/* Keyword Match Score Card */}
            <div className="p-4 rounded-2xl border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">JD Keyword Match</span>
                <Target className={`size-4 ${matchTheme.color}`} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-foreground">{results.matchScore}%</span>
                <span className="text-sm font-medium text-muted-foreground">ATS Coverage</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${matchTheme.bg}`} 
                  style={{ width: `${Math.min(100, Math.max(0, results.matchScore))}%` }}
                />
              </div>
            </div>
          </div>

          {/* AI Executive Summary */}
          {results.summary && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                AI Career Coach Analysis
              </div>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                {results.summary}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        {results.strengths?.length > 0 && (
          <Card className="border border-emerald-500/20 bg-card/80 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-base text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                Key Profile Strengths ({results.strengths.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2.5">
                {results.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                    <span className="size-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="size-3.5" />
                    </span>
                    <span className="leading-snug">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Weaknesses */}
        {results.weaknesses?.length > 0 && (
          <Card className="border border-rose-500/20 bg-card/80 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-base text-rose-600 dark:text-rose-400">
                <XCircle className="size-4" />
                Skill & Experience Gaps ({results.weaknesses.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2.5">
                {results.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                    <span className="size-5 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                      <XCircle className="size-3.5" />
                    </span>
                    <span className="leading-snug">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Missing Skills Tags */}
      {results.missingSkills?.length > 0 && (
        <Card className="border border-amber-500/20 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-4" />
              Keywords & Tech Missing from Resume
            </CardTitle>
            <CardDescription>
              Adding verifiable experience with these keywords can instantly boost ATS parser ranking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {results.missingSkills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="warning"
                  className="px-3 py-1 text-xs rounded-lg font-medium tracking-normal"
                >
                  + {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actionable Suggestions & Recommended Changes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Suggestions */}
        {results.suggestions?.length > 0 && (
          <Card className="border border-indigo-500/20 bg-card/80 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-base text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="size-4" />
                Strategic Interview Advancements
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2.5">
                {results.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                    <span className="size-5 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold">
                      {index + 1}
                    </span>
                    <span className="leading-snug">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recommended Changes */}
        {results.recommendedChanges?.length > 0 && (
          <Card className="border border-purple-500/20 bg-card/80 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-base text-purple-600 dark:text-purple-400">
                <FileEdit className="size-4" />
                Company-Tailored Resume Edits
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2.5">
                {results.recommendedChanges.map((change, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                    <ArrowRight className="size-4 text-purple-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">{change}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
