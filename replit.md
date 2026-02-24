# Replit Agent Guide

## Overview

This is a **bus booking and management platform** for small towns in Rajasthan, India (Churu district area). It provides bilingual (English/Hindi) UI for two user roles:

- **Admin**: Manages bus routes, views all bookings, and responds to student queries via chat.
- **Citizen/Student**: Browses available buses, books seats, views their bookings, and chats with admin for support.

The app includes simulated AI features (delay predictions, seat availability indicators) rendered client-side based on deterministic logic from bus IDs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Structure

The project follows a **monorepo pattern** with three top-level directories:

- `client/` — React SPA (Vite + TypeScript)
- `server/` — Express API server (TypeScript, runs via tsx)
- `shared/` — Shared types, schemas, and route definitions used by both client and server

### Frontend (client/)

- **Framework**: React 18 with TypeScript
- **Routing**: `wouter` (lightweight client-side router)
- **State Management**: `@tanstack/react-query` for server state; no global client state library
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with CSS variables for theming, custom fonts (DM Sans, Outfit)
- **Build Tool**: Vite with HMR in dev, static build for production
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

Key frontend patterns:
- Custom hooks in `client/src/hooks/` wrap React Query for each API resource (buses, bookings, messages, auth)
- Protected routes redirect unauthenticated users to `/login`
- Admin-only routes check `user.role === 'admin'`
- Chat uses polling (5-second refetchInterval) rather than WebSockets

### Backend (server/)

- **Framework**: Express 5 on Node.js
- **Language**: TypeScript, executed with `tsx`
- **Session Management**: `express-session` with `memorystore` (in-memory, not persistent across restarts)
- **API Design**: RESTful JSON API under `/api/` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod (via `drizzle-zod` for auto-generating insert schemas)
- **Authentication**: Simple username/password session-based login (no hashing in demo — passwords stored as plaintext)
- **Seeding**: Database is seeded on startup with demo admin/citizen users and sample bus routes

### Shared Layer (shared/)

- `schema.ts` — Drizzle table definitions (users, buses, bookings, messages) and Zod insert schemas
- `routes.ts` — Typed API route definitions with paths, methods, and Zod input/response schemas. Used by both server route handlers and client hooks for type safety.

### Database

- **PostgreSQL** via `drizzle-orm/node-postgres` and the `pg` Pool
- **Connection**: `DATABASE_URL` environment variable (required)
- **Schema Push**: `npm run db:push` uses `drizzle-kit push` to sync schema to the database
- **Migrations**: Configured to output to `./migrations/` directory

**Database Tables:**
1. `users` — id, username, password, role ('admin' | 'citizen')
2. `buses` — id, name, source, destination, departureTime, arrivalTime, totalSeats, ticketPrice
3. `bookings` — id, userId, busId, seatNumber, bookingDate
4. `messages` — id, senderId, receiverId, content, timestamp

### Build & Deploy

- **Dev**: `npm run dev` — runs tsx with Vite dev server middleware for HMR
- **Build**: `npm run build` — Vite builds client to `dist/public/`, esbuild bundles server to `dist/index.cjs`
- **Production**: `npm start` — runs the bundled server which serves static files from `dist/public/`

### Key API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/login` | POST | Authenticate user |
| `/api/logout` | POST | End session |
| `/api/me` | GET | Get current user |
| `/api/buses` | GET/POST | List or create buses |
| `/api/buses/:id` | PATCH/DELETE | Update or delete a bus |
| `/api/bookings` | GET/POST | List all bookings or create one |
| `/api/my-bookings` | GET | Get current user's bookings |
| `/api/messages` | GET/POST | List or send chat messages |

## External Dependencies

### Required Services
- **PostgreSQL Database**: Must be provisioned and connected via `DATABASE_URL` environment variable

### Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required)
- `SESSION_SECRET` — Secret for express-session (falls back to `'demo-secret-key'`)

### Key npm Packages
- `drizzle-orm` + `drizzle-kit` — Database ORM and migration tooling
- `express` v5 — HTTP server
- `@tanstack/react-query` — Async state management
- `wouter` — Client-side routing
- `zod` + `drizzle-zod` — Schema validation
- `shadcn/ui` components (Radix UI + Tailwind CSS)
- `date-fns` — Date formatting
- `memorystore` — In-memory session store
- `lucide-react` — Icon library

### Replit-Specific Plugins
- `@replit/vite-plugin-runtime-error-modal` — Shows runtime errors in dev
- `@replit/vite-plugin-cartographer` — Dev tooling (dev only)
- `@replit/vite-plugin-dev-banner` — Dev banner (dev only)