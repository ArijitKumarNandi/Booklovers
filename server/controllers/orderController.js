import Order from "../models/Order.js"
import Product from "../models/Product.js"
import User from "../models/User.js"
import { createNotification } from "./notificationController.js"
import stripe from "stripe"


// Global variables for payment
const currency = "inr"
const deliveryCharges = 10 // 10 Dollars
const taxPercentage = 0.02 // 2% tax charges

const getOrderBookNames = (items = []) => {
    const names = items
        .map((item) => item.product?.name)
        .filter(Boolean)

    if(names.length === 0) return "your books"
    if(names.length === 1) return names[0]
    return `${names[0]} and ${names.length - 1} more book${names.length > 2 ? "s" : ""}`
}

const getAvailableQuantity = (product) => {
    const quantity = Number(product?.quantity)
    return Number.isFinite(quantity) ? Math.max(0, quantity) : 10
}

const validateOrderItems = async (items = []) => {
    let subtotal = 0
    const productData = []

    for(const item of items){
        const product = await Product.findById(item.product)

        if(!product){
            return {success:false, message:"One of the selected books is no longer available"}
        }

        const availableQuantity = getAvailableQuantity(product)
        if(item.quantity > availableQuantity){
            return {success:false, message:`Only ${availableQuantity} copies left for ${product.name}`}
        }

        productData.push({product, quantity:item.quantity})
        subtotal += product.offerPrice * item.quantity
    }

    return {success:true, subtotal, productData}
}

const decrementOrderStock = async (items = []) => {
    for(const item of items){
        const product = await Product.findById(item.product)
        if(!product) throw new Error("One of the selected books is no longer available")

        const availableQuantity = getAvailableQuantity(product)
        if(item.quantity > availableQuantity){
            throw new Error(`Only ${availableQuantity} copies left for ${product.name}`)
        }

        product.quantity = Math.max(0, availableQuantity - item.quantity)
        product.inStock = product.quantity > 0
        await product.save()
    }
}

const restoreOrderStock = async (items = []) => {
    for(const item of items){
        const product = await Product.findById(item.product)
        if(!product) continue

        const currentQuantity = getAvailableQuantity(product)
        product.quantity = currentQuantity + item.quantity
        product.inStock = product.quantity > 0
        await product.save()
    }
}

const canRequestCancellation = (status) => ["Order Placed", "Packing"].includes(status)

const canRequestReturn = (status) => status === "Delivered"

const normalStatusFlow = ["Order Placed", "Packing", "Shipped", "Out for delivery", "Delivered"]
const lockedStatuses = ["Delivered", "Cancelled", "Return Approved", "Return Rejected"]
const requestOnlyStatuses = ["Cancellation Requested", "Return Requested"]

const markStripeOrderPaid = async ({orderId, userId}) => {
    const existingOrder = await Order.findById(orderId)
    if(!existingOrder) return null
    if(existingOrder?.isPaid) return existingOrder

    await decrementOrderStock(existingOrder.items)

    const order = await Order.findByIdAndUpdate(orderId, {isPaid: true}, {new: true}).populate("items.product")
    if(!order) return null

    await createNotification({
        userId,
        type: "order_placed",
        title: "Payment successful",
        message: `Your payment is successful and order of ${getOrderBookNames(order.items)} is placed.`,
        targetPath: "/my-orders",
        orderId: order._id,
    })

    await User.findByIdAndUpdate(userId, {cartData:{}})
    return order
}

// PLACE ORDER USING COD
export const placeOrderCOD = async (req,res)=>{
    try {
        const {items, address} = req.body
        const userId = req.userId
        if(items.length === 0){
            return res.json({success:false, message:"Please add product first"})
        }
        const validation = await validateOrderItems(items)
        if(!validation.success){
            return res.json({success:false, message:validation.message})
        }

        const {subtotal, productData} = validation

        // calculate total amount by adding tax and delivery charges
        const taxAmount = subtotal * taxPercentage
        const totalAmount = subtotal + taxAmount + deliveryCharges

        await decrementOrderStock(items)

        const order = await Order.create({
            userId,
            items,
            amount:totalAmount,
            address,
            paymentMethod: "COD"
        })

        await createNotification({
            userId,
            type: "order_placed",
            title: "Order placed",
            message: `Your order of ${getOrderBookNames(productData)} is placed successfully.`,
            targetPath: "/my-orders",
            orderId: order._id,
        })

        // Clear user cart
        await User.findByIdAndUpdate(userId, {cartData: {}})
        return res.json({success:true, message:"Order Placed"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// PLACE ORDER USING STRIPE
export const placeOrderStripe = async (req,res)=>{
    try {
        const {items, address} = req.body
        const userId = req.userId
        const {origin} = req.headers

        if(items.length === 0){
            return res.json({success:false, message:"Please add product first"})
        }

        const validation = await validateOrderItems(items)
        if(!validation.success){
            return res.json({success:false, message:validation.message})
        }

        const {subtotal, productData} = validation

        // calculate total amount by adding tax and delivery charges
        const taxAmount = subtotal * taxPercentage
        const totalAmount = subtotal + taxAmount + deliveryCharges

        const order = await Order.create({
            userId,
            items,
            amount:totalAmount,
            address,
            paymentMethod: "stripe"
        })

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

        // Create line items for stripe
        let line_items = productData.map((item)=>{
            return {
                price_data: {
                    currency: currency,
                    product_data: {name: item.product.name},
                    unit_amount: Math.floor(item.product.offerPrice * 100 * 94) // multiply by 94 for getting into inr
                },
                quantity:item.quantity
            }
        })

        // Add tax as seperate line item
        line_items.push({
            price_data: {
                    currency: currency,
                    product_data: {name: "Tax (2%)"},
                    unit_amount: Math.floor(taxAmount * 100 * 94) // multiply by 94 for getting into inr
                },
                quantity: 1
        })

        // Add Delivery Charges as seperate line item
        line_items.push({
            price_data: {
                    currency: currency,
                    product_data: {name: "Delivery Charges"},
                    unit_amount: Math.floor(deliveryCharges * 100 * 94) // multiply by 94 for getting into inr
                },
                quantity: 1
        })

        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: 'payment',
            success_url: `${origin}/loader?next=my-orders&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/cart`,
            metadata:{
                orderId: order._id.toString(),
                userId,
            }

        })

        return res.json({success:true, url:session.url})

        
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// STRIPE WEBHOOKS FOR VERIFYING PAYMENT THROUGH STRIPE
export const stripeWebhooks = async (request, response)=>{
    // Stripe gateway initialization
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

    const signature = request.headers["stripe-signature"]

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
        
    } catch (error) {
        response.status(400).send(`Webhook Error: $(error.message)`)
    }

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded":{
            const paymentIntent = event.data.object
            const paymentIntentId = paymentIntent.id

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId
            })

            const {orderId, userId} = session.data[0].metadata
            // Mark order as paid
            await markStripeOrderPaid({orderId, userId})
            break;
        } 
        
         case "payment_intent.failed":{
            const paymentIntent = event.data.object
            const paymentIntentId = paymentIntent.id

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId
            })

            const {orderId} = session.data[0].metadata
            // Delete the order if payment is failed
            await Order.findByIdAndDelete(orderId)
            
            break;
        }   
            
        default:
            console.log(`unhandled event type ${event.type}`)
            break;
    }
    response.json({received:true})
}

// CONFIRM STRIPE PAYMENT AFTER USER RETURNS FROM CHECKOUT
export const confirmStripePayment = async (req,res)=>{
    try {
        const {sessionId} = req.body
        const userId = req.userId

        if(!sessionId){
            return res.json({success:false, message:"Stripe session id is required"})
        }

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
        const session = await stripeInstance.checkout.sessions.retrieve(sessionId)
        const {orderId, userId: sessionUserId} = session.metadata ?? {}

        if(!orderId || sessionUserId !== userId){
            return res.json({success:false, message:"Invalid Stripe session"})
        }

        if(session.payment_status !== "paid"){
            return res.json({success:false, message:"Payment is not completed yet"})
        }

        await markStripeOrderPaid({orderId, userId})
        return res.json({success:true, message:"Payment confirmed"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// ALL ORDERS DATA FOR FRONTEND BY USERID
export const userOrders = async (req,res)=>{
    try {
        const userId = req.userId
        const orders = await Order.find({userId, $or: [{paymentMethod: "COD"}, {isPaid:true}]}).populate("items.product address").sort({createdAt: -1})
        res.json({success:true, orders})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// ALL ORDERS DATA FOR ADMIN PANEL
export const allOrders = async (req,res)=>{
    try {
        const orders = await Order.find({$or: [{paymentMethod: "COD"}, {isPaid:true}]}).populate("items.product address").sort({createdAt: -1})
        res.json({success:true, orders})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// UPDATING ORDER STATUS FROM ADMIN PANEL
export const updateStatus = async (req,res)=>{
    try {
        const {orderId, status} = req.body
        const order = await Order.findById(orderId).populate("items.product")

        if(!order){
            return res.json({success:false, message:"Order not found"})
        }

        if(requestOnlyStatuses.includes(status) || ["Cancelled", "Return Approved", "Return Rejected"].includes(status)){
            return res.json({success:false, message:"Use the request action buttons for cancellation and return decisions"})
        }

        if(lockedStatuses.includes(order.status) || requestOnlyStatuses.includes(order.status)){
            return res.json({success:false, message:"This order status can no longer be changed from the dropdown"})
        }

        const currentIndex = normalStatusFlow.indexOf(order.status)
        const nextIndex = normalStatusFlow.indexOf(status)

        if(currentIndex === -1 || nextIndex === -1 || nextIndex < currentIndex){
            return res.json({success:false, message:"Order status can only move forward"})
        }

        order.status = status
        if(status === "Delivered"){
            order.isPaid = true
        }
        await order.save()

        if(order && ["Shipped", "Out for delivery", "Delivered"].includes(status)){
            const statusText = status === "Out for delivery" ? "out for delivery" : status.toLowerCase()
            await createNotification({
                userId: order.userId,
                type: "order_status",
                title: "Order status updated",
                message: `Your order of ${getOrderBookNames(order.items)} has been ${statusText}.`,
                targetPath: "/my-orders",
                orderId: order._id,
            })
        }

        res.json({success:true, message:"Order status updated"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// USER REQUESTS ORDER CANCELLATION
export const requestCancellation = async (req,res)=>{
    try {
        const {orderId, reason} = req.body
        const trimmedReason = reason?.trim()

        if(!orderId || !trimmedReason){
            return res.json({success:false, message:"Please provide an order and cancellation reason"})
        }

        const order = await Order.findOne({_id: orderId, userId: req.userId}).populate("items.product")
        if(!order){
            return res.json({success:false, message:"Order not found"})
        }

        if(order.cancelRequest?.requested || order.status === "Cancellation Requested"){
            return res.json({success:false, message:"Cancellation request is already pending"})
        }

        if(["Cancelled", "Return Approved", "Return Rejected", "Return Requested"].includes(order.status)){
            return res.json({success:false, message:"This order cannot be cancelled now"})
        }

        if(!canRequestCancellation(order.status)){
            return res.json({success:false, message:"Cancellation is available only before shipping"})
        }

        order.cancelRequest = {
            requested: true,
            reason: trimmedReason,
            requestedAt: new Date(),
            adminNote: "",
        }
        order.status = "Cancellation Requested"
        await order.save()

        await createNotification({
            userId: req.userId,
            type: "cancellation_requested",
            title: "Cancellation requested",
            message: `Your cancellation request for ${getOrderBookNames(order.items)} has been sent to admin.`,
            targetPath: "/my-orders",
            orderId: order._id,
        })

        return res.json({success:true, message:"Cancellation request sent"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// USER REQUESTS ORDER RETURN
export const requestReturn = async (req,res)=>{
    try {
        const {orderId, reason} = req.body
        const trimmedReason = reason?.trim()

        if(!orderId || !trimmedReason){
            return res.json({success:false, message:"Please provide an order and return reason"})
        }

        const order = await Order.findOne({_id: orderId, userId: req.userId}).populate("items.product")
        if(!order){
            return res.json({success:false, message:"Order not found"})
        }

        if(order.returnRequest?.status === "Pending" || order.status === "Return Requested"){
            return res.json({success:false, message:"Return request is already pending"})
        }

        if(order.returnRequest?.status === "Approved"){
            return res.json({success:false, message:"Return request is already approved"})
        }

        if(!canRequestReturn(order.status)){
            return res.json({success:false, message:"Return can be requested only after delivery"})
        }

        order.returnRequest = {
            requested: true,
            reason: trimmedReason,
            requestedAt: new Date(),
            adminNote: "",
            status: "Pending",
        }
        order.status = "Return Requested"
        await order.save()

        await createNotification({
            userId: req.userId,
            type: "return_requested",
            title: "Return requested",
            message: `Your return request for ${getOrderBookNames(order.items)} has been sent to admin.`,
            targetPath: "/my-orders",
            orderId: order._id,
        })

        return res.json({success:true, message:"Return request sent"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// ADMIN APPROVES OR REJECTS CANCELLATION
export const decideCancellation = async (req,res)=>{
    try {
        const {orderId, action, adminNote = ""} = req.body
        const order = await Order.findById(orderId).populate("items.product")

        if(!order){
            return res.json({success:false, message:"Order not found"})
        }

        if(!order.cancelRequest?.requested || order.status !== "Cancellation Requested"){
            return res.json({success:false, message:"No pending cancellation request found"})
        }

        if(action === "approve"){
            await restoreOrderStock(order.items)
            order.status = "Cancelled"
            order.cancelRequest.requested = false
            order.cancelRequest.decidedAt = new Date()
            order.cancelRequest.adminNote = adminNote
            await order.save()

            await createNotification({
                userId: order.userId,
                type: "cancellation_approved",
                title: "Cancellation approved",
                message: `Your cancellation request for ${getOrderBookNames(order.items)} has been approved.`,
                targetPath: "/my-orders",
                orderId: order._id,
            })

            return res.json({success:true, message:"Cancellation approved"})
        }

        if(action === "reject"){
            order.status = "Packing"
            order.cancelRequest.requested = false
            order.cancelRequest.decidedAt = new Date()
            order.cancelRequest.adminNote = adminNote
            await order.save()

            await createNotification({
                userId: order.userId,
                type: "cancellation_rejected",
                title: "Cancellation rejected",
                message: `Your cancellation request for ${getOrderBookNames(order.items)} was rejected.`,
                targetPath: "/my-orders",
                orderId: order._id,
            })

            return res.json({success:true, message:"Cancellation rejected"})
        }

        return res.json({success:false, message:"Invalid cancellation action"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// ADMIN APPROVES OR REJECTS RETURN
export const decideReturn = async (req,res)=>{
    try {
        const {orderId, action, adminNote = ""} = req.body
        const order = await Order.findById(orderId).populate("items.product")

        if(!order){
            return res.json({success:false, message:"Order not found"})
        }

        if(order.returnRequest?.status !== "Pending" || order.status !== "Return Requested"){
            return res.json({success:false, message:"No pending return request found"})
        }

        if(action === "approve"){
            order.status = "Return Approved"
            order.returnRequest.status = "Approved"
            order.returnRequest.decidedAt = new Date()
            order.returnRequest.adminNote = adminNote
            await order.save()

            await createNotification({
                userId: order.userId,
                type: "return_approved",
                title: "Return approved",
                message: `Your return request for ${getOrderBookNames(order.items)} has been approved.`,
                targetPath: "/my-orders",
                orderId: order._id,
            })

            return res.json({success:true, message:"Return approved"})
        }

        if(action === "reject"){
            order.status = "Return Rejected"
            order.returnRequest.status = "Rejected"
            order.returnRequest.decidedAt = new Date()
            order.returnRequest.adminNote = adminNote
            await order.save()

            await createNotification({
                userId: order.userId,
                type: "return_rejected",
                title: "Return rejected",
                message: `Your return request for ${getOrderBookNames(order.items)} was rejected.`,
                targetPath: "/my-orders",
                orderId: order._id,
            })

            return res.json({success:true, message:"Return rejected"})
        }

        return res.json({success:false, message:"Invalid return action"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}
