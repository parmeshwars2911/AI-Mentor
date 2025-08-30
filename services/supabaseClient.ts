import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config';

// Create a single, shared Supabase client for the whole app
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
