import Order from "../models/Order.js"
import Product from "../models/Product.js"
import Review from "../models/Review.js"
import { createNotification } from "./notificationController.js"

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

export const listAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate("productId", "name image category")
            .populate("userId", "name email avatar")
            .sort({createdAt: -1})

        res.json({success: true, reviews})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const listMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({userId: req.userId})
            .populate("productId", "name image category")
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

export const replyToReview = async (req, res) => {
    try {
        const {reviewId, message} = req.body
        const trimmedMessage = message?.trim()

        if(!reviewId){
            return res.json({success: false, message: "Review id is required"})
        }
        if(!trimmedMessage){
            return res.json({success: false, message: "Reply message is required"})
        }

        const review = await Review.findByIdAndUpdate(
            reviewId,
            {adminReply: {message: trimmedMessage, repliedAt: new Date()}},
            {new: true}
        )

        if(!review){
            return res.json({success: false, message: "Review not found"})
        }

        await review.populate("productId", "name")
        await createNotification({
            userId: review.userId,
            type: "review_reply",
            title: "Admin replied",
            message: `Admin has replied to your review of the book ${review.productId?.name ?? "you reviewed"}.`,
            targetPath: "/my-reviews",
            reviewId: review._id,
        })

        res.json({success: true, message: "Reply saved"})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const deleteReviewReply = async (req, res) => {
    try {
        const {reviewId} = req.params

        if(!reviewId){
            return res.json({success: false, message: "Review id is required"})
        }

        const review = await Review.findByIdAndUpdate(
            reviewId,
            {$set: {adminReply: {message: "", repliedAt: null}}},
            {new: true}
        )

        if(!review){
            return res.json({success: false, message: "Review not found"})
        }

        res.json({success: true, message: "Reply deleted"})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const toggleReviewHeart = async (req, res) => {
    try {
        const {reviewId} = req.body

        if(!reviewId){
            return res.json({success: false, message: "Review id is required"})
        }

        const review = await Review.findById(reviewId)
        if(!review){
            return res.json({success: false, message: "Review not found"})
        }

        review.adminLiked = !review.adminLiked
        await review.save()

        if(review.adminLiked){
            await review.populate("productId", "name")
            await createNotification({
                userId: review.userId,
                type: "review_liked",
                title: "Review loved",
                message: `Your review of the book ${review.productId?.name ?? "you reviewed"} has been loved by the admin.`,
                targetPath: "/my-reviews",
                reviewId: review._id,
            })
        }

        res.json({success: true, message: review.adminLiked ? "Review hearted" : "Heart removed"})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const deleteReviewByAdmin = async (req, res) => {
    try {
        const {reviewId} = req.params

        const review = await Review.findById(reviewId)
        if(!review){
            return res.json({success: false, message: "Review not found"})
        }

        await review.deleteOne()
        res.json({success: true, message: "Review deleted"})
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
