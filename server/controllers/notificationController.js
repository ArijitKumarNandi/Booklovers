import Notification from "../models/Notification.js"

export const createNotification = async ({userId, type, title, message, targetPath, orderId, reviewId}) => {
    if(!userId || !type || !title || !message || !targetPath) return null

    if(orderId || reviewId){
        const existingNotification = await Notification.findOne({
            userId,
            type,
            ...(orderId ? {orderId} : {}),
            ...(reviewId ? {reviewId} : {}),
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
    })
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
