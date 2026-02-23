import { z } from "zod";

  export const api = {
    auth: {
      login: { path: "/api/login", method: "POST", input: z.object({ username: z.string(), password: z.string() }) },
      logout: { path: "/api/logout", method: "POST" },
      me: { path: "/api/me", method: "GET" },
    },
    buses: {
      list: { path: "/api/buses", method: "GET", responses: { 200: z.array(z.any()) } },
      get: { path: "/api/buses/:id", method: "GET" },
      create: { path: "/api/buses", method: "POST", input: z.object({ name: z.string(), source: z.string(), destination: z.string(), departureTime: z.string(), arrivalTime: z.string(), totalSeats: z.number(), ticketPrice: z.number() }) },
      update: { path: "/api/buses/:id", method: "PATCH", input: z.object({ name: z.string().optional(), source: z.string().optional(), destination: z.string().optional(), departureTime: z.string().optional(), arrivalTime: z.string().optional(), totalSeats: z.number().optional(), ticketPrice: z.number().optional() }) },
      delete: { path: "/api/buses/:id", method: "DELETE" },
    },
    bookings: {
      list: { path: "/api/bookings", method: "GET" },
      myBookings: { path: "/api/my-bookings", method: "GET" },
      create: { path: "/api/bookings", method: "POST", input: z.object({ userId: z.number().optional(), busId: z.number(), seatNumber: z.number() }) },
    },
    messages: {
      list: { path: "/api/messages", method: "GET" },
      send: { path: "/api/messages", method: "POST", input: z.object({ content: z.string() }) },
    }
  } as const;

  export function buildUrl(path: string, params?: Record<string, string | number>) {
    let url = path;
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url = url.replace(`:${key}`, String(value));
      }
    }
    return url;
  }
  