import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://licarkzxaximdaqbxfra.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpY2Fya3p4YXhpbWRhcWJ4ZnJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MDAyMDMsImV4cCI6MjA3MTM3NjIwM30.ErIJm-sZnBA7pTZpDbsWpBUxqpL3f_uUe8Zmd_o9i_Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)