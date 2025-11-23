# Project Analysis Report

## 1. Overview
The project `front-end-tlb` is a web application built with **SvelteKit** and **TypeScript**, utilizing **Supabase** for backend services (authentication, database). The UI is styled with **Tailwind CSS v4** and utilizes modern component libraries. The project has recently incorporated 3D and animation capabilities.

## 2. Tech Stack

### Frontend Core
- **Framework**: [SvelteKit](https://kit.svelte.dev/) (v2.16.0)
- **UI Library**: [Svelte 5](https://svelte.dev/) (v5.0.0)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (v5.0.0)

### Styling & UI Components
- **CSS Framework**: [Tailwind CSS](https://tailwindcss.com/) (v4.1.17)
- **Component Primitives**: [bits-ui](https://www.bits-ui.com/)
- **Icons**: [lucide-svelte](https://lucide.dev/icons/)
- **Toasts**: `svelte-sonner`
- **Animations**: `tw-animate-css`
- **Carousel**: `embla-carousel-svelte`
- **Charts**: `layerchart`

### 3D & Advanced Animation (New)
- **3D Library**: `three`, `@threlte/core`, `@threlte/extras`
- **Motion Graphics**: `@theatre/core`, `@theatre/studio`, `@threlte/theatre`

### State Management & Data
- **Form Management**: `sveltekit-superforms` (v2.27.1)
- **Validation**: `zod` (v3.25.76)
- **Backend Client**: `@supabase/supabase-js` (v2.76.1)
- **File Upload**: `svelte-file-dropzone`

### Tooling
- **Build Tool**: Vite
- **Linting/Formatting**: ESLint, Prettier

## 3. Architecture & Infrastructure

### Architecture
The application follows a standard SvelteKit architecture:
- **`src/routes`**: File-based routing.
    - `(home)`: Public facing pages.
        - `camera`: Likely for AR/3D features (uses Threlte/Three.js).
        - `catalogue`: Product/Service catalogue.
        - `profile`: User profile management.
    - `admin`: Admin dashboard/features.
    - `auth`: Authentication pages (login, register).
    - `reservation`: Reservation flow.
- **`src/lib`**: Shared code and components.
    - `components`: Reusable UI components.
    - `supabase`: Supabase client initialization.
    - `api`: API wrapper functions.
    - `stores`: Svelte stores for global state.

### Infrastructure
- **Backend**: **Supabase** (Backend-as-a-Service).
    - Handles Authentication (Email/Password).
    - Likely handles Database (PostgreSQL) and Realtime subscriptions.
- **Hosting**: Likely **Vercel** (suggested by `.vercel` in `.gitignore` and `adapter-auto`).

## 4. API Documentation Analysis

The project interacts with a backend (likely Supabase Edge Functions or a separate API server).

### Standard Response Format
All API responses follow a consistent JSON structure:
```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "timestamp": string, // ISO-8601
  "status": number // HTTP Status Code
}
```

### Key Endpoints
- **Auth**:
    - `POST /auth/register`: Register new user.
    - `POST /auth/login`: Login user.
    - `POST /auth/logout`: Logout user.
- **Customer**:
    - `GET /customer/view-profile`: Get user profile.
    - `PUT /customer/update-profile`: Update user profile.
    - `POST /customer/create-reservation`: Create a new reservation.

## 5. Key Configuration
- **Supabase Client**: Initialized in `src/lib/supabase/client.ts` using `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`.
- **Tailwind**: Configured with `@tailwindcss/vite` plugin (v4).
- **Path Aliases**:
    - `@/*` -> `./src/lib/*` (Standard SvelteKit alias)
    - `ui` -> `$lib/components/ui`
    - `utils` -> `$lib/utils`
