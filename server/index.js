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
const PORT = 8000

//Configure Environment
dotenv.config()

//Connecting to Database..
mongoose.connect(process.env.dbUrl)
.then(() => {
    console.log("DB Connected!")
}).catch((err) => {
    console.log("Some error Found ",err)
})

app.use(express.json())
app.use(cookieParser())   

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}))

app.use('/customers', customerRoutes)
app.use('/products', productRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', orderRoutes)


//Staring Server
app.listen(PORT, ()=>{
    console.log("Server started!")
})