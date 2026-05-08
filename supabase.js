import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://cktgezsawdnpejnnxjzj.supabase.co'   // ← pega tu Project URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdGdlenNhd2RucGVqbm54anpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTA3MzEsImV4cCI6MjA4OTI4NjczMX0.LOM_iEit_jJMJ_TE-lNXnKVWc5mTAXIHAARQL7x3WLE'   // ← pega tu anon public key

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
