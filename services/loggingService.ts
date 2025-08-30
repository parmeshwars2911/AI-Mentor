// FIX: This file is part of a deprecated Firebase implementation and is no longer used.
// The application has been migrated to use `supabaseService.ts` for all logging functionalities.
// The original code was removed to resolve an import error for `getUserId` from `userService`,
// which no longer exists after the migration to Supabase.

/*
import {
  collection,
  doc,
  setDoc,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import type { Message, LogEntry } from "../types";
import { getUserId } from "./userService";
import { db } from "./firebase";
import { logSafe } from "./safeLogger";

export const addLog = async (message: Message): Promise<void> => {
  const userId = getUserId();
  if (!userId) {
    // This warning is safe as it doesn't involve complex objects.
    console.warn("[LOGGING WARN] Invalid or missing User ID, skipping log.");
    return;
  }

  try {
    // Per expert diagnosis, using Firestore's native serverTimestamp()
    // is the most robust way to handle timestamps and avoid serialization issues.
    const payload = {
      timestamp: serverTimestamp(),
      id: message.id ?? null,
      sender: message.sender ?? null,
      text: message.text ?? null,
    };

    const logsCollectionRef = collection(db, "users", userId, "logs");
    await setDoc(doc(logsCollectionRef, message.id), payload);
  } catch (error) {
    logSafe(
      "--- [LOGGING CRITICAL ERROR] Failed to save log to Firestore. ---",
      error
    );
  }
};

export const getLogs = async (): Promise<LogEntry[]> => {
  const userId = getUserId();
  if (!userId) return [];

  try {
    const logsCollectionRef = collection(db, "users", userId, "logs");
    const q = query(logsCollectionRef, orderBy("timestamp", "asc"), limit(100));
    const querySnapshot = await getDocs(q);

    const logs: LogEntry[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      const timestampValue = data.timestamp;
      let timestampString: string;

      // Handle both the new string format and the old Firestore Timestamp object
      if (timestampValue instanceof Timestamp) {
        timestampString = timestampValue.toDate().toISOString();
      } else if (typeof timestampValue === 'string') {
        timestampString = timestampValue;
      } else {
        // Provide a sensible fallback if the timestamp is missing or corrupt.
        timestampString = new Date().toISOString();
      }

      // FIX: Corrected property name from 'timestamp' to 'created_at' to match the LogEntry type definition.
      logs.push({
        id: data.id,
        text: data.text,
        sender: data.sender,
        created_at: timestampString,
      });
    });
    
    return logs;
  } catch (error) {
    logSafe("Failed to retrieve logs from Firestore:", error);
    return [];
  }
};
*/
