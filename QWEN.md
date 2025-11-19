# Three Lights Barbershop Frontend - Qwen Context

## Project Overview

This is the front-end for the **Three Lights Barbershop** management system, built as a thesis project. It's a SvelteKit 5 application that serves two primary user groups:

1. **Administrators** - Complete CRUD operations for managing barbershop resources (barbers, services, catalogues, reservations, vouchers, operational times)
2. **Customers** - Public-facing interface for viewing services, schedules, and making reservations

## Tech Stack

- **Framework:** SvelteKit 5 with Svelte 5 (runes-based reactivity)
- **Language:** TypeScript (strict mode)
- **Styling:** TailwindCSS 4, shadcn-svelte components
- **Build Tool:** Vite 6
- **Forms/Validation:** sveltekit-superforms with Zod
- **Database:** Supabase JS client (pre-configured)
- **UI Components:** shadcn-svelte with 30+ components
- **Icons:** Lucide Svelte
- **Date Handling:** @internationalized/date + svelte-fullcalendar
- **Quality:** ESLint 9, Prettier 3, svelte-check

## Project Structure

```
front-end-TLB/
├── src/
│   ├── lib/                        # Shared library code
│   │   ├── api/                    # API layer
│   │   │   ├── admin/             # Admin CRUD operations
│   │   │   │   ├── barber.ts
│   │   │   │   ├── catalogue.ts
│   │   │   │   ├── operationalTime.ts
│   │   │   │   ├── reservation.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── voucher.ts
│   │   │   └── shared/            # Customer-facing APIs
│   │   │       └── api.ts
│   │   ├── columns/               # Table column definitions
│   │   │   └── admin/
│   │   ├── components/            # Reusable components
│   │   │   ├── Admin/            # Admin-specific components
│   │   │   ├── Global/           # Shared across admin/user
│   │   │   ├── User/             # Customer-facing components
│   │   │   └── ui/               # shadcn-svelte components
│   │   ├── hooks/                 # Svelte runes-based hooks
│   │   ├── supabase/             # Supabase client
│   │   ├── types/                # TypeScript definitions
│   │   ├── utils/                # Utility functions
│   │   ├── zod/                  # Validation schemas
│   │   └── assets/               # Static assets
│   ├── routes/                    # SvelteKit routes
│   │   ├── (home)/               # Customer route group
│   │   │   ├── profile/          # Profile pages with mini navigation
│   │   │   │   ├── +layout.svelte # Profile layout without duplicate navbar
│   │   │   │   ├── +page.svelte   # Main profile page
│   │   │   │   ├── coin/          # Coin history page
│   │   │   │   ├── reservation/   # Reservation management page
│   │   │   │   └── voucher/       # Voucher management page
│   │   └── admin/                # Admin route group
│   ├── app.css                   # Global styles + Tailwind
│   ├── app.d.ts                  # App type definitions
│   └── app.html                  # HTML template
```

## Key Architectural Patterns

### 1. Routing Architecture

- **Customer Routes:** `(home)` route group with navbar layout
- **Admin Routes:** `admin/` prefix with sidebar + header layout
- **Profile Routes:** Under `(home)/profile` with mini navigation between sections
- **Feature Modules:** Each admin feature follows a consistent CRUD pattern with Create/Edit/Detail pages

### 2. API Layer Architecture

- **Admin API:** Currently uses in-memory arrays with faker.js, but prepared for real backend integration
- **Customer API:** Real HTTP calls to backend service via `PUBLIC_API_URL` environment variable
- **API Functions:** Located in `src/lib/api/` with consistent response format using ApiResponse type

### 3. Component Architecture

- **Admin Components:**
  - AdminSidebar, DataTable (with sorting/pagination/search), DataTableAction for row actions
  - Form components for each entity type with superforms + Zod validation
- **UI Components:** 30+ shadcn-svelte components in `src/lib/components/ui/`

### 4. Profile Page Design

- **Layout Integration:** Profile pages are children of the home route group, sharing the same navbar and footer
- **No Duplicate Navigation:** Profile layout does not include a separate navbar to prevent collision
- **Mini Navigation:** Each profile section has a mini navigation bar for switching between sections:
  - Profile (Main info & security)
  - Reservations (Active & history)
  - Coin History
  - Vouchers
- **Modern UI:** All profile components use shadcn-svelte components for consistency

### 5. Data Flow Pattern

```
User Action → Form Component → Server Action → Validation → API Function → Data Update → Response
```

## Environment Configuration

Create `.env` file with:

```env
# Supabase (client-side)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend API (server-side)
BACKEND_HOST=http://localhost:8000

# Backend API (client-side)
# For development with proxy: PUBLIC_API_URL=/
# For direct access: PUBLIC_API_URL=http://localhost:3000
PUBLIC_API_URL=http://localhost:3000
```

## Development Notes

### CORS Configuration

When running the development server, if you encounter CORS issues, the Vite configuration includes proxy rules that forward API requests to the backend server at http://localhost:3000.

To use the proxy, set `PUBLIC_API_URL=/` in your `.env` file during development. This ensures API calls are made to the same origin as the frontend, avoiding CORS issues.

For the proxy to work properly:

1. Make sure your backend server is running on http://localhost:3000
2. Set `PUBLIC_API_URL=/` in the `.env` file for development
3. Restart the development server after making changes to vite.config.ts or environment variables

## Building and Running

- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Preview:** `npm run preview`
- **Type Check:** `npm run check`
- **Lint:** `npm run lint`
- **Format:** `npm run format`

## Development Conventions

- **TypeScript:** Strict mode with explicit typing
- **Svelte 5 Runes:** Use `$state`, `$derived`, `$props`, `$effect` for reactivity
- **Component Organization:** Use shadcn-svelte patterns for forms and UI
- **Validation:** All forms use Zod schemas with sveltekit-superforms
- **File Naming:** Follow SvelteKit conventions (`+page.svelte`, `+server.ts`, etc.)

## API Integration Notes

- Customer-facing APIs in `src/lib/api/customer/` use the `PUBLIC_API_URL` variable for backend calls
- Admin APIs currently use fake data but are structured to work with real APIs
- All API responses follow a consistent `ApiResponse<T>` format with success, message, data, and error fields

## Active Files Context

- Current focus is on the customer reservation API (`src/lib/api/customer/reservation.ts`)
- Auth-related API in `src/lib/api/auth.ts`
- Various admin API files in `src/lib/api/admin/` for different entities

## Important Files

- `ARCHITECTURE.md`: Detailed technical architecture of the project
- `svelte.config.js`: SvelteKit configuration including path aliases
- `components.json`: shadcn-svelte configuration
- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: Vite build configuration
