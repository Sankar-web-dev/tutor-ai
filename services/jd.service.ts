export interface JDComparisonResult {
  overallRating: number // 0-100
  matchScore: number // 0-100
  summary: string
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  missingSkills: string[]
  recommendedChanges: string[]
}

export const jdService = {
  async compareResumeWithJD(resumeText: string, jdText: string): Promise<JDComparisonResult> {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_KEY
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not found')
    }

    const prompt = `You are an expert resume analyzer and career coach. Compare the following resume with the job description and provide detailed feedback.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}

Analyze the resume against the job description and return ONLY a JSON object with this exact structure:
{
  "overallRating": number (0-100),
  "matchScore": number (0-100),
  "summary": "brief summary of the candidate's fit",
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "recommendedChanges": ["change1", "change2", ...]
}

Rules:
- overallRating: Overall assessment of the candidate (0-100)
- matchScore: How well the resume matches the JD requirements (0-100)
- summary: 2-3 sentences summarizing the candidate's fit for the role
- strengths: 3-5 key strengths based on the resume and JD match
- weaknesses: 3-5 areas where the resume falls short
- suggestions: 3-5 actionable suggestions to improve the resume
- missingSkills: Skills mentioned in JD but not found in resume
- recommendedChanges: Specific changes to make the resume more company-specific
- Return ONLY the JSON, no other text`

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'JD Resume Analyzer',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-nemo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume analyzer and career coach. Always return valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenRouter API error:', errorText)
        throw new Error(`Failed to analyze with AI: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response from AI')
      }

      // Parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI')
      }

      const parsed = JSON.parse(jsonMatch[0])

      // Validate required fields
      if (parsed.overallRating === undefined || parsed.matchScore === undefined) {
        throw new Error('Missing required fields in AI response')
      }

      return {
        overallRating: parsed.overallRating,
        matchScore: parsed.matchScore,
        summary: parsed.summary || '',
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        suggestions: parsed.suggestions || [],
        missingSkills: parsed.missingSkills || [],
        recommendedChanges: parsed.recommendedChanges || [],
      }
    } catch (error) {
      console.error('Error comparing resume with JD:', error)
      throw error
    }
  },

  extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const text = e.target?.result as string
        resolve(text)
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsText(file)
    })
  },
}
