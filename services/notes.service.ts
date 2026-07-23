import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Note {
  id: string
  title: string
  content: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface CreateNoteInput {
  title: string
  content: string
}

export interface UpdateNoteInput {
  title?: string
  content?: string
}

export const notesService = {
  async getNotes(): Promise<Note[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getNote(id: string): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createNote(input: CreateNoteInput): Promise<Note> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('notes')
      .insert({
        title: input.title,
        content: input.content,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateNote(id: string, input: UpdateNoteInput): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
