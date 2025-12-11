# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Clinic Link is a clinic management platform for Taiwan clinics, integrating online appointments, on-site registration, and visit progress tracking. The codebase is a monorepo with a NestJS backend and React frontend.

## Commands

### Backend Development
```bash
npm run start:dev          # Start NestJS with hot reload
npm run build              # Build to dist/
npm run test               # Run Jest unit tests
npm run test:watch         # Run tests in watch mode
npm run test:e2e           # Run end-to-end tests
npm run lint               # ESLint check and fix
npm run format             # Prettier formatting
```

### Database (Prisma)
```bash
npm run prisma:generate    # Generate Prisma client after schema changes
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio UI
npm run prisma:seed        # Seed database
```

### Frontend (from /web directory)
```bash
npm run dev                # Start Vite dev server
npm run build              # Build for production
npm run check              # TypeScript type checking
```

### Docker/Make Commands
```bash
make dev-up                # Start dev containers (PostgreSQL, Redis, MQTT, pgAdmin)
make dev-down              # Stop dev containers
make db-shell              # Access PostgreSQL shell
make api-shell             # Shell into API container
```

## Architecture

### Clean Architecture (Backend)

The backend follows Clean Architecture with four layers:

1. **Domain** (`src/domain/`) - Core business entities, value objects, repository interfaces, domain events and exceptions
2. **Use Cases** (`src/usecases/`) - CQRS pattern with Commands, Queries, and Handlers
3. **Presentation** (`src/presentation/`) - REST controllers, MQTT gateways, DTOs, guards
4. **Infrastructure** (`src/infrastructure/`) - Prisma repositories, auth services, external integrations

**Module Registration**: NestJS modules are defined in `src/app/` per feature (e.g., `AppointmentModule`, `PatientModule`)

### CQRS Pattern

Commands and queries are separated:
```typescript
// Command: src/usecases/appointment/commands/create_appointment.command.ts
export class CreateAppointmentCommand {
  constructor(public readonly data: CreateAppointmentDto) {}
}

// Handler: src/usecases/appointment/commands/create_appointment.handler.ts
@CommandHandler(CreateAppointmentCommand)
export class CreateAppointmentHandler implements ICommandHandler<CreateAppointmentCommand> { }
```

### Multi-Tenant Design

All data is scoped by `clinic_id`. Users and patients can belong to multiple clinics via junction tables (`UserClinic`, `PatientClinic`).

### Authentication

Dual authentication system:
- **Firebase Auth**: Patient authentication (mobile app)
- **JWT + Passport**: Staff/admin authentication with role-based guards

### Real-Time Communication

MQTT topics follow pattern: `cms/clinic/{clinic_id}/queue/updates`

### Frontend Stack

React 18 + TypeScript with:
- TanStack Query for server state
- shadcn/ui + Radix UI components
- Tailwind CSS styling
- React Hook Form + Zod validation
- Wouter for routing

## Key Conventions

- **File naming**: snake_case (e.g., `create_appointment.handler.ts`)
- **Repository injection**: Interface-based with `@Inject('IAppointmentRepository')`
- **API prefix**: `/api/v1`
- **Swagger docs**: Available at `/docs` endpoint

## Development Setup

1. `make dev-up` - Start PostgreSQL, Redis, MQTT, pgAdmin containers
2. `cp .env.example .env` - Configure environment
3. `npm install` - Install dependencies
4. `npm run prisma:generate && npm run prisma:migrate` - Setup database
5. `npm run start:dev` - Start API server (http://localhost:3000)
6. `cd web && npm run dev` - Start frontend (http://localhost:5173)
