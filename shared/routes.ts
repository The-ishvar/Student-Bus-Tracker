import { z } from 'zod';
import { insertUserSchema, insertBusSchema, insertBookingSchema, insertMessageSchema, insertVideoSchema, users, buses, bookings, messages, videos } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.validation,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.validation,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.object({ message: z.string() }),
      }
    }
  },
  buses: {
    list: {
      method: 'GET' as const,
      path: '/api/buses' as const,
      responses: { 200: z.array(z.custom<typeof buses.$inferSelect>()) }
    },
    get: {
      method: 'GET' as const,
      path: '/api/buses/:id' as const,
      responses: { 200: z.custom<typeof buses.$inferSelect>(), 404: errorSchemas.notFound }
    },
    create: {
      method: 'POST' as const,
      path: '/api/buses' as const,
      input: insertBusSchema,
      responses: { 201: z.custom<typeof buses.$inferSelect>() }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/buses/:id' as const,
      input: insertBusSchema.partial(),
      responses: { 200: z.custom<typeof buses.$inferSelect>(), 404: errorSchemas.notFound }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/buses/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound }
    }
  },
  bookings: {
    list: {
      method: 'GET' as const,
      path: '/api/bookings' as const,
      responses: { 200: z.array(z.custom<typeof bookings.$inferSelect & { bus: typeof buses.$inferSelect, user: typeof users.$inferSelect }>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/bookings' as const,
      input: insertBookingSchema,
      responses: { 201: z.custom<typeof bookings.$inferSelect>(), 400: errorSchemas.validation }
    },
    myBookings: {
      method: 'GET' as const,
      path: '/api/my-bookings' as const,
      responses: { 200: z.array(z.custom<typeof bookings.$inferSelect & { bus: typeof buses.$inferSelect }>()) }
    }
  },
  messages: {
    list: {
      method: 'GET' as const,
      path: '/api/messages' as const,
      responses: { 200: z.array(z.custom<typeof messages.$inferSelect & { senderUsername?: string }>()) }
    },
    send: {
      method: 'POST' as const,
      path: '/api/messages' as const,
      input: insertMessageSchema,
      responses: { 201: z.custom<typeof messages.$inferSelect>() }
    }
  },
  videos: {
    list: {
      method: 'GET' as const,
      path: '/api/videos' as const,
      responses: { 200: z.array(z.custom<typeof videos.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/videos' as const,
      input: insertVideoSchema,
      responses: { 201: z.custom<typeof videos.$inferSelect>() }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
