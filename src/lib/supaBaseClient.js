import { createClient } from '@supabase/supabase-js'

export const supabase = createClient('https://eesfvhslqinfbualerug.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlc2Z2aHNscWluZmJ1YWxlcnVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE2NjY2OTMsImV4cCI6MjAxNzI0MjY5M30.8UmQ-qvkw86QlvlXERdPVOEKdkhyi6HRP1j-9GJQSro')