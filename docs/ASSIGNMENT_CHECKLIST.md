# Capstone assignment coverage checklist

Chosen assignment: **Project 4 — E-Commerce and Inventory Management System**.

| Assignment requirement | Project implementation / evidence |
| --- | --- |
| Node.js and Express REST API | `src/app.js`, `src/server.js`, `src/routes/` |
| MVC or layered architecture | `src/routes/`, `src/controllers/`, `src/services/`, `src/models/` |
| MongoDB and Mongoose | `src/config/db.js`, `src/models/` |
| CRUD of major entities | `categoryController.js`, `productController.js`, `cartController.js`, `orderController.js`, `userController.js` |
| Consistent JSON responses and HTTP codes | All controllers and `src/middleware/error.js` |
| Request validation and logging | `src/validators/schemas.js`, `src/middleware/validate.js`, `morgan` in `src/app.js` |
| Centralized error handling | `src/middleware/error.js` |
| bcrypt password hashing | `src/controllers/authController.js`, `scripts/seed.js` |
| JWT authentication and access/refresh tokens | `src/utils/tokens.js`, `src/services/authService.js`, `src/middleware/auth.js` |
| Role-based access control | Route-level guards and record-level ownership checks |
| dotenv and protected secrets | `.env.example`, `.gitignore`, `src/config/db.js` |
| Two meaningful MongoDB aggregation pipelines | Three report aggregations in `src/controllers/reportController.js` |
| At least two suitable indexes | Product search and compound indexes, order history, user email, TTL tokens in `src/models/` |
| EventEmitter | `src/utils/events.js` and event emissions in services/controllers |
| Socket.IO real-time notifications | `src/server.js`, `src/utils/events.js`, `demo/socket-demo.html` |
| Positive/negative Postman coverage | `postman/Capstone_Inventory.postman_collection.json` (47 requests) |
| Sample data or seed script | `scripts/seed.js` |
| Documentation and project report | `README.md`, `docs/API_GUIDE.md`, `docs/DATABASE_DESIGN.md`, `docs/Project_Report.docx` |
| Demonstration | `docs/WINDOWS_SETUP.md`, Postman requests, browser socket demo |
| Git repository and meaningful commit history | Create your own repository and commits after running and reviewing the work |
| Screenshots from a real demonstration | Add your screenshots in the report after running your local database and API |

## Notes to explain in the viva

**Why not use a real payment gateway?** The assignment explicitly permits simulated payments. All order payment fields are labeled `simulated`.

**How is overselling prevented?** Checkout uses an atomic `findOneAndUpdate` that only reduces stock when the database value is high enough. It cannot make a product's stock negative. A failure during a multi-item checkout initiates compensating updates; true crash-atomic multi-document transactions would be a production improvement.

**Why does order cancellation have restrictions?** Cancellation is permitted only from placed or processing states, and only authorized users may request it. This avoids accidentally restoring stock twice or cancelling delivered orders.

**Why does EventEmitter exist when Socket.IO also exists?** EventEmitter is used internally to publish domain events; Socket.IO delivers those events in real time to connected authenticated users.

**How are roles enforced?** Both route middleware and per-record checks enforce the permissions. Hiding a button in the frontend would not provide this security.
