# Project Management: Three Lights Barbershop (TLB)

**Project Duration:** July 1, 2025 – December 15, 2025  
**Methodology:** Agile Scrum (2-Week Sprints)  
**Framework:** SvelteKit 5 (Svelte 5 Runes, Snippets)  
**Status:** Completed

---

## 1. Product Backlog (Epics)

### **EPIC-01: Authentication & Authorization**
Secure access for Customers and Admins using Supabase Auth.
- **Features:** Login, Register, Forgot Password, Update Password, Google OAuth, Role-based Access Control (RBAC).

### **EPIC-02: Customer Experience (Storefront)**
The main interface for customers to explore services and book appointments.
- **Features:** Landing Page (Hero, Features), Service Catalogue (Filtering, Search), AI Catalogue Recommendations, Responsive Layout.

### **EPIC-03: Reservation System**
The core business logic for booking appointments.
- **Features:** Reservation Sheet (Multi-step form), Slot Availability Logic, Payment Calculation (Dynamic), Rescheduling, Success/Failure handling.

### **EPIC-04: Customer Profile & Loyalty**
Features to retain customers and manage their data.
- **Features:** Profile Dashboard, Reservation History, Coin/Point System, Voucher Wallet.

### **EPIC-05: Admin Portal (Dashboard & Management)**
Comprehensive back-office for business operations.
- **Features:** Dashboard (Stats), Barber Management, Service Management, Operational Time Settings, Voucher Management.

### **EPIC-06: Admin Operations (Finance & Chat)**
Tools for day-to-day business monitoring and communication.
- **Features:** Finance Reports (Income/Expense), Real-time Chat with Customers, Reservation Oversight.

---

## 2. Sprint Schedule (Retroactive)

### **Sprint 1: UI/UX Foundation & Prototypes**
**Date:** July 1 – July 14, 2025
**Goal:** Establish the visual identity and create high-fidelity static mockups for both Admin and Customer portals.
- **Completed:**
    - [x] **Admin Dashboard Mockup:** Created static base templates using faker data for:
        - Barber Management
        - Catalogue & Service Management
        - Voucher Management
        - Reservation History
    - [x] **Customer Frontend:** Implemented core layout components (Navbar, Footbar) and Homepage.
    - [x] **Catalogue UI:** Developed Customer Catalogue and AI Catalogue interfaces.
    - [x] **UI Redesign:** Executed a comprehensive redesign of all Customer-facing pages to match new aesthetic requirements.

### **Sprint 2: Authentication & Backend Setup**
**Date:** July 15 – July 28, 2025
**Goal:** Initialize the real backend and secure the application.
- **Completed:**
    - [x] Setup Supabase project and Database Schema.
    - [x] Implement Auth API (`src/lib/api/auth.ts`).
    - [x] Connect Login/Register Pages to Supabase Auth.
    - [x] Replace static admin mockups with real data fetching for simple tables.

### **Sprint 3: Service & Catalogue Integration**
**Date:** July 29 – August 11, 2025
**Goal:** Make the catalogue dynamic and manageable.
- **Completed:**
    - [x] Connect Admin Service/Catalogue management to Supabase.
    - [x] Connect Customer Catalogue to live data.
    - [x] Implement `ServiceDetailModal` with real data.
    - [x] Implement Image Upload for Catalogue items.

### **Sprint 4: Operational Logic & Barbers**
**Date:** August 12 – August 25, 2025
**Goal:** Define availability logic.
- **Completed:**
    - [x] Admin: Barber Management (CRUD) with real data.
    - [x] Admin: Operational Time Management.
    - [x] Backend: Availability Logic (Check conflicting slots).

### **Sprint 5: Reservation Core Flow**
**Date:** August 26 – September 8, 2025
**Goal:** Enable real bookings.
- **Completed:**
    - [x] Develop `ReservationSheet.svelte` logic (State machine).
    - [x] Implement Step 1: Service Selection (Dynamic).
    - [x] Implement Step 2: Barber & Time Selection (Dynamic).
    - [x] Backend: Create Reservation Endpoint.

### **Sprint 6: Payments & Vouchers**
**Date:** September 9 – September 22, 2025
**Goal:** Handle financial logic.
- **Completed:**
    - [x] Implement Payment Calculation Logic (Dynamic Pricing).
    - [x] Integrate Voucher Selection in Reservation Sheet.
    - [x] Implement Coin Redemption Logic.
    - [x] Reservation Success Page & Error Handling.

### **Sprint 7: Customer Profile & Retention**
**Date:** September 23 – October 6, 2025
**Goal:** Customer dashboard and history.
- **Completed:**
    - [x] Customer Profile Dashboard (`src/routes/(customer)/profile`).
    - [x] Reservation History List.
    - [x] Reschedule Functionality.
    - [x] Voucher Wallet UI.

### **Sprint 8: Admin Operations & Chat V1**
**Date:** October 7 – October 20, 2025
**Goal:** Management tools.
- **Completed:**
    - [x] Admin: Reservation Management (View, Approve, Cancel).
    - [x] Database: Chat Schema.
    - [x] Basic Chat UI (Customer side).

### **Sprint 9: Finance & AI Features**
**Date:** October 21 – November 3, 2025
**Goal:** Advanced features.
- **Completed:**
    - [x] Admin: Finance Dashboard (Charts).
    - [x] Customer: AI Catalogue Page (Logic integration).
    - [x] Implement AI Recommendation Logic.

### **Sprint 10: Real-time Chat & Polish**
**Date:** November 4 – November 17, 2025
**Goal:** Real-time capabilities.
- **Completed:**
    - [x] Admin: Chat Interface (Real-time).
    - [x] Supabase Realtime integration.
    - [x] UI Polish: Micro-interactions.

### **Sprint 11: Mobile Responsiveness & Optimization**
**Date:** November 18 – December 1, 2025
**Goal:** Mobile first.
- **Completed:**
    - [x] Mobile Viewport Adjustments.
    - [x] Image Optimization (WebP).
    - [x] Performance Tuning.

### **Sprint 12: Final Testing & Launch**
**Date:** December 2 – December 15, 2025
**Goal:** Stability.
- **Completed:**
    - [x] End-to-End Testing.
    - [x] Bug Fixes.
    - [x] Final Deployment.

---

## 3. User Stories

### **Authentication**
- **US-01:** As a **Customer**, I want to **register with my email**, so that I can book appointments and track my history.
- **US-02:** As an **Admin**, I want to **login securely**, so that I can access the management dashboard.

### **Catalogue & Booking**
- **US-03:** As a **Customer**, I want to **filter services by category (Short, Medium, Long)**, so that I can find the right haircut for me.
- **US-04:** As a **Customer**, I want to **see available slots for a specific barber**, so that I can book with my preferred stylist.
- **US-05:** As a **Customer**, I want to **apply a voucher during booking**, so that I can get a discount.
- **US-06:** As a **Customer**, I want to **receive a confirmation after booking**, so that I know my appointment is secured.

### **Admin Management**
- **US-07:** As an **Admin**, I want to **view a dashboard of daily income**, so that I can track business performance.
- **US-08:** As an **Admin**, I want to **block out operational times**, so that customers cannot book during holidays or breaks.
- **US-09:** As an **Admin**, I want to **chat with a customer**, so that I can answer their specific queries.

---

## 4. Technical Debt & Refactoring

These tasks were identified and addressed during the development lifecycle to ensure code quality and maintainability.

### **Svelte 5 Migration & Best Practices**
- **TASK-01:** **Enforce Runes Syntax:** Ensure all new components use `$state`, `$derived`, and `$effect` instead of legacy stores or `let` exports.
- **TASK-02:** **Snippet Implementation:** Refactor reusable UI parts (like Pagination) to use Svelte 5 `{#snippet}` for better performance and readability.

### **Performance & Optimization**
- **TASK-03:** **Image Optimization:** Implement a pipeline to serve all catalogue images as WebP.
- **TASK-04:** **Code Splitting:** Ensure heavy components (like Charts) are lazy-loaded.

### **Code Quality**
- **TASK-05:** **Zod Validation:** Standardize all form submissions (Login, Reservation) to use Zod schemas for strict type safety.
- **TASK-06:** **Type Safety:** Refactor `any` types in API responses to proper TypeScript interfaces (e.g., `Catalogue`, `Reservation`).