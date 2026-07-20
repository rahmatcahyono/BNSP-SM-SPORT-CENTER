# System Architecture & Design
## SM Sport Center Reservation System

This document outlines the architectural decisions, technical stack, folder structure, and database strategy as designed by the Software Architect.

### 1. Technology Stack
*   **Framework**: Next.js 15 (App Router) - Leveraging Server Components and Server Actions.
*   **Language**: TypeScript - For end-to-end type safety.
*   **Styling**: TailwindCSS & Shadcn UI - For rapid, accessible, and highly customizable UI development.
*   **Database**: Neon PostgreSQL - Serverless Postgres, ideal for Vercel edge deployments.
*   **ORM**: Prisma - Type-safe database access and schema migrations.
*   **Authentication**: Auth.js (NextAuth) - Secure session management and Role-Based Access Control (RBAC).
*   **Validation**: Zod & React Hook Form - For robust client and server-side input validation.
*   **Hosting/Deployment**: Vercel.

### 2. Clean Architecture in Next.js
To ensure maintainability and separation of concerns (SOLID principles), we adapt Clean Architecture to the Next.js App Router paradigm:

1.  **Presentation Layer (`app/`, `components/`)**: Handles UI, routing, and React state. It calls Server Actions or API routes. It should contain *zero* raw database queries.
2.  **Application Layer (`actions/`)**: Server Actions act as Controllers/Interactors. They validate input (via Zod), check permissions, and orchestrate calls to Services.
3.  **Domain/Service Layer (`services/`)**: Contains the core business logic (e.g., calculating prices, orchestrating the double-booking check logic).
4.  **Data Access Layer (`repositories/`)**: Abstracted database access. Prisma client calls are encapsulated here.

### 3. Target Folder Structure
This structure ensures the codebase is modular, reusable, and enterprise-ready.

```text
sm-sport-center/
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── (auth)/           # Route group for login/register
│   ├── dashboard/        # Admin & Customer dashboards
│   ├── reservation/      # Booking process pages
│   ├── api/              # Route handlers for external access/webhooks
│   └── layout.tsx        # Root layout (Providers, Fonts)
├── components/           # Reusable UI components
│   ├── ui/               # Shadcn UI primitives
│   ├── dashboard/        # Complex dashboard components
│   ├── forms/            # Form components (React Hook Form)
│   └── common/           # Navbars, Footers, Modals
├── actions/              # Next.js Server Actions (Controllers)
├── services/             # Business Logic (e.g., ReservationService)
├── repositories/         # Data Access Layer (Prisma queries)
├── lib/                  # Utility configurations (Prisma client, Auth config)
├── hooks/                # Custom React Hooks
├── prisma/               # Database Schema
│   ├── schema.prisma     # Prisma models
│   └── seed.ts           # Initial database seed
├── types/                # Global TypeScript definitions
├── utils/                # Helper functions (date formatting, currency)
├── constants/            # Hardcoded values (Roles, Status Enums)
└── middleware.ts         # Edge middleware for route protection
```

### 4. Database Strategy
*   **Database Engine**: Neon Serverless PostgreSQL.
*   **Connection Management**: Because Next.js Server Actions execute statelessly, direct database connections can quickly exceed PostgreSQL's limits. We will use Neon's built-in PgBouncer/Connection Pooling to manage connections efficiently.
*   **Integrity**: Strict foreign key constraints and ENUM types at the database level to ensure data integrity even if the application layer fails.
*   **Security**: Credentials stored in `.env`, using `DATABASE_URL` for migrations and `DIRECT_URL` for direct connection pooling depending on the Prisma setup.
