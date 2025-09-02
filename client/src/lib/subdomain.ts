/**
 * Subdomain detection utilities for routing logic
 * This file helps determine if we're on the app subdomain or marketing site
 */

/**
 * Check if current page is on app subdomain
 * @returns true if on app.theamproject.com, false otherwise
 */
export function isAppSubdomain(): boolean {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  
  // In production, check for app subdomain
  if (hostname.startsWith('app.theamproject.com')) {
    return true;
  }
  
  // In development, check for special port or parameter
  // This allows testing subdomain logic locally
  if (import.meta.env.MODE === 'development') {
    // Check for ?app=true parameter for local testing
    const params = new URLSearchParams(window.location.search);
    if (params.get('app') === 'true') {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if current page is on marketing domain
 * @returns true if on theamproject.com (not app subdomain), false otherwise
 */
export function isMarketingDomain(): boolean {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  
  // Check for main domain without app subdomain
  if (hostname === 'theamproject.com' || hostname === 'www.theamproject.com') {
    return true;
  }
  
  // In development, default to marketing if not explicitly app
  if (import.meta.env.MODE === 'development') {
    return !isAppSubdomain();
  }
  
  return false;
}

/**
 * Get the appropriate domain for authentication
 * @returns the auth domain URL
 */
export function getAuthDomain(): string {
  if (typeof window === 'undefined') return '';
  
  // In production, always use app subdomain for auth
  if (import.meta.env.MODE === 'production') {
    return 'https://app.theamproject.com';
  }
  
  // In development, use current origin
  return window.location.origin;
}

/**
 * Get the appropriate domain for marketing pages
 * @returns the marketing domain URL
 */
export function getMarketingDomain(): string {
  if (typeof window === 'undefined') return '';
  
  // In production, use main domain
  if (import.meta.env.MODE === 'production') {
    return 'https://theamproject.com';
  }
  
  // In development, use current origin
  return window.location.origin;
}

/**
 * Redirect to app subdomain if needed
 * Used for auth and protected pages
 */
export function redirectToAppSubdomain(path: string = '/'): void {
  if (!isAppSubdomain() && import.meta.env.MODE === 'production') {
    window.location.href = `https://app.theamproject.com${path}`;
  }
}

/**
 * Redirect to marketing domain if needed
 * Used when non-authenticated users access app subdomain
 */
export function redirectToMarketingDomain(path: string = '/'): void {
  if (isAppSubdomain() && import.meta.env.MODE === 'production') {
    window.location.href = `https://theamproject.com${path}`;
  }
}