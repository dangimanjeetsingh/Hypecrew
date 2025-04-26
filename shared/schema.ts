import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  isAdmin: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const categories = [
  "All",
  "Academic",
  "Cultural",
  "Sports",
  "Technical",
] as const;

export type Category = (typeof categories)[number];

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  venue: text("venue").notNull(),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  featured: boolean("featured").default(false).notNull(),
  organizer: text("organizer").notNull(),
});

export const insertEventSchemaClient = createInsertSchema(events).pick({
  title: true,
  description: true,
  venue: true,
  date: true,
  endDate: true,
  imageUrl: true,
  category: true,
  featured: true,
  organizer: true,
}).extend({
  // Allow for date objects
  date: z.union([z.string(), z.date()]),
  endDate: z.union([z.string(), z.date(), z.null()]).optional(),
  // For image upload support
  imageFile: z.instanceof(File).optional(),
});

export const insertEventSchemaServer = createInsertSchema(events).pick({
  title: true,
  description: true,
  venue: true,
  date: true,
  endDate: true,
  imageUrl: true,
  category: true,
  featured: true,
  organizer: true,
}).extend({
  // Allow for date objects
  date: z.union([z.string(), z.date()]),
  endDate: z.union([z.string(), z.date(), z.null()]).optional(),
  // For image upload support
  imageFile: z.any().optional(),
});

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  eventId: integer("event_id").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  tickets: integer("tickets").notNull(),
  registrationDate: timestamp("registration_date").notNull(),
});

export const insertRegistrationSchema = createInsertSchema(registrations).pick({
  userId: true,
  eventId: true,
  fullName: true,
  email: true,
  phone: true,
  tickets: true,
  registrationDate: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;
