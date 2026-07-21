import { supabase } from '@/lib/supabase'

// Type definitions for credentials
export interface SignUpCredentials {
  email: string
  password: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface GoogleTokens {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
}

export const authService = {
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/drive',
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: false
      }
    })
    
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  async getGoogleAccessToken(): Promise<string | null> {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    
    if (!session) return null
    
    // The provider token is stored in the session
    const providerToken = session.provider_token
    return providerToken || null
  },

  async getGoogleTokens(): Promise<GoogleTokens | null> {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    
    if (!session) return null
    
    return {
      access_token: session.provider_token || '',
      refresh_token: session.provider_refresh_token || undefined,
      expires_in: session.expires_in || undefined,
      token_type: session.token_type || undefined
    }
  },

  async refreshGoogleAccessToken(): Promise<string | null> {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) throw error
    
    return data.session?.provider_token || null
  }
}