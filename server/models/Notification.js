import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "user"},
    type: {
        type: String,
        required: true,
        enum: [
            "order_placed",
            "order_status",
            "review_reply",
            "review_liked",
            "product_added",
            "cancellation_requested",
            "cancellation_approved",
            "cancellation_rejected",
            "return_requested",
            "return_approved",
            "return_rejected",
        ],
    },
    title: {type: String, required: true, trim: true},
    message: {type: String, required: true, trim: true},
    targetPath: {type: String, required: true},
    orderId: {type: mongoose.Schema.Types.ObjectId, ref: "order"},
    reviewId: {type: mongoose.Schema.Types.ObjectId, ref: "review"},
    isRead: {type: Boolean, default: false},
}, {timestamps: true})

const Notification = mongoose.models.notification || mongoose.model("notification", notificationSchema)

export default Notification
