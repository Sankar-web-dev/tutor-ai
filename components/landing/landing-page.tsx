import { LandingNavbar } from './landing-navbar'
import { Calendar, FileText, Briefcase, Mail, Cloud, BookOpen, MessageSquare, Target } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <span className="text-sm font-medium">AI-Powered Learning Platform</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Career & Study Assistant
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            An AI-powered web application designed to help students manage their academics and placement preparation from a single platform.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">About the Project</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
          </div>
          <p className="text-lg text-muted-foreground text-center leading-relaxed">
            Our platform leverages cutting-edge AI technology to transform how students approach their academic journey and career preparation. By integrating with essential Google services and providing intelligent document analysis, we create a seamless experience that helps you stay organized, informed, and ahead of the competition.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Calendar className="w-8 h-8" />}
              title="Google Calendar Integration"
              description="Create reminders and schedules automatically to never miss important deadlines."
            />
            <FeatureCard
              icon={<FileText className="w-8 h-8" />}
              title="PDF Summarization"
              description="Generate concise summaries of notes, research papers, and study materials."
            />
            <FeatureCard
              icon={<Briefcase className="w-8 h-8" />}
              title="JD Summarization"
              description="Extract important skills, requirements, and responsibilities from job descriptions."
            />
            <FeatureCard
              icon={<Mail className="w-8 h-8" />}
              title="Gmail Integration"
              description="Sync Gmail and automatically identify placement, internship, and job-related emails."
            />
            <FeatureCard
              icon={<Cloud className="w-8 h-8" />}
              title="Google Cloud Storage"
              description="Securely upload and store PDFs and other study documents in the cloud."
            />
            <FeatureCard
              icon={<BookOpen className="w-8 h-8" />}
              title="Smart Notes"
              description="Convert uploaded documents into organized notes, key points, and quick revision material."
            />
            <FeatureCard
              icon={<MessageSquare className="w-8 h-8" />}
              title="AI Doubt Solver"
              description="Ask questions based on your uploaded notes and PDFs. Get accurate answers from your own documents using RAG technology."
              fullSpan
            />
          </div>
        </div>
      </section>

      {/* Goal Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Goal</h2>
          </div>
          <p className="text-xl text-center leading-relaxed text-white/90">
            To build a single AI-powered platform that helps students organize their studies, manage placement activities, and quickly find information from their personal learning resources, improving both productivity and exam/interview preparation.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 AI Career & Study Assistant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, fullSpan = false }: { 
  icon: React.ReactNode
  title: string
  description: string
  fullSpan?: boolean 
}) {
  return (
    <div className={`p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow ${fullSpan ? 'md:col-span-2 lg:col-span-3' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}
