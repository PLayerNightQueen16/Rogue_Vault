# RØUGE Vault

### _Shop Beyond Ordinary_

RØUGE Vault is a full-stack MERN e-commerce application with a dark, premium aesthetic. It offers product browsing sourced from the [DummyJSON](https://dummyjson.com) catalog, per-user shopping carts and wishlists, a full checkout flow with [Razorpay](https://razorpay.com) test-payment integration, and JWT-based authentication via HTTP-only cookies.

---

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Installation and Local Setup](#installation-and-local-setup)
6. [Environment Variables](#environment-variables)
7. [Authentication and Security](#authentication-and-security)
8. [API Overview](#api-overview)
9. [Deployment Guide](#deployment-guide)
10. [Testing and Build](#testing-and-build)
11. [Troubleshooting](#troubleshooting)
12. [Future Improvements](#future-improvements)
13. [License](#license)

---

## Features

### Implemented and verified

| Feature | Details |
|---|---|
| **Product browsing** | Full catalog from DummyJSON; grid layout with product cards |
| **Product details** | Individual product page with images, description, brand, stock, rating, warranty, shipping, and return policy |
| **Search** | Live search across product name, description, and brand |
| **Category filtering** | Filter by subcategory (e.g. smartphones, laptops) or grouped categories (e.g. Electronics, Beauty) |
| **Deals page** | Curated discounted products with animated Matrix-rain sale overlay |
| **User registration** | Email, name, phone, password (bcrypt, min 6 chars); returns JWT cookie |
| **User login / logout** | Email + password authentication; HTTP-only cookie session |
| **Shopping cart** | Add, update quantity, remove items; stock-validated server-side |
| **Wishlist** | Add, remove, and toggle wishlist items per user |
| **Checkout** | Shipping address form; server computes totals from DB — frontend prices are never trusted |
| **Razorpay payments** | Razorpay test-mode payment modal; HMAC-SHA256 signature verification on the backend |
| **Order creation** | Order saved to MongoDB on verified payment; cart cleared automatically |
| **Order history** | Per-user order list and individual order detail pages |
| **Dark premium UI** | Tailwind CSS v4, Outfit font, dark theme, glassmorphism cards |
| **Matrix-rain background** | Animated canvas overlay with sale/discount tokens (`%`, `SALE`, `DEAL`) |

### Not yet implemented

- Admin panel or product management interface
- Live inventory sync (stock is a snapshot from DummyJSON at first product resolution)
- Real-money / production Razorpay integration (currently test mode only)
- Email notifications or order confirmation emails
- Product reviews / ratings from users

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | ^19 | UI framework |
| Vite | ^8 | Build tool and dev server |
| React Router DOM | ^7 | Client-side routing |
| Tailwind CSS | ^4 | Utility-first styling |
| Axios | ^1 | HTTP client (API calls to backend) |
| Lucide React | ^1 | Icon library |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥18 recommended | Runtime |
| Express | ^5 | Web framework |
| Mongoose | ^9 | MongoDB ODM |
| jsonwebtoken | ^9 | JWT signing and verification |
| bcrypt | ^6 | Password hashing |
| cookie-parser | ^1 | HTTP-only cookie support |
| cors | ^2 | Cross-origin request configuration |
| dotenv | ^17 | Environment variable loading |
| Razorpay Node SDK | ^2 | Payment order creation |
| nodemon | ^3 | Dev server auto-restart |

### Infrastructure

- **Database:** MongoDB Atlas (cloud) or any MongoDB instance
- **External catalog API:** [DummyJSON](https://dummyjson.com/products) — product data source for browsing
- **Payments:** Razorpay (test mode)

---

## Project Structure

```
shop_kart_mern/
├── client/                        # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── axiosCalls/
│   │   │   └── axios.js           # Axios instance (reads VITE_API_URL)
│   │   ├── components/
│   │   │   ├── AuthRequiredModal.jsx
│   │   │   ├── CategoryBar.jsx
│   │   │   ├── FlashVaultBanner.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── Logo.jsx
│   │   │   ├── MatrixRainBackground.jsx  # Animated canvas sale overlay
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── TrendingSection.jsx
│   │   ├── constants/
│   │   │   └── categories.js      # Category groups and DummyJSON slug map
│   │   ├── context/
│   │   │   └── CartContext.jsx    # Global cart state
│   │   ├── pages/
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Deals.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── OrderSuccess.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Wishlist.jsx
│   │   ├── services/
│   │   │   └── api.js             # All API call functions
│   │   ├── App.jsx                # Router and layout shell
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├── server/                        # Express backend
│   ├── controllers/
│   │   ├── cart.controller.js
│   │   ├── customer.controller.js
│   │   ├── order.controller.js
│   │   ├── product.controller.js
│   │   └── wishlist.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js     # JWT verification via HTTP-only cookie
│   ├── models/
│   │   ├── customer.model.js      # Embedded cart and wishlist refs
│   │   ├── order.model.js
│   │   └── product.model.js      # Includes dummyId for stable DummyJSON mapping
│   ├── routes/
│   │   ├── cart.routes.js
│   │   ├── customer.routes.js
│   │   ├── order.routes.js
│   │   ├── product.routes.js
│   │   └── wishlist.routes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── index.js                   # App entry — env validation, CORS, DB, routes
│   ├── test_labs.js               # 20-test automated backend suite
│   ├── .env                       # ⚠️  Not committed — see .env.example
│   ├── .env.example
│   └── package.json
│
├── .gitignore                     # Excludes .env, node_modules, dist
└── README.md
```

---

## Prerequisites

| Requirement | Notes |
|---|---|
| **Node.js ≥ 18** | Check with `node -v` |
| **npm ≥ 9** | Bundled with Node 18+ |
| **MongoDB Atlas account** | Or a local MongoDB instance |
| **Razorpay account** | Required for payment testing; test-mode credentials are free |
| **Git** | For cloning the repository |

---

## Installation and Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/shop_kart_mern.git
cd shop_kart_mern
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure backend environment variables

```bash
cp .env.example .env
# Open .env and fill in all values — see Environment Variables section below
```

### 4. Install frontend dependencies

```bash
cd ../client
npm install
```

### 5. Configure frontend environment variables

```bash
cp .env.example .env
# For local development the default value (http://localhost:8000/) is correct
# No changes needed unless your backend runs on a different port
```

### 6. Start the backend (Terminal 1)

```bash
cd server
npm run dev
# Server starts on http://localhost:8000
# Expected output: Server started on port 8000 [NODE_ENV=development]
#                  DB Connected!
```

### 7. Start the frontend (Terminal 2)

```bash
cd client
npm run dev
# Vite starts on http://localhost:5173
```

### 8. Open the application

Navigate to **http://localhost:5173** in your browser.

---

## Environment Variables

### Backend — `server/.env`

> ⚠️ **Never commit `.env` to Git.** The root `.gitignore` already excludes it.
> Copy `server/.env.example` and fill in real values.

```env
# ─── Database ────────────────────────────────────────────────────────────────
dbUrl=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0

# ─── Security ─────────────────────────────────────────────────────────────────
# Generate with: node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
# Must be at least 32 bytes (64 hex chars) of random entropy.
JWT_SECRET=replace_with_a_64_char_random_hex_string

# ─── Razorpay ─────────────────────────────────────────────────────────────────
razorpay_id=rzp_test_your_test_key_id
razorpay_secret=your_test_key_secret

# ─── Runtime ──────────────────────────────────────────────────────────────────
PORT=8000          # Optional; defaults to 8000 if not set
NODE_ENV=development

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Comma-separated production frontend URLs (leave empty for local dev)
ALLOWED_ORIGINS=
```

| Variable | Required | Description |
|---|---|---|
| `dbUrl` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Cryptographically random secret for JWT signing (≥32 bytes entropy) |
| `razorpay_id` | ✅ | Razorpay Key ID (test or live) |
| `razorpay_secret` | ✅ | Razorpay Key Secret — **backend only, never expose to frontend** |
| `PORT` | Optional | Server port; defaults to `8000` |
| `NODE_ENV` | Recommended | Set to `production` on deployment host |
| `ALLOWED_ORIGINS` | Production | Comma-separated list of allowed frontend origin URLs |

### Frontend — `client/.env`

```env
# Backend API base URL — must end with a trailing slash
# Leave as-is for local development
VITE_API_URL=http://localhost:8000/

# In production, set this in your hosting provider's environment settings:
# VITE_API_URL=https://your-backend-api.onrender.com/
```

> ⚠️ `VITE_` variables are bundled into the client JavaScript and **visible to anyone** who visits the site.
> Never store `JWT_SECRET`, `razorpay_secret`, `dbUrl`, or any other private credential in a `VITE_` variable.

---

## Authentication and Security

### How it works

1. **Register / Login** — the server validates credentials, signs a JWT with `JWT_SECRET`, and sends it as an `httpOnly` cookie.
2. **Authenticated requests** — the browser automatically sends the cookie; the `isAuthenticated` middleware verifies the JWT on every protected route.
3. **Logout** — the server clears the cookie with matching attributes.
4. **Session expiry** — tokens expire after **10 days**.

### Cookie settings

| Environment | `secure` | `sameSite` |
|---|---|---|
| Development | `false` | `lax` |
| Production (`NODE_ENV=production`) | `true` | `none` |

`sameSite: 'none'` is required when the frontend and backend are on different domains (standard for most deployment setups). `secure: true` is required alongside it — cookies with `sameSite: none` are only sent over HTTPS.

### Generating a secure `JWT_SECRET`

Run this locally and copy the output into your `.env` (and hosting provider env settings):

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

**Never hardcode this value in source code. Never commit it to Git.**

### Secret rotation

Changing `JWT_SECRET` invalidates all currently active sessions immediately. All logged-in users will receive a `401 Invalid or expired token` response on their next request and will be prompted to log in again. This is the expected and correct behaviour.

### Production startup guard

The server refuses to start if:
- Any required environment variable is missing, **or**
- `NODE_ENV=production` and `JWT_SECRET` is the known-weak development default.

---

## API Overview

All endpoints are prefixed relative to the backend base URL (e.g. `http://localhost:8000`).
Endpoints marked 🔒 require a valid `token` HTTP-only cookie.

### Customers / Authentication — `/customers`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/customers/register` | Public | Register a new customer |
| `POST` | `/customers/login` | Public | Log in; sets JWT cookie |
| `GET` | `/customers/me` | 🔒 | Get current authenticated customer |
| `POST` | `/customers/logout` | Public | Clear the session cookie |
| `PATCH` | `/customers/change` | 🔒 | Change password |

> Registration and login responses never return password hashes.

### Products — `/products`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/products` | Public | List all products (supports `?search=` and `?category=`) |
| `GET` | `/products/:id` | Public | Get a single product by DummyJSON numeric ID or MongoDB ObjectId |

> `POST /products` (product creation) is **disabled** — no public endpoint exists.

### Cart — `/cart`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/cart` | 🔒 | Get current user's cart (populated product details) |
| `POST` | `/cart/:productId` | 🔒 | Add a product to cart (supports DummyJSON numeric ID or MongoDB ObjectId) |
| `PATCH` | `/cart/:productId` | 🔒 | Update quantity of a cart item |
| `DELETE` | `/cart/:productId` | 🔒 | Remove a product from cart |

### Wishlist — `/wishlist`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/wishlist` | 🔒 | Get current user's wishlist |
| `POST` | `/wishlist/:productId` | 🔒 | Add a product to wishlist |
| `DELETE` | `/wishlist/:productId` | 🔒 | Remove a product from wishlist |
| `PATCH` | `/wishlist/:productId/toggle` | 🔒 | Toggle wishlist status |

### Orders and Payments — `/orders`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/orders/create-payment-order` | 🔒 | Validate cart, compute server-side total, create Razorpay order |
| `POST` | `/orders/verify-payment` | 🔒 | Verify Razorpay HMAC signature; mark order PAID; clear cart |
| `GET` | `/orders` | 🔒 | List all orders for the current user |
| `GET` | `/orders/:id` | 🔒 | Get a specific order (ownership enforced) |

> Order totals are **always computed server-side** from MongoDB product prices. Any price submitted by the frontend is ignored.

---

## Deployment Guide

The production architecture deploys the backend on **Render Web Services**, the frontend on **Vercel**, and the database on **MongoDB Atlas**.

### 1. Backend — Render Web Service

Deploy `server/` as a Web Service from your connected GitHub repository:

| Setting | Value |
|---|---|
| **Name** | `rouge-vault-backend` (or your choice) |
| **Root Directory** | `server` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

**Required environment variables on Render:**

| Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Enables production cookie security (`sameSite: 'none'`, `secure: true`) and checks |
| `dbUrl` | `mongodb+srv://...` | MongoDB Atlas connection string with username, password, and database name |
| `JWT_SECRET` | `<generated-64-char-hex>` | Cryptographically secure secret (generate with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`) |
| `razorpay_id` | `rzp_test_...` | Razorpay Key ID (use test mode during staging) |
| `razorpay_secret` | `<your-razorpay-secret>` | Razorpay Key Secret — **kept strictly on server, never exposed** |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | Exact URL of the deployed Vercel frontend (no trailing slash, e.g. `https://rouge-vault.vercel.app`) |

> ⚠️ **Do not set `PORT` manually** on Render. Render automatically assigns and provides `process.env.PORT` dynamically. The server code defaults to `process.env.PORT || 8000`.

### 2. Frontend — Vercel

Import your repository into Vercel as a new Project:

| Setting | Value |
|---|---|
| **Framework Preset** | `Vite` |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

**Required frontend environment variable on Vercel:**

| Variable | Value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com/` | URL of your deployed Render backend. **Preserve the trailing slash `/`** |

> ⚠️ **Important Vercel Rules:**
> 1. **Vite bundles environment variables at build time:** Any time you add or update `VITE_API_URL` in Vercel's Environment Variables dashboard, you **must trigger a new deployment** (Deployments → Redeploy) for changes to take effect in the client bundle.
> 2. **SPA Routing Fallback:** The repository includes [`client/vercel.json`](file:///Users/shreyapal/Desktop/shop_kart_mern/client/vercel.json) with rewrite rules (`"source": "/(.*)", "destination": "/index.html"`). This ensures React Router handles deep links and page refreshes on nested routes (e.g., `/products/1`, `/checkout`, `/orders`) without Vercel returning 404 errors.

### 3. MongoDB Atlas Configuration

1. **Network Access:**
   - Go to MongoDB Atlas → **Network Access** → **IP Access List**.
   - Add your Render backend's outbound IP addresses, or add `0.0.0.0/0` (Allow access from anywhere) if your Render plan uses dynamic outgoing IPs.
2. **Database User & Permissions:**
   - Go to **Database Access** → **Database Users**.
   - Ensure the user has `readWriteAnyDatabase` or `Read and write to any database` on the application database.
   - Verify that special characters in the database password are URL-encoded in `dbUrl`.

### 4. Razorpay Payment Gateway

- Keep test credentials (`rzp_test_...`) configured during initial deployment and QA testing.
- Razorpay webhook / secret credentials (`razorpay_secret`) are strictly used by the backend in `server/controllers/order.controller.js` to verify HMAC SHA256 signatures — never expose them to the frontend.
- When transitioning to live payments, update `razorpay_id` and `razorpay_secret` on Render and complete Razorpay KYC requirements.

### 5. Authentication & Cookie Compatibility

RØUGE Vault uses **HTTP-only JWT cookies** for user session security:

```javascript
const cookiesOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
}
```

- **In Development:** `sameSite: 'lax'`, `secure: false` allows standard localhost cookie exchange over HTTP.
- **In Production (`NODE_ENV=production`):** `sameSite: 'none'`, `secure: true` allows cross-origin credentialed requests between the frontend domain (`vercel.app`) and backend domain (`onrender.com`) over HTTPS.
- **Axios Configuration:** [`client/src/axiosCalls/axios.js`](file:///Users/shreyapal/Desktop/shop_kart_mern/client/src/axiosCalls/axios.js) includes `withCredentials: true` so the browser sends and stores authentication cookies across origins.
- **CORS Configuration:** [`server/index.js`](file:///Users/shreyapal/Desktop/shop_kart_mern/server/index.js) includes `credentials: true` and validates against `ALLOWED_ORIGINS`.

> ⚠️ **Browser Third-Party Cookie Restrictions Notice:**
> Modern privacy mechanisms (such as Apple Safari Intelligent Tracking Prevention (ITP) and strict third-party cookie blocking in some Chromium distributions) treat cookies sent between different top-level domains (`*.vercel.app` and `*.onrender.com`) as third-party cookies.
> 
> If testing reveals that cookies are dropped by a browser on distinct domains:
> - **Recommended Production Solution:** Configure custom domains under the same root domain (e.g., `app.yourdomain.com` for frontend on Vercel and `api.yourdomain.com` for backend on Render). This makes cookies first-party / same-site, ensuring 100% browser compatibility.

---

## Deployment Checklist

Follow this exact deployment sequence:

1. **Local Pre-flight Verification:**
   - Confirm all backend tests pass: `cd server && npm test`
   - Confirm frontend production build succeeds: `cd client && npm run build`
2. **Push to GitHub:**
   - Commit and push all project changes to the repository's `main` branch.
3. **Deploy Backend to Render:**
   - Log into Render (`dashboard.render.com`).
   - Create a **New Web Service** pointing to your GitHub repo.
   - Set **Root Directory** to `server`.
   - Set **Build Command** to `npm install` and **Start Command** to `npm start`.
   - Add environment variables: `NODE_ENV=production`, `dbUrl`, `JWT_SECRET`, `razorpay_id`, `razorpay_secret`. Leave `ALLOWED_ORIGINS` temporary or empty initially.
   - Click **Deploy Web Service** and monitor logs for `Server started on port ...` and `DB Connected!`.
   - Copy your Render backend service URL (e.g. `https://rouge-vault-backend.onrender.com`).
4. **Deploy Frontend to Vercel:**
   - Log into Vercel (`vercel.com`).
   - Import your GitHub repository.
   - Set **Root Directory** to `client` (Vercel automatically detects the Vite preset).
   - In **Environment Variables**, add:
     `VITE_API_URL = https://rouge-vault-backend.onrender.com/` (with trailing slash).
   - Click **Deploy**.
   - Copy the generated Vercel production URL (e.g. `https://rouge-vault.vercel.app`).
5. **Update Render CORS Allowed Origins:**
   - Return to your Render Web Service dashboard → **Environment**.
   - Set `ALLOWED_ORIGINS` = `https://rouge-vault.vercel.app` (your exact Vercel frontend URL, no trailing slash).
   - Save changes (Render will automatically redeploy the service).
6. **Redeploy Vercel Frontend (if API URL was set after initial build):**
   - In Vercel → Deployments → click the latest deployment menu → **Redeploy** to ensure the build bundle contains the live Render backend URL.
7. **End-to-End Production Verification:**
   - Visit the live Vercel URL in your browser.
   - **Account:** Register a new user account, log out, and log back in.
   - **Catalog:** Browse products, test search, and filter by categories.
   - **Cart & Wishlist:** Add items to cart and wishlist, modify cart quantities, remove items.
   - **Deep Linking:** Refresh the browser on nested routes (`/products`, `/cart`, `/orders`) to verify `vercel.json` SPA routing works without 404s.
   - **Checkout & Razorpay:** Proceed to checkout, enter shipping address, open Razorpay test modal, verify test payment completion and order history creation.
8. **Log Inspection:**
   - Check the browser DevTools Console and Network tabs for CORS errors or dropped cookies.
   - Check Render service logs for startup messages, incoming requests, or unhandled errors.

---

## Testing and Build

### Backend automated tests

```bash
cd server
npm test
```

Runs `server/test_labs.js` — a 20-test suite covering:

- Authentication (register, login, session isolation, unauthenticated rejection)
- Cart CRUD and stock validation
- Checkout with server-side total computation
- Razorpay order creation and HMAC signature verification
- Order history and ownership access control

**Verified result: All 20 tests pass** (requires the backend dev server to be running and all env vars to be configured).

### Frontend production build

```bash
cd client
npm run build
# Output in client/dist/
```

**Verified result:** Builds successfully with no errors (1,975 modules).

### Frontend lint

```bash
cd client
npm run lint
```

Uses [Oxlint](https://oxc.rs/docs/guide/usage/linter.html).

### Preview the production build locally

```bash
cd client
npm run preview
```

---

## Troubleshooting

### MongoDB connection fails on startup

```
[DB ERROR] Failed to connect to MongoDB: ...
```

- Check that `dbUrl` in `server/.env` is correct and the Atlas cluster is running.
- In Atlas → **Network Access**, ensure your IP is whitelisted (or add `0.0.0.0/0` temporarily).
- Check that the database user credentials embedded in `dbUrl` are correct.

### API calls return `ERR_CONNECTION_REFUSED` or network errors

- The backend is not running — start it with `npm run dev` in the `server/` directory.
- The frontend `VITE_API_URL` does not match the backend URL. Verify `client/.env`.
- After changing `VITE_API_URL`, restart the Vite dev server — env vars are baked in at build time.

### CORS errors in the browser console

```
Access to XMLHttpRequest ... has been blocked by CORS policy
```

- In production: add your exact frontend origin to `ALLOWED_ORIGINS` on the backend (e.g. `https://rouge-vault.vercel.app`).
- Ensure there are no trailing slashes in `ALLOWED_ORIGINS` values.
- In development: the backend already allows all localhost origins regardless of port.

### 401 Unauthorized on every request after deployment

- The cookie is not being sent. Verify:
  - `NODE_ENV=production` is set on the backend (activates `secure: true` and `sameSite: 'none'`).
  - Both frontend and backend are served over **HTTPS**.
  - `VITE_API_URL` matches the exact backend HTTPS URL.
  - Axios is configured with `withCredentials: true` (it is — see `client/src/axiosCalls/axios.js`).

### 401 "Invalid or expired token" after rotating `JWT_SECRET`

This is expected. Changing `JWT_SECRET` invalidates all existing sessions. Users must log in again. No data is lost.

### Missing environment variable — server exits immediately

```
[STARTUP ERROR] Missing required environment variables: JWT_SECRET, razorpay_id
```

Copy `server/.env.example` to `server/.env` and fill in all required values.

### Razorpay payment modal does not open or payment fails

- Confirm `razorpay_id` in `server/.env` is a valid test key starting with `rzp_test_`.
- Confirm `razorpay_secret` matches the key ID in your Razorpay dashboard.
- Use Razorpay's [test card numbers](https://razorpay.com/docs/payments/payments/test-card-upi-details/) when completing test payments.
- Payment verification errors mean the backend `razorpay_secret` does not match what Razorpay used to sign the response.

### Frontend build fails

```
vite build → error
```

- Run `npm install` in the `client/` directory first.
- Ensure Node.js ≥ 18 is installed (`node -v`).

---

## Future Improvements

These are genuine gaps in the current implementation — not planned features.

| Area | Current state | Improvement |
|---|---|---|
| **Inventory management** | Stock is a snapshot from DummyJSON at first product resolution; not decremented at checkout | Atomic `$inc: { stock: -qty }` in `createPaymentOrder`; a product management interface to set stock manually |
| **Concurrent purchases** | Stock is checked but not locked between check and order creation | Atomic findOneAndUpdate guard with a `$gte` stock condition |
| **Rate limiting** | None on auth endpoints | Add `express-rate-limit` to `/customers/login` and `/customers/register` |
| **Production payments** | Razorpay test mode only | Switch to `rzp_live_*` credentials; complete Razorpay KYC |
| **DummyJSON downtime** | First-time cart add fails if DummyJSON is unreachable | Import or pre-seed a local product catalog into MongoDB |
| **Email notifications** | None | Order confirmation and registration emails |
| **Admin panel** | None | Product, order, and user management |
| **Refresh tokens** | Sessions expire after 10 days with no renewal path | Implement refresh token rotation |
| **Input sanitisation** | Basic field presence checks | Add a validation library (e.g. Zod or Joi) for stricter schema validation |

---

## License

No license has been specified for this repository. All rights are reserved by default until a license is added.
