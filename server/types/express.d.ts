// Extend Express Request type to include subdomain detection
declare namespace Express {
  export interface Request {
    isAppSubdomain?: boolean;
  }
}