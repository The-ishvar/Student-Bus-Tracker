import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
  import { createInsertSchema } from "drizzle-zod";
  import { z } from "zod";

  export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    role: text("role").notNull().default('citizen'), // 'admin' or 'citizen'
  });

  export const buses = pgTable("buses", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    source: text("source").notNull(),
    destination: text("destination").notNull(),
    departureTime: text("departure_time").notNull(),
    arrivalTime: text("arrival_time").notNull(),
    totalSeats: integer("total_seats").notNull(),
    ticketPrice: integer("ticket_price").notNull(),
  });

  export const bookings = pgTable("bookings", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    busId: integer("bus_id").notNull(),
    seatNumber: integer("seat_number").notNull(),
    bookingDate: timestamp("booking_date").defaultNow(),
  });

  export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    senderId: integer("sender_id").notNull(),
    receiverId: integer("receiver_id").notNull(), // 0 for broadcast to admin
    content: text("content").notNull(),
    timestamp: timestamp("timestamp").defaultNow(),
  });

  export const insertUserSchema = createInsertSchema(users).omit({ id: true });
  export const insertBusSchema = createInsertSchema(buses).omit({ id: true });
  export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, bookingDate: true });
  export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, timestamp: true });

  export type User = typeof users.$inferSelect;
  export type InsertUser = z.infer<typeof insertUserSchema>;
  export type Bus = typeof buses.$inferSelect;
  export type InsertBus = z.infer<typeof insertBusSchema>;
  export type Booking = typeof bookings.$inferSelect;
  export type InsertBooking = z.infer<typeof insertBookingSchema>;
  export type Message = typeof messages.$inferSelect;
  export type InsertMessage = z.infer<typeof insertMessageSchema>;
  