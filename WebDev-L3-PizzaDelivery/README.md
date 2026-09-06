# 🍕 Pizza Delivery Full-Stack Application

A MERN-stack pizza ordering + inventory management platform with separate User and Admin roles,
Razorpay test-mode payments, order status tracking (via polling), and automated low-stock email
alerts (immediate + hourly cron sweep).

## Folder structure

```
pizza-delivery-app/
├── backend/                 Node.js + Express + MongoDB API
│   ├── config/db.js
│   ├── models/               User, Admin, Order, Inventory
│   ├── controllers/          authController, orderController, inventoryController
│   ├── routes/                authRoutes, orderRoutes, inventoryRoutes
│   ├── middleware/auth.js    JWT auth (role-aware: user / admin)
│   ├── jobs/stockCheckCron.js  hourly node-cron low-stock sweep
│   ├── utils/sendEmail.js, seedAdmin.js, seedInventory.js
│   ├── server.js
│   └── .env.example
└── frontend/                 React app (Create React App)
    ├── src/pages/user/        Register, Login, ForgotPassword, ResetPassword,
    │                          VerifyEmail, Dashboard, PizzaBuilder, OrderSummary
    ├── src/pages/admin/       AdminLogin, AdminDashboard, InventoryManagement,
    │                          OrderManagement
    ├── src/components/        ProtectedRoute, StatusTracker
    ├── src/context/AuthContext.js
    ├── src/api/axios.js
    └── .env.example
```

## How each checklist item is implemented

| Feature | Where |
|---|---|
| Registration + email verification | `authController.register` + `verifyEmail`, emailed link via nodemailer |
| JWT login | `authController.login`, `middleware/auth.js` |
| Forgot/reset password | `authController.forgotPassword/resetPassword`, emailed reset link, 1h expiry |
| Pizza dashboard | `pages/user/Dashboard.js`, polls `/api/orders/mine` every 8s |
| 4-step pizza builder (base/sauce/cheese/veg) | `pages/user/PizzaBuilder.js`, options pulled live from `/api/inventory/public` |
| Order summary + Razorpay checkout (test mode) | `pages/user/OrderSummary.js` + `orderController.createPaymentOrder` / `verifyAndPlaceOrder` |
| Order status: Order Received → In Kitchen → Sent to Delivery | `Order.status` enum, updated by admin, polled by user dashboard |
| Separate admin login (no public admin signup) | `pages/admin/AdminLogin.js` + `/api/auth/admin/login`; admins created only via `backend/utils/seedAdmin.js` |
| Inventory dashboard (bases/sauces/cheeses/veg stock) | `pages/admin/InventoryManagement.js` + `/api/inventory` |
| Auto stock decrement per order | `inventoryController.decrementStockForOrder`, called after payment verification |
| Manual stock update | `InventoryManagement.js` "Save" per row → `PUT /api/inventory/:id` |
| Low-stock email alert, configurable threshold | Immediate check in `decrementStockForOrder` **and** hourly `node-cron` job in `jobs/stockCheckCron.js`; threshold is per-item (`lowStockThreshold` field, editable) |
| Admin order management + status updates | `pages/admin/OrderManagement.js` + `PUT /api/orders/:id/status` |
| Status change reflected on user dashboard | User dashboard polls every 8s (simple, reliable "real-time-ish" approach; see note below on WebSockets) |

> **Note on "real-time":** this implementation uses polling (every 8s) rather than WebSockets/Socket.io,
> since it needs no extra infrastructure and is simple to reason about. If you want true push updates,
> swap the polling `useEffect` in `Dashboard.js` / `OrderManagement.js` for a `socket.io-client` listener
> and add `socket.io` to the backend — the REST endpoints don't need to change.

---

## Prerequisites

- Node.js 18+ and npm
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string
- A Razorpay account in **Test Mode** (free) — https://dashboard.razorpay.com/ → Settings → API Keys
- An SMTP account for sending emails — easiest is a **Gmail App Password**
  (Google Account → Security → 2-Step Verification → App Passwords)

---

## Setup steps

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in:
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — any long random string
- `SMTP_USER` / `SMTP_PASS` — your email + app password
- `ADMIN_NOTIFY_EMAIL` — where low-stock alerts should go
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — from Razorpay Dashboard, **Test Mode**
- `LOW_STOCK_THRESHOLD` — default threshold (individual items can also be edited later from the admin UI)

Seed the database:

```bash
node utils/seedInventory.js
node utils/seedAdmin.js "Admin Name" admin@example.com StrongPass123
```

Start the API:

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

The API runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
- `REACT_APP_API_URL=http://localhost:5000/api`
- `REACT_APP_RAZORPAY_KEY=` your Razorpay **Key ID** (same as backend, this one is safe to expose client-side)

Start the app:

```bash
npm start
```

Opens `http://localhost:3000`.

### 3. Try it out

1. Go to `/register`, sign up, then check your email (or backend console log if SMTP isn't configured
   yet) for the verification link.
2. Log in at `/login`, click **Build a Pizza**, walk through the 4 steps, review on `/order-summary`.
3. Click **Pay with Razorpay** — this opens Razorpay's **test-mode checkout widget**. Use any Razorpay
   test card (e.g. `4111 1111 1111 1111`, any future expiry, any CVV) or just click the widget's
   **Success** button in test mode to simulate a successful payment.
4. After payment, you're returned to the dashboard — the order appears with status "Order Received".
5. Go to `/admin/login`, sign in with the admin account you seeded, open the **Orders** tab, and move
   the order through "In Kitchen" → "Sent to Delivery". Watch it update on the user dashboard within ~8s.
6. In the **Inventory** tab, manually edit a stock value below its threshold and save — an email
   alert fires immediately. The `node-cron` job additionally sweeps all inventory every hour as a
   safety net.

---

## Deployment notes (optional next step)

- Backend: deploy to Render/Railway/Fly.io, set the same env vars there, point `MONGO_URI` to Atlas.
- Frontend: `npm run build` then deploy the `build/` folder to Vercel/Netlify, set `REACT_APP_API_URL`
  to your deployed backend URL.
- Switch Razorpay to live keys only after full testing — test and live keys are not interchangeable.
- For production, add rate-limiting (`express-rate-limit`) on auth routes and a proper logging/monitoring
  setup — not included here to keep the reference implementation focused on the checklist.
