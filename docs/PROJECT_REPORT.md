# E-Commerce and Inventory Management System

**Backend Development Capstone Project — Option 4**

**Student / Team:** [Write your name(s)]  
**Roll Number(s):** [Write your roll number(s)]  
**Department / Semester:** [Write department and semester]  
**College / University:** [Write college or university]  
**Academic Session:** 2026–2027

## 1. Cover Page and Team Details

This report describes the backend design, core modules, implementation, testing approach and limitations of the E-Commerce and Inventory Management System. Add your own team details above before submitting it.

## 2. Abstract / Executive Summary

The project is a REST API designed for an online shopping platform. Customers can browse products, keep items in a cart, place orders and see their order history. Sellers can manage their own products and stock. Administrators can manage categories, user roles and overall order activity. The application is built with Node.js, Express.js, MongoDB and Mongoose. It uses bcrypt for password hashing, JSON Web Tokens for authentication, role-based permissions, Zod for request validation and Socket.IO for live notifications. The backend also provides aggregation reports for sales, stock values and popular products.

## 3. Problem Statement

Manual product and stock tracking can lead to errors, overselling and poor order visibility. A simple shop backend needs clear separation between customers, sellers and administrators. It should check stock at the time of purchase, calculate prices on the server, record order history and send useful notifications. The project provides these workflows through organized API endpoints rather than depending on a particular frontend.

## 4. Project Objectives

1. Create secure login and registration for customers and sellers with administrator management.
2. Build CRUD-style management for products, categories, cart items and permitted user/profile fields.
3. Validate product availability, price and order data on the backend.
4. Maintain stock without allowing negative quantities when buyers order simultaneously.
5. Generate stock and order-value reports through MongoDB aggregation.
6. Provide authenticated, role-scoped live notifications with Socket.IO.
7. Document and demonstrate the APIs in Postman.

## 5. Scope and Limitations

The application covers core product-to-order operations, role-based access, cart management, stock changes, cancellation, reporting and notifications. Payments are simulated and no banking data is handled. The project does not include a full storefront or commercial payment gateway. A failed multi-item checkout normally restores stock using compensating updates; this is not a replacement for an ACID transaction during process or database failures. Production use would require transactions, idempotency, background reconciliation, audit logging and additional deployment hardening.

## 6. Functional and Non-Functional Requirements

**Functional:** User registration/login/refresh/logout; profile maintenance; admin category management; seller product management; public product queries; customer cart; order placement/history/status transitions/cancellation; sales, inventory and best-seller reports; real-time order and low-stock notifications.

**Non-functional:** Protected routes, 15-minute access tokens, 7-day refresh tokens, server-side validation, consistent JSON responses, pagination, maintainable layered architecture, indexes for common queries, environment-variable configuration and meaningful HTTP status codes.

## 7. System Architecture and Module Description

The application uses an Express HTTP server with grouped routers. Validation and authentication run as middleware before controllers. Controllers coordinate with reusable services and Mongoose models. A central error handler returns clear JSON errors. The HTTP server hosts a Socket.IO server; internal events trigger the correct room-scoped socket notifications.

**Request flow:** Postman / Client → Express Route → Auth & Validation Middleware → Controller → Service & Model → MongoDB → JSON Response. Domain Event → EventEmitter Listener → Socket.IO Room → Authenticated Client.

Main modules are authentication, users, categories, products, cart, orders, reports and live events. Folder names in `src/` match these responsibilities.

## 8. Database Design (Collections, Schemas and Relationships)

The six collections are `users`, `refreshtokens`, `categories`, `products`, `carts` and `orders`. A product references its seller and category. A cart references a customer and product IDs. An order references a customer and embeds order-item snapshots containing product, seller, name, price, quantity and subtotal. Those snapshots preserve order prices if listings change later.

Indexes include unique user email, category slug and refresh token hash; product text search; compound indexes for product category/price and seller/stock; order customer/createdAt and seller/createdAt; and a TTL index on token expiry. Full schema descriptions are in `DATABASE_DESIGN.md`.

## 9. REST API Documentation

The API root is `/api`. Authentication uses `/api/auth`, profiles and admin users use `/api/users`, product and category operations use `/api/products` and `/api/categories`, customer carts use `/api/cart`, orders use `/api/orders`, and aggregation endpoints use `/api/reports`. Full endpoint methods, roles, request samples and error codes appear in `API_GUIDE.md` and the supplied Postman collection.

## 10. Authentication and Authorization Design

Passwords are hashed using bcrypt with 12 rounds. On login, the server returns a short-lived access token and a refresh token. Only a SHA-256 hash of the refresh token is saved in MongoDB. Refresh requests invalidate the previous token and create a new pair; logout invalidates the presented refresh token. Middleware verifies access tokens, loads the current account and rejects disabled users. Roles are customer, seller and administrator. Sellers may modify only their products. Customers manage only their cart and see only their orders. Reports and socket rooms enforce appropriate access restrictions.

## 11. Implementation Details

Product listings support full creation, retrieval, updates and archiving. Product queries provide search, filtering, pagination and sorting. Cart totals are recalculated using current product prices. During checkout, the server locks one customer's cart, rechecks the items and decrements stock with conditional atomic MongoDB updates that require sufficient inventory. It then records the order and clears the cart. Cancellations restore quantities according to allowed order-status transitions. Orders store the simulated payment state explicitly. Aggregation pipelines calculate grouped daily order value, inventory totals by category and best-selling products.

Node.js EventEmitter separates domain actions from their notification behavior. The listener publishes order and low-stock messages through Socket.IO to authenticated customer, seller or admin rooms.

## 12. Testing Strategy and Test Cases

Static JavaScript syntax checks were run across the project. Four Node.js unit tests for monetary calculations and order-status transitions passed. A 47-request Postman collection is included for API and database-backed testing. The supplied tests cover positive creation and retrieval, malformed fields, unknown resources, unauthenticated access, forbidden roles, duplicate categories, insufficient stock and invalid status changes. Live database-backed Postman requests and Socket.IO events must be run on the student's own environment and screenshots saved as evidence before marking them passed.

## 13. Screenshots / Demonstration Evidence

Insert your own screenshots here after running the project:

1. VS Code terminal showing MongoDB connection and server start.
2. Postman login response with sensitive tokens hidden in the screenshot.
3. Product creation and product-list response.
4. Customer cart, order creation and order detail.
5. Inventory and sales aggregation output.
6. Negative request showing a 401 / 403 / 409 response.
7. Live Socket.IO notification from the demo page.

## 14. Conclusion and Future Enhancements

This capstone demonstrates a layered Node.js backend that connects REST APIs with database relationships, validation, security, inventory logic, aggregation and live notifications. Future improvements could include multi-document MongoDB transactions, idempotent checkout and cancellation, granular multi-seller fulfillment, order audit logs, automated integration tests, production monitoring, persistent notification history and an optional frontend.

## 15. References

- Backend Development Capstone Project Assignment, Project 4, provided course document.
- Node.js Documentation: https://nodejs.org/docs/latest/api/
- Express Documentation: https://expressjs.com/
- MongoDB Documentation: https://www.mongodb.com/docs/
- Mongoose Documentation: https://mongoosejs.com/docs/
- Socket.IO Documentation: https://socket.io/docs/v4/
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
