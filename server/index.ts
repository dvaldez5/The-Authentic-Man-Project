import type { Request, Response, NextFunction } from "express";
import express from "express";
import compression from "compression";
import session from "express-session";
import passport from "passport";
import helmet from "helmet";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { log } from "./vite";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import { testConnection } from "./db";

const app = express();
app.set("trust proxy", true);

// Only enable strict headers in production so dev/HMR isn't affected
if (process.env.NODE_ENV === "production") {
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://www.googletagmanager.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: [
          "'self'",
          "https://www.google-analytics.com",
          "https://analytics.google.com",
          "https://www.googletagmanager.com",
        ],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    xssFilter: true,
    noSniff: true,
  }));
}

// Serve static files for PWA
app.use(express.static("public"));

// Compression
app.use(compression());

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration with cross-subdomain support
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV === 'production') {
  throw new Error('SESSION_SECRET is required in production');
}

app.use(session({
  secret: sessionSecret || 'development-session-secret-not-for-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    // Enable cross-subdomain cookies in production
    domain: process.env.NODE_ENV === 'production' ? '.theamproject.com' : undefined,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport configuration
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return done(null, false);
    }
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return done(null, false);
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// Subdomain detection middleware
app.use((req, res, next) => {
  const host = req.headers.host || '';
  req.isAppSubdomain = host.startsWith('app.');
  // Log subdomain detection for debugging
  if (req.path === '/' || req.path.startsWith('/api')) {
    console.log(`Subdomain Detection: host=${host}, isApp=${req.isAppSubdomain}`);
  }
  next();
});

// --- API request logging (host-aware, no response bodies) ---
app.use((req, res, next) => {
  const start = Date.now();
  const host = req.headers["x-forwarded-host"] || req.hostname;
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const ms = Date.now() - start;
      console.log(`${host} :: ${req.method} ${req.path} ${res.statusCode} in ${ms}ms`);
    }
  });
  next();
});

async function startServer() {
  try {
    // Test database connection before starting server
    log('Testing database connection...');
    const connectionSuccess = await testConnection();
    if (!connectionSuccess) {
      console.error('Failed to connect to database. Server will not start.');
      process.exit(1);
    }
    
    const server = await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      console.error(`ERROR ${status}: ${message} for ${req.method} ${req.originalUrl}`);
      
      if (!res.headersSent) {
        if (req.path.startsWith('/api') || req.headers.accept?.includes('application/json')) {
          res.status(status).json({ message });
        } else {
          res.status(status).send(`<!DOCTYPE html><html><head><title>Error ${status}</title></head><body><h1>Error ${status}</h1><p>${message}</p></body></html>`);
        }
      }
    });

    // Setup Vite in development or static files in production
    if (app.get("env") === "development") {
      const { setupVite } = await import("./vite");
      await setupVite(app, server);
    } else {
      const { serveStatic } = await import("./vite");
      serveStatic(app);
    }

    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
      const networkInterface = process.env.REPLIT_DEV_DOMAIN ? 
        `https://${process.env.REPLIT_DEV_DOMAIN}` : 
        `http://0.0.0.0:${port}`;
      log(`serving on port ${port}`);
      log(`Mobile access: ${networkInterface}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();