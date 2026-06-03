import jwt from "jsonwebtoken"
import Order from "../models/Order.js"
import Product from "../models/Product.js"
import User from "../models/User.js"

const cookieOptions = {
    httpOnly: true, // Prevent client-side javascript from accessing the cookie
    secure: process.env.APP_ENV === "production", // Ensure the cookie is only sent over HTTPS in production
    sameSite: process.env.APP_ENV === "production" ? "none" : "strict" // Controls when cookies are sent "none" allows cross-site in production, "strict" block cross-site by default
}

// Admin Login Route
export const adminLogin = async (req,res)=>{
    try {
        const {email, password} = req.body
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS){
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" })
            res.cookie("adminToken", token, {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000 // Cookie expiration time
            })
            return res.json({ success: true, message:"Admin Logged in" })
        }else{
            return res.json({success:false, message:"Invalid Credentials"})
        }
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// CHECK AUTH
export const isAdminAuth = async (req, res)=>{
    try {
      return res.json({success:true})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// ADMIN DASHBOARD
export const adminDashboard = async (req,res)=>{
    try {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        const paidOrderFilter = {$or: [{paymentMethod: "COD"}, {isPaid:true}]}

        const [orders, products, totalUsers, newCustomersThisMonth] = await Promise.all([
            Order.find(paidOrderFilter).populate("items.product").sort({createdAt: -1}),
            Product.find({}),
            User.countDocuments({}),
            User.countDocuments({createdAt: {$gte: startOfMonth, $lt: startOfNextMonth}}),
        ])

        const thisMonthOrders = orders.filter((order) => {
            const createdAt = new Date(order.createdAt)
            return createdAt >= startOfMonth && createdAt < startOfNextMonth
        })

        const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + order.amount, 0)
        const allTimeRevenue = orders.reduce((total, order) => total + order.amount, 0)

        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const previousMonthEnd = startOfMonth
        const previousMonthRevenue = orders.reduce((total, order) => {
            const createdAt = new Date(order.createdAt)
            return createdAt >= previousMonthStart && createdAt < previousMonthEnd ? total + order.amount : total
        }, 0)

        const revenueGrowthRate = previousMonthRevenue > 0
            ? ((thisMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
            : thisMonthRevenue > 0 ? 100 : 0

        const orderStatus = {
            shipped: orders.filter((order) => order.status === "Shipped").length,
            outForDelivery: orders.filter((order) => order.status === "Out for delivery").length,
            delivered: orders.filter((order) => order.status === "Delivered").length,
        }

        const productSales = new Map()
        orders.forEach((order) => {
            order.items.forEach((item) => {
                const product = item.product
                if(!product) return

                const productId = product._id.toString()
                const existing = productSales.get(productId) || {
                    id: productId,
                    title: product.name,
                    category: product.category,
                    image: product.image?.[0] || "",
                    totalSold: 0,
                }
                existing.totalSold += item.quantity
                productSales.set(productId, existing)
            })
        })

        const topProducts = Array.from(productSales.values())
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, 5)

        const monthFormatter = new Intl.DateTimeFormat("en", {month:"short", year:"numeric"})
        const monthlySales = Array.from({length: 4}, (_, index) => {
            const date = new Date(now.getFullYear(), now.getMonth() - (3 - index), 1)
            const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1)
            const revenue = orders.reduce((total, order) => {
                const createdAt = new Date(order.createdAt)
                return createdAt >= date && createdAt < nextDate ? total + order.amount : total
            }, 0)
            return {
                label: monthFormatter.format(date),
                revenue,
            }
        })

        return res.json({
            success:true,
            dashboard:{
                thisMonthRevenue,
                totalUsers,
                allTimeRevenue,
                totalOrdersThisMonth: thisMonthOrders.length,
                totalProducts: products.length,
                newCustomersThisMonth,
                revenueGrowthRate,
                orderStatus,
                monthlySales,
                topProducts,
            }
        })
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// ADMIN USERS LIST
export const adminUsers = async (req,res)=>{
    try {
        const users = await User.find({}).select("name email avatar createdAt").sort({createdAt: -1})
        return res.json({success:true, users})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// DELETE USER FROM ADMIN PANEL
export const deleteUser = async (req,res)=>{
    try {
        const {userId} = req.body
        if(!userId){
            return res.json({success:false, message:"User id is required"})
        }

        await User.findByIdAndDelete(userId)
        return res.json({success:true, message:"User deleted successfully"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// LOGOUT ADMIN
export const adminLogout = async (req,res)=>{
    try {
        res.clearCookie("adminToken", cookieOptions)
        return res.json({success:true, message:"Admin Logged out"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}
