import type { Message, LogEntry } from "../types";
import { supabase } from "./supabaseClient";
import { logSafe } from "./safeLogger";

/**
 * Fetches the current user session securely from Supabase.
 * This is the single source of truth for the user's identity.
 * @returns The user's ID or null if not authenticated.
 */
const getCurrentUserId = async (): Promise<string | null> => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        logSafe("Failed to get Supabase session", error);
        return null;
    }
    return session?.user?.id ?? null;
};

export const addLog = async (message: Message): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.warn("[SUPABASE WARN] Invalid or missing User ID, skipping log.");
    return;
  }

  try {
    const payload = {
      user_id: userId,
      message_id: message.id,
      sender: message.sender,
      text: message.text,
    };

    const { error } = await supabase.from('logs').insert(payload);
    if (error) throw error;

  } catch (error) {
    logSafe(
      "--- [SUPABASE CRITICAL ERROR] Failed to save log to Supabase. ---",
      error
    );
  }
};

export const getLogs = async (): Promise<LogEntry[]> => {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('logs')
      .select('message_id, text, sender, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) throw error;

    if (!data) return [];
    
    // Map Supabase response to the application's Message/LogEntry type
    const logs: LogEntry[] = data.map(row => ({
      id: row.message_id,
      text: row.text,
      sender: row.sender as 'user' | 'ai',
      created_at: row.created_at,
    }));
    
    return logs;
  } catch (error) {
    logSafe("Failed to retrieve logs from Supabase:", error);
    return [];
  }
};
