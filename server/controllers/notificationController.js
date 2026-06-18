import Notification from "../models/Notification.js"
import User from "../models/User.js"

export const createNotification = async ({userId, type, title, message, targetPath, orderId, reviewId, productId}) => {
    if(!userId || !type || !title || !message || !targetPath) return null

    if(orderId || reviewId || productId){
        const existingNotification = await Notification.findOne({
            userId,
            type,
            ...(orderId ? {orderId} : {}),
            ...(reviewId ? {reviewId} : {}),
            ...(productId ? {productId} : {}),
        })

        if(existingNotification) return existingNotification
    }

    return Notification.create({
        userId,
        type,
        title,
        message,
        targetPath,
        orderId,
        reviewId,
        productId,
    })
}

export const notifyWishlistLowStock = async (product, quantity) => {
    if(!product?._id || quantity <= 0 || quantity > 5) return []

    const users = await User.find({wishlist: product._id}).select("_id")

    return Promise.all(users.map((user) => createNotification({
        userId: user._id,
        type: "wishlist_low_stock",
        title: "Wishlisted book low stock",
        message: `${product.name} from your wishlist has only ${quantity} cop${quantity === 1 ? "y" : "ies"} left.`,
        targetPath: `/shop/book/${product._id}`,
        productId: product._id,
    })))
}

export const listNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({userId: req.userId}).sort({createdAt: -1})
        res.json({success: true, notifications})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const markNotificationRead = async (req, res) => {
    try {
        const {notificationId} = req.params

        await Notification.findOneAndUpdate(
            {_id: notificationId, userId: req.userId},
            {isRead: true}
        )

        res.json({success: true, message: "Notification opened"})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const deleteNotification = async (req, res) => {
    try {
        const {notificationId} = req.params

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            userId: req.userId,
        })

        if(!notification){
            return res.json({success: false, message: "Notification not found"})
        }

        res.json({success: true, message: "Notification deleted"})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}
