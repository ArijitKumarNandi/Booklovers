import express from "express"
import { deleteNotification, listNotifications, markNotificationRead } from "../controllers/notificationController.js"
import authUser from "../middlewares/authUser.js"

const notificationRouter = express.Router()

notificationRouter.get("/", authUser, listNotifications)
notificationRouter.patch("/:notificationId/read", authUser, markNotificationRead)
notificationRouter.delete("/:notificationId", authUser, deleteNotification)

export default notificationRouter
