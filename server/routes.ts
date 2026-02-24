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
          const cities = ["Churu (चूरू)", "Taranagar (तारानगर)", "Sardarshahar (सरदारशहर)", "Bikaner (बीकानेर)", "Buchawas (बुचावास)", "Gelegti (गेलेगटी)", "Mehri (मेहरी)", "Nohar (नोहर)"];
          const demoBuses = [
            { name: "Churu Express", source: cities[0], destination: cities[3], departureTime: "08:00 AM", arrivalTime: "11:00 AM", totalSeats: 40, ticketPrice: 150 },
            { name: "Taranagar Local", source: cities[1], destination: cities[0], departureTime: "09:30 AM", arrivalTime: "10:30 AM", totalSeats: 30, ticketPrice: 50 },
            { name: "Sardarshahar Deluxe", source: cities[2], destination: cities[3], departureTime: "07:00 AM", arrivalTime: "10:30 AM", totalSeats: 45, ticketPrice: 200 },
            { name: "Nohar Seva", source: cities[7], destination: cities[2], departureTime: "11:00 AM", arrivalTime: "01:30 PM", totalSeats: 35, ticketPrice: 120 },
            { name: "Buchawas Connect", source: cities[4], destination: cities[1], departureTime: "06:30 AM", arrivalTime: "07:15 AM", totalSeats: 25, ticketPrice: 30 },
            { name: "Mehri Link", source: cities[5], destination: cities[0], departureTime: "02:00 PM", arrivalTime: "03:00 PM", totalSeats: 30, ticketPrice: 60 },
            { name: "Gelegti Express", source: cities[6], destination: cities[7], departureTime: "04:00 PM", arrivalTime: "05:00 PM", totalSeats: 30, ticketPrice: 70 }
          ];
          for (const bus of demoBuses) {
            await storage.createBus(bus);
          }
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
        
        if (!user) {
          // If user doesn't exist, create them as a citizen
          user = await storage.createUser({ username: input.username, password: input.password, role: "citizen" });
        } else if (user.password !== input.password) {
          return res.status(401).json({ message: "Invalid password / गलत पासवर्ड" });
        }
        
        if (!user) {
          return res.status(500).json({ message: "Internal server error: user undefined" });
        }

        // @ts-ignore
        req.session.userId = user.id;
        res.status(200).json(user);
      } catch (err) {
        if (err instanceof z.ZodError) {
          res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
        } else {
          res.status(500).json({ message: "An unexpected error occurred" });
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

    app.patch(api.buses.update.path, async (req, res) => {
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

    // Start seeding immediately
    seedDatabase();

    return httpServer;
  }
  