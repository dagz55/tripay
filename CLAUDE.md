# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm run dev          # Start Next.js development server on port 3000

# Build and production
npm run build        # Build application for production
npm start           # Start production server
npm run lint        # Run ESLint for code quality

# Testing
npm test            # Run Jest tests
npm run test:watch  # Run tests in watch mode
```

## Project Architecture

**Tripay** is a Next.js 14 App Router application for accounts payable management using Supabase as the backend.

### Core Architecture
- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL database, Auth, Real-time subscriptions)  
- **Styling**: Tailwind CSS with custom UI components
- **Authentication**: Supabase Auth with email/password and Row Level Security (RLS)

### Key Database Tables
- `Tripay`: Main payables table with user-scoped access via RLS
- `profiles`: User profile data linked to Supabase auth

### Real-time Features
The application uses Supabase real-time subscriptions for live updates across all users. Real-time channels are established in `components/TripayDemo.tsx:38-46` for the `Tripay` table.

### Authentication Flow
1. Users sign up/login via Supabase Auth (`components/AuthForm.tsx`)
2. Auth callback handled at `app/auth/callback/route.ts`  
3. Dashboard requires authentication (`app/dashboard/page.tsx`)
4. User data automatically synced to `profiles` table via database triggers

### Component Structure
- `TripayDemo.tsx`: Main dashboard with payables management, inline editing, real-time sync
- `AuthForm.tsx`: Unified login/signup component with email verification
- `ui/`: Reusable components (Button, Input, Card) following a design system pattern

### Data Management
- Type-safe database schema defined in `lib/supabase.ts`
- Utility functions for formatting currency, dates, and status colors in `lib/utils.ts`
- All database operations use Supabase client with automatic RLS filtering

### Environment Setup
Required environment variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

### Security
- Row Level Security (RLS) policies ensure users only access their own data
- Environment variables kept out of version control
- Supabase handles authentication tokens and session management

## Development Workflow

1. Always run `npm run dev` to test changes locally
2. Run `npm run lint` before committing to ensure code quality  
3. Test authentication flow and real-time features when making changes
4. Verify database changes work with RLS policies
5. Upload changes to GitHub repo after validation