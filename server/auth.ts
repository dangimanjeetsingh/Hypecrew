import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Add a utility function to debug the hash validity
async function validateHashedPassword(password: string) {
  try {
    // Just verify the format - should be hash.salt
    const parts = password.split('.');
    console.log(`[Auth] Hash validation: ${parts.length === 2}`);
    return parts.length === 2;
  } catch (error) {
    console.error('[Auth] Hash validation error:', error);
    return false;
  }
}

export function setupAuth(app: Express) {
  // Validate the admin password hash
  const adminUser = storage.getUser(1);
  adminUser.then(user => {
    if (user) {
      console.log(`[Auth] Admin user found: ${user.username}`);
      validateHashedPassword(user.password);
    } else {
      console.log('[Auth] Admin user not found');
    }
  });
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "HYPECREW-secret-key",
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax', // Important for cross-domain cookie behavior
      secure: false, // Set to true in production with HTTPS
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`[Auth] Login attempt for username: ${username}`);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`[Auth] User not found: ${username}`);
          return done(null, false);
        }
        
        // For demo purposes - direct password comparison
        // In a real application, use secure password hashing
        const passwordMatches = password === user.password;
        console.log(`[Auth] Password match result: ${passwordMatches}`);
        
        if (!passwordMatches) {
          return done(null, false);
        } else {
          console.log(`[Auth] Login successful for: ${username}`);
          return done(null, user);
        }
      } catch (error) {
        console.error(`[Auth] Login error:`, error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Create user with plain password (for demo only)
      // In production, always hash passwords before storing
      const user = await storage.createUser({
        ...validatedData,
        // password is stored directly for this demo
      });

      // Log user in after registration
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log('[Auth] Login API called with:', { 
      username: req.body.username, 
      password: req.body.password ? '******' : 'not provided'
    });
    
    passport.authenticate("local", (err: Error, user: SelectUser) => {
      if (err) {
        console.error('[Auth] Login error:', err);
        return next(err);
      }
      if (!user) {
        console.log('[Auth] Authentication failed - invalid username or password');
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      console.log('[Auth] Authentication successful, logging in user:', user.username);
      req.login(user, (err) => {
        if (err) {
          console.error('[Auth] Session login error:', err);
          return next(err);
        }
        
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        console.log('[Auth] Login successful, returning user data');
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    console.log('[Auth] GET /api/user called, session:', 
      req.session ? 'exists' : 'missing', 
      'authenticated:', req.isAuthenticated());
    
    if (!req.isAuthenticated()) {
      console.log('[Auth] User not authenticated');
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    console.log('[Auth] User authenticated:', req.user.username);
    
    // Return user without password
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}
