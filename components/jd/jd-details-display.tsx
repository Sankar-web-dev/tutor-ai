'use client'

import { JDDetails } from '@/services/jd-extraction.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Briefcase, DollarSign, FileText, MapPin, GraduationCap, Clock, ListTodo, Sparkles } from 'lucide-react'

interface JDDetailsDisplayProps {
  details: JDDetails
}

export function JDDetailsDisplay({ details }: JDDetailsDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{details.summary}</p>
        </CardContent>
      </Card>

      {/* Key Details Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Company</p>
            </div>
            <p className="text-lg font-semibold">{details.companyName}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Role</p>
            </div>
            <p className="text-lg font-semibold">{details.role}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">LPA</p>
            </div>
            <p className="text-lg font-semibold">{details.lpa}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Bond</p>
            </div>
            <p className="text-lg font-semibold">{details.bond}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Location</p>
            </div>
            <p className="text-lg font-semibold">{details.location}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Stipend</p>
            </div>
            <p className="text-lg font-semibold">{details.stipend}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Experience</p>
            </div>
            <p className="text-lg font-semibold">{details.experience}</p>
          </CardContent>
        </Card>
      </div>

      {/* Skills */}
      {details.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Required Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {details.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Qualifications */}
      {details.qualifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Qualifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {details.qualifications.map((qualification, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-sm">{qualification}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Responsibilities */}
      {details.responsibilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {details.responsibilities.map((responsibility, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-sm">{responsibility}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
