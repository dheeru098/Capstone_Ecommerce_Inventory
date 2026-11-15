# Windows laptop setup, step by step

## 1. Check software

Open PowerShell in VS Code. Type `node -v` and `npm -v`. If either is missing, install the official Node.js LTS release and restart VS Code. Keep Postman ready for API calls.

## 2. Make sure MongoDB is available

This project needs a MongoDB database. You can install MongoDB Community Server and use the default local connection `mongodb://127.0.0.1:27017/capstone_shop`. Alternatively, create a MongoDB Atlas database, allow your laptop's IP address in Atlas network access settings, create a database user and copy its connection URI to `.env`.

Do not paste a database password in a public Git repository, screenshot or chat. The `.env` file is excluded from Git.

Official resources:

- https://www.mongodb.com/try/download/community
- https://www.mongodb.com/products/platform/atlas-database

## 3. Start the backend

Open the project folder in VS Code, then run these lines one at a time:

```powershell
npm install
Copy-Item .env.example .env
```

Edit the `.env` file in VS Code. Set `MONGO_URI` and change `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to long, different strings. Then run:

```powershell
npm run seed
npm run dev
```

The terminal should show MongoDB connected and the API address. If it cannot connect to MongoDB, check that the database server is started or Atlas network credentials and IP access are correct.

## 4. Verify the health endpoint

Open `http://localhost:5000/api/health` in your browser. An expected response is:

```json
{"success":true,"message":"Capstone API is running"}
```

## 5. Test the endpoints with Postman

Import both JSON files from the `postman` directory. Select the **Capstone Local** environment. Send Health Check, then the three login requests. They save tokens automatically. Send List Categories and List Products, then add a product to the cart and place an order. Follow the order-status steps under folder 03.

You can also use folder 04 to show a forbidden request, an invalid input and a missing resource. Save screenshots from your own working API for the assignment report. Refresh tokens are available in folder 05 when access tokens need renewal.

## 6. Show real-time communication

Log in to Postman, copy the access token for the role you are demonstrating and open `demo/socket-demo.html`. Paste the token and click Connect. Update an order from Postman. You should see the scoped order status event on the page. To show stock alerts, reduce a seller's product stock to or below its threshold.

## 7. Prepare the submission

Read `docs/Project_Report.docx`, replace the placeholders with your own details, and add screenshots of the real API responses. Do not submit `.env`, `node_modules`, MongoDB connection passwords or live access tokens. Be ready to explain one complete route-to-database request in your viva.
