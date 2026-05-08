import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = ''   // ← pega tu Project URL
const SUPABASE_KEY = ''   // ← pega tu anon public key

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
