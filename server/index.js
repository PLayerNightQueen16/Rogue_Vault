import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import dns from 'node:dns';
import cors from 'cors'

import { customerRoutes } from './routes/customer.routes.js';
import { productRoutes } from './routes/product.routes.js';
import { wishlistRoutes } from './routes/wishlist.routes.js';
import { cartRoutes } from './routes/cart.routes.js';
import { orderRoutes } from './routes/order.routes.js';

dns.setServers([
  '8.8.8.8',
  '8.8.4.4',
  '1.1.1.1'
]);

const app = express()

//Configure Environment
dotenv.config()

const PORT = process.env.PORT || 8000

// Validate required environment variables at startup
const REQUIRED_ENV = ['dbUrl', 'JWT_SECRET', 'razorpay_id', 'razorpay_secret'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`[STARTUP ERROR] Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('Server cannot start safely. Please configure all required variables.');
  process.exit(1);
}

// Reject the known-weak development default JWT secret in production.
// The secret value is intentionally never printed in any log message.
const KNOWN_WEAK_SECRETS = ['shopKart_C'];
if (process.env.NODE_ENV === 'production' && KNOWN_WEAK_SECRETS.includes(process.env.JWT_SECRET)) {
  console.error('[STARTUP ERROR] JWT_SECRET is set to a known weak value. Set a strong, random secret before deploying.');
  process.exit(1);
}

//Connecting to Database..
mongoose.connect(process.env.dbUrl)
.then(() => {
    console.log("DB Connected!")
}).catch((err) => {
    console.error('[DB ERROR] Failed to connect to MongoDB:', err.message);
    process.exit(1);
})

app.use(express.json())
app.use(cookieParser())   

// Build allowed origins list: always include localhost dev ports, and any
// additional production origins supplied via ALLOWED_ORIGINS env var
// (comma-separated, e.g. "https://rouge-vault.vercel.app,https://www.rouge-vault.com")
const devOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

const productionOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : [];

const allowedOrigins = [...devOrigins, ...productionOrigins];

app.use(cors({
    origin: (origin, callback) => {
        // Allow same-origin / non-browser requests (no Origin header)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // In development also allow any localhost regardless of port
        if (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true
}))

app.use('/customers', customerRoutes)
app.use('/products', productRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', orderRoutes)


//Starting Server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT} [NODE_ENV=${process.env.NODE_ENV || 'development'}]`)
})