import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema({
    productId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "product"},
    userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "user"},
    rating: {type: Number, required: true, min: 1, max: 5},
    comment: {type: String, required: true, trim: true, maxlength: 1000},
}, {timestamps: true})

reviewSchema.index({productId: 1, userId: 1}, {unique: true})

const Review = mongoose.models.review || mongoose.model("review", reviewSchema)

export default Review
