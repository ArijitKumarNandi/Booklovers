import express from "express"
import authAdmin from "../middlewares/authAdmin.js"
import { allOrders, confirmStripePayment, placeOrderCOD, placeOrderStripe, updateStatus, userOrders } from "../controllers/orderController.js"
import authUser from "../middlewares/authUser.js"

const orderRouter = express.Router()

// For Admin
orderRouter.post('/list', authAdmin, allOrders)
orderRouter.post('/status', authAdmin, updateStatus)
// For Payment
orderRouter.post('/cod', authUser, placeOrderCOD)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/stripe/confirm', authUser, confirmStripePayment)

// For User
orderRouter.post('/userorders', authUser, userOrders)

export default orderRouter
