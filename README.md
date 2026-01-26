# Iti0302-2025

## Project Overview

Bärsibaar is a full-stack web application with a Spring Boot backend and Next.js frontend. It provides inventory management, transaction tracking, and price optimization features for stock bar themed events. There is also a public page for seeing drink prices in a format that is similar to the stock market.

## Architecture

* **Backend**: Spring Boot 3.5.5 with Java 21, PostgreSQL database, Spring Security with OAuth2, JWT authentication
* **Frontend**: Next.js with TypeScript, Tailwind CSS, Shadcn UI components
* **Database**: PostgreSQL with Liquibase migrations
* **Containerization**: Docker for development environment

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

### Docker usage

```bash
# Start full development environment (DB and backend)
docker compose up
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

PostgreSQL database configured via Docker. Environment variables are loaded from `.env` and `backend/.env` files.

## Environment Setup

1. Copy `.sample.env` to `.env` and configure credentials
2. Use Docker for local development: `docker compose up`
3. Start frontend by running `npm run dev` in the `frontend` directory

### Sample `.env` (root)

```env
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=

SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/{pane siia POSTGRES_DB nimi}
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

JWT_SECRET="" # openssl rand -base64 32
```

## Sample Spring configuration (application.properties)

`backend/src/main/resources/application.properties`

```properties
spring.application.name=Borsibaar

spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}

spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.google.scope=openid,profile,email
spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}
spring.security.oauth2.client.registration.google.client-name=Google

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false

spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml
spring.liquibase.enabled=true
spring.sql.init.mode=never

jwt.secret=${JWT_SECRET}
app.cors.allowed-origins=http://localhost:3000,http://127.0.0.1:3000
app.frontend.url=http://localhost:3000

server.forward-headers-strategy=framework
```

## Tech debt, things that could be improved

### Backend
- **Inventory & pricing domain consistency, missing features**
  _Packages: `backend/src/main/java/com/borsibaar/entity`, `service`, `repository`_
  - Several services manually fetch related entities via repositories instead of navigating object graphs, which leads to extra queries and more complex code. Example from `InventoryService`: `getByOrganization` loads the `Product` for each `Inventory` via `productRepository.findById` instead of using a mapped association.
  - Dynamic pricing / price correction logic exists (see PriceCorrectionJob and use of adjustedPrice in InventoryService), but it is not encapsulated in a dedicated domain service; behaviour is partly in jobs/services and partly implied by database state.
  - Inventory currently stores both a `product_id` and an `organization_id`, while `Product` also has an `organization_id`. The duplication is convenient for queries but adds complexity and risk of inconsistency.
    - A refactor should either:
      - Make `Inventory` depend purely on `Product` (and navigate `product.organizationId`), or
      - Clearly document and enforce the duplication via invariants / constraints.
  - Create a **public item transaction history endpoint** (read‑only, requires auth for now) that exposes `InventoryTransaction` data per product and organization.
  - Introduce a **price correction setting** on a per‑organization or per‑product basis (how often price correction runs, what lookback window to use).
  - Enhance the dynamic pricing model with gamification features like “hype trains” (e.g. bursts of demand temporarily decreasing prices) and “market crashes” (sharp temporary drops) for a more stock‑market‑like experience.


- **Validation & business rules on write paths**
  _Packages: `controller`, `dto`, `service`_
  - Many request DTOs lack comprehensive validation (e.g. negative prices, invalid quantity changes, inconsistent min/max/base prices, missing required fields).
  - Inventory invariants (non‑negative stock, immutable transaction history, organization isolation) are enforced via a mix of DB constraints and ad‑hoc service code instead of a clearly defined domain boundary.

- **Cross-cutting concerns & error handling**
  _Packages: `exception`, `config`, `controller`_
  - Controllers are not fully consistent in how they surface errors – some rely on default Spring exceptions / `ResponseStatusException`, others may use custom handlers; response shapes are not unified for all error cases.
  - Some helper utilities (e.g. `SecurityUtils`) are used, but most authorization and tenant checks are still manual in each service/controller method.

- **Tests and observability around core flows**
  _Packages: `src/test/java`, application logging_
  - Test coverage is decent for happy paths, but is missing many edge cases. There should be more “negative” tests (invalid inputs, concurrent updates, trying to operate on another organization’s data, deleted/inactive products, etc.).
  - Logging is mostly technical (stack traces, generic messages) instead of structured domain events (who changed which product price, which station sold what, etc.).


### Frontend
- **Inventory management UX & state model**
  _File: `frontend/app/(protected)/(sidebar)/inventory/page.tsx`_
  - The inventory page is a very large monolith that mixes data fetching, business rules, and complex UI (tables, dialogs, forms) in one file. This makes it harder to reason about and reuse.
  - Input validation should be implemented (e.g. negative prices, empty names, duplicate names, min greater than max, etc.). This could go hand-in-hand with the shared DTOs/types with the backend.
  - Several places rely on loose typing or `// @ts-expect-error` because shared DTO types from the backend are missing.  Introducing a shared contract layer or code‑generated types would be a big improvement.
    - TypeScript type checking is currently relaxed/ignored for builds in `next.config.ts`; this should be fixed so the build fails on type errors.
  - Sorting should be implemented in the inventory page product list view for better UX.
  - There should be a way to change the current price so a drink can be made cheaper or more expensive manually (e.g. manual overrides on top of dynamic pricing).

- **POS flows & client-facing views**
  _Files: `frontend/app/(protected)/(sidebar)/pos/**`, `frontend/app/(protected)/client/page.tsx`_
  - Station selection, product loading, cart building, and sale submission logic are tightly coupled to React component state and direct fetch calls, which makes it difficult to test or reuse this logic elsewhere (e.g. in hooks or service modules).
  - The public/client pricing view still has implicit or hardcoded organization handling instead of a clear URL or query‑parameter contract for selecting the organization.
  - Better UI responsiveness is needed so everything fits on screen even on smaller screens.
  - Themed components for the public view (e.g. “stock ticker” style, event‑specific themes) would be a strong value add.

- **Error handling and auth boundary in the frontend**
  _Files: `frontend/app/api/backend/**`, `frontend/middleware.ts`_
  - There is no centralized helper or hook to distinguish “not logged in” from domain errors; each page handles fetch failures differently, leading to inconsistent UX.
  - The user is not always redirected to the login page if they access a protected page without an active auth state; this should be enforced centrally (e.g. middleware + shared fetch helpers).
  - Error messages are mostly inline; using toasts/snackbars or a common error banner component would improve UX and consistency.

- **Typing & shared contracts between frontend and backend**
  _Modules: `frontend/app/**`, `frontend/utils/**`, backend DTO packages_
  - TypeScript types are currently hand‑written and can drift out of sync with backend DTOs; there is no code generation or shared contract layer.
  - Introducing generated types from OpenAPI / SpringDoc, or a shared package for DTO interfaces, would reduce duplication and runtime bugs.
