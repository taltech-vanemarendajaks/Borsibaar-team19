# Iti0302-2025

## Project Overview

Borsibaar is a fullstack web application with a Spring Boot backend and Next.js frontend. The system appears to be a stock exchange/trading platform ("börsibaari" in Estonian means "stock bar").

## Architecture

* **Backend**: Spring Boot 3.5.5 with Java 21, PostgreSQL database, Spring Security with OAuth2, JWT authentication
* **Frontend**: Next.js with TypeScript, Tailwind CSS, Radix UI components
* **Database**: PostgreSQL with Liquibase migrations
* **Containerization**: Docker Compose for development environment

## Development Commands

### Backend (Spring Boot)

```bash
# Run backend with Maven wrapper
cd backend && ./mvnw spring-boot:run

# Build backend
cd backend && ./mvnw clean package

# Run tests
cd backend && ./mvnw test
```

### Frontend (Next.js)

```bash
# Development server with Turbopack
cd frontend && npm run dev

# Build for production
cd frontend && npm run build

# Start production server
cd frontend && npm start

# Lint code
cd frontend && npm run lint
```

### Docker Development

```bash
# Start full development environment
docker-compose up

# Start specific services
docker-compose up postgres backend
```

## Key Backend Architecture

The Spring Boot backend follows a layered architecture:

* **Controllers** (`controller/`): REST API endpoints
* **Services** (`service/`): Business logic layer
* **Repositories** (`repository/`): Data access layer using Spring Data JPA
* **Entities** (`entity/`): JPA entities mapping to database tables
* **DTOs** (`dto/`): Request/Response data transfer objects
* **Mappers** (`mapper/`): MapStruct mappers for entity-DTO conversion
* **Config** (`config/`): Spring configuration classes

Key technologies:

* Spring Security with OAuth2 client
* JWT tokens for authentication
* Liquibase for database migrations
* MapStruct for object mapping
* Lombok for reducing boilerplate

## Frontend Structure

Next.js 15 application using the App Router:

* **Pages**: `app/page.tsx` (landing), `app/dashboard/`, `app/login/`, `app/onboarding/`
* **API Routes**: `app/api/` for backend integration
* **Styling**: Tailwind CSS with custom components using Radix UI
* **TypeScript**: Fully typed with strict configuration

## Database

PostgreSQL database configured via Docker Compose. Environment variables are loaded from `.env` and `backend/.env` files.

## Environment Setup

1. Copy `.sample.env` to `.env` and configure database credentials
2. Set up backend environment in `backend/.env`
3. Use Docker Compose for local development: `docker-compose up`

### Sample `.env` (root)

```env
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=

# Backend will reach the DB using the Compose service name "postgres"
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/{pane siia POSTGRES_DB nimi}
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Generate with: openssl rand -base64 32
JWT_SECRET=""
```

### Sample `backend/.env`

```env
# Spring overrides (optional if already set in root .env)
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/{pane siia POSTGRES_DB nimi}
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=

# OAuth2 Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Security
JWT_SECRET=""
```

> Nõuanne: kui kasutad Docker Compose’i, veendu et `postgres` on sinu PostgreSQL teenuse nimi `docker-compose.yaml` failis – nii vastab `SPRING_DATASOURCE_URL` õigesse konteinerisse.

## Key Dependencies

### Backend

* Spring Boot Starter (Web, Data JPA, Security, OAuth2 Client)
* PostgreSQL driver and Liquibase
* JWT libraries (jjwt)
* MapStruct and Lombok
* Spring DotEnv for environment configuration

### Frontend

* Next.js 15 with Turbopack
* React 19
* Tailwind CSS v4
* Radix UI components
* TypeScript
