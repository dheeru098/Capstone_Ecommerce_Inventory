# Database design

Database: `capstone_shop` (or your database name in `MONGO_URI`). All application data is stored using MongoDB collections and Mongoose schemas.

| Collection | Main fields | Relationships | Important indexes |
| --- | --- | --- | --- |
| users | name, email, passwordHash, role, isActive | Seller owns products; customer owns carts/orders | email unique; role + createdAt |
| refreshtokens | user, tokenHash, expiresAt | user → users | tokenHash unique; user; expiresAt TTL |
| categories | name, slug | category referenced by products | slug unique |
| products | name, description, price, stock, category, seller, isActive, lowStockThreshold | seller → users; category → categories | text name/description; category + price; seller + stock |
| carts | customer, items[{product, quantity}], checkoutLocked | customer → users; item → products | customer unique |
| orders | customer, items with price snapshots, address, total, status, paymentMode, paymentStatus | customer → users; items refer to products and sellers | customer + createdAt; items.seller + createdAt; status + createdAt |

## Relationship diagram

```text
Users (seller) ----< Products >---- Categories
Users (customer) -- Cart ----< Cart items >---- Products
Users (customer) --< Orders ----< Order items >---- Products
Users ------------< Refresh tokens
```

## Index and aggregation choices

The product text index helps users search item names/descriptions. The product category+price index supports filtered listings, while seller+stock helps owner inventory views. The order customer+date and item seller+date indexes support order histories. The refresh-token TTL index removes expired token records.

Three aggregation reports are included. `GET /api/reports/sales` groups non-cancelled order items by day, counting distinct orders and summing units and item values. `GET /api/reports/inventory` groups products by category and calculates stock, low-stock counts and value. `GET /api/reports/best-sellers` unwinds order items and ranks products by units ordered. A seller sees only their own products/order items in reports; the administrator sees the full database.

## Consistency

The item price stored in each order is a snapshot, so product price changes cannot alter old order totals. Conditional atomic stock updates require stock to be at least the purchased quantity and prevent negative stock values even if two orders compete for the last unit. Cart checkout uses a per-customer lock. A failed purchase normally compensates earlier stock decrements. See README for the crash-consistency limitation and production transaction recommendation.
