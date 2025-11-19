# Three Lights Barbershop - Project Architecture

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Detailed Architecture](#detailed-architecture)
- [Design Patterns](#design-patterns)
- [Data Flow](#data-flow)
- [UI Component System](#ui-component-system)

---

## Overview

**Three Lights Barbershop** is a comprehensive barbershop management system built as a thesis project. The application serves two primary user groups:

1. **Administrators** - Complete CRUD operations for managing barbershop resources (barbers, services, catalogues, reservations, vouchers, operational times)
2. **Customers** - Public-facing interface for viewing services, schedules, and making reservations

### Key Characteristics

- **Architecture:** Client-side rendered SPA (SSR disabled)
- **Framework:** SvelteKit 5 with Svelte 5 (runes-based reactivity)
- **Language:** TypeScript (strict mode)
- **Routing:** File-based routing with feature modules

---

## Tech Stack

### Core Framework

- **SvelteKit 5** - Full-stack meta-framework
- **Svelte 5** - Component framework with runes ($state, $props, $derived)
- **TypeScript 5** - Type safety with strict mode enabled
- **Vite 6** - Build tool and dev server

### Styling & UI

- **TailwindCSS 4** - Utility-first CSS framework
- **shadcn-svelte** - Component library built on bits-ui
- **Lucide Svelte** - Icon library
- **tw-animate-css** - Animation utilities
- **mode-watcher** - Dark mode support

### Forms & Validation

- **sveltekit-superforms 2** - Type-safe form library
- **Zod 3** - Schema validation
- **formsnap** - Form accessibility utilities

### Data & State

- **@tanstack/table-core** - Headless table logic
- **Supabase JS** - Backend as a Service client
- **@faker-js/faker** - Mock data generation (development)

### Calendar & Scheduling

- **svelte-fullcalendar** - Calendar component
- **@internationalized/date** - Date/time utilities

### Quality Tools

- **ESLint 9** - JavaScript linter
- **Prettier 3** - Code formatter
- **svelte-check** - Svelte type checking
- **typescript-eslint** - TypeScript ESLint integration

---

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
│   │   │
│   │   ├── columns/               # Table column definitions
│   │   │   └── admin/
│   │   │       ├── barberColumns.ts
│   │   │       ├── catalogueColumns.ts
│   │   │       ├── reservationColumns.ts
│   │   │       ├── serviceColumns.ts
│   │   │       └── voucherColumns.ts
│   │   │
│   │   ├── components/            # Reusable components
│   │   │   ├── Admin/            # Admin-specific components
│   │   │   │   ├── AdminSidebar.svelte
│   │   │   │   ├── AdminForm/    # CRUD forms
│   │   │   │   │   ├── BarberForm.svelte
│   │   │   │   │   ├── CatalogueForm.svelte
│   │   │   │   │   ├── OperationalTimeForm.svelte
│   │   │   │   │   ├── ServiceForm.svelte
│   │   │   │   │   └── VoucherForm.svelte
│   │   │   │   ├── AdminHeader/
│   │   │   │   │   └── AdminHeader.svelte
│   │   │   │   ├── Statistics/
│   │   │   │   │   └── StatsCard.svelte
│   │   │   │   └── Table/        # Data table components
│   │   │   │       ├── DataTable.svelte
│   │   │   │       ├── DataTableAction.svelte
│   │   │   │       ├── DataTableActionReservation.svelte
│   │   │   │       └── SortableHeaderButton.svelte
│   │   │   │
│   │   │   ├── Global/           # Shared across admin/user
│   │   │   │   └── Button/
│   │   │   │       ├── CancelButton.svelte
│   │   │   │       ├── DeleteButton.svelte
│   │   │   │       ├── EditButton.svelte
│   │   │   │       └── SaveButton.svelte
│   │   │   │
│   │   │   ├── User/             # Customer-facing components
│   │   │   │   ├── CustomerNavbar.svelte
│   │   │   │   └── Home/
│   │   │   │       ├── ScheduleCard.svelte
│   │   │   │       └── ServiceItem.svelte
│   │   │   │
│   │   │   └── ui/               # shadcn-svelte components (30+ components)
│   │   │       ├── accordion/
│   │   │       ├── alert-dialog/
│   │   │       ├── button/
│   │   │       ├── calendar/
│   │   │       ├── card/
│   │   │       ├── data-table/
│   │   │       ├── dropdown-menu/
│   │   │       ├── form/
│   │   │       ├── input/
│   │   │       ├── select/
│   │   │       ├── sidebar/
│   │   │       ├── table/
│   │   │       └── ... (25+ more)
│   │   │
│   │   ├── hooks/                 # Svelte runes-based hooks
│   │   │   └── is-mobile.svelte.ts
│   │   │
│   │   ├── supabase/             # Supabase client
│   │   │   └── client.ts
│   │   │
│   │   ├── types/                # TypeScript definitions
│   │   │   └── adminTypes.ts
│   │   │
│   │   ├── utils/                # Utility functions
│   │   │   ├── table.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── zod/                  # Validation schemas
│   │   │   └── schema.ts
│   │   │
│   │   ├── assets/               # Static assets
│   │   │   └── favicon.svg
│   │   │
│   │   ├── index.ts              # Library exports
│   │   └── utils.ts
│   │
│   ├── routes/                    # SvelteKit routes
│   │   ├── +layout.svelte        # Root layout
│   │   ├── +layout.ts            # SSR = false
│   │   │
│   │   ├── (home)/               # Customer route group
│   │   │   ├── +layout.svelte
│   │   │   ├── +page.svelte
│   │   │   └── +page.ts
│   │   │
│   │   └── admin/                # Admin route group
│   │       ├── +layout.svelte    # Admin layout with sidebar
│   │       ├── +page.svelte      # Admin dashboard
│   │       │
│   │       ├── Barber/           # Barber management
│   │       │   ├── +layout.svelte
│   │       │   ├── +page.svelte  # List view
│   │       │   ├── Create/
│   │       │   │   ├── +page.server.ts
│   │       │   │   └── +page.svelte
│   │       │   └── [id]/
│   │       │       ├── +page.svelte      # Detail view
│   │       │       └── Edit/
│   │       │           ├── +page.server.ts
│   │       │           └── +page.svelte
│   │       │
│   │       ├── Catalogue/        # Hair style catalogue
│   │       │   ├── +layout.svelte
│   │       │   ├── +page.svelte
│   │       │   ├── Create/
│   │       │   │   ├── +page.server.ts
│   │       │   │   └── +page.svelte
│   │       │   └── [id]/
│   │       │       ├── +page.svelte
│   │       │       └── Edit/
│   │       │           ├── +page.server.ts
│   │       │           └── +page.svelte
│   │       │
│   │       ├── Service/          # Service management
│   │       │   ├── +layout.svelte
│   │       │   ├── +page.svelte
│   │       │   ├── Create/
│   │       │   │   ├── +page.server.ts
│   │       │   │   └── +page.svelte
│   │       │   └── [id]/
│   │       │       ├── +page.svelte
│   │       │       └── Edit/
│   │       │           ├── +page.server.ts
│   │       │           └── +page.svelte
│   │       │
│   │       ├── Voucher/          # Voucher/promotion management
│   │       │   ├── +layout.svelte
│   │       │   ├── +page.svelte
│   │       │   ├── Create/
│   │       │   │   ├── +page.server.ts
│   │       │   │   └── +page.svelte
│   │       │   └── [id]/
│   │       │       ├── +page.svelte
│   │       │       └── Edit/
│   │       │           ├── +page.server.ts
│   │       │           └── +page.svelte
│   │       │
│   │       ├── Reservation/      # Reservation management
│   │       │   ├── +layout.svelte
│   │       │   └── +page.svelte
│   │       │
│   │       └── OperationalTime/  # Schedule management
│   │           ├── +layout.svelte
│   │           ├── +page.svelte
│   │           └── Create/
│   │               ├── +page.server.ts
│   │               └── +page.svelte
│   │
│   ├── app.css                   # Global styles + Tailwind
│   ├── app.d.ts                  # App type definitions
│   └── app.html                  # HTML template
│
├── static/                       # Static assets (served as-is)
│
├── .gitignore
├── .npmrc                        # engine-strict=true
├── .prettierignore
├── .prettierrc
├── components.json               # shadcn-svelte config
├── eslint.config.js              # ESLint 9 flat config
├── package.json
├── package-lock.json
├── README.md
├── svelte.config.js              # SvelteKit config
├── tsconfig.json                 # TypeScript config
└── vite.config.ts                # Vite config
```

---

## Detailed Architecture

### 1. Routing Architecture

#### Route Groups

SvelteKit uses **route groups** to organize routes without affecting URLs:

**Customer Routes** - `(home)` group

```
src/routes/(home)/
├── +layout.svelte     # Customer layout with navbar
├── +page.svelte       # Homepage
└── +page.ts           # Load function (client-side)
```

**Admin Routes** - `admin/` prefix

```
src/routes/admin/
├── +layout.svelte     # Admin layout with collapsible sidebar + header
└── +page.svelte       # Admin dashboard
```

#### Feature Module Pattern

Each admin feature follows a consistent structure:

```
[Feature]/
├── +layout.svelte                 # Feature-specific layout
├── +page.svelte                   # List view (DataTable)
├── Create/
│   ├── +page.server.ts           # Server actions for form submission
│   └── +page.svelte              # Create form
├── [id]/
│   └── +page.svelte              # Detail/view page
└── [id]/Edit/
    ├── +page.server.ts           # Server actions for form submission
    └── +page.svelte              # Edit form
```

### 2. Component Architecture

#### Admin Components

**AdminSidebar** (`src/lib/components/Admin/AdminSidebar.svelte`)

- Collapsible navigation sidebar
- Navigation items for all admin features
- Responsive mobile/desktop behavior
- Uses shadcn-svelte sidebar primitives

**DataTable** (`src/lib/components/Admin/Table/DataTable.svelte`)

- Reusable table component for all list views
- Features:
  - Sorting (via TanStack Table)
  - Pagination
  - Search/filtering
  - Row actions (view/edit/delete)
  - "Add New" button
- Props:
  - `tableData` - Array of data objects
  - `tableColumns` - Column definitions
  - `entityName` - Used for routing
  - `searchConfig` - Search configuration
  - `enableAddNew` - Show/hide add button

**DataTableAction** (`src/lib/components/Admin/Table/DataTableAction.svelte`)

- Dropdown menu for row actions
- Configurable actions: view, edit, delete
- Alert dialog integration for delete confirmation

**Forms** (`src/lib/components/Admin/AdminForm/`)

- One form component per entity type
- Uses sveltekit-superforms + Zod validation
- Form primitives from shadcn-svelte
- Reusable between Create and Edit pages

#### UI Components (shadcn-svelte)

30+ pre-built components in `src/lib/components/ui/`:

- **Forms:** input, textarea, select, checkbox, radio-group, calendar
- **Feedback:** alert-dialog, toast (sonner), skeleton, progress
- **Layout:** card, sheet, sidebar, separator, accordion
- **Navigation:** dropdown-menu, pagination, tooltip
- **Data:** table, data-table helpers
- **Custom:** chip, file-drop-zone

### 3. Data Layer

#### API Architecture

**Admin API** (`src/lib/api/admin/`)

- Currently uses **in-memory arrays** with faker.js
- Pattern for each entity:
  ```typescript
  export const get[Entity] = () => { /* return array */ }
  export const get[Entity]ById = (id) => { /* find by id */ }
  export const create[Entity] = (data) => { /* push to array */ }
  export const edit[Entity] = (data) => { /* update in array */ }
  ```
- Some entities (e.g., Service) have real HTTP calls to backend
- Uses `env.BACKEND_HOST` for server-side API calls

**Shared API** (`src/lib/api/shared/api.ts`)

- Customer-facing API calls
- Fetches from backend REST API
- Uses `PUBLIC_API_URL` environment variable
- Example endpoints:
  - `GET /shared/view-service` - List services
  - `GET /shared/view-schedule` - Operational hours

#### Supabase Client

- Configured in `src/lib/supabase/client.ts`
- Creates client with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Session persistence enabled in browser
- Currently not actively used in most features (prepared for future)

### 4. Type System

#### Admin Types (`src/lib/types/adminTypes.ts`)

```typescript
export type Barber = {
	id: string;
	name: string;
	phoneNumber: string;
	description?: string;
	skills?: string;
	experience?: string;
};

export type Service = {
	id: string;
	serviceName: string;
	price: number;
	description: string;
	attainableCoin?: number;
};

export type Reservation = {
	id: string;
	customer: string;
	invoice: string;
	dateTime: string;
	status: 'waiting-approve' | 'on-going' | 'completed' | 'canceled-by-user' | 'canceled-by-admin';
	amount: number;
};

export type Voucher = {
	id: string;
	title: string;
	startDate: { date: string; time: string };
	expiredDate: { date: string; time: string };
	description: string;
	service: string;
	value: number;
};

export type Catalogue = {
	id: string;
	name: string;
	type: 'Long' | 'Short' | 'Medium';
	description: string;
	image: string;
};

export type OperationalTime = {
	id: string;
	dateTime: { date: string; time: string[] };
};
```

### 5. Validation Layer

#### Zod Schemas (`src/lib/zod/schema.ts`)

- One schema per entity type
- Used with sveltekit-superforms for type-safe validation
- Example pattern:
  ```typescript
  export const barberSchema = z.object({
  	id: z.string().regex(/^\d+$/),
  	name: z.string().trim().min(1).max(50),
  	phoneNumber: z
  		.string()
  		.trim()
  		.refine((val) => /^\d+$/.test(val))
  		.refine((val) => val.length >= 10)
  		.refine((val) => val.length <= 14),
  	description: z.string().trim().max(255).optional(),
  	skills: z.string().trim().max(255).optional(),
  	experience: z.string().trim().max(255).optional()
  });
  ```
- Exported schema types for TypeScript inference

### 6. Table Column Definitions

#### Column Pattern (`src/lib/columns/admin/*.ts`)

Uses TanStack Table Core with Svelte-specific rendering:

```typescript
import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';

export const barberColumns: ColumnDef<Barber>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => renderComponent(SortableHeaderButton, {
      label: 'Name',
      onclick: column.getToggleSortingHandler()
    }),
    cell: ({ row }) => {
      // Custom cell rendering with snippets
    }
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => renderComponent(DataTableAction, {
      data: row.original,
      href: [...],
      alertDialog: [...]
    })
  }
];
```

---

## Design Patterns

### 1. Form Handling Pattern

**Server-Side Form Actions**

```typescript
// +page.server.ts
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';

export const load = async () => {
	return {
		form: await superValidate(zod(barberSchema))
	};
};

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		// Process form data
		const success = createEntity(form.data);

		if (!success) {
			return fail(500, {
				form,
				message: 'Failed to save',
				success: false
			});
		}

		return {
			form,
			success: true,
			message: 'Saved successfully!'
		};
	}
};
```

**Client-Side Form Usage**

```svelte
<script lang="ts">
	import { superForm } from 'sveltekit-superforms';

	let { data } = $props();
	const form = superForm(data.form);
	const { form: formData, enhance, message } = form;
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Input {...attrs} bind:value={$formData.name} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Button type="submit">Save</Button>
</form>
```

### 2. Data Table Pattern

**Column Definition**

```typescript
// src/lib/columns/admin/barberColumns.ts
export const barberColumns: ColumnDef<Barber>[] = [
	{ accessorKey: 'name', header: 'Name' },
	{ accessorKey: 'phoneNumber', header: 'Phone' },
	{ id: 'actions', cell: renderActions }
];
```

**Page Usage**

```svelte
<script lang="ts">
	import { getBarber } from '$lib/api/admin/barber';
	import DataTable from '$lib/components/Admin/Table/DataTable.svelte';
	import { barberColumns } from '$lib/columns/admin/barberColumns';

	let response = getBarber();
</script>

<DataTable
	tableData={response.barbers}
	tableColumns={barberColumns}
	entityName="barber"
	searchConfig={{
		enabled: true,
		column: 'name',
		placeholder: 'Search barbers...'
	}}
	enableAddNew={true}
/>
```

### 3. Component Composition Pattern

Uses Svelte 5 **snippets** for flexible composition:

```svelte
<!-- Parent component with snippet slots -->
<script lang="ts">
	let { children } = $props();
</script>

<div class="layout">
	{@render children?.()}
</div>

<!-- Usage -->
<Layout>
	<Header />
	<Content />
</Layout>
```

### 4. State Management Pattern

Uses Svelte 5 **runes** for reactive state:

```typescript
// Component-level state
let count = $state(0);
let doubled = $derived(count * 2);

// Props
let { title, items = [] } = $props();

// Effects
$effect(() => {
	console.log('Count changed:', count);
});
```

---

## Data Flow

### Admin Feature Data Flow

```
User Action (Create/Edit Form)
    ↓
+page.svelte (Form Component)
    ↓
Form submission via SvelteKit form action
    ↓
+page.server.ts (Server Action)
    ↓
superValidate() validates with Zod schema
    ↓
API function (src/lib/api/admin/*.ts)
    ↓
In-memory array update / HTTP request
    ↓
Return success/error response
    ↓
Form component receives result
    ↓
Show success message / error messages
    ↓
Redirect to list page (on success)
```

### Data Table Flow

```
+page.svelte (List View)
    ↓
Call API function to get data
    ↓
Pass data + columns to DataTable
    ↓
DataTable creates TanStack Table instance
    ↓
Renders table with sorting/pagination/search
    ↓
User clicks action (View/Edit/Delete)
    ↓
Navigate to detail/edit page OR show delete dialog
```

### Customer Flow

```
(home)/+page.svelte
    ↓
Fetch services/schedule from shared API
    ↓
HTTP GET to backend (PUBLIC_API_URL)
    ↓
Render ServiceItem / ScheduleCard components
    ↓
Display to customer
```

---

## UI Component System

### Styling Strategy

**TailwindCSS 4 with CSS Variables**

- Base styles in `src/app.css`
- Custom theme colors via CSS variables
- Dark mode support with `.dark` class
- Example variables:
  ```css
  :root {
  	--primary: #2e6057; /* Brand teal/green */
  	--radius: 0.625rem; /* Border radius */
  	--sidebar: #ffffff; /* Sidebar background */
  }
  ```

### Component Import Pattern

```typescript
// Individual imports
import Button from '$lib/components/ui/button/button.svelte';

// Namespace imports
import * as Form from '$lib/components/ui/form';
import * as Select from '$lib/components/ui/select';
```

### Responsive Design

- Mobile-first approach with Tailwind breakpoints
- Collapsible sidebar on mobile (AdminSidebar)
- Responsive tables (DataTable)
- Mobile hook: `src/lib/hooks/is-mobile.svelte.ts`

---

## Environment Configuration

### Required Variables

Create `.env` file in project root:

```env
# Supabase (client-side)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend API (server-side)
BACKEND_HOST=http://localhost:8000

# Backend API (client-side)
PUBLIC_API_URL=http://localhost:8000
```

### Variable Usage

- `VITE_*` - Available in client-side code
- `PUBLIC_*` - Available in client-side code
- No prefix - Server-side only

---

## Build & Deployment

### Development

```bash
npm run dev              # Start Vite dev server
```

### Production Build

```bash
npm run build            # Build for production
npm run preview          # Preview production build
```

### Build Output

- Uses `@sveltejs/adapter-auto`
- Detects deployment platform automatically
- Outputs to `.svelte-kit/` and `build/`

---

## Future Considerations

### Potential Improvements

1. **Real Backend Integration** - Replace faker mocks with actual API calls
2. **Authentication** - Implement Supabase auth for admin/customer login
3. **Testing** - Add Vitest + Testing Library for unit/integration tests
4. **Error Handling** - Centralized error boundary and toast notifications
5. **State Management** - Consider Svelte stores for cross-component state
6. **API Layer** - Create unified API client with error handling/retry logic
7. **Performance** - Add lazy loading for admin modules
8. **Accessibility** - Comprehensive ARIA attributes and keyboard navigation

---

**Last Updated:** November 10, 2025
**Version:** 0.0.1
