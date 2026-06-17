import mongoose from "mongoose"

const userActivitySchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true},
    productId: {type: mongoose.Schema.Types.ObjectId, ref: "product"},
    action: {type: String, enum: ["view", "wishlist", "search"], required: true, index: true},
    searchText: {type: String, default: ""},
}, {timestamps: true})

userActivitySchema.index({userId: 1, createdAt: -1})
userActivitySchema.index({userId: 1, productId: 1, action: 1})

const UserActivity = mongoose.models.userActivity || mongoose.model("userActivity", userActivitySchema)

export default UserActivity
