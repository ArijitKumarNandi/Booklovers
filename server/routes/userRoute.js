import express from "express"
import { deleteAccount, isAuth, logout, updatePassword, updateProfile, userLogin, userRegister } from "../controllers/userController.js"
import authUser from "../middlewares/authUser.js"

const userRouter = express.Router()

userRouter.post('/register', userRegister)
userRouter.post('/login', userLogin)
userRouter.post('/logout', logout)
userRouter.get('/is-auth', authUser, isAuth)
userRouter.put('/profile', authUser, updateProfile)
userRouter.put('/password', authUser, updatePassword)
userRouter.delete('/account', authUser, deleteAccount)

export default userRouter
