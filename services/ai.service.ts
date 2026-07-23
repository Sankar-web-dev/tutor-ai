export interface ParsedEvent {
  title: string
  description?: string
  start: string // ISO datetime string
  end: string // ISO datetime string
  location?: string
}

export const aiService = {
  async parseNaturalLanguageEvent(input: string): Promise<ParsedEvent> {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_KEY
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not found')
    }

    const today = new Date().toISOString()
    
    const prompt = `You are a date and time parser. Parse the following natural language event description into a structured JSON format.
    
Current date and time: ${today}

Input: "${input}"

Extract the event details and return ONLY a JSON object with this exact structure:
{
  "title": "event title",
  "description": "event description (optional)",
  "start": "ISO 8601 datetime string",
  "end": "ISO 8601 datetime string",
  "location": "location (optional)"
}

Rules:
- Calculate dates relative to current date (e.g., "tomorrow" = today + 1 day, "next Sunday" = next Sunday)
- Default duration is 1 hour if not specified
- Use 24-hour format for times
- Return valid ISO 8601 format
- If location is mentioned, include it
- If no description is provided, omit the field
- Return ONLY the JSON, no other text`

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Calendar Assistant',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-nemo',
          messages: [
            {
              role: 'system',
              content: 'You are a precise date and time parser. Always return valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenRouter API error:', errorText)
        throw new Error(`Failed to parse with AI: ${response.status}`)
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
      if (!parsed.title || !parsed.start || !parsed.end) {
        throw new Error('Missing required fields in AI response')
      }

      return {
        title: parsed.title,
        description: parsed.description,
        start: parsed.start,
        end: parsed.end,
        location: parsed.location,
      }
    } catch (error) {
      console.error('Error parsing natural language:', error)
      throw error
    }
  },
}
