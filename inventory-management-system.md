# Project Overview

The client wants an inventory management system for **their** grocery store. The system is to handle/track inventory and discounts of both food and non-food products, and will also need to handle alerts for low stock states, tracking current inventory sales rates relative to previous sales, and suggest discounts on products approaching end of shelf life. Along with extensibility for reporting.

## Purpose of This Document
This document represents **Step One** of the Feature23 coding exercise: the requirements plan for client review with John Dupper (jdupper@feature23.com) before development begins. As the exercise specifies, development commences only after client review and approval of this plan. Markdown is used for easy conversion to other formats.

---

## 1. Introduction

**Client:** FreshMart Grocery - a regional grocery store chain operating **4 locations in Springfield, Colorado**
**Current State:** Each store uses separate Excel spreadsheets for manual inventory tracking
**Goal:** Replace Excel-based process with a simple web-based inventory management system
**Scope:** Multi-store support with role-based access for Store Managers and Stock Associates

---

## 2. Assumptions & Client Meeting Notes

### Assumptions
- **4 store locations** in Springfield, Colorado using StoreID schema: 101 Downtown, 102 Northside, 103 Westside, 104 Riverside
- **Multi-store architecture**: Per-store inventory with shared Product catalog
- **Three user roles**: Store Managers (inventory oversight), Stock Associates (shipment handling), Corporate Staff (cross-store reporting - future)
- **Replacing Excel spreadsheets**: Current manual process at each store becomes web-based system
- **Transaction schema**: SALE, RECEIVE, ADJUSTMENT types explicitly required
- **Product schema** follows Excel structure: UPC, UnitCost, RetailPrice, IsOnSale, SalePrice, ExpirationDate, ReorderThreshold, ReorderQuantity, IsFood

### Client Meeting Notes

**Meeting Date:** [To be scheduled]  
**Attendees:** Matthew Parks (Consultant), John Dupper (Client, jdupper@feature23.com)  

Meeting with John confirmed FreshMart operates 4 stores with separate Excel tracking. Three distinct user roles identified: Store Managers (oversee inventory & ensure stock levels), Stock Associates (receive shipments & update counts), and Corporate Staff (future - cross-store reporting). Product/Inventory/Transaction schema provided in sample Excel files. 

**Key Pain Points Confirmed:**
- Inaccurate inventory counts
- Difficulty tracking low stock items
- No automated expiration handling
- Inefficient multi-store management
- No visibility into inventory changes over time

**Next Steps:** Review this requirements plan with John. Upon approval, begin Increment 1 development. Schedule follow-up meeting when first feature is ready for review.

---

## 3. Epics

| Epic ID | Name | Description | Business Value |
|---------|------|-------------|----------------|
| EPIC-01 | Inventory Management | Add/remove and mark product as discounted | Allows accurate inventory tracking so the business always knows current stock levels and can make informed purchasing decisions |
| EPIC-02 | Inventory Monitoring and Alerting | Will alert the user based on the current stock of the product being low | This can allow the **business** to know when products are restock, meaning higher conversion of customers. |
| EPIC-03 | Analytics | Track the velocity of sale | Allows the business to know how to handle and order future stock based on current trends, better serving customer needs |
| EPIC-04 | Liquidation/Expiration Handling | Suggest recommendations to put items on sale based on proximity to their expiration date | Prevents the grocer from selling items that have gone bad and other similar disastrous outcomes |
| EPIC-05 | Reporting | Handling of the reporting infrastructure | Provides extensible foundation for future reporting capabilities |
| EPIC-06 | Multi-Store Operations | Handle inventory across 4 stores with role-based access control | Enables proper separation of duties between Managers, Associates, and future Corporate staff |
---

## 4. User Stories by Epic

### Epic: EPIC-01 Inventory Management

| ID | Role | Story | So That | Acceptance Criteria | Priority |
|----|------|-------|---------|-------------------|----------|
| EPIC-01-01 | As a Store Manager | I want to input new products into inventory | So that we can track store inventory | - Input product using Product schema (ProductName, Category, UPC, UnitCost, RetailPrice, IsOnSale, SalePrice, ExpirationDate, ReorderThreshold, ReorderQuantity)<br>- System validates UPC uniqueness<br>- Initial quantity creates Inventory record with StoreID | Must Have |
| EPIC-01-02 | As a Store Manager | I want to delete products from inventory | So that discontinued or depleted items no longer appear | - Deleting shows confirmation popup<br>- After confirmation, product no longer appears in dashboard<br>- System archives internally without exposing "archive" concept | Must Have |
| EPIC-01-03 | As a Store Manager or Stock Associate | I want the inventory count to refresh automatically when I view them | So that I always see the most current stock levels | - Count refreshes automatically when new transactions are recorded<br>- QuantityOnHand reflects latest changes immediately<br>- Low stock status recalculates automatically | Must Have |
| EPIC-01-04 | As a Store Manager | I want to mark products as on sale | So that I can run promotions while preserving original pricing | - Original RetailPrice preserved with SalePrice<br>- Sale applies to assigned store only<br>- [S] badge appears on dashboard<br>- Sale removable to restore original price | Must Have |

### Epic: EPIC-02 Inventory Monitoring and Alerting

| ID | Role | Story | So That | Acceptance Criteria | Priority |
|----|------|-------|---------|-------------------|----------|
| EPIC-02-01 | As a Store Manager | I want to set a low-stock threshold when creating an item | So that I can define when I should be alerted before it runs out | - I can set a low-stock threshold during item creation<br>- The threshold must be a valid non-negative number<br>- The threshold is saved with the product | Should Have |
| EPIC-02-02 | As a Store Manager or Stock Associate | I want to be alerted when stock falls below the threshold | So that I can restock before running out | - Alert is generated when quantity falls below threshold<br>- Alert includes product name, current quantity, and threshold value<br>- Alerts can be acknowledged once acted on | Must Have |

### Epic: EPIC-03 Analytics

| ID | Role | Story | So That | Acceptance Criteria | Priority |
|----|------|-------|---------|-------------------|----------|
| EPIC-03-01 | As a Store Manager | I want to see a product's sales velocity over the last 4 weeks | So that I can tell if it is selling faster or slower than before | - A chart displays weekly sales velocity for the past 4 weeks<br>- Velocity is shown as units sold per week<br>- Trend direction is visually clear (e.g., upward/downward slope) | Must Have |
| EPIC-03-02 | As a Store Manager | I want to see the delta between the most recent week and the previous week | So that I can quickly quantify whether sales are accelerating or declining | - Delta (percentage change) is displayed<br>- Change is visually indicated (up/down) | Should Have |
| EPIC-03-03 | As a Store Manager | I want to adjust the time period used to calculate sales velocity | So that I can analyze longer or shorter trends | - Time period is selectable (7, 30, 90 days)<br>- Chart updates when time period changes | Should Have |

### Epic: EPIC-04 Liquidation/Expiration Handling

| ID | Role | Story | So That | Acceptance Criteria | Priority |
|----|------|-------|---------|-------------------|----------|
| EPIC-04-01 | As a Store Manager or Stock Associate | I want the system to handle food products approaching their expiration date | So that I can take action before products expire and become unsellable | - Products are flagged at a configurable number of days before expiration (default: 7 days)<br>- Flagged products appear to the user<br>- Already expired products are distinct from approaching expiration | Must Have |
| EPIC-04-02 | As a Store Manager | I want the system to suggest a discount for products nearing expiration | So that I can reduce waste and increase the chance of selling them before they expire | - Suggested discount is based on remaining shelf life<br>- Products closer to expiration receive a steeper suggested discount<br>- Suggested discount percentage is displayed to the user | Should Have |

### Epic: EPIC-06 Multi-Store Operations

The FreshMart requirements explicitly mention three user types, and the current spreadsheet pain points include difficulty managing inventory across multiple locations. This epic addresses both role-based access and store-specific operations.

| ID | Role | Story | So That | Acceptance Criteria | Priority |
|----|------|-------|---------|-------------------|----------|
| EPIC-06-01 | As any user | I want to log in with my assigned role and store | I only access features and data appropriate to my responsibilities | - Login requires username and password<br>- System authenticates and assigns role: Manager, Associate, or Corporate<br>- Role determines which UI elements are visible and which API endpoints are accessible<br>- Store Managers and Associates are assigned to one specific StoreID<br>- Corporate staff can select any store or view aggregate data<br>- Failed login attempts are logged for security auditing | Must Have |
| EPIC-06-02 | As a Store Manager | I want to view all inventory for my assigned store | I can oversee stock levels and make informed decisions about purchasing and promotions | - Dashboard defaults to showing all products for the manager's assigned StoreID<br>- Can filter by category, alert status (LOW, EXP), and sale status<br>- Cannot see inventory at other stores by default (configurable based on business rules)<br>- Quick-glance indicators show: quantity on hand, sale status, days until expiration, low stock alerts<br>- Clicking a product opens the Product Detail page for that store's inventory | Must Have |
| EPIC-06-03 | As a Stock Associate | I want to record when I receive a shipment of products | The inventory count reflects new stock immediately and accurately | - Simple interface to select ProductID and enter received quantity<br>- Transaction type is automatically set to RECEIVE<br>- System validates that ProductID exists in the catalog<br>- QuantityOnHand is increased immediately<br>- Associate must provide notes (e.g., "Supplier delivery from Dairy Best")<br>- Timestamp and Associate UserID are captured automatically<br>- Cannot modify prices, sale status, or archive products | Must Have |
| EPIC-06-04 | As a Stock Associate | I want to record sales and damaged goods | All inventory movements are tracked and attributed to the correct associate | - Can record SALE transactions (decreases QuantityOnHand, customer purchases)<br>- Can record ADJUSTMENT transactions for damaged, expired, or miscounted items<br>- Must enter quantity change and reason/notes for each transaction<br>- All transactions logged with: ProductID, StoreID, TransactionType, QuantityChange, TransactionDate, UserID, Notes<br>- Transaction history is viewable by Store Managers for auditing | Must Have |
---

## 5. Roadmap

### Increment 1 — Core Inventory

**What it delivers:**
A functional inventory management system with multi-store support and role-based access. This increment establishes the core data model matching FreshMart's existing Excel structure, with full CRUD operations through a REST API accessible via a simple HTML/JavaScript frontend. The system supports 4 store locations with distinct user roles (Managers and Associates), tracks inventory per store using the Product/Inventory separation from the client's current spreadsheets, and logs all changes as transactions.

**Stories covered:**
- EPIC-01-01: Input products using Product schema
- EPIC-01-02: Delete products from inventory (archive internally)
- EPIC-01-03: Inventory counts refresh automatically
- EPIC-01-04: Mark products on sale
- EPIC-06-01: Login with role and store assignment
- EPIC-06-02: Store Manager views store inventory
- EPIC-06-03: Stock Associate records RECEIVE transactions
- EPIC-06-04: Stock Associate records SALE and ADJUSTMENT transactions

**Dependencies:**
- Java 21+ and Maven/Gradle build system
- Spring Boot 3.x with Spring Data JPA and Spring Security
- PostgreSQL database (matching the Excel schema: Stores, Products, Inventory, Transactions, Suppliers)
- Database schema versioning and migrations
- BCrypt or similar for password hashing
- JWT or session-based authentication
- Basic HTML/CSS/JavaScript frontend with role-aware rendering

**Why it's first:**
This increment replaces FreshMart's Excel-based process with a digital system that maintains their existing workflow while adding structure. Multi-store support and role-based access are foundational—without authentication and store scoping, we cannot properly separate duties between Managers and Associates. The transaction logging ensures auditability that Excel lacks. By matching the client's existing Excel structure (Products as master catalog, Inventory per-store, Transactions for history), we minimize migration friction while establishing a proper relational database foundation.

**Technical Notes:**
- Database schema is based on the client's existing Excel structure with additions for authentication and audit tracking:
  - `stores` table: StoreID, StoreName, Street, City, State, ZipCode, Phone, Active
  - `products` table: ProductID, ProductName, Category, UPC, SupplierID, UnitCost, RetailPrice, IsOnSale, SalePrice, ExpirationDate, ReorderThreshold, ReorderQuantity, IsFood, Active
  - `inventory` table: InventoryID, ProductID, StoreID, QuantityOnHand, LastUpdated, Active
  - `transactions` table: TransactionID, ProductID, StoreID, TransactionType (SALE/RECEIVE/ADJUSTMENT), QuantityChange, TransactionDate, UserID, Notes
  - `suppliers` table: SupplierID, SupplierName, ContactName, Phone, Email
  - `users` table: UserID, Username, PasswordHash, Role (MANAGER/ASSOCIATE/CORPORATE), AssignedStoreID (nullable for Corporate), Active
- REST API uses JWT tokens with role claims
- Frontend conditionally renders UI elements based on role from JWT
- Database migrations establish schema matching Excel structure
- Per-store inventory queries use StoreID filter in all API endpoints
- "Delete" operation sets Active=0 on Inventory record (archived) but presents as "removed" to user
- Active inventory counts use `WHERE Active=1` filter in all queries

---

### Increment 2 — Operations & Alerts

**What it delivers:**
Enhanced inventory operations including discount management, low stock alerting, and expiration date tracking. Users can mark products on sale with configurable discounts, receive alerts when stock falls below defined thresholds, and view warnings for products approaching expiration.

**Stories covered:**
- EPIC-02-01: Set low-stock thresholds during item creation
- EPIC-02-02: Alert when stock falls below threshold
- EPIC-04-01: Handle products approaching expiration date

**Dependencies:**
- Increment 1 completed and deployed
- Database schema additions for alert system
- Frontend alert display components

**Why it's second:**
Building on the core inventory foundation, this increment adds operational intelligence that prevents stockouts and waste. Low stock alerts ensure the store never runs out of popular items, while expiration handling prevents selling expired goods. The discount functionality enables promotional pricing strategies. These features directly address the client's stated concerns about knowing when items are running low and handling products near expiration.

**Technical Notes:**
- Database schema adds low_stock_threshold column
- Database schema adds alert/notification tables
- Alert system queries database periodically or on quantity updates
- Expiration warnings calculated based on configurable days-before-expiration threshold
- Discount UI shows both original and sale prices

---

### Increment 3 — Analytics

**What it delivers:**
Sales velocity tracking and analytics capabilities that show how fast products are selling compared to previous periods. Includes visual charts displaying weekly sales velocity over time, week-over-week delta calculations, and configurable time period analysis. Smart discount recommendations are provided for products nearing expiration based on remaining shelf life.

**Stories covered:**
- EPIC-03-01: Display product sales velocity over last 4 weeks
- EPIC-03-02: Show delta between recent and previous week
- EPIC-03-03: Adjustable time period for velocity calculation
- EPIC-04-02: Suggest discounts for products nearing expiration

**Dependencies:**
- Increment 1 deployed and operational long enough to accumulate meaningful SALE transaction history
- Database schema additions for sales velocity tracking
- Charting library for frontend (Chart.js or vanilla canvas)

**Why it's third:**
Analytics requires historical sales data that only becomes meaningful after Increment 2 is operational for some time. This increment transforms raw inventory data into actionable business intelligence—showing which products are trending up or down, enabling data-driven purchasing decisions, and providing automated discount suggestions to minimize waste. It completes the client's requirements for understanding sales velocity and making smart liquidation decisions.

**Technical Notes:**
- Database schema adds sales_transaction_history table
- REST endpoints for velocity calculations and chart data
- Frontend charts rendered with Chart.js or custom canvas implementation
- Discount suggestion algorithm based on days until expiration
- Time period selector (7, 30, 90 days) for trend analysis

---

## 6. Wireframes

### Design Pattern: Functional Minimalism (McMaster-Carr Style)

All wireframes follow a **functional minimalism** design philosophy inspired by industrial supply catalogs like McMaster-Carr:

- **Dense information display**: Maximize data visibility, minimize decorative elements
- **Clear visual hierarchy**: Headers, labels, and data organized in strict grids
- **Functional over beautiful**: Every element serves a purpose
- **Tabular presentation**: Data tables preferred for complex information
- **Minimal chrome**: No unnecessary borders, shadows, or gradients
- **Action-oriented**: Buttons and controls clearly labeled and contextually placed

**Note:** These ASCII wireframes represent the UI concept and layout structure for client review. The actual implementation will be a functional HTML/CSS/JavaScript interface following this design pattern.

---

### Wireframe: Inventory Dashboard (Main List View)

**Description:**
Wireframe for the primary entry point of the inventory system. Displays a searchable, filterable table of all products with quick-glance information including current stock, sale status, and expiration warnings.

**Layout Structure:**
```
+--------------------------------------------------+
|  INVENTORY MANAGEMENT                    [+ Add] |
+--------------------------------------------------+
|  Search: [________________]  Filter: [All ▼]     |
+--------------------------------------------------+
|  Name          | Category | Qty | Price | Alert |
|----------------|----------|-----|-------|-------|
|  Milk 2%       | Dairy    |  45 | $3.99 |       |
|  Milk 2% [S]   | Dairy    |  12 | $2.99 |  LOW  |
|  Bread White   | Bakery   |   3 | $2.49 |  LOW  |
|  Eggs Dozen    | Dairy    |  28 | $4.99 |  EXP  |
|  Paper Towels  | Household| 67 | $5.99 |       |
|  ...           | ...      | ... | ...   | ...   |
+--------------------------------------------------+
|  Showing 5 of 47 products    [< Prev] [Next >] |
+--------------------------------------------------+
```

**Supports Stories:**
- EPIC-01-01: View all products in inventory
- EPIC-01-03: Quick access to update quantities
- EPIC-01-04: Visual indicator of sale items [S] badge
- EPIC-02-02: Alert column shows LOW/EXP warnings
- EPIC-04-01: Expiration warnings in Alert column

**Key Elements:**
- **Search bar**: Real-time filtering by product name
- **Category filter**: Dropdown to filter by product category
- **Data table**: Columns for Name, Category, Quantity, Price, Alert status
- **Alert indicators**: Visual badges (LOW, EXP) for items needing attention
- **Sale badge**: [S] indicator next to product name when on sale
- **Pagination**: Navigate through large product lists
- **Add button**: Primary action to create new product
- **Row click**: Opens Product Detail page

---

### Wireframe: Add/Edit Product Form

**Description:**
Wireframe for a modal or dedicated page for creating new products or editing existing ones. Clean form layout with conditional fields based on product type (food vs non-food).

**Layout Structure:**
```
+--------------------------------------------------+
|  < Back to Inventory                             |
+--------------------------------------------------+
|  Milk 2% - 1 Gallon                              |
|  UPC:          DAIRY-001    Category: Dairy    Type: Food |
+--------------------------------------------------+
|                                                  |
|  CURRENT STOCK                                   |
|  +------------------------------------------+   |
|  |  In Stock: 45 units    Status: OK        |   |
|  |                                          |   |
|  |  [+ Stock In]  [- Stock Out]  [Update ▼] |   |
|  +------------------------------------------+   |
|                                                  |
|  PRICING                                         |
|  Regular: $3.99    Sale: $2.99 (25% off)       |
|  [Remove Sale]                                   |
|                                                  |
|  SHELF LIFE                                      |
|  Expires: 2026-03-15 (18 days remaining)         |
|  Status: OK                                      |
|                                                  |
|  ALERTS                                          |
|  [!] Stock is below threshold (45 < 50)          |
|  [Dismiss] [Update Threshold]                    |
|                                                  |
|  SALES VELOCITY (Last 4 Weeks)                  |
|  +------------------------------------------+   |
|  |         /\                               |   |
|  |        /  \      /\                     |   |
|  |       /    \    /  \   /\               |   |
|  |  ____/      \__/    \_/  \____          |   |
|  |  W1    W2    W3    W4                      |   |
|  |  12    18    15    22  units/week        |   |
|  |                                          |   |
|  |  Trend: +37%  [↑] vs previous week       |   |
|  +------------------------------------------+   |
|                                                  |
|  HISTORY                                         |
|  2026-02-20  Restocked +50 units                 |
|  2026-02-18  Price updated $3.49 → $3.99       |
|  2026-02-15  Sale activated (25% off)            |
|  ...                                             |
|                                                  |
+--------------------------------------------------+
|  [Archive Product]                    [Edit]    |
+--------------------------------------------------+
```

**Supports Stories:**
- EPIC-01-02: Archive product option
- EPIC-01-03: Quick stock in/out controls
- EPIC-01-04: View and manage sale status
- EPIC-02-02: Display and dismiss low stock alerts
- EPIC-03-01, 03-02: Sales velocity chart with trend indicator
- EPIC-04-01: Expiration status display

**Key Elements:**
- **Breadcrumb**: Navigation back to main list
- **Quick actions**: Stock in/out buttons with quantity inputs
- **Pricing section**: Shows current sale status with remove option
- **Shelf life indicator**: Days until expiration with visual status
- **Alert panel**: Active alerts with dismiss actions
- **Sales velocity chart**: Simple line/bar chart (vanilla JS or Chart.js)
- **Trend indicator**: Percentage change with up/down arrow
- **Activity history**: Chronological log of changes
- **Archive button**: Soft-delete functionality

---

### Wireframe: Alerts Panel

**Description:**
Wireframe for a centralized view of all system alerts requiring user attention. Organized by severity/urgency with clear action items.

**Layout Structure:**
```
+--------------------------------------------------+
|  ALERTS & NOTIFICATIONS              [Dashboard] |
+--------------------------------------------------+
|                                                  |
|  ACTIVE ALERTS (4)                               |
|  [All] [Low Stock] [Expiring] [Dismissed]       |
|                                                  |
|  Priority | Product       | Type    | Action    |
|  ---------|---------------|---------|-----------|
|  HIGH     | Bread White   | LOW     | [Restock] |
|  HIGH     | Milk 2%       | LOW     | [Restock] |
|  MEDIUM   | Eggs Dozen    | EXP 3d  | [Discount]|
|  MEDIUM   | Yogurt Plain  | EXP 5d  | [Discount]|
|  ...      | ...           | ...     | ...       |
|                                                  |
+--------------------------------------------------+
|                                                  |
|  RECOMMENDED ACTIONS                             |
|  +------------------------------------------+   |
|  |  Eggs Dozen - Expires in 3 days           |   |
|  |  Suggested: 40% discount ($4.99 → $2.99)   |   |
|  |  [Apply Discount] [Dismiss] [View Product] |   |
|  +------------------------------------------+   |
|                                                  |
|  +------------------------------------------+   |
|  |  Yogurt Plain - Expires in 5 days         |   |
|  |  Suggested: 25% discount ($3.49 → $2.62) |   |
|  |  [Apply Discount] [Dismiss] [View Product] |   |
|  +------------------------------------------+   |
|                                                  |
+--------------------------------------------------+
```

**Supports Stories:**
- EPIC-02-02: View and acknowledge low stock alerts
- EPIC-04-01: View expiration warnings
- EPIC-04-02: Smart discount recommendations

**Key Elements:**
- **Tab filters**: Filter alerts by type (All/Low Stock/Expiring/Dismissed)
- **Priority column**: Visual indication of urgency (HIGH/MEDIUM/LOW)
- **Quick actions**: Context-aware buttons per alert type
  - Low Stock: [Restock] opens product edit with focus on quantity
  - Expiring: [Discount] suggests and applies recommended discount
- **Recommended actions section**: Expanded view of expiring items with suggested discount percentages
- **Dismiss functionality**: Mark alerts as handled/acknowledged
- **Product links**: Navigate to product detail from any alert

---

## 7. Appendix

### MoSCoW Priority Definitions

- **Must Have** — Critical for launch; system cannot function without this
- **Should Have** — Important but not critical; can work around if missing
- **Nice to Have** — Desirable but not necessary; can be added later

### Glossary

| Term | Definition |
|------|------------|
| **Inventory** | The complete list of products currently in stock at the store |
| **Food Item** | A product that has an expiration date and requires shelf life tracking |
| **Non-Food Item** | A product without an expiration date (e.g., cleaning supplies, paper goods) |
| **Low Stock** | When a product's quantity falls below the minimum threshold set for reordering |
| **Sale Price** | A temporary reduced price applied to move inventory faster |
| **Archived Product** | A product removed from active inventory tracking but retained in historical records |
| **Velocity** | The rate at which a product sells over a specific time period |
| **Expiration Date** | The date by which a food product should be sold or removed from shelves |
| **Restock** | The process of adding inventory to an existing product's quantity |
| **UPC** | Universal Product Code - a barcode identifier for products (replaces SKU in this system) |
| **StoreID** | Unique identifier for each FreshMart location: 101 (Downtown), 102 (Northside), 103 (Westside), 104 (Riverside) |
| **Transaction Type** | Classification of inventory change: SALE (customer purchase), RECEIVE (supplier shipment), ADJUSTMENT (damage, expiry, recount) |
| **Reorder Threshold** | Minimum QuantityOnHand before system suggests reordering (from ReorderThreshold field) |
| **Reorder Quantity** | Suggested amount to order when stock falls below threshold (from ReorderQuantity field) |
| **Multi-Store** | Architecture supporting 4 independent store locations with shared product catalog |
| **User Role** | Permission level: Store Manager (full store access), Stock Associate (inventory updates only), Corporate Staff (cross-store reporting) |
| **IsFood** | Boolean field indicating if product requires expiration date tracking (true for food items, false for non-food) |

---

## 8. Future Considerations & Suggestions

### Proactive Features Beyond Client Requirements

The exercise prompt asked: *"What are other features that this application can support that the grocery store hasn't thought of yet?"*

The following features were proactively proposed beyond the client's stated requirements:

**1. Full Transaction Audit Trail with UserID Attribution**
- *Why proposed:* The Excel pain points mention difficulty tracking inventory changes over time
- *Implementation:* All RECEIVE, SALE, and ADJUSTMENT transactions capture UserID, timestamp, and notes
- *Value:* Complete accountability—know WHO made every inventory change, not just WHAT changed

**2. Algorithmic Discount Percentage Suggestions (EPIC-04-02)**
- *Why proposed:* Client asked to "suggest recommendations for when to put items on sale"
- *Implementation:* Dynamic discount percentages based on days until expiration (40% at 3 days, 25% at 5 days, etc.)
- *Value:* Goes beyond simple "flag for sale" to specific actionable percentages that maximize waste reduction

**3. Role-Based Access Control Across Stores (EPIC-06)**
- *Why proposed:* While the exercise prompt mentions "store managers" and "associates," it doesn't explicitly ask for authentication
- *Implementation:* Login system with Spring Security, JWT tokens, role-based UI rendering
- *Value:* Separation of duties prevents unauthorized pricing changes by Associates and ensures data integrity

**4. Multi-Store Architecture from Day One**
- *Why proposed:* The exercise prompt implies one store but client files show 4 locations
- *Implementation:* StoreID scoping on all inventory queries, per-store transaction logging
- *Value:* Solves the actual pain point (multi-location inefficiency) rather than building single-store MVP that misses the mark

These features transform a basic inventory tracker into an operational intelligence system that addresses FreshMart's real workflow challenges.

These items were considered but deferred for future phases based on client meeting feedback:

### Cross-Store Visibility
**Question:** Should Store Managers be able to view inventory at other FreshMart locations?
**Suggestion:** Start with store-only visibility for security. Consider read-only cross-store view for Store Managers in Phase 2 if needed for coordination.

### Store-Specific Pricing
**Question:** Are there pricing differences between locations?
**Suggestion:** Current schema uses single RetailPrice per ProductID. If store-specific pricing becomes requirement, migrate to store_pricing table.

### Corporate Staff Access
**Question:** Should Corporate Staff be able to modify inventory at specific stores?
**Suggestion:** Keep Corporate Staff read-only in initial release. Add modification capabilities later if business requires central control.

### Excel Data Migration
**Suggestion:** Provide import tool in Increment 1 to migrate existing Excel data. Map Excel sheets directly to database tables (Stores, Products, Inventory, Transactions, Suppliers).

### Supplier Management
**Status:** Deferred to future phase
**Rationale:** While the system tracks supplier information (SupplierID, contact details) in the database schema per the Excel files, full supplier management UI (add/edit suppliers, view supplier catalogs) is not included in initial deliverables.
**Future Value:** Once basic inventory operations are stable, full supplier management will enable better vendor relationship tracking and automated reordering workflows.

### Reporting Infrastructure
**Status:** Deferred to future phase
**Rationale:** While the system architecture will support future reporting enhancements (as noted in requirements), full reporting capabilities for Corporate Staff are not included in the initial deliverables. The current epics focus on operational inventory management. However, the database schema and API design accommodate future reporting features without requiring significant refactoring.
**Future Value:** Once basic inventory operations are stable, reporting will enable the business to analyze long-term trends, identify seasonal patterns, and optimize overall store performance.

---
