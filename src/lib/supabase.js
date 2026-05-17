import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Returns a live client if credentials are set, null otherwise (falls back to localStorage)
export const supabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')
  ? createClient(supabaseUrl, supabaseKey)
  : null

export const isSupabaseEnabled = !!supabase
