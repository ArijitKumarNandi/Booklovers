import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import adminRouter from "./routes/adminRoute.js"
import productRouter from "./routes/productRoute.js"
import cartRouter from "./routes/cartRoute.js"
import addressRouter from "./routes/addressRoute.js"
import orderRouter from "./routes/orderRoute.js"
import { stripeWebhooks } from "./controllers/orderController.js"

const app = express() // Initialize Express Application
const port = process.env.PORT || 4000 // Define server port

await connectDB() // Establish connection to the database
await connectCloudinary() // Setup cloudinary for image storage

// Allow local development, production, and Vercel preview deployments.
const allowedOrigins = [
    'http://localhost:5173',
    'https://booklovers-kohl.vercel.app',
    process.env.CLIENT_URL
].filter(Boolean)

const isAllowedOrigin = (origin) => {
    if(!origin) return true
    if(allowedOrigins.includes(origin)) return true
    return /^https:\/\/booklovers-[a-z0-9-]+\.vercel\.app$/i.test(origin)
}

// STRIPE WEBHOOKS
app.post('/stripe', express.raw({type: "application/json"}), stripeWebhooks)

// Middleware Setup
app.use(express.json()) // Enables JSON request body parsing
app.use(cookieParser()) // Cookie-parser middleware to parse HTTP request cookies
app.use(cors({
    origin(origin, callback){
        if(isAllowedOrigin(origin)){
            return callback(null, true)
        }
        return callback(new Error("Not allowed by CORS"))
    },
    credentials:true // Require for cookies/authorization headers
}))

// Define API routes
app.use('/api/user', userRouter) // Routes for user-related operations
app.use('/api/admin', adminRouter) // Routes for admin-related operations
app.use('/api/product', productRouter) // Routes for product-related operations
app.use('/api/cart', cartRouter) // Routes for cart-related operations
app.use('/api/address', addressRouter) // Routes for address-related operations
app.use('/api/order', orderRouter) // Routes for order-related operations

// Root Endpoint to check API Status
app.get('/', (req, res)=>{
    res.send("API successfully connected")
})

// Start the server
app.listen(port, ()=> console.log(`Server is running at http://localhost:${port}`))
