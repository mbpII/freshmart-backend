

---

## 1. Project Overview

The client wants a inventory management system for there grocery store. The system is to handle/track inventory and discounts of both food and non-food products, the will also need to be alerts handling states of low stock, tracking on current inventory sales rates relative to previous sales, suggest discounts on products approaching end of shelf life. Along with exetensibility for reportin reporting. 
---

## 2. Assumptions & Open Questions

### Assumptions
- [Starting from scratch]
- [Assuming there will be one user (this is unlikely but can be extensible)]
- [Assumption 3]

### Open Questions
1. **[What system does the client currently have ?]** — [Based on what they are currently using this could what needs to be built, if they have a current digital system I need only to integrate with it, then add the features they are missing, I could also have a better frame of reference of what the system should work like by having a demonstration.]
2. **[Who will be the main user of this system ? stockers, managers, cashiers, associates, or some other role/position ]** — [By knowing this it can help me better scope the user stories.]
3. **[Question 3]** — [Context/why it matters]

---

## 3. Epics

| Epic ID | Name | Description | Business Value |
|---------|------|-------------|----------------|
| EPIC-01 | [Inventory Management] | [add/remove and mark product as discounted ] | [Allows accurate inventory tracking so the business always knows current stock levels and can make informed purchasing decisions] |
| EPIC-02 | [Inventory Monitoring and Alerting] | [will alert the user based on the current stock of the product being low] | [This can allow the buisness to know when products are restock, meaning higher conversion of customers.] |
| EPIC-03 | Analytics | Track the velocity of sale | Allows the business to know how to handle and order future stock based on current trends, better serving customer needs |
| EPIC-04 | Liquidation/Expiration Handling | Suggest recommendations to put items on sale based on proximity to their expiration date | Prevents the grocer from selling items that have gone bad and other similar disastrous outcomes |
| EPIC-05 | Reporting | Handling of the reporting infrastructure | Provides extensible foundation for future reporting capabilities |
---

## 4. User Stories by Epic

### Epic: EPIC-01 Inventory Management

| ID | Role | Story | So That | Acceptance Criteria | Priority |
|----|------|-------|---------|-------------------|----------|
| EPIC-01-01 | As a user | I want to add new products to the inventory | So that we can keep track of store inventory | - Can add food items with name, category, quantity, price, and expiration date<br>- Can add non-food items with name, category, quantity, and price (no expiration date required)<br>- System distinguishes between food and non-food product types | Must Have |
| EPIC-01-02 | As a user | I want to remove products from the inventory | So that discontinued or depleted items aren't in active inventory| - Product is archived rather than permanently deleted<br>-Removing a product with quantity > 0 triggers a confirmation prompt | Must Have |
| EPIC-01-03 | As a user | I want to update the quantity of an existing product | So that inventory counts stay accurate as stock is received or sold | - Quantity can be increased (stocked) or decreased (sold, damage, etc.)<br>- Quantity cannot go below zero| Must Have |
| EPIC-01-04 | As a user | I want to mark a product as on sale with a discount amount | So that reductions in price are applied and tracked without losing the original price | - Original price is preserved alongside the sale price<br>- Item can be a percentage or flat amount<br>- Item can be restored to the original price | Must Have |

### Epic: [EPIC-02 Name]

| ID | Role | Story | So That | Acceptance Criteria | Priority |
|----|------|-------|---------|-------------------|----------|
| EPIC-02-01 | As a user | I want to set a low-stock threshold when creating an item | So that I can define when I should be alerted before it runs out | - I can set a low-stock threshold during item creation<br>- The threshold must be a valid non-negative number<br>- The threshold is saved with the product | Should Have |
| EPIC-02-02 | As a user | I want to be alerted when stock falls below the threshold | So that I can restock before running out | - Alert is generated when quantity falls below threshold<br>- Alert includes product name, current quantity, and threshold value<br>- Alerts can be acknowledged once acted on | Must Have |

### Epic: EPIC-03 Analytics

| ID | Role | Story | So That | Acceptance Criteria | Priority |
|----|------|-------|---------|-------------------|----------|
| EPIC-03-01 | As a user | I want to see a product's sales velocity over the last 4 weeks | So that I can tell if it is selling faster or slower than before | - A chart displays weekly sales velocity for the past 4 weeks<br>- Velocity is shown as units sold per week<br>- Trend direction is visually clear (e.g., upward/downward slope) | Must Have |
| EPIC-03-02 | As a user | I want to see the delta between the most recent week and the previous week | So that I can quickly quantify whether sales are accelerating or declining | - Delta (percentage change) is displayed<br>- Change is visually indicated (up/down) | Should Have |
| EPIC-03-03 | As a user | I want to adjust the time period used to calculate sales velocity | So that I can analyze longer or shorter trends | - Time period is selectable (7, 30, 90 days)<br>- Chart updates when time period changes | Should Have |

---

## 5. Roadmap

<!-- Lay out your increments in order: What it delivers, Which stories it covers (reference the IDs), Dependencies, Why it's first. -->

### Increment 1 — [Name]

**What it delivers:**
[Description of deliverables]

**Stories covered:**
- [EPIC-01]-01
- [EPIC-01]-02
- [EPIC-02]-01

**Dependencies:**
- [Dependency 1]
- [Dependency 2]

**Why it's first:**
[Rationale for priority]

---

### Increment 2 — [Name]

**What it delivers:**
[Description of deliverables]

**Stories covered:**
- [Story ID]
- [Story ID]

**Dependencies:**
- [Dependency 1]

**Why it's second:**
[Rationale for priority]

---

### Increment 3 — [Name]

**What it delivers:**
[Description of deliverables]

**Stories covered:**
- [Story ID]

**Dependencies:**
- [Dependency 1]

**Why it's third:**
[Rationale for priority]

---

## 6. Future Considerations

<!-- Features and capabilities identified as valuable but not part of the current roadmap. These inform architectural decisions without expanding current scope. -->

### Reporting Infrastructure

**Status:** Out of Scope for Current Roadmap

**Rationale:** While the system architecture will support future reporting enhancements (as noted in requirements), full reporting capabilities are not included in the initial deliverables. The current epics focus on operational inventory management. However, the database schema and API design should accommodate future reporting features without requiring significant refactoring.

**Future Value:** Once basic inventory operations are stable, reporting will enable the business to analyze long-term trends, identify seasonal patterns, and optimize overall store performance.

---

## 7. Wireframes

<!-- Reference your draw.io screens here. Each wireframe should map back to specific stories — "this screen supports IM-01, IM-02, and IM-04." -->

### Wireframe: [Screen Name]

**File:** `[draw.io filename]`

**Description:**
[Brief description of what this screen does]

**Supports Stories:**
- [Story ID]
- [Story ID]
- [Story ID]

**Key Elements:**
- [Element 1]
- [Element 2]
- [Element 3]

---

### Wireframe: [Screen Name]

**File:** `[draw.io filename]`

**Description:**
[Brief description of what this screen does]

**Supports Stories:**
- [Story ID]
- [Story ID]

**Key Elements:**
- [Element 1]
- [Element 2]

---

## Appendix

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
| **SKU** | Stock Keeping Unit - a unique identifier for each product type |

---

*Last updated: [Date]*
