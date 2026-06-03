import Order from "../models/Order.js"
import Product from "../models/Product.js"
import Review from "../models/Review.js"

export const listReviews = async (req, res) => {
    try {
        const reviews = await Review.find({productId: req.params.productId})
            .populate("userId", "name")
            .sort({createdAt: -1})

        res.json({success: true, reviews})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const addReview = async (req, res) => {
    try {
        const {productId, rating, comment} = req.body
        const userId = req.userId
        const trimmedComment = comment?.trim()
        const numericRating = Number(rating)

        if(!productId || !trimmedComment || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5){
            return res.json({success: false, message: "Please add a rating and review comment"})
        }

        const product = await Product.findById(productId)
        if(!product){
            return res.json({success: false, message: "Book not found"})
        }

        const hasPurchased = await Order.exists({
            userId,
            "items.product": productId,
            $or: [{paymentMethod: "COD"}, {isPaid: true}]
        })

        if(!hasPurchased){
            return res.json({success: false, message: "You can review this book only after purchasing it"})
        }

        const existingReview = await Review.findOne({productId, userId})
        if(existingReview){
            return res.json({success: false, message: "You have already reviewed this book"})
        }

        await Review.create({productId, userId, rating: numericRating, comment: trimmedComment})
        res.json({success: true, message: "Review posted"})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId)

        if(!review){
            return res.json({success: false, message: "Review not found"})
        }

        if(review.userId.toString() !== req.userId){
            return res.json({success: false, message: "You can delete only your own review"})
        }

        await review.deleteOne()
        res.json({success: true, message: "Review deleted"})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}
