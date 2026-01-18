import { createClient } from '@supabase/supabase-js'

// We are pasting the string directly just to test. 
// We will secure this later.
const supabaseUrl = 'https://uoldfbnrjwzjkflbcjml.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbGRmYm5yand6amtmbGJjam1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MzEyNTgsImV4cCI6MjA4NDMwNzI1OH0.9MrLzVjqK5BKN3NK1fcCQNASzWzwoQSKakOmTVRUq2M'

export const supabase = createClient(supabaseUrl, supabaseKey)