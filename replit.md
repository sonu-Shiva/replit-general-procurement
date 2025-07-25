# SCLEN Procurement Platform

## Overview

This is a modern, full-stack procurement management platform built with React and Express.js. The application provides comprehensive tools for managing vendors, products, RFx processes, auctions, and purchase orders with AI-powered features and real-time capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with session-based authentication
- **Real-time**: WebSocket support for live auction features
- **Middleware**: Express middleware for logging, error handling, and authentication

### Authentication System
- **Provider**: Replit OpenID Connect (OIDC) authentication
- **Session Management**: Express sessions with PostgreSQL store
- **Strategy**: Passport.js with OpenID Connect strategy
- **Authorization**: Role-based access control (buyer_admin, buyer_user, sourcing_manager, vendor)

## Key Components

### Database Layer
- **ORM**: Drizzle ORM with TypeScript-first approach
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Comprehensive procurement domain model including:
  - User management and organizations
  - Vendor lifecycle management
  - Product catalog and BOM (Bill of Materials)
  - RFx (Request for Quote/Proposal/Information) processes
  - Auction system with bidding
  - Purchase order management
  - Approval workflows and notifications

### Core Modules
1. **Dashboard**: Executive overview with key metrics and AI chat
2. **Vendor Management**: Complete vendor lifecycle from discovery to management
3. **Product Catalog**: Centralized product information management
4. **BOM Management**: Bill of Materials creation and management
5. **RFx Management**: Request for Quote/Proposal/Information workflows
6. **Auction Center**: Real-time bidding system with WebSocket integration
7. **Purchase Orders**: Order creation, tracking, and fulfillment
8. **Analytics**: Comprehensive reporting and insights

### UI/UX Features
- **Design System**: Consistent component library based on Radix UI
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: System-wide theme switching capability
- **Accessibility**: WCAG-compliant components with proper ARIA attributes
- **Real-time Updates**: WebSocket integration for live auction bidding

## Data Flow

### Authentication Flow
1. User accesses protected route
2. Middleware checks session validity
3. If not authenticated, redirect to Replit OIDC login
4. Upon successful authentication, user data is stored in session
5. Subsequent requests use session-based authentication

### API Request Flow
1. Frontend makes API requests using TanStack React Query
2. Express middleware handles authentication and authorization
3. Business logic processes requests using Drizzle ORM
4. Responses are cached and managed by React Query
5. Real-time updates pushed via WebSocket for auction features

### Database Operations
1. Drizzle ORM provides type-safe database operations
2. Schema validation using Zod for all data inputs
3. Transactions used for complex operations (e.g., BOM creation)
4. Connection pooling via Neon serverless PostgreSQL

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI components
- **react-hook-form**: Form state management
- **zod**: Runtime type validation
- **passport**: Authentication middleware
- **openid-client**: OIDC authentication

### Development Tools
- **TypeScript**: Static type checking
- **Vite**: Fast development and build tool
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint/Prettier**: Code formatting and linting

### Replit Integration
- **@replit/vite-plugin-cartographer**: Development environment integration
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error reporting

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **Database**: Neon PostgreSQL with automatic provisioning
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPL_ID
- **Authentication**: Replit OIDC with development domains

### Production Build
- **Frontend**: Static assets built with Vite to `dist/public`
- **Backend**: Compiled TypeScript bundled with esbuild
- **Process Management**: Node.js process serving both static files and API
- **Session Storage**: PostgreSQL-backed session store for scalability

### Database Management
- **Migrations**: Drizzle Kit for schema migrations
- **Schema**: Shared TypeScript definitions between frontend and backend
- **Connection**: Serverless PostgreSQL with connection pooling
- **Backup**: Managed by Neon database service

The architecture emphasizes type safety, developer experience, and scalability while maintaining simplicity in deployment and maintenance. The modular design allows for easy extension of procurement workflows and integration with external systems.