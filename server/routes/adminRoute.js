import express from "express"
import { adminDashboard, adminLogin, adminLogout, adminUsers, deleteUser, isAdminAuth } from "../controllers/adminController.js"
import authAdmin from "../middlewares/authAdmin.js"
import { deleteReviewByAdmin, deleteReviewReply, listAllReviews, replyToReview, toggleReviewHeart } from "../controllers/reviewController.js"

const adminRouter = express.Router()

adminRouter.post('/login', adminLogin)
adminRouter.post('/logout', adminLogout)
adminRouter.get('/is-auth', authAdmin, isAdminAuth)
adminRouter.get('/dashboard', authAdmin, adminDashboard)
adminRouter.get('/users', authAdmin, adminUsers)
adminRouter.delete('/users', authAdmin, deleteUser)
adminRouter.get('/reviews', authAdmin, listAllReviews)
adminRouter.patch('/reviews/reply', authAdmin, replyToReview)
adminRouter.patch('/reviews/heart', authAdmin, toggleReviewHeart)
adminRouter.delete('/reviews/:reviewId/reply', authAdmin, deleteReviewReply)
adminRouter.delete('/reviews/:reviewId', authAdmin, deleteReviewByAdmin)

export default adminRouter
