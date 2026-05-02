# ADR: Epic 06 Multi-Store Downscope

Status: informal / implementation guide

## Context

Epic 06 was too broad for the current slice. The useful next step is not full auth or corporate reporting, but removing hidden single-store assumptions while keeping the app playable.

The client docs describe Store Managers and Stock Associates as store-assigned roles. Corporate Staff is the future role that most closely matches true cross-store selection and reporting. For this slice, manager mode remains a dev/demo affordance for exposing store switching.

## Decisions

- Preserve existing convenience product routes where already used, but make missing store context fail loudly.
- Prefer canonical store-scoped frontend reads and inventory actions: `/api/stores/{storeId}/inventory`.
- Remove backend fallback to store `101`. Missing store context returns `400 Bad Request`.
- Treat invalid, inactive, or unknown store IDs as `400 Bad Request`.
- Use these store-context error messages:
  - Missing: `Missing store id. Please provide store identifier`
  - Invalid: `A valid storeId is required to perform this operation.`
- The frontend can initialize to store `101`, but the selected store is session state, not a backend default.
- Store switching is shown only while manager mode is enabled.
- The current manager-mode store dropdown is temporary scaffolding for the future auth/role work.

## Consequences

- Product and inventory operations must carry a `storeId` explicitly.
- React Query keys include `storeId` so each store has separate cached inventory.
- Future auth can replace the dev-mode selected store without changing the service-layer store-context contract.
