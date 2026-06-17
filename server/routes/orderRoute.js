import express from "express"
import authAdmin from "../middlewares/authAdmin.js"
import { allOrders, confirmStripePayment, decideCancellation, decideReturn, placeOrderCOD, placeOrderStripe, requestCancellation, requestReturn, updateStatus, userOrders } from "../controllers/orderController.js"
import authUser from "../middlewares/authUser.js"

const orderRouter = express.Router()

// For Admin
orderRouter.post('/list', authAdmin, allOrders)
orderRouter.post('/status', authAdmin, updateStatus)
orderRouter.post('/cancel-action', authAdmin, decideCancellation)
orderRouter.post('/return-action', authAdmin, decideReturn)
// For Payment
orderRouter.post('/cod', authUser, placeOrderCOD)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/stripe/confirm', authUser, confirmStripePayment)

// For User
orderRouter.post('/userorders', authUser, userOrders)
orderRouter.post('/cancel-request', authUser, requestCancellation)
orderRouter.post('/return-request', authUser, requestReturn)

export default orderRouter
