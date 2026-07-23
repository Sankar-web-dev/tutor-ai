export interface JDDetails {
  companyName: string
  role: string
  lpa: string
  bond: string
  location: string
  stipend: string
  experience: string
  skills: string[]
  qualifications: string[]
  responsibilities: string[]
  summary: string
}

export const jdExtractionService = {
  async extractJDDetails(jdText: string): Promise<JDDetails> {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_KEY
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not found')
    }

    const prompt = `You are an expert job description analyzer. Extract key details from the following job description and return them in a structured JSON format.

JOB DESCRIPTION:
${jdText}

Extract the following details and return ONLY a JSON object with this exact structure:
{
  "companyName": "company name",
  "role": "job role/title",
  "lpa": "salary/LPA (e.g., '8-12 LPA' or 'Not mentioned')",
  "bond": "bond details (e.g., '2 years' or 'No bond' or 'Not mentioned')",
  "location": "job location",
  "stipend": "stipend amount (if internship) or 'Not applicable'",
  "experience": "required experience (e.g., '2-4 years' or 'Fresher' or 'Not mentioned')",
  "skills": ["skill1", "skill2", ...],
  "qualifications": ["qualification1", "qualification2", ...],
  "responsibilities": ["responsibility1", "responsibility2", ...],
  "summary": "brief 2-3 sentence summary of the job"
}

Rules:
- If a field is not mentioned in the JD, use "Not mentioned" or "Not applicable"
- Extract exact values where possible
- For skills, qualifications, and responsibilities, extract as arrays
- Return ONLY the JSON, no other text`

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'JD Analyzer',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-nemo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert job description analyzer. Always return valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenRouter API error:', errorText)
        throw new Error(`Failed to extract JD details: ${response.status}`)
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

      return {
        companyName: parsed.companyName || 'Not mentioned',
        role: parsed.role || 'Not mentioned',
        lpa: parsed.lpa || 'Not mentioned',
        bond: parsed.bond || 'Not mentioned',
        location: parsed.location || 'Not mentioned',
        stipend: parsed.stipend || 'Not applicable',
        experience: parsed.experience || 'Not mentioned',
        skills: parsed.skills || [],
        qualifications: parsed.qualifications || [],
        responsibilities: parsed.responsibilities || [],
        summary: parsed.summary || '',
      }
    } catch (error) {
      console.error('Error extracting JD details:', error)
      throw error
    }
  },
}
