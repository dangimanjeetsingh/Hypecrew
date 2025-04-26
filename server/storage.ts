import { User, InsertUser, Event, InsertEvent, Registration, InsertRegistration } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Event operations
  getEvent(id: number): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  getEventsByCategory(category: string): Promise<Event[]>;
  getFeaturedEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Registration operations
  getRegistration(id: number): Promise<Registration | undefined>;
  getRegistrationsByEvent(eventId: number): Promise<Registration[]>;
  getRegistrationsByUser(userId: number): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  
  // Session store
  sessionStore: any; // Using any type for session store due to type compatibility issues
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private registrations: Map<number, Registration>;
  private userIdCounter: number;
  private eventIdCounter: number;
  private registrationIdCounter: number;
  sessionStore: any; // Using any type for sessionStore

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.registrations = new Map();
    this.userIdCounter = 1;
    this.eventIdCounter = 1;
    this.registrationIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Create two test accounts with plain text passwords (for demo purposes only)
    // In a real application, passwords should be hashed before storing
    
    // Admin account - direct password storage
    this.users.set(1, {
      id: 1,
      username: "admin",
      password: "admin123",
      name: "Admin User",
      email: "manjeetsinghdangi@gmail.com",
      isAdmin: true
    });
    
    // Regular user account - direct password storage
    this.users.set(2, {
      id: 2,
      username: "user",
      password: "pass1111",
      name: "Regular User",
      email: "user@example.com",
      isAdmin: false
    });
    
    this.userIdCounter = 3;
    
    // Add sample events
    this.createEvent({
      title: "Annual Tech Fest",
      description: "Join us for the biggest tech event of the year! Participate in hackathons, workshops, and tech talks from industry experts.",
      venue: "University Auditorium",
      date: new Date("2024-04-15T15:00:00"),
      endDate: new Date("2024-04-15T23:00:00"),
      imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
      category: "Technical",
      featured: true,
      organizer: "Department of Computer Science"
    });
    
    this.createEvent({
      title: "University Cricket Tournament",
      description: "The annual inter-department cricket tournament. Come cheer for your department's team!",
      venue: "Sports Complex",
      date: new Date("2024-04-25T10:00:00"),
      endDate: new Date("2024-04-25T18:00:00"),
      imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      category: "Sports",
      featured: true,
      organizer: "Sports Department"
    });
    
    this.createEvent({
      title: "Cultural Night",
      description: "A celebration of diverse cultures through music, dance, and art performances by students.",
      venue: "University Auditorium",
      date: new Date("2024-05-10T18:00:00"),
      endDate: new Date("2024-05-10T22:00:00"),
      imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
      category: "Cultural",
      featured: false,
      organizer: "Cultural Club"
    });
    
    this.createEvent({
      title: "Research Symposium",
      description: "Annual gathering for showcasing student and faculty research. Featuring keynote speakers from industry experts.",
      venue: "University Auditorium",
      date: new Date("2024-05-20T09:00:00"),
      endDate: new Date("2024-05-20T17:00:00"),
      imageUrl: "https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&w=800&q=80",
      category: "Academic",
      featured: false,
      organizer: "Research Department"
    });
    
    this.createEvent({
      title: "Football Championship",
      description: "The most anticipated football tournament of the season. Come and support your favorite teams!",
      venue: "Sports Complex",
      date: new Date("2024-06-05T15:00:00"),
      endDate: new Date("2024-06-05T19:00:00"),
      imageUrl: "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=800&q=80",
      category: "Sports",
      featured: true,
      organizer: "Sports Club"
    });
    
    this.createEvent({
      title: "Robotics Workshop",
      description: "Hands-on workshop on building and programming robots. Perfect for beginners and enthusiasts alike!",
      venue: "University Auditorium",
      date: new Date("2024-06-15T10:00:00"),
      endDate: new Date("2024-06-15T16:00:00"),
      imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
      category: "Technical",
      featured: false,
      organizer: "Robotics Club"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    // Ensure isAdmin has a default value of false
    const user: User = { 
      id, 
      ...insertUser, 
      isAdmin: insertUser.isAdmin ?? false 
    };
    this.users.set(id, user);
    return user;
  }

  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async getEventsByCategory(category: string): Promise<Event[]> {
    if (category === "All") {
      return this.getAllEvents();
    }
    return Array.from(this.events.values()).filter(
      (event) => event.category === category
    );
  }
  
  async getFeaturedEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.featured
    );
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    
    // Ensure dates are properly converted to Date objects
    const processedEvent = {
      ...insertEvent,
      // Convert date string to Date object if needed
      date: insertEvent.date instanceof Date ? insertEvent.date : new Date(insertEvent.date),
      // Convert endDate string to Date or set to null
      endDate: insertEvent.endDate ? 
        (insertEvent.endDate instanceof Date ? insertEvent.endDate : new Date(insertEvent.endDate)) 
        : null,
      featured: insertEvent.featured ?? false
    };
    
    // Remove imageFile field if present (not stored in database)
    if ('imageFile' in processedEvent) {
      delete (processedEvent as any).imageFile;
    }
    
    const event: Event = { 
      id, 
      ...processedEvent
    };
    
    this.events.set(id, event);
    return event;
  }
  
  async updateEvent(id: number, updateData: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = await this.getEvent(id);
    if (!event) return undefined;
    
    // Process the update data
    const processedUpdate: any = { ...updateData };
    
    // Convert date to Date object if provided
    if (updateData.date) {
      processedUpdate.date = updateData.date instanceof Date ? 
        updateData.date : new Date(updateData.date);
    }
    
    // Handle endDate - might be a date, null, or undefined
    if (updateData.endDate !== undefined) {
      processedUpdate.endDate = updateData.endDate ? 
        (updateData.endDate instanceof Date ? updateData.endDate : new Date(updateData.endDate)) 
        : null;
    }
    
    // Remove imageFile field if present
    if ('imageFile' in processedUpdate) {
      delete processedUpdate.imageFile;
    }
    
    const updatedEvent: Event = { ...event, ...processedUpdate };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Registration methods
  async getRegistration(id: number): Promise<Registration | undefined> {
    return this.registrations.get(id);
  }
  
  async getRegistrationsByEvent(eventId: number): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      (registration) => registration.eventId === eventId
    );
  }
  
  async getRegistrationsByUser(userId: number): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      (registration) => registration.userId === userId
    );
  }
  
  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const id = this.registrationIdCounter++;
    const registration: Registration = { id, ...insertRegistration };
    this.registrations.set(id, registration);
    return registration;
  }
}

export const storage = new MemStorage();
