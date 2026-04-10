# AGENTS.md — FreshMart Portfolio

## Project Overview
Inventory management system for a grocery chain. Two services under `freshmart/`:
- **api/** — Spring Boot 3.2 (Java 17, Maven)
- **web/** — React 19 + TypeScript + Vite + Tailwind 4

PostgreSQL 16 runs via `docker-compose.yml` (also orchestrates api + adminer).

## Developer Commands

### Infrastructure
```bash
docker compose up -d          # starts postgres (port 5432), api (8080), adminer (8081)
docker compose down           # stop all
```

### API (`freshmart/api/`)
```bash
mvn spring-boot:run           # run dev server on :8080 (use mvn, not ./mvnw)
mvn clean compile             # build (MapStruct requires Maven)
mvn clean package             # build jar (skips tests)
mvn test                      # run tests
```
- Swagger UI at `http://localhost:8080/swagger-ui.html`
- Uses Flyway migrations in `src/main/resources/db/migration/`
- `hibernate.ddl-auto: validate` — schema must match migrations; do not rely on auto-DDL
- MapStruct annotation processor required — always build with Maven, not IDE-only compile

### Web (`freshmart/web/`)
```bash
npm run dev                   # Vite dev server
npm run build                 # tsc -b && vite build
npm run lint                  # eslint
npm run preview               # preview production build
```
- Routes: `/` (product list), `/products/:id` (detail), `/products/new` (create), `/products/:id/edit` (TODO stub)
- State: React Query (staleTime 30s, no refetch on focus)
- Forms: React Hook Form + Zod validation
- Tailwind 4 — no `tailwind.config.js`; config via CSS

## Architecture Notes
- API entrypoint: `com.freshmart` package under `src/main/java/com/`
- Web entrypoint: `src/main.tsx` → `src/App.tsx`
- No `test/` directory exists in the API — tests have not been written yet
- No CI/CD pipeline configured
- `knowledge-repo/` contains exercise docs and wireframes (reference only, not code)

### Backend Structure (EPIC-01)
```
com.freshmart/
├── controller/    # REST endpoints
├── service/       # Business logic (CurrentUserService stub for auth)
├── repository/    # JPA repositories
├── dto/           # Request/response records
├── mapper/        # MapStruct converters
├── event/         # Domain events (InventoryAdjustedEvent)
├── exception/     # Global exception handler
├── config/        # OpenAPI, CORS, Web config
└── model/         # JPA entities
```

### Key Design Decisions
- **Product Creation**: Two separate endpoints — `POST /api/products` (catalog) + `POST /api/stores/{storeId}/inventory` (store linkage)
- **Soft Delete**: `inventory.is_active=false` (per-store only, no global side effects)
- **Transaction Recording**: Automatic via `InventoryAdjustedEvent` + `@TransactionalEventListener`
- **Response Format**: Standard REST (HTTP status codes, direct resource bodies)
- **Store ID**: Derived from authenticated user (stub: `manager_downtown` with store 101)
- **DTO Structure**: Flat `ProductInventoryResponse` (serves frontend needs)

## Conventions
- API: Spring profiles `dev`, `docker`, `prod`. Default profile connects to `localhost:5432`
- Web: No test framework configured — do not assume Jest/Vitest exists

## Current Task Plan

### EPIC-01: Backend Implementation ✅ COMPLETE
- [x] **Start database** — `docker compose up -d` to spin up PostgreSQL
- [x] **Create Repositories** — JPA repositories for all entities
- [x] **Create Domain Events** — `InventoryAdjustedEvent` for transaction audit
- [x] **Create DTOs** — Request/response records for all endpoints
- [x] **Create Mappers** — MapStruct for entity/DTO conversion
- [x] **Create Services** — Product, Inventory, TransactionRecording, CurrentUser (stub)
- [x] **Create Controllers** — REST endpoints for products, inventory, stores
- [x] **Create Exception Handler** — Global @RestControllerAdvice
- [x] **Verify build** — `mvn clean compile -DskipTests` succeeds

### API Endpoints

**Products (Epic 1 - Complete)**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products` | Create product with optional initial inventory |
| GET | `/api/products` | List products for store |
| GET | `/api/products/{id}` | Get product details |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Archive product (soft delete) |
| POST | `/api/products/{id}/sale` | Mark product on sale |
| DELETE | `/api/products/{id}/sale` | Remove sale |

**Inventory (Epic 3 - Stubbed)**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stores/{storeId}/inventory` | Get store inventory (basic) |
| DELETE | `/api/stores/{storeId}/inventory/{productId}` | Remove from store |

### Architecture Note
- **Product is the main resource** - Inventory behavior attaches to products
- **Stock changes** are explicit and auditable (full implementation in Epic 3)
- **Initial stock** can be set during product creation via `initialQuantity` field

## Implementation Plan

### Phase 1: Wire Frontend to Real API
- [ ] Update `src/api/products.ts` to use `/api/*` endpoints (Vite proxy already configured at `localhost:8080`)
- [ ] Map frontend types to backend DTOs - verify field alignment between `ProductInventoryResponse` and frontend `Product` type
- [ ] Use combined endpoint `POST /api/inventory/products` for creating products (creates catalog entry + store inventory in one call)
- [ ] Update React Query hooks with proper error handling and loading states
- [ ] Create edit product form component - reuse create form with pre-populated data
- [ ] Add API error display (inline form errors + toast notifications)

### Phase 2: Pretty Colors / UI Improvements
- [ ] Replace grayscale theme with fresh grocery palette:
  - Primary: emerald/slate (fresh feel)
  - Food items: warm amber accents
  - Status badges: semantic colors (red=expired/low, yellow=warning, green=success)
- [ ] Add smooth transitions and hover states to all interactive elements
- [ ] Improve table styling with zebra striping and better typography hierarchy
- [ ] Replace loading text with skeleton placeholders
- [ ] Add card shadows and rounded corners for visual depth

### Phase 3: Performance Testing & Optimization
- [ ] Add Lighthouse CI configuration for automated performance audits
- [ ] Implement virtual scrolling for large inventory lists using `react-window`
- [ ] Optimize React re-renders with `React.memo` and `useMemo` where needed
- [ ] Add performance budgets: initial bundle <200KB, API response <500ms
- [ ] Enable React Query stale-while-revalidate patterns for perceived speed

### Future
- [ ] Implement authentication (replace CurrentUserService stub)
- [ ] Write integration tests for API endpoints
