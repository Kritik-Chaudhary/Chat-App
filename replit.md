# Real-time Chat Application

## Overview

This is a full-stack real-time chat application built with a modern web technology stack. The application features a React-based frontend with TypeScript, an Express.js backend, and PostgreSQL database integration using Drizzle ORM. The app supports user registration, real-time messaging, online status tracking, and a responsive design with shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

```
├── client/          # React frontend application
├── server/          # Express.js backend API
├── shared/          # Shared TypeScript schemas and types
└── migrations/      # Database migration files
```

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Driver**: Neon Database serverless driver
- **API Pattern**: RESTful endpoints under `/api`
- **Validation**: Zod schemas for request/response validation

## Key Components

### Database Schema
The application uses two main tables:
- **Users**: Stores user information (id, username, online status, avatar color)
- **Messages**: Stores chat messages (id, content, sender info, timestamp)

### API Endpoints
- `POST /api/users` - Create new user
- `GET /api/users/online` - Get list of online users
- `PATCH /api/users/:id/status` - Update user online status
- `POST /api/messages` - Send new message
- `GET /api/messages` - Retrieve messages

### Frontend Pages & Components
- **Chat Page**: Main application interface with message list and input
- **User Sidebar**: Shows online users with avatars
- **Message Components**: Input and display components for chat functionality
- **UI Components**: Comprehensive set of reusable components from shadcn/ui

## Data Flow

1. **User Registration**: Users create accounts with username and avatar color
2. **Authentication**: Simple session-based authentication using localStorage
3. **Real-time Updates**: Polling-based approach for message and user status updates
4. **Message Flow**: Messages are sent via POST API, retrieved via GET with polling
5. **Online Status**: User status is tracked and updated via API calls

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React, React DOM, React Router (wouter)
- **State Management**: TanStack React Query
- **UI Framework**: Radix UI primitives, shadcn/ui components
- **Styling**: Tailwind CSS, class-variance-authority, clsx
- **Forms**: React Hook Form with Zod resolvers
- **Utilities**: date-fns for date formatting

### Backend Dependencies
- **Server**: Express.js with middleware for JSON parsing
- **Database**: Drizzle ORM with PostgreSQL dialect
- **Database Driver**: Neon Database serverless
- **Validation**: Zod for schema validation
- **Session Storage**: connect-pg-simple for PostgreSQL session store

### Development Dependencies
- **Build Tools**: Vite, esbuild for production builds
- **TypeScript**: Full TypeScript support across the stack
- **Database Tools**: Drizzle Kit for migrations and schema management

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with hot reload
- **Database**: In-memory storage (MemStorage) for development
- **Storage**: Automatically switches to PostgreSQL in production when DATABASE_URL is provided

### Production Build
- **Frontend**: Vite build output to `dist/public`
- **Backend**: esbuild bundle to `dist/index.js`
- **Database**: Automatic migrations on startup using Drizzle migrations
- **Storage**: DatabaseStorage implementation using Neon PostgreSQL

### Railway Deployment Configuration
- **railway.yml**: Railway-specific deployment configuration
- **nixpacks.toml**: Build configuration for Nixpacks
- **Procfile**: Fallback process configuration
- **Migration System**: Automatic database schema creation on first deployment
- **Database Integration**: Smart storage switching between development and production

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required for production)
- **NODE_ENV**: Environment setting (development/production)
- **PORT**: Automatically set by Railway deployment platform

### Key Architectural Decisions

1. **Polling vs WebSockets**: Uses polling for simplicity, suitable for moderate traffic
2. **Shared Schema**: TypeScript schemas in `/shared` ensure type safety across frontend/backend
3. **Dual Storage System**: MemStorage for development, DatabaseStorage for production with automatic switching
4. **Component Architecture**: Modular React components with clear separation of concerns
5. **CSS Variables**: Theme system using CSS custom properties for easy customization
6. **Type Safety**: End-to-end TypeScript with Zod validation for runtime safety
7. **Railway Deployment**: Complete Railway deployment configuration with PostgreSQL integration

## Recent Changes

### Fixed Username Reuse Issue (2025-07-17)
- Modified user creation logic to allow username reuse when users are offline
- Simplified authentication system - removed complex login/register flow
- Updated backend to check if username belongs to offline user and reactivate account
- Switched back to in-memory storage (MemStorage) for simpler development
- Removed database dependencies and reverted to original simple architecture
- Fixed duplicate message issues by maintaining proper React Query cache management