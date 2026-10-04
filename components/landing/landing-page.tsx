import { LandingNavbar } from './landing-navbar'
import {
  Calendar,
  FileText,
  Briefcase,
  Mail,
  Cloud,
  BookOpen,
  MessageSquare,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  GraduationCap
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground bg-ambient-mesh">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="container mx-auto text-center max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold backdrop-blur-md">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Next-Gen Placement & Academic Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Ace Your Campus Placements with <span className="gradient-text">AI Precision</span>
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Eliminate placement spam with localized Python ML classification, benchmark your resume against real job descriptions, and query your study notes using RAG.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-card/80 border border-border/70 px-3.5 py-2 rounded-xl backdrop-blur-sm">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span>Zero-Spam Gmail ML Filter</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-card/80 border border-border/70 px-3.5 py-2 rounded-xl backdrop-blur-sm">
              <CheckCircle2 className="size-4 text-indigo-500" />
              <span>ATS Resume Gap Scoring</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-card/80 border border-border/70 px-3.5 py-2 rounded-xl backdrop-blur-sm">
              <CheckCircle2 className="size-4 text-sky-500" />
              <span>Google Drive TF-IDF RAG</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="outline" className="px-3 py-1">Comprehensive Feature Architecture</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything You Need to Get Hired</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Engineered specifically for engineering students navigating competitive campus placement seasons.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={<Mail className="w-5 h-5 text-emerald-500" />}
              iconBg="bg-emerald-500/10"
              title="Python ML Placement Filter"
              description="Custom classification model automatically distinguishes campus shortlists and interview calls from promo spam."
            />
            <FeatureCard
              icon={<FileText className="w-5 h-5 text-indigo-500" />}
              iconBg="bg-indigo-500/10"
              title="ATS Resume Benchmark"
              description="Compares your uploaded resume against target job requirements, highlighting missing keywords and skills."
            />
            <FeatureCard
              icon={<Briefcase className="w-5 h-5 text-purple-500" />}
              iconBg="bg-purple-500/10"
              title="JD Parameter Extractor"
              description="Parses compensation LPA packages, service bonds, required tech stack, and interview round criteria."
            />
            <FeatureCard
              icon={<Calendar className="w-5 h-5 text-amber-500" />}
              iconBg="bg-amber-500/10"
              title="Google Calendar Sync"
              description="One-click extraction of drive and test dates directly from placement emails into Google Calendar."
            />
            <FeatureCard
              icon={<Cloud className="w-5 h-5 text-sky-500" />}
              iconBg="bg-sky-500/10"
              title="Google Drive Document Hub"
              description="Upload and categorize subject notes, previous questions, and company prep sheets in the cloud."
            />
            <FeatureCard
              icon={<BookOpen className="w-5 h-5 text-rose-500" />}
              iconBg="bg-rose-500/10"
              title="Smart Prep Notes"
              description="Personal markdown notes with tag indexing to synthesize interview formulas and coding tips."
            />
            <FeatureCard
              icon={<MessageSquare className="w-5 h-5 text-pink-500" />}
              iconBg="bg-pink-500/10"
              title="AI Doubt Solver & Drive RAG"
              description="Ask technical questions to an AI assistant with answers grounded directly in your uploaded syllabus PDFs and documents."
              fullSpan
            />
          </div>
        </div>
      </section>

      {/* Executive Mission Banner */}
      <section className="py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 p-8 sm:p-12 text-center text-white space-y-4 shadow-xl shadow-indigo-950/30 backdrop-blur-xl relative overflow-hidden">
            <div className="size-14 rounded-2xl bg-white/10 text-white mx-auto flex items-center justify-center border border-white/20">
              <Target className="size-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Our Mission</h2>
            <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
              To provide students with a single AI-driven command center that unifies placement communications, interview scheduling, document retrieval, and resume tailoring into a frictionless experience.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/60 text-xs text-muted-foreground text-center">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} AI Career Assistant. Built with Next.js, Google Workspace APIs & Python ML.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  iconBg,
  title,
  description,
  fullSpan = false
}: { 
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
  fullSpan?: boolean 
}) {
  return (
    <div className={`p-6 rounded-2xl border border-border/70 bg-card/80 hover:bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 ${
      fullSpan ? 'md:col-span-2 lg:col-span-3' : ''
    }`}>
      <div className="flex items-start gap-4">
        <div className={`size-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-base text-foreground">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}
