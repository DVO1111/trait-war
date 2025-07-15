// Security utilities and configurations

/**
 * Sanitizes user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .trim() // Remove leading/trailing whitespace
    .slice(0, 1000); // Limit length to prevent DoS
};

/**
 * Validates URLs to ensure they're safe and properly formatted
 */
export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Rate limiting utility for client-side operations
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minute
  ) {}

  canAttempt(key: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Record this attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Content Security Policy configuration
 */
export const CSP_CONFIG = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-inline' 'unsafe-eval'", // Needed for Vite dev
  'style-src': "'self' 'unsafe-inline'", // Needed for Tailwind
  'img-src': "'self' data: https:",
  'font-src': "'self' data:",
  'connect-src': "'self' https://*.supabase.co https://rpc.test.honeycombprotocol.com wss://*.supabase.co",
  'frame-ancestors': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'",
};

/**
 * Applies CSP headers in production
 */
export const applyCspHeaders = (): void => {
  if (typeof document !== 'undefined' && import.meta.env.PROD) {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = Object.entries(CSP_CONFIG)
      .map(([directive, value]) => `${directive} ${value}`)
      .join('; ');
    document.head.appendChild(meta);
  }
};

/**
 * Error messages that don't expose sensitive information
 */
export const SAFE_ERROR_MESSAGES = {
  AUTHENTICATION_FAILED: "Authentication failed. Please check your credentials.",
  AUTHORIZATION_FAILED: "You don't have permission to perform this action.",
  VALIDATION_FAILED: "Please check your input and try again.",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  GENERIC_ERROR: "Something went wrong. Please try again later.",
  RATE_LIMITED: "Too many attempts. Please wait and try again.",
} as const;

/**
 * Maps error types to safe user-facing messages
 */
export const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return SAFE_ERROR_MESSAGES.NETWORK_ERROR;
    }
    
    if (message.includes('auth') || message.includes('unauthorized')) {
      return SAFE_ERROR_MESSAGES.AUTHENTICATION_FAILED;
    }
    
    if (message.includes('permission') || message.includes('forbidden')) {
      return SAFE_ERROR_MESSAGES.AUTHORIZATION_FAILED;
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return SAFE_ERROR_MESSAGES.VALIDATION_FAILED;
    }
    
    if (message.includes('rate') || message.includes('limit')) {
      return SAFE_ERROR_MESSAGES.RATE_LIMITED;
    }
  }
  
  return SAFE_ERROR_MESSAGES.GENERIC_ERROR;
};