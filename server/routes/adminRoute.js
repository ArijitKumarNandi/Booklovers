import express from "express"
import { adminDashboard, adminLogin, adminLogout, adminUsers, deleteUser, isAdminAuth } from "../controllers/adminController.js"
import authAdmin from "../middlewares/authAdmin.js"

const adminRouter = express.Router()

adminRouter.post('/login', adminLogin)
adminRouter.post('/logout', adminLogout)
adminRouter.get('/is-auth', authAdmin, isAdminAuth)
adminRouter.get('/dashboard', authAdmin, adminDashboard)
adminRouter.get('/users', authAdmin, adminUsers)
adminRouter.delete('/users', authAdmin, deleteUser)

export default adminRouter
