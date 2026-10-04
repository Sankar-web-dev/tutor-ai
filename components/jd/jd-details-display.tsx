'use client'

import { JDDetails } from '@/services/jd-extraction.service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Briefcase,
  DollarSign,
  FileText,
  MapPin,
  GraduationCap,
  Clock,
  ListTodo,
  Sparkles,
  CheckCircle2,
  Layers
} from 'lucide-react'

interface JDDetailsDisplayProps {
  details: JDDetails
}

export function JDDetailsDisplay({ details }: JDDetailsDisplayProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Executive Summary Card */}
      {details.summary && (
        <Card className="border border-border/70 bg-gradient-to-br from-card via-card/90 to-primary/5 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="size-4" />
              </div>
              Role Overview & Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans">
              {details.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Key Details Matrix Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <DetailStatCard
          icon={<Building2 className="size-4 text-indigo-500" />}
          label="Company"
          value={details.companyName || 'Not specified'}
          highlight
        />
        <DetailStatCard
          icon={<Briefcase className="size-4 text-purple-500" />}
          label="Designation / Role"
          value={details.role || 'Not specified'}
        />
        <DetailStatCard
          icon={<DollarSign className="size-4 text-emerald-500" />}
          label="CTC Package (LPA)"
          value={details.lpa || 'Not disclosed'}
          accentColor="text-emerald-600 dark:text-emerald-400 font-bold"
        />
        <DetailStatCard
          icon={<FileText className="size-4 text-amber-500" />}
          label="Service Agreement / Bond"
          value={details.bond || 'No Bond'}
        />
        <DetailStatCard
          icon={<MapPin className="size-4 text-sky-500" />}
          label="Location"
          value={details.location || 'Multiple / Remote'}
        />
        <DetailStatCard
          icon={<DollarSign className="size-4 text-teal-500" />}
          label="Internship Stipend"
          value={details.stipend || 'N/A'}
        />
        <DetailStatCard
          icon={<Clock className="size-4 text-rose-500" />}
          label="Experience Required"
          value={details.experience || 'Freshers / 0-1 yrs'}
        />
      </div>

      {/* Required Tech Skills */}
      {details.skills?.length > 0 && (
        <Card className="border border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <div className="size-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Layers className="size-4" />
              </div>
              Core Tech Stack & Competencies ({details.skills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {details.skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1 text-xs rounded-xl font-medium border border-border/60 hover:border-primary/40 transition-colors"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Qualifications & Responsibilities 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Qualifications */}
        {details.qualifications?.length > 0 && (
          <Card className="border border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <GraduationCap className="size-4 text-primary" />
                Eligibility Criteria & Degrees
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2.5">
                {details.qualifications.map((qualification, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                    <span className="size-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="leading-relaxed">{qualification}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Responsibilities */}
        {details.responsibilities?.length > 0 && (
          <Card className="border border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <ListTodo className="size-4 text-purple-500" />
                Key Deliverables & Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2.5">
                {details.responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                    <span className="size-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                    <span className="leading-relaxed">{responsibility}</span>
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

function DetailStatCard({
  icon,
  label,
  value,
  highlight,
  accentColor,
}: {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
  accentColor?: string
}) {
  return (
    <div className={`p-4 rounded-2xl border transition-colors ${
      highlight
        ? 'border-primary/30 bg-primary/5'
        : 'border-border/70 bg-card/70'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="size-7 rounded-lg bg-background/80 flex items-center justify-center border border-border/40 shadow-xs">
          {icon}
        </div>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">{label}</p>
      </div>
      <p className={`text-sm sm:text-base font-semibold truncate ${accentColor || 'text-foreground'}`}>
        {value}
      </p>
    </div>
  )
}
