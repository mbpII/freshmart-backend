# AGENTS.md — FreshMart Portfolio

## Project Structure

Two-service monorepo under `freshmart/`:
- **api/** — Spring Boot 3.2 / Java 17 / Maven
- **web/** — React 19 / TypeScript / Vite 6 / Tailwind 4

PostgreSQL 16 via `docker-compose.yml` (also builds api image + adminer).

## Developer Commands

```bash
# Infrastructure (from repo root)
docker compose up -d          # postgres:5432, api:8080, adminer:8081
docker compose down

# API (from freshmart/api/)
mvn spring-boot:run           # dev server on :8080
mvn clean compile             # build (MapStruct needs Maven annotation processing)
mvn clean package -DskipTests # build jar without tests
mvn test                      # run tests (needs docker for testcontainers)

# Web (from freshmart/web/)
npm run dev                   # Vite dev server on :5173 (proxies /api → :8080)
npm run build                 # tsc -b && vite build
npm run lint                  # eslint
```

**Always run `mvn clean compile` after changing MapStruct mappers** — IDE-only compile skips annotation processing and generated impl classes will be stale or missing.

## Architecture Gotchas

- **No `./mvnw`** — use system `mvn`
- **`hibernate.ddl-auto: validate`** — schema is managed entirely by Flyway migrations (`src/main/resources/db/migration/`). Never rely on auto-DDL; always write a migration.
- **Web path alias**: `@` maps to `src/` (configured in `vite.config.ts`)
- **Vite proxies `/api` to `localhost:8080`** in dev, so frontend API calls use relative paths
- **Auth is a stub** — `CurrentUserService` hardcodes user `manager_downtown` (store 101). Frontend hardcodes `DEFAULT_STORE_ID = 101`.
- **Product creation is two-step**: `POST /api/products` creates the catalog entry (with optional `initialQuantity` + `storeId`), then `POST /api/stores/{storeId}/inventory/{productId}/receive` adds stock to a specific store.
- **Soft delete** on inventory only (`inventory.is_active = false`), not on the global product.
- **Sale state is scoped per-store**: `inventory.sales_price_modifier` field, not a product-level flag.

## Spring Profiles

- Default (no profile): connects to `localhost:5432` — for local `mvn spring-boot:run`
- `docker`: connects to `postgres:5432` inside docker network
- `prod`: reads `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` from env

## Web Stack Notes

- **Tailwind 4** — no `tailwind.config.js`; all config is in CSS (`@theme` directive)
- **React Query** — 30s staleTime, no refetchOnWindowFocus (set in `App.tsx` queryClient)
- **React Hook Form + Zod** for form validation
- **React Router v7** with file-based routes under `src/routes/`
- **No test framework** configured in web — don't assume Jest/Vitest exists
- **No test directory** in API either — tests have not been written yet
- `INVENTORY_PAGE_SIZE = 5` — pagination is client-side with `@tanstack/react-table`

## Backend Package Layout

```
com.freshmart/
├── controller/    # REST endpoints (Product, Inventory, Store)
├── service/       # Business logic (CurrentUserService is auth stub)
├── repository/   # Spring Data JPA
├── dto/           # Request/response records
├── mapper/        # MapStruct (ProductMapper, InventoryMapper, ProductInventoryMapper)
├── event/         # InventoryAdjustedEvent + @TransactionalEventListener
├── exception/     # GlobalExceptionHandler (@RestControllerAdvice)
├── config/        # CORS (allows :5173, :3000), OpenAPI, Web config
└── model/         # JPA entities (Product, Inventory, Store, User, Transaction, Supplier)
```

## Database

- PostgreSQL 16, credentials: `freshmart/freshmart`, database: `freshmart`
- 7 Flyway migrations (V1–V7), baseline-on-migrate enabled
- Schema: `products`, `inventory`, `stores`, `users`, `suppliers`, `transactions`, `alerts`
- Seed data in V2 (stores) and V4 (users)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products` | Create product (with optional `initialQuantity` + `storeId`) |
| GET | `/api/products?storeId={id}` | List products for store |
| GET | `/api/products/{id}` | Get product catalog info |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Archive product (soft delete) |
| POST | `/api/products/{id}/sale?storeId=&salesPriceModifier=` | Mark on sale per-store |
| DELETE | `/api/products/{id}/sale?storeId=` | Remove sale per-store |
| GET | `/api/stores/{storeId}/inventory` | Get store inventory |
| GET | `/api/stores/{storeId}/inventory/{productId}` | Get single item detail |
| DELETE | `/api/stores/{storeId}/inventory/{productId}` | Remove from store (soft delete) |
| POST | `/api/stores/{storeId}/inventory/{productId}/receive` | Receive stock |
| POST | `/api/stores/{storeId}/inventory/{productId}/sell` | Sell stock |
| POST | `/api/stores/{storeId}/inventory/{productId}/adjust` | Adjust stock |

Swagger UI: `http://localhost:8080/swagger-ui.html`