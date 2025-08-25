import type { Request, Response, NextFunction } from "express";
import express from "express";
import compression from "compression";
import { log } from "./vite";
import { registerRoutes } from "./routes";

const app = express();
app.set("trust proxy", true);

// Serve static files for PWA
app.use(express.static("public"));

// Compression
app.use(compression());

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalSend = res.send;
  res.send = function (body) {
    if (res.get('Content-Type')?.includes('application/json')) {
      try {
        capturedJsonResponse = typeof body === 'string' ? JSON.parse(body) : body;
      } catch {
        // Not JSON or malformed
      }
    }
    return originalSend.call(this, body);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse).slice(0, 100)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function startServer() {
  try {
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
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "custom",
        base: "/",
      });
      app.use(vite.ssrFixStacktrace);
      app.use(vite.middlewares);
    } else {
      app.use("/assets", express.static("dist/assets"));
    }

    const port = 5000;
    server.listen(port, "0.0.0.0", {
      reusePort: true,
    }, () => {
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