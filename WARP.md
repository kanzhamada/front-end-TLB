# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is the **Three Lights Barbershop** frontend application - a thesis project for managing a barbershop business. It's built with SvelteKit 5, TypeScript, TailwindCSS 4, and shadcn-svelte components. The application includes both admin management features and customer-facing pages.

**Note:** This is a client-side rendered application (SSR is disabled globally in `src/routes/+layout.ts`).

## Common Commands

### Development

```pwsh
npm run dev                # Start dev server (Vite)
npm run dev -- --open      # Start dev server and open browser
```

### Build & Preview

```pwsh
npm run build              # Build production app
npm run preview            # Preview production build
```

### Code Quality

```pwsh
npm run lint               # Run Prettier check AND ESLint
npm run format             # Format all files with Prettier
npm run check              # TypeScript + Svelte type checking
npm run check:watch        # Watch mode for type checking
```

### Testing

**No test framework is configured in this project.** Do not attempt to run tests unless explicitly added by the developer.

## Architecture Overview

### Routing Strategy

The app uses **SvelteKit file-based routing** with two main sections:

- **Admin area:** `/admin/*` - Full CRUD operations for managing barbershop data
- **Customer area:** `/(home)/*` - Public-facing pages for customers

### Admin Module Structure

Admin features follow a consistent pattern with feature-based organization:

```
src/routes/admin/
├── [Feature]/              # e.g., Barber, Service, Catalogue, Reservation, Voucher, OperationalTime
│   ├── +page.svelte        # List view with DataTable
│   ├── Create/
│   │   └── +page.server.ts # Server-side form handling with superforms + zod
│   ├── [id]/
│   │   └── +page.svelte    # Detail view
│   └── [id]/Edit/
│       └── +page.svelte    # Edit form
```

Each admin module follows the same pattern:

1. **List page** - Uses custom `DataTable` component with search, sort, pagination
2. **Create page** - Form with `sveltekit-superforms` + Zod validation, server-side actions
3. **Detail page** - View single entity details
4. **Edit page** - Form reusing the same validation schemas

### Key Directories

```
src/lib/
├── api/                    # Data layer (currently faker.js mocks + some real API calls)
│   ├── admin/             # Admin CRUD operations (mostly in-memory arrays)
│   └── shared/            # Customer-facing API calls (fetch to backend)
├── columns/admin/         # TanStack Table column definitions for each entity
├── components/
│   ├── Admin/            # Admin-specific components (Forms, Headers, Tables, etc.)
│   ├── ui/               # shadcn-svelte components (accordion, button, form, etc.)
│   └── User/             # Customer-facing components
├── hooks/                # Svelte 5 runes-based hooks (e.g., is-mobile.svelte.ts)
├── supabase/             # Supabase client setup
├── types/                # TypeScript type definitions (adminTypes.ts)
├── utils/                # Utility functions
└── zod/                  # Zod schemas for form validation
```

## Important Technical Details

### Form Validation Pattern

Forms use **sveltekit-superforms** with **Zod** for validation. Pattern:

1. Define schema in `src/lib/zod/schema.ts`
2. Server-side validation in `+page.server.ts` with `superValidate` and `zod()` adapter
3. Return form errors via `fail(400, { form })` for client-side display
4. Success responses return `{ form, success: true, message: '...' }`

Example schema: `barberSchema`, `serviceSchema`, `voucherSchema`, etc.

### Data Table Pattern

Admin list pages use a custom `DataTable` component (`$lib/components/Admin/Table/DataTable.svelte`) with:

- **Column definitions** from `$lib/columns/admin/*Columns.ts` using TanStack Table
- **Built-in features:** sorting, pagination, search, row actions (view/edit/delete)
- **Actions rendered** via `DataTableAction.svelte` with dropdown menu for view/edit/delete

### API Layer

**Current state:** Mixed implementation

- Most admin APIs use **in-memory arrays** with faker.js for mock data (`$lib/api/admin/*.ts`)
- Some admin APIs make real HTTP calls to a backend (e.g., `service.ts` uses `env.BACKEND_HOST`)
- Customer APIs (`$lib/api/shared/api.ts`) call a real backend via `PUBLIC_API_URL`

**When writing new code:** Follow the existing pattern for the feature you're working on. Admin features typically use the in-memory mocks for now.

### Environment Variables

Required environment variables (not present in repo, create `.env` file):

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `BACKEND_HOST` (private) - Backend API host for admin calls
- `PUBLIC_API_URL` (public) - Backend API URL for customer-facing calls

### UI Components

The project uses **shadcn-svelte** components configured in `components.json`:

- Install new components: Use shadcn-svelte CLI (outside the scope of these commands)
- All UI components are in `$lib/components/ui/`
- Base color scheme: `slate` with custom primary color `#2e6057` (teal/green)

### Styling Approach

- **TailwindCSS 4** (using `@tailwindcss/vite` plugin)
- Custom CSS variables in `src/app.css` for theme colors
- Dark mode support via `.dark` class
- Custom sidebar colors defined in CSS variables

## Development Patterns

### When Adding New Admin Features

1. Create feature folder in `src/routes/admin/[Feature]/`
2. Add type definition in `src/lib/types/adminTypes.ts`
3. Add Zod schema in `src/lib/zod/schema.ts`
4. Create API functions in `src/lib/api/admin/[feature].ts`
5. Define table columns in `src/lib/columns/admin/[feature]Columns.ts`
6. Create pages following the standard pattern (list, create, detail, edit)

### When Creating Forms

- Use `sveltekit-superforms` with Zod adapter
- Implement server-side validation in `+page.server.ts`
- Return structured responses: `{ form, success: boolean, message?: string }`
- Handle both create and edit operations in the same form when possible

### Path Aliases

Configured in `svelte.config.js`:

- `$lib/*` - Standard SvelteKit alias for `src/lib/*`
- Additional aliases defined but not consistently used: `ui`, `hooks`, `actions`, `utils`

## Known Issues & Notes

- The `alias` config in `svelte.config.js` has incorrect path (`'@/*': './path/to/lib/*'`) but doesn't affect functionality
- FullCalendar is configured with dedupe settings in vite config (used for scheduling features)
- No testing framework configured - do not attempt to run tests
- Some admin APIs mix faker mocks with real HTTP calls - check implementation before modifying

## Tech Stack Summary

- **Framework:** SvelteKit 5 (Svelte 5 with runes)
- **Language:** TypeScript (strict mode)
- **Styling:** TailwindCSS 4, tw-animate-css
- **UI Components:** shadcn-svelte (bits-ui), Lucide icons
- **Forms:** sveltekit-superforms, formsnap, Zod
- **Tables:** TanStack Table Core
- **Backend Integration:** Supabase client, fetch API
- **Development:** Vite, ESLint, Prettier
- **Mock Data:** @faker-js/faker
