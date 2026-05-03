import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zelmfpqovtvyukiozwdt.supabase.co';
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplbG1mcHFvdnR2eXVraW96d2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzkyMTcsImV4cCI6MjA5MzA1NTIxN30.68YXRplxLk3jZod83YqDyOLdmvcfW9xSmJONDTbTcOg';

// Clean up the URL if it contains the REST endpoint path
supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  supabaseUrl = 'https://zelmfpqovtvyukiozwdt.supabase.co';
}

if (!supabaseAnonKey) {
  supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplbG1mcHFvdnR2eXVraW96d2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzkyMTcsImV4cCI6MjA5MzA1NTIxN30.68YXRplxLk3jZod83YqDyOLdmvcfW9xSmJONDTbTcOg';
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);