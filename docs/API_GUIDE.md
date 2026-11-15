# REST API and testing guide

Base URL: `http://localhost:5000`. Content-Type: `application/json`. Authenticated requests use `Authorization: Bearer <accessToken>`. Responses use `{ "success": true, "data": ... }` or `{ "success": false, "message": ... }` (with optional validation errors).

## Endpoints

| Method | Route | Role | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Check server |
| POST | `/api/auth/register` | Public | Register customer or seller |
| POST | `/api/auth/login` | Public | Receive access and refresh tokens |
| POST | `/api/auth/refresh` | Public with refresh token | Rotate refresh token |
| POST | `/api/auth/logout` | Public with refresh token | Revoke refresh token |
| GET | `/api/users/me` | Any logged-in user | Current user profile |
| PATCH | `/api/users/me` | Any logged-in user | Change display name |
| GET | `/api/users` | Admin | Paginated user list |
| PATCH | `/api/users/:id/role` | Admin | Update user role and optional active flag |
| GET | `/api/categories` | Public | All categories |
| GET | `/api/categories/:id` | Public | Category detail |
| POST | `/api/categories` | Admin | Add category |
| PATCH | `/api/categories/:id` | Admin | Rename category |
| DELETE | `/api/categories/:id` | Admin | Delete unused category |
| GET | `/api/products` | Public | Search, filter, sort, paginate |
| GET | `/api/products/:id` | Public | Active product detail |
| POST | `/api/products` | Seller, admin | Add product |
| PATCH | `/api/products/:id` | Owner seller, admin | Update details |
| PATCH | `/api/products/:id/stock` | Owner seller, admin | Increase/decrease stock atomically |
| DELETE | `/api/products/:id` | Owner seller, admin | Archive product |
| GET | `/api/cart` | Customer | Retrieve own cart and calculated total |
| POST | `/api/cart/items` | Customer | Add product quantity |
| PATCH | `/api/cart/items/:productId` | Customer | Set cart quantity |
| DELETE | `/api/cart/items/:productId` | Customer | Remove item |
| DELETE | `/api/cart` | Customer | Empty cart |
| POST | `/api/orders` | Customer | Checkout current cart with address |
| GET | `/api/orders` | Logged-in users | Role-scoped order history |
| GET | `/api/orders/:id` | Authorized user | Order detail |
| PATCH | `/api/orders/:id/status` | Authorized user | Change status using transition rules |
| POST | `/api/orders/:id/cancel` | Authorized user | Cancel eligible order |
| GET | `/api/reports/sales` | Seller, admin | Date-wise order-value aggregation |
| GET | `/api/reports/inventory` | Seller, admin | Category inventory aggregation |
| GET | `/api/reports/best-sellers` | Seller, admin | Best-selling products aggregation |

## Example payloads

Register customer:

```json
{"name":"Test Customer","email":"testcustomer@example.com","password":"StrongPass123","role":"customer"}
```

Login:

```json
{"email":"customer@capstone.test","password":"Customer@12345"}
```

Add product (as seller):

```json
{"name":"Wireless Mouse","description":"Comfortable wireless mouse","price":799,"stock":15,"category":"<categoryId>","lowStockThreshold":4}
```

Add to cart (as customer):

```json
{"productId":"<productId>","quantity":2}
```

Checkout (as customer):

```json
{"address":{"fullName":"Demo Customer","line1":"14 Example Road","city":"Gurugram","state":"Haryana","postalCode":"122001","phone":"9876543210"}}
```

Change order status (as seller for a single-seller order):

```json
{"status":"processing"}
```

Product query examples:

- `/api/products?page=1&limit=10&sort=price_asc`
- `/api/products?q=cable`
- `/api/products?category=<categoryId>`
- `/api/orders?status=placed&page=1`
- `/api/reports/sales?from=2026-01-01&to=2026-12-31`

## HTTP statuses and security tests

| Test | Expected |
| --- | --- |
| Successful creation | 201 |
| Successful query, update or deletion | 200 |
| Missing product name/negative price | 400 |
| Invalid MongoDB ObjectId | 400 |
| Unknown valid product ID | 404 |
| Missing/invalid access token on `/api/cart` | 401 |
| Customer attempts to create a product | 403 |
| Seller attempts to add an admin-only category | 403 |
| Duplicate category slug or user email | 409 |
| Cart requests more units than stock | 409 |
| Seller changes another seller's product | 403 |
| Invalid order transition, e.g. placed → delivered | 409 |
| Second cancellation of the same order | 409 |
| Using a previously rotated refresh token | 401 |

The supplied Postman collection includes both normal workflow requests and negative/authorization examples. Screenshots demonstrating actual successful and failing requests should be captured on your laptop for submission.

## Real-time protocol

Connect to Socket.IO at `http://localhost:5000` using `{ auth: { token: "<accessToken>" } }`. The server authenticates the JWT and joins the client to `user:<id>`, or `role:admin` for administrators. Event payloads include order IDs and status values, or low-stock product IDs and quantities. These rooms avoid sharing one customer's order details with another customer.

## Execution flow for viva

`POST /api/orders` → router authenticates customer → Zod validates address → controller calls checkout service → Mongoose queries cart and products → atomic stock updates → creates Order → clears cart → emits internal EventEmitter event → Socket.IO sends scoped notification → Express returns JSON with status 201.
