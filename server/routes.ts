import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import memorystore from "memorystore";

const MemoryStore = memorystore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Simple session setup for our demo login
  app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({ checkPeriod: 86400000 }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || 'demo-secret-key'
  }));

  // Seed DB on startup
  async function seedDatabase() {
    try {
      // Ensure admin exists
      let admin = await storage.getUserByUsername("admin");
      if (!admin) {
        admin = await storage.createUser({ username: "admin", password: "password", role: "admin" });
      }

      // Ensure a demo citizen exists
      let citizen = await storage.getUserByUsername("citizen");
      if (!citizen) {
        citizen = await storage.createUser({ username: "citizen", password: "password", role: "citizen" });
      }

      const existingBuses = await storage.getBuses();
      if (existingBuses.length === 0) {
        await storage.createBus({
          name: "Express Line 1",
          source: "City Center (शहर केंद्र)",
          destination: "Village North (उत्तरी गाँव)",
          departureTime: "08:00 AM",
          arrivalTime: "09:30 AM",
          totalSeats: 40,
          ticketPrice: 50
        });
        await storage.createBus({
          name: "Morning Star",
          source: "Village South (दक्षिणी गाँव)",
          destination: "College Campus (कॉलेज)",
          departureTime: "07:30 AM",
          arrivalTime: "08:45 AM",
          totalSeats: 30,
          ticketPrice: 30
        });
      }
      
      const existingVideos = await storage.getVideos();
      if(existingVideos.length === 0) {
         await storage.createVideo({
           title: "Live Class: Math Demo",
           url: "https://www.youtube.com/embed/dQw4w9WgXcQ"
         });
      }
    } catch (e) {
      console.error("Failed to seed db", e);
    }
  }
  
  // Auth routes
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      let user = await storage.getUserByUsername(input.username);
      
      // If user doesn't exist (since it's a demo), create them as a citizen dynamically
      if (!user) {
        user = await storage.createUser({ username: input.username, password: input.password, role: "citizen" });
      } else if (user.password !== input.password) {
        return res.status(401).json({ message: "Invalid password / गलत पासवर्ड" });
      }
      
      // @ts-ignore
      req.session.userId = user.id;
      res.status(200).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
    }
  });

  app.get(api.auth.me.path, async (req, res) => {
    // @ts-ignore
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Not logged in" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.status(200).json(user);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.status(200).json({ message: "Logged out" });
    });
  });

  // Bus routes
  app.get(api.buses.list.path, async (req, res) => {
    const buses = await storage.getBuses();
    res.json(buses);
  });

  app.get(api.buses.get.path, async (req, res) => {
    const bus = await storage.getBus(Number(req.params.id));
    if (!bus) return res.status(404).json({ message: "Bus not found" });
    res.json(bus);
  });

  app.post(api.buses.create.path, async (req, res) => {
    const input = api.buses.create.input.parse(req.body);
    const bus = await storage.createBus(input);
    res.status(201).json(bus);
  });

  app.put(api.buses.update.path, async (req, res) => {
    const input = api.buses.update.input.parse(req.body);
    const bus = await storage.updateBus(Number(req.params.id), input);
    res.json(bus);
  });

  app.delete(api.buses.delete.path, async (req, res) => {
    await storage.deleteBus(Number(req.params.id));
    res.status(204).send();
  });

  // Bookings routes
  app.get(api.bookings.list.path, async (req, res) => {
    const bookings = await storage.getBookings();
    res.json(bookings);
  });

  app.get(api.bookings.myBookings.path, async (req, res) => {
    // @ts-ignore
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Not logged in" });
    const userBookings = await storage.getUserBookings(userId);
    res.json(userBookings);
  });

  app.post(api.bookings.create.path, async (req, res) => {
    // @ts-ignore
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Not logged in" });
    
    try {
      const input = api.bookings.create.input.parse({...req.body, userId});
      const booking = await storage.createBooking(input);
      res.status(201).json(booking);
    } catch(err) {
       if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      }
    }
  });

  // Messages routes
  app.get(api.messages.list.path, async (req, res) => {
    const msgs = await storage.getMessages();
    res.json(msgs);
  });

  app.post(api.messages.send.path, async (req, res) => {
    // @ts-ignore
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Not logged in" });
    
    const input = api.messages.send.input.parse({...req.body, senderId: userId, receiverId: 0});
    const msg = await storage.createMessage(input);
    res.status(201).json(msg);
  });

  // Videos routes
  app.get(api.videos.list.path, async (req, res) => {
    const vids = await storage.getVideos();
    res.json(vids);
  });

  app.post(api.videos.create.path, async (req, res) => {
    const input = api.videos.create.input.parse(req.body);
    const vid = await storage.createVideo(input);
    res.status(201).json(vid);
  });

  // Start seeding immediately
  seedDatabase();

  return httpServer;
}
