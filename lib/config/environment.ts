/**
 * Environment configuration and utilities
 * Centralizes all environment-based logic for the application
 */

/**
 * Check if Firebase client-side environment variables are present
 */
export const isFirebaseClientAvailable = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
};

/**
 * Check if Firebase server-side (Admin SDK) environment variables are present
 */
export const isFirebaseServerAvailable = (): boolean => {
  return !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
};

/**
 * Check if Firebase is fully available (both client and server)
 * Falls back to checking client-side only if server check is not needed
 */
export const isFirebaseAvailable = (requireServer: boolean = false): boolean => {
  const clientAvailable = isFirebaseClientAvailable();
  if (requireServer) {
    return clientAvailable && isFirebaseServerAvailable();
  }
  return clientAvailable;
};

export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  /**
   * Use mock data only if Firebase is not available
   * This allows using Firebase even in development mode if env vars are set
   */
  useMockData: !isFirebaseAvailable(true),
} as const;
