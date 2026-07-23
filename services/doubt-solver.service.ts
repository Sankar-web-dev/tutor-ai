import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Question {
  id: string
  question: string
  answer: string
  user_id: string
  created_at: string
}

export interface CreateQuestionInput {
  question: string
  answer: string
}

export const doubtSolverService = {
  async askQuestion(question: string): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_KEY
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not found')
    }

    const prompt = `You are a helpful AI assistant. Answer the following question clearly and concisely.

Question: ${question}

Provide a helpful, accurate answer. If the question is unclear, ask for clarification. Be educational and explain concepts when appropriate.`

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Doubt Solver',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-nemo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant that provides clear, accurate, and educational answers.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenRouter API error:', errorText)
        throw new Error(`Failed to get AI response: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response from AI')
      }

      return content
    } catch (error) {
      console.error('Error asking question:', error)
      throw error
    }
  },

  async saveQuestion(input: CreateQuestionInput): Promise<Question> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('questions')
      .insert({
        question: input.question,
        answer: input.answer,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getQuestions(): Promise<Question[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
