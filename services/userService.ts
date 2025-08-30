import { supabase } from './supabaseClient';
import { logSafe } from './safeLogger';
// FIX: Removed GetSessionResponse as it is not an exported member of '@supabase/supabase-js', resolving a compile error.
import { 
  AuthResponse,
  SignUpWithPasswordCredentials,
  SignInWithPasswordCredentials 
} from '@supabase/supabase-js';

export const signUp = async (credentials: SignUpWithPasswordCredentials): Promise<AuthResponse> => {
  const response = await supabase.auth.signUp(credentials);
  if (response.error) {
    logSafe("Supabase Sign Up Error:", response.error);
  }
  return response;
};

export const signIn = async (credentials: SignInWithPasswordCredentials): Promise<AuthResponse> => {
  const response = await supabase.auth.signInWithPassword(credentials);
  if (response.error) {
    logSafe("Supabase Sign In Error:", response.error);
  }
  return response;
};

export const signOut = async (): Promise<{ error: Error | null }> => {
  const response = await supabase.auth.signOut();
  if (response.error) {
    logSafe("Supabase Sign Out Error:", response.error);
  }
  return response;
};

// FIX: Removed the explicit GetSessionResponse type, which is not exported from the module and caused a compile error.
// The return type is now correctly inferred from `supabase.auth.getSession()`.
export const getSession = async () => {
    return supabase.auth.getSession();
};

export const onAuthStateChange = (callback: (event: string, session: import('@supabase/supabase-js').Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
};
