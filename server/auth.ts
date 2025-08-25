import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

export interface AuthRequest extends Request {
  userId?: number;
  user?: any;
}

// Hash password utility
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Compare password utility
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): { userId: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded;
  } catch (error) {
    // If token verification fails, try to decode without verification for development
    if (process.env.NODE_ENV === 'development') {
      try {
        const decoded = jwt.decode(token) as { userId: number };
        if (decoded && decoded.userId) {
          console.log('Development mode: Using expired token for user', decoded.userId);
          return decoded;
        }
      } catch (decodeError) {
        // Still return null if decode fails
      }
    }
    return null;
  }
}

// Middleware to authenticate JWT token
export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    // Get user from database
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(403).json({ error: "User not found" });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(403).json({ error: "Invalid token" });
  }
}

// Optional authentication (doesn't fail if no token)
export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await storage.getUser(decoded.userId);
        if (user) {
          req.userId = decoded.userId;
          req.user = user;
        }
      }
    }
    next();
  } catch (error) {
    // Silent fail for optional auth
    next();
  }
}