import express from "express"
import { deleteAccount, forgotPassword, getWishlist, isAuth, logout, resetPassword, toggleWishlist, updateNotificationSettings, updatePassword, updateProfile, userLogin, userRegister } from "../controllers/userController.js"
import authUser from "../middlewares/authUser.js"

const userRouter = express.Router()

userRouter.post('/register', userRegister)
userRouter.post('/login', userLogin)
userRouter.post('/forgot-password', forgotPassword)
userRouter.post('/reset-password/:token', resetPassword)
userRouter.post('/logout', logout)
userRouter.get('/is-auth', authUser, isAuth)
userRouter.get('/wishlist', authUser, getWishlist)
userRouter.post('/wishlist/toggle', authUser, toggleWishlist)
userRouter.put('/profile', authUser, updateProfile)
userRouter.put('/password', authUser, updatePassword)
userRouter.put('/notification-settings', authUser, updateNotificationSettings)
userRouter.delete('/account', authUser, deleteAccount)

export default userRouter
