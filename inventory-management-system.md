# Project Overview

The client wants an inventory management system for **their** grocery store. The system is to handle/track inventory and discounts of both food and non-food products, and will also need to handle alerts for low stock states, tracking current inventory sales rates relative to previous sales, and suggest discounts on products approaching end of shelf life. Along with extensibility for reporting.

## Purpose of This Document
This document represents **Step One** of the Feature23 coding exercise: the requirements plan for client review with John Dupper before development begins. As the exercise specifies, development commences only after client review and approval of this plan. Markdown is used for easy conversion to other formats.

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
**Attendees:** Matthew Parks (Consultant), John Dupper (Client)  

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
| EPIC-02 | Inventory Monitoring and Alerting | Will alert the user based on the current stock of the product being low | This can allow the **business** to know when products are restocked, meaning higher conversion of customers. |
| EPIC-03 | Analytics | Track the velocity of sale | Allows the business to know how to handle and order future stock based on current trends, better serving customer needs |
| EPIC-04 | Liquidation/Expiration Handling | Suggest recommendations to put items on sale based on proximity to their expiration date | Prevents the grocer from selling items that have gone bad and other similar disastrous outcomes |
| EPIC-05 | Reporting | Handling of the reporting infrastructure | Supports future reporting capabilities as the system grows |
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
- Relational database matching the Excel schema (Stores, Products, Inventory, Transactions, Suppliers)
- Database schema versioning and migrations
- Authentication system with role-based access control
- REST API for data operations
- Web-based frontend with role-aware rendering

**Why it's first:**
This increment gets FreshMart out of Excel and into a system that tracks inventory more reliably starting with one, which can be repeated across all 4 stores. It covers the core day-to-day work first: managing products, inventory, and making sure Managers and Associate have adequate data.

**Technical Notes:**
- Database schema is based on the client's existing Excel structure with additions for authentication and audit tracking:
  - `stores` table: StoreID, StoreName, Street, City, State, ZipCode, Phone, Active
  - `products` table: ProductID, ProductName, Category, UPC, SupplierID, UnitCost, RetailPrice, IsOnSale, SalePrice, ExpirationDate, ReorderThreshold, ReorderQuantity, IsFood, Active
  - `inventory` table: InventoryID, ProductID, StoreID, QuantityOnHand, LastUpdated, Active
  - `transactions` table: TransactionID, ProductID, StoreID, TransactionType (SALE/RECEIVE/ADJUSTMENT), QuantityChange, TransactionDate, UserID, Notes
  - `suppliers` table: SupplierID, SupplierName, ContactName, Phone, Email
  - `users` table: UserID, Username, PasswordHash, Role (MANAGER/ASSOCIATE/CORPORATE), AssignedStoreID (nullable for Corporate), Active
- REST API with authentication and role-based access
- Frontend conditionally renders UI elements based on user role
- Database migrations establish schema matching Excel structure
- Per-store inventory queries use StoreID filter in all API endpoints
- "Delete" operation sets Active=0 on Inventory record (archived) but presents as "removed" to user
- Active inventory counts use `WHERE Active=1` filter in all queries

---

### Increment 2 — Operations & Alerts

**What it delivers:**
Additional inventory operations including discount management, low stock alerting, and expiration date tracking. Users can mark products on sale with configurable discounts, receive alerts when stock falls below defined thresholds, and view warnings for products approaching expiration.

**Stories covered:**
- EPIC-02-01: Set low-stock thresholds during item creation
- EPIC-02-02: Alert when stock falls below threshold
- EPIC-04-01: Handle products approaching expiration date

**Dependencies:**
- Increment 1 completed and deployed
- Database schema additions for alert system
- Frontend alert display components

**Why it's second:**
With the core inventory work in place, this increment adds the alerting and expiration handling. Helping the store track low stock, manage items nearing expiration, and apply discounts as needed.

**Technical Notes:**
- Database schema adds low_stock_threshold column
- Database schema adds alert/notification tables
- Alert system queries database periodically or on quantity updates
- Expiration warnings calculated based on configurable days-before-expiration threshold
- Discount UI shows both original and sale prices

---

### Increment 3 — Analytics

**What it delivers:**
Sales velocity tracking and analytics capabilities that show how fast products are selling compared to previous periods. Includes visual charts displaying weekly sales velocity over time, changes week to week, and configurable time period analysis. Smart discount recommendations are provided for products nearing expiration based on remaining shelf life.

**Stories covered:**
- EPIC-03-01: Display product sales velocity over last 4 weeks
- EPIC-03-02: Show delta between recent and previous week
- EPIC-03-03: Adjustable time period for velocity calculation
- EPIC-04-02: Suggest discounts for products nearing expiration

**Dependencies:**
- Increment 1 deployed and operational long enough to accumulate meaningful SALE transaction history
- Database schema additions for sales velocity tracking 

**Why it's third:**
This increment comes after enough sales history exists to make the analytics useful. Once that data is available, managers can see sales trends, compare recent performance, and make better stocking and discount decisions.

**Technical Notes:**
- Database schema adds sales_transaction_history table
- REST endpoints for velocity calculations and chart data
- Frontend charts rendered implementation to be determined
- Discount suggestion algorithm based on days until expiration
- Time period selector (7, 30, 90 days) for trend analysis

---

## 6. Wireframes

**Design Philosophy:** All interfaces follow **functional minimalism** inspired by industrial supply catalogs (McMaster-Carr style) landing somewhere between the former and Bootstrap's aesthetic. Dense information display with minimal decorative elements. Data organized in strict grids and tables with clear hierarchy. Every element serves a purpose—no unnecessary chrome, shadows, or gradients.

**Wireframe Assets:** Detailed wireframes are provided in the accompanying file `takehome-wireframe.drawio`. This file contains visual diagrams for all primary interfaces including:

1. **Inventory Dashboard (Main List View)** — Searchable, filterable product table with quick-glance stock, sale, and expiration status
2. **Add/Edit Product Form** — Modal/dedicated page for creating and editing products with conditional fields based on product type
3. **Product Detail Page** — Comprehensive product view with stock controls, pricing, shelf life, alerts, sales velocity chart, and activity history
4. **Alerts Panel** — Centralized view of all system alerts organized by priority with recommended actions

**Note:** These wireframes communicate design intent for client review. The actual implementation will be a functional HTML/CSS/JavaScript interface following this philosophy.

### Wireframe Summary: Inventory Dashboard

**Supports Stories:**
- EPIC-01-01: View all products in inventory
- EPIC-01-03: Quick access to update quantities
- EPIC-01-04: Visual indicator of sale items
- EPIC-02-02: Alert column shows LOW/EXP warnings
- EPIC-04-01: Expiration warnings in Alert column

**Key Elements:**
- **Search bar**: Real-time filtering by product name
- **Category filter**: Dropdown to filter by product category
- **Data table**: Columns for Name, Category, Quantity, Price, Alert status
- **Alert indicators**: Visual badges (LOW, EXP) for items needing attention
- **Sale badge**: Indicator next to product name when on sale
- **Pagination**: Navigate through large product lists
- **Add button**: Primary action to create new product
- **Row click**: Opens Product Detail page

### Wireframe Summary: Add/Edit Product Form

**Supports Stories:**
- EPIC-01-01: Add new products with type distinction
- EPIC-01-03: Edit product details and quantities
- EPIC-01-04: Configure sale pricing
- EPIC-02-01: Set low stock thresholds
- EPIC-04-01: Enter expiration dates for food items

**Key Elements:**
- **Product type toggle**: Selection for Food/Non-Food (sets IsFood field)
- **Conditional fields**: Expiration date only shows for Food type
- **UPC field**: Universal Product Code for barcode scanning
- **Low stock threshold**: Number input with helpful text
- **Sale configuration**: Toggle to enable sale, with price or percentage options
- **Form validation**: Inline validation for required fields
- **Cancel/Save buttons**: Standard form actions

### Wireframe Summary: Product Detail Page

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
- **Sales velocity chart**: Simple line/bar chart displaying velocity trends
- **Trend indicator**: Percentage change with up/down arrow
- **Activity history**: Chronological log of changes
- **Archive button**: Soft-delete functionality

### Wireframe Summary: Alerts Panel

**Supports Stories:**
- EPIC-02-02: View and acknowledge low stock alerts
- EPIC-04-01: View expiration warnings
- EPIC-04-02: Smart discount recommendations

**Key Elements:**
- **Tab filters**: Filter alerts by issue type (All/Low Stock/Expiring/Dismissed)
- **Priority column**: Visual indication of urgency (HIGH/MEDIUM/LOW)
- **Quick actions**: Context-aware buttons per issue type
  - Low Stock: [Restock] opens product edit with focus on quantity
  - Expiring: [Discount] suggests and applies recommended discount
- **Recommended actions section**: Expanded view of expiring items with suggested discount percentages
- **Dismiss functionality**: Mark alerts as handled/acknowledged
- **Product links**: Navigate to product detail from any alert



## 8. Future Considerations & Suggestions

### Proactive Features Beyond Client Requirements

| # | Feature | Why Proposed | Implementation | Value |
|---|---------|--------------|----------------|-------|
| 1 | **Full Transaction Audit Trail** | The Excel pain points mention difficulty tracking inventory changes over time | All RECEIVE, SALE, and ADJUSTMENT transactions capture UserID, timestamp, and notes | This creates complete accountability so the who and when is documented for every inventory change|
| 2 | **Role-Based Access Control** (EPIC-06) | Exercise prompt mentions "store managers" and "associates" but doesn't explicitly ask for authentication | Login system with role based authentication and authorization | Separation of duties prevents unauthorized pricing changes by Associates|
| 3 | **Multi-Store Architecture** | Client description identifies managing inventory across locations as a key pain point | StoreID scoping on all inventory queries, per-store transaction logging | Solves the actual pain point (inefficiency) first rather than building single-store MVP that misses the mark |
---

### Deferred for Future Phases

| Feature | Rationale | Future Consideration |
|---------|-----------|---------------------|
| **Cross-Store Visibility** | Start with store-only visibility for security | Consider read-only cross-store view for Store Managers in Phase 2 if needed for coordination |
| **Store-Specific Pricing** | Current schema uses single RetailPrice per ProductID | If store-specific pricing becomes requirement, migrate to store_pricing table |
| **Associate Editing and Discount Permissions** | Product edits and discount changes stay with Store Managers in the initial release | Should Stock Associates be allowed to edit items or apply discounts later if store workflow requires it? |
| **Excel Data Migration Tool** | Not critical for initial launch | Provide import tool in Increment 1 to migrate existing Excel data; map sheets directly to database tables |
| **Supplier Management UI** | System tracks supplier info in schema per Excel files, but full UI is not critical initially | Once basic inventory operations are stable, enable vendor relationship tracking and automated reordering |
| **Corporate Reporting Infrastructure** | Current epics focus on operational inventory management; schema supports future enhancements | Once operations are stable, enable long-term trend analysis, seasonal pattern identification, and performance optimization |
| **Per-Store vs. Shared Sale Pricing and Expiration Dates** *(Open Design Decision)* | Start with shared `products` table to match existing Excel structure and minimize migration friction. EPIC-01-04 specifies "sale applies to assigned store only," but `IsOnSale`, `SalePrice`, and `ExpirationDate` currently live on the shared table — meaning all 4 stores would share one sale price and expiration date per product | **Option A:** Keep fields on `products` table (matches Excel, simpler) **Option B:** Move to per-store `inventory` table (supports independent pricing and per-shipment expiration tracking). **Needs client input when expanding to multiple stores** |

---
