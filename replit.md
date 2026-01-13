# Dropy - Solana Crypto Marketing Platform

## Overview

Dropy is a pay-per-action marketing platform built for the Solana ecosystem. Users connect their Phantom wallet and complete engagement tasks (following Twitter, joining Telegram, visiting websites) to earn project tokens. Advertisers create campaigns with token budgets, and the platform verifies task completion before distributing rewards.

The core business model:
- **Users** earn tokens by completing verified actions for crypto projects
- **Advertisers** get quality engagement by depositing tokens into campaigns
- **Platform token** provides access control and burns on campaign creation (deflationary utility)

No gambling, no USDC/SOL prizes - only fixed rewards for completed actions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React Context for wallet state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions
- **Charts**: Recharts for statistics visualization
- **Build**: Vite with path aliases (@/ for client/src, @shared/ for shared code)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Design**: REST endpoints with Zod validation schemas defined in shared/routes.ts
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Build**: esbuild for production bundling

### Data Models
Four core tables defined in shared/schema.ts:
- **users**: Wallet address, role (user/advertiser), reputation score, balance
- **campaigns**: Token details, budget tracking, social links, creator reference
- **actions**: Task types (twitter/telegram/website), reward amounts, execution limits
- **executions**: User task completions with verification status and payment tracking

### Authentication Flow
- Phantom wallet connection via browser extension (window.solana)
- Wallet address stored in localStorage for session persistence
- User role selected on connect (user vs advertiser)
- Backend creates/retrieves user record on wallet auth

### Key Design Patterns
- Shared types and validation schemas between frontend and backend (shared/ directory)
- Type-safe API routes with Zod schemas for input/output validation
- Storage interface pattern in server/storage.ts for database abstraction
- Component composition with shadcn/ui primitives

## External Dependencies

### Database
- **PostgreSQL**: Primary data store via DATABASE_URL environment variable
- **Drizzle Kit**: Schema migrations with `npm run db:push`

### Blockchain Integration
- **Phantom Wallet**: Browser extension for Solana wallet connection
- **Message Signing**: Proof of wallet ownership for action verification

### UI Component Libraries
- **Radix UI**: Accessible primitive components (dialogs, dropdowns, forms)
- **shadcn/ui**: Pre-styled component system built on Radix
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Development server with HMR
- **Replit plugins**: Dev banner, cartographer, runtime error overlay