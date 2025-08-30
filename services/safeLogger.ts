/**
 * Logs any error to the console in a safe, serializable format, preventing
 * "circular structure" crashes from complex library error objects.
 *
 * @param message A descriptive message for the error context.
 * @param error The error object to be logged. Can be of any type.
 */
export const logSafe = (message: string, error: unknown): void => {
  console.error(message);

  if (error && typeof error === 'object') {
    // Extract safe, primitive properties from the error object.
    const safeError = {
      name: (error as Error).name || 'UnknownError',
      message: (error as Error).message || 'No message available',
      code: (error as any).code || 'No code available',
      stack: (error as Error).stack ? (error as Error).stack?.split('\n').slice(0, 5).join('\n') : 'No stack available',
    };
    
    // Log the cleaned object. Using JSON.stringify ensures it's displayed cleanly.
    console.error("Error Details (Safe):", JSON.stringify(safeError, null, 2));
  } else {
    // Handle cases where the thrown 'error' is not an object (e.g., a string or number).
    console.error("Caught a non-object error:", error);
  }
};
