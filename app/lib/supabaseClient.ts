import { createClient } from '@supabase/supabase-js'

// Check if environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  }
})