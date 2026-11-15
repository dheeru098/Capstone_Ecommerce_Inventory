# E-Commerce and Inventory Management System

Backend Development Capstone Project — Project 4

A REST API for customers, sellers and administrators. It runs on Node.js, Express.js, MongoDB and Mongoose. The code is arranged into routes, controllers, services, middleware and models. You can test the APIs with Postman; no frontend is required.

## Included features

- Customer and seller registration and login
- Password hashing with bcrypt and JWT access/refresh token rotation
- Administrator account creation through the seed script and role-based access rules
- Product and category management, product search, filters, sorting and pagination
- Customer shopping cart with server-calculated item totals
- Order creation, order histories, order-status transitions and cancellation
- Atomic conditional stock decrements that never allow a negative stock value
- Low-stock alerts, real-time order notifications, EventEmitter and Socket.IO
- MongoDB aggregations: sales by date, inventory by category, top-selling products
- Central error handling, input validation and environment-based configuration
- Sample accounts, sample products and a Postman collection

## What you need on Windows

1. Node.js 20 or later.
2. VS Code.
3. Postman.
4. **MongoDB**, either a local MongoDB Community Server or a MongoDB Atlas database. VS Code and Postman do not contain a MongoDB server.

## Start in VS Code

1. Unzip this folder, open **Capstone_Ecommerce_Inventory** in VS Code and open Terminal > New Terminal.
2. Run `npm install`.
3. Copy `.env.example` to `.env`. In PowerShell use `Copy-Item .env.example .env`.
4. Open `.env` and enter your MongoDB connection string and two different JWT secrets with at least 32 characters each.
5. Start MongoDB locally, or use a MongoDB Atlas connection string if you do not have a local server.
6. Run `npm run seed` to add the example users, categories and products.
7. Run `npm run dev` to start the API.
8. Visit `http://localhost:5000/api/health`; it should show a JSON success response.

### Copy/paste terminal commands

```powershell
npm install
Copy-Item .env.example .env
npm run seed
npm run dev
```

Edit `.env` **before** running seed. With a local MongoDB installation on the default port, the example URI may work as written. With Atlas, replace `MONGO_URI` with the connection string shown by Atlas. Replace all example secrets and demo passwords before sharing or deploying the project.

### Sample logins after seeding

| Role | Email | Initial password from `.env.example` |
| --- | --- | --- |
| Admin | `admin@capstone.test` | `Admin@12345` |
| Seller | `seller@capstone.test` | `Seller@12345` |
| Customer | `customer@capstone.test` | `Customer@12345` |

These credentials are for local academic demonstrations. The seed script reads passwords from `SEED_*_PASSWORD` variables in `.env`, so they can be changed without editing source code. Running seed again resets the three demo user passwords to the current environment values.

## Test with Postman

1. Import `postman/Capstone_Inventory.postman_collection.json`.
2. Import `postman/Capstone_Local.postman_environment.json` and select **Capstone Local**.
3. Start the server, then send **Health Check**.
4. Run **Login Customer**, **Login Seller**, and **Login Admin** to save three access tokens automatically.
5. Run **List Products**, or **Create Product (Seller)** if you want a new product. The collection saves a usable `productId` automatically.
6. Use **Add to Cart (Customer)**, **View Cart**, then **Place Order (Customer)**.
7. Use **My Orders (Customer)**, **Update Order to Processing (Seller)**, **Update Order to Shipped (Seller)**, **Update Order to Delivered (Seller)**, and the report endpoints.
8. Send the validation and unauthorized tests to demonstrate expected `400`, `401`, `403`, `404`, or `409` errors.

Postman scripts save the access tokens and IDs to the selected environment when the corresponding requests succeed. The requests include sample bodies and status assertions. See `docs/API_GUIDE.md` for the complete endpoint guide and test checklist.

## Live events demo

Open `demo/socket-demo.html` in a browser. In Postman, log in as customer or seller, then copy the **accessToken** from the response or environment and paste it into the demo page. Connect and create/update an order through Postman. Events available to the appropriate logged-in user are:

- `connection:ready`
- `order:placed`
- `order:new`
- `order:status`
- `inventory:low`

The socket handshake authenticates a JWT access token; clients are added only to their own user room or the administrator room. Internal EventEmitter events are `order.placed`, `order.status`, and `stock.low`.

## Database models and relationships

`User` (customer/seller/admin) → `Product` (seller), `Cart` (customer), `Order` (customer). `Product` references `Category`. `Order.items` records the associated product and seller plus name, unit price, quantity and subtotal snapshots. `RefreshToken` stores only hashed refresh-token values, associated users and expiry dates. Inactive products are archived rather than hard-deleted.

Indexes include unique emails, categories and refresh-token hashes, a product text index, compound category/price and seller/stock indexes, order customer/date and seller/date indexes, and refresh-token expiry TTL.

## Security and business rules

- Public registration allows only customer or seller roles. An administrator comes from the seed script or can update roles through an admin-only route.
- Password hashes are not returned by authentication responses, and passwords are never stored as plain text.
- Only an owner seller or administrator can modify a product.
- Customers can manage only their own cart and view only their own orders.
- A seller can view orders containing their products but can change an order's status only if all its items belong to that seller. An administrator may change mixed-seller orders.
- Customers can cancel only an order in the `placed` state. Status changes follow `placed → processing → shipped → delivered`, with cancellation permitted from `placed` or `processing` by the authorized party.
- Product price and available stock are verified on the server at checkout. A conditional database update prevents any single product's stock from going below zero.
- Failed multi-item checkout attempts restore already-decremented quantities when the process is still running. For strict crash-proof, multi-document atomicity in production, use MongoDB transactions on a replica set and an idempotency key. This academic version intentionally avoids requiring a replica set.
- Payment is a simulated status only. This project never collects card details or processes real money.

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the API with file watching |
| `npm start` | Start the API normally |
| `npm run seed` | Add/update example accounts, categories and products |
| `npm test` | Run Node.js helper tests |
| `npm run check` | Check syntax of every JavaScript source file |

## Files to submit

- The source project folder, excluding `node_modules` and `.env`
- This README and `docs/API_GUIDE.md`
- `docs/DATABASE_DESIGN.md`
- The Postman collection and local environment (environment has no real credentials)
- `docs/PROJECT_REPORT.md` and `docs/Project_Report.docx`
- Screenshots you take after actually running the API, and the Git repository link after you create it

The supplied Word report has placeholders for your name, team, department and screenshots. Fill these in using your own actual testing evidence. For the viva, understand each route and be ready to explain the flow from route to controller to model to MongoDB and back to the response.

## Known limits

This is a backend assignment, not an online commercial shop. It does not include real payment processing, image uploads, a deployment pipeline, multi-vendor per-item fulfillment, refunds or an automated background recovery worker. It uses compensating stock restoration for a failed checkout, not a MongoDB multi-document transaction. In unusual circumstances such as the server losing power during checkout or during cancellation, manual stock/order reconciliation may be necessary. It is suitable as a local educational implementation and should be hardened further before any real-world deployment.
