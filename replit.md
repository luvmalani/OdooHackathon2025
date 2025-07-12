# Skill Swap Platform

## Overview

This is a full-stack skill exchange platform built with modern web technologies. The application allows users to discover each other's skills, request skill swaps, and manage their learning/teaching preferences. It features real-time communication, user authentication via Replit Auth, and a comprehensive admin panel.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket integration for live updates
- **Authentication**: Replit Auth with session management

### Database Design
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple

## Key Components

### Authentication System
- Replit OAuth integration for seamless user authentication
- Session-based authentication with PostgreSQL session storage
- Automatic session refresh and user state management
- Protected routes and middleware for authenticated endpoints

### User Management
- User profiles with customizable information (bio, location, skills)
- Skill categorization system (Programming, Design, Marketing, Languages, Music, Business)
- User search and discovery with filtering capabilities
- Rating and review system for skill exchanges

### Skill Exchange System
- Skill offering and requesting functionality
- Swap request management with status tracking (pending, accepted, rejected, completed)
- Real-time notifications for swap updates
- Messaging system for coordination between users

### Admin Panel
- User management and moderation tools
- System analytics and statistics
- Skill approval and categorization management
- Platform monitoring capabilities

### Real-time Features
- WebSocket connection management for live updates
- Real-time swap request notifications
- Live user activity indicators
- Automatic reconnection with exponential backoff

## Data Flow

### User Registration and Profile Setup
1. User authenticates via Replit OAuth
2. Profile information is collected and stored
3. Skills are added to user's offered/wanted lists
4. User becomes discoverable in the platform

### Skill Discovery and Matching
1. Users search for skills or browse user profiles
2. Advanced filtering by category, location, and proficiency level
3. Skill matching algorithm suggests compatible users
4. Users can view detailed profiles and skill descriptions

### Swap Request Process
1. User initiates swap request specifying offered and desired skills
2. Target user receives real-time notification
3. Request can be accepted, rejected, or require negotiation
4. Upon acceptance, users coordinate via messaging
5. Completion is tracked and rated by both parties

### Admin Operations
1. Admins monitor platform activity and user behavior
2. Skill approval workflow for new skill categories
3. User moderation tools for platform safety
4. Analytics dashboard for platform insights

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **react-hook-form**: Form handling and validation
- **zod**: Runtime type checking and validation

### Authentication
- **openid-client**: OpenID Connect authentication
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### UI and Styling
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library
- **date-fns**: Date manipulation utilities

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type checking and development
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- Vite development server with HMR (Hot Module Replacement)
- Express server running with tsx for TypeScript execution
- Real-time database schema synchronization with Drizzle
- WebSocket development support with automatic reconnection

### Production Build
- Vite builds optimized React application to `dist/public`
- esbuild bundles Express server to `dist/index.js`
- Static file serving from built React application
- Database migrations applied via Drizzle Kit

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption key (required)
- **REPLIT_DOMAINS**: Allowed domains for Replit Auth
- **ISSUER_URL**: OAuth issuer URL (defaults to Replit)
- **NODE_ENV**: Environment mode (development/production)

### Scaling Considerations
- Neon serverless PostgreSQL for automatic scaling
- WebSocket connection pooling for real-time features
- Session store optimization for high concurrency
- CDN integration for static asset delivery