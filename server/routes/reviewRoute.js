import express from "express"
import authUser from "../middlewares/authUser.js"
import { addReview, deleteReview, listReviews } from "../controllers/reviewController.js"

const reviewRouter = express.Router()

reviewRouter.get("/:productId", listReviews)
reviewRouter.post("/add", authUser, addReview)
reviewRouter.delete("/:reviewId", authUser, deleteReview)

export default reviewRouter
