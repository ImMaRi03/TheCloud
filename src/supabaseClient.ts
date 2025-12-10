
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://utoscaassnbyvwwfyzvs.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0b3NjYWFzc25ieXZ3d2Z5enZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTM4NzgsImV4cCI6MjA4MDg2OTg3OH0.xTdZlBN7zoogzkrxFQbJQ5NMjlrFwtUMVCPZ8nwJZtA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
