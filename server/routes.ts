import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertEventSchema, 
  insertRegistrationSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const category = req.query.category as string;
      const search = req.query.search as string;
      
      let events = category 
        ? await storage.getEventsByCategory(category) 
        : await storage.getAllEvents();
      
      // Filter by search if provided
      if (search && search.trim() !== "") {
        const searchLower = search.toLowerCase();
        events = events.filter(event => 
          event.title.toLowerCase().includes(searchLower) || 
          event.description.toLowerCase().includes(searchLower)
        );
      }
      
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/featured", async (req, res) => {
    try {
      const events = await storage.getFeaturedEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      // Check if user is authenticated and admin
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      console.log("[Events] Create event request received");
      
      // Extract and validate data
      const validatedData = insertEventSchema.parse(req.body);
      
      // Handle dates - ensure they are proper Date objects
      const processedData = {
        ...validatedData,
        date: new Date(validatedData.date),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      };
      
      // Remove the imageFile field which we don't want to store
      if ('imageFile' in processedData) {
        delete processedData.imageFile;
      }
      
      const event = await storage.createEvent(processedData);
      res.status(201).json(event);
    } catch (error) {
      console.error("[Events] Create event error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create event", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Handle both PUT and PATCH for event updates
  app.put("/api/events/:id", updateEvent);
  app.patch("/api/events/:id", updateEvent);
  
  // Function to handle event updates
  async function updateEvent(req: Request, res: Response) {
    try {
      // Check if user is authenticated and admin
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      console.log("[Events] Update event request received");
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Extract and validate data
      const validatedData = insertEventSchema.partial().parse(req.body);
      
      // Process dates
      const processedData: any = { ...validatedData };
      
      if (validatedData.date) {
        processedData.date = new Date(validatedData.date);
      }
      
      if (validatedData.endDate) {
        processedData.endDate = new Date(validatedData.endDate);
      } else if (validatedData.endDate === null) {
        processedData.endDate = null;
      }
      
      // Remove the imageFile field
      if ('imageFile' in processedData) {
        delete processedData.imageFile;
      }
      
      // Update the event
      const updatedEvent = await storage.updateEvent(id, processedData);
      res.json(updatedEvent);
    } catch (error) {
      console.error("[Events] Update event error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update event", error: error instanceof Error ? error.message : String(error) });
    }
  }

  app.delete("/api/events/:id", async (req, res) => {
    try {
      // Check if user is authenticated and admin
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const success = await storage.deleteEvent(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete event" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Registration routes
  app.post("/api/registrations", async (req, res) => {
    try {
      const { eventId, fullName, email, phone, tickets } = req.body;
      
      // Check if event exists
      const event = await storage.getEvent(parseInt(eventId));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Determine user ID (0 for guest registrations)
      const userId = req.isAuthenticated() ? req.user.id : 0;
      
      const registrationData = {
        userId,
        eventId: parseInt(eventId),
        fullName,
        email,
        phone,
        tickets: parseInt(tickets),
        registrationDate: new Date()
      };
      
      const validatedData = insertRegistrationSchema.parse(registrationData);
      const registration = await storage.createRegistration(validatedData);
      
      res.status(201).json(registration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  app.get("/api/registrations/event/:eventId", async (req, res) => {
    try {
      // Check if user is authenticated and admin
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const registrations = await storage.getRegistrationsByEvent(eventId);
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  app.get("/api/registrations/user", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const registrations = await storage.getRegistrationsByUser(req.user.id);
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
