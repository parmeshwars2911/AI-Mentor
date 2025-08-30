// Centralized Supabase configuration

// IMPORTANT: Replace these with your actual Supabase project URL and anon key.
// You can find these in your Supabase project's dashboard under:
// Settings -> API -> Project API keys

const supabaseUrl = 'https://yokehhbxqnpfvteytupn.supabase.co'; // e.g., 'https://your-project-id.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlva2VoaGJ4cW5wZnZ0ZXl0dXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODAzMTEsImV4cCI6MjA3MjA1NjMxMX0.eZ-sIPj0LwUsm87ERNhbccfOHQVmaJsMnwDgytAVeIw'; // This is the public, "anonymous" key

// FIX: Removed the compile-time constant comparison that was causing a TypeScript error.
// The check for placeholder values is no longer necessary as the actual Supabase URL and key have been provided.

export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
};