import { db } from "./db";
import {
  users, buses, bookings, messages, videos,
  type User, type InsertUser,
  type Bus, type InsertBus,
  type Booking, type InsertBooking,
  type Message, type InsertMessage,
  type Video, type InsertVideo
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Buses
  getBuses(): Promise<Bus[]>;
  getBus(id: number): Promise<Bus | undefined>;
  createBus(bus: InsertBus): Promise<Bus>;
  updateBus(id: number, bus: Partial<InsertBus>): Promise<Bus>;
  deleteBus(id: number): Promise<void>;

  // Bookings
  getBookings(): Promise<(Booking & { bus: Bus, user: User })[]>;
  getUserBookings(userId: number): Promise<(Booking & { bus: Bus })[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;

  // Messages
  getMessages(): Promise<(Message & { senderUsername?: string })[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Videos
  getVideos(): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Buses
  async getBuses(): Promise<Bus[]> {
    return await db.select().from(buses);
  }

  async getBus(id: number): Promise<Bus | undefined> {
    const [bus] = await db.select().from(buses).where(eq(buses.id, id));
    return bus;
  }

  async createBus(insertBus: InsertBus): Promise<Bus> {
    const [bus] = await db.insert(buses).values(insertBus).returning();
    return bus;
  }

  async updateBus(id: number, updates: Partial<InsertBus>): Promise<Bus> {
    const [bus] = await db.update(buses).set(updates).where(eq(buses.id, id)).returning();
    return bus;
  }

  async deleteBus(id: number): Promise<void> {
    await db.delete(buses).where(eq(buses.id, id));
  }

  // Bookings
  async getBookings(): Promise<(Booking & { bus: Bus, user: User })[]> {
    const rows = await db.select({
      booking: bookings,
      bus: buses,
      user: users
    }).from(bookings)
      .innerJoin(buses, eq(bookings.busId, buses.id))
      .innerJoin(users, eq(bookings.userId, users.id));
    
    return rows.map(r => ({ ...r.booking, bus: r.bus, user: r.user }));
  }

  async getUserBookings(userId: number): Promise<(Booking & { bus: Bus })[]> {
    const rows = await db.select({
      booking: bookings,
      bus: buses
    }).from(bookings)
      .innerJoin(buses, eq(bookings.busId, buses.id))
      .where(eq(bookings.userId, userId));
    
    return rows.map(r => ({ ...r.booking, bus: r.bus }));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  // Messages
  async getMessages(): Promise<(Message & { senderUsername?: string })[]> {
    const rows = await db.select({
      message: messages,
      user: users
    }).from(messages)
      .leftJoin(users, eq(messages.senderId, users.id));
      
    return rows.map(r => ({ ...r.message, senderUsername: r.user?.username }));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [msg] = await db.insert(messages).values(insertMessage).returning();
    return msg;
  }

  // Videos
  async getVideos(): Promise<Video[]> {
    return await db.select().from(videos);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const [vid] = await db.insert(videos).values(insertVideo).returning();
    return vid;
  }
}

export const storage = new DatabaseStorage();
