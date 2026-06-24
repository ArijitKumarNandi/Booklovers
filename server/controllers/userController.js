import validator from "validator"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import Notification from "../models/Notification.js"
import Product from "../models/Product.js"
import User from "../models/User.js"
import UserActivity from "../models/UserActivity.js"
import { sendMail } from "../config/mailer.js"

const cookieOptions = {
    httpOnly: true, // Prevent client-side javascript from accessing the cookie
    secure: process.env.APP_ENV === "production", // Ensure the cookie is only sent over HTTPS in production
    sameSite: process.env.APP_ENV === "production" ? "none" : "strict" // Controls when cookies are sent "none" allows cross-site in production, "strict" block cross-site by default
}

// USER REGISTER ROUTE
export const userRegister = async (req,res)=>{
    try {
        const {name,email,password} = req.body
        // Checking if user already exists or not
        const exists = await User.findOne({email})
        if(exists){
            return res.json({success:false, message:"User already exists"})
        }
        // Validate password and checking strong password
        if(!validator.isEmail(email)){
            return res.json({success:false, message:"Please enter a valid email"})
        } 
        if(password.length < 8){
            return res.json({success:false, message:"Please enter a strong password"})
        }
        // Hash user password
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            name,
            email,
            password:hashedPassword
        })
        const user = await newUser.save()
        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn: "7d"})

        res.cookie("token", token, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000 // Cookie expiration time
        })
        return res.json({success:true, user:{email:user.email, name:user.name}})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// USER LOGIN ROUTE
export const userLogin = async (req,res)=>{
    try {
        const {email,password} =req.body
        const user = await User.findOne({email})

        if(!user){
            return res.json({success:false, message:"User doesn't exist"})
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.json({success:false, message:"Invalid Credentials"})
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "7d"})
        res.cookie("token", token, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000 // Cookie expiration time
        })
        return res.json({success:true, user:{email:user.email, name:user.name}})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// Check Auth
export const isAuth = async (req,res)=>{
    try {
        const {userId} = req
        const user = await User.findById(userId).select("-password")
        return res.json({success:true, user})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

const normalizeUrl = (url) => url?.trim().replace(/\/+$/, "")

const isTrustedClientOrigin = (origin) => {
    if(!origin) return false
    if(origin === "http://localhost:5173") return true
    if(origin === "https://booklovers-kohl.vercel.app") return true
    return /^https:\/\/booklovers-[a-z0-9-]+\.vercel\.app$/i.test(origin)
}

const getClientUrl = (req) => {
    const configuredClientUrl = normalizeUrl(process.env.CLIENT_URL)
    if(configuredClientUrl){
        return configuredClientUrl
    }

    const requestOrigin = normalizeUrl(req.get("origin"))
    if(isTrustedClientOrigin(requestOrigin)){
        return requestOrigin
    }

    return `${req.protocol}://${req.get("host")}`.replace(":4000", ":5173")
}

const getResetEmailHtml = (resetLink) => {
    return `
        <div style="margin:0;padding:32px;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827;">
            <div style="max-width:520px;margin:0 auto;background:#050505;color:#ffffff;border-radius:8px;padding:32px;text-align:center;">
                <h2 style="margin:0 0 22px;font-size:22px;">Reset Your Password</h2>
                <p style="margin:0 0 18px;text-align:left;line-height:1.6;">Dear User,</p>
                <p style="margin:0 0 26px;text-align:left;line-height:1.6;">You requested to reset your password. Please click the button below to proceed.</p>
                <a href="${resetLink}" style="display:inline-block;background:#ffffff;color:#111827;text-decoration:none;font-weight:700;border-radius:4px;padding:13px 24px;margin-bottom:26px;">Reset Password</a>
                <p style="margin:0 0 18px;text-align:left;line-height:1.6;">If you did not request this, please ignore this email. The link will expire in 15 minutes.</p>
                <p style="margin:0 0 8px;text-align:left;line-height:1.6;">If the button above doesn't work, copy and paste the following URL into your browser:</p>
                <a href="${resetLink}" style="display:block;color:#7dd3fc;text-align:left;word-break:break-all;margin-bottom:26px;">${resetLink}</a>
                <p style="margin:0;line-height:1.6;color:#d1d5db;">Thank you,<br/>Booklovers Team</p>
                <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    `
}

// SEND PASSWORD RESET LINK
export const forgotPassword = async (req,res)=>{
    try {
        const {email} = req.body

        if(!validator.isEmail(email || "")){
            return res.json({success:false, message:"Please enter a valid email"})
        }

        const user = await User.findOne({email})
        if(!user){
            return res.json({success:false, message:"No account found with this email"})
        }

        const resetToken = crypto.randomBytes(32).toString("hex")
        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000
        await user.save()

        const resetLink = `${getClientUrl(req)}/reset-password/${resetToken}`

        await sendMail({
            to: user.email,
            subject: "Booklovers Password Recovery",
            html: getResetEmailHtml(resetLink),
        })

        return res.json({success:true, message:`Reset link sent to ${user.email}`})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// RESET USER PASSWORD
export const resetPassword = async (req,res)=>{
    try {
        const {token} = req.params
        const {password, confirmPassword} = req.body

        if(!password || !confirmPassword){
            return res.json({success:false, message:"Please fill all password fields"})
        }
        if(password !== confirmPassword){
            return res.json({success:false, message:"Passwords do not match"})
        }
        if(password.length < 8){
            return res.json({success:false, message:"Please enter a strong password"})
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: {$gt: Date.now()},
        })

        if(!user){
            return res.json({success:false, message:"Reset link is invalid or expired"})
        }

        user.password = await bcrypt.hash(password, 10)
        user.resetPasswordToken = ""
        user.resetPasswordExpires = undefined
        await user.save()

        return res.json({success:true, message:"Password reset successfully"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// UPDATE USER PROFILE
export const updateProfile = async (req,res)=>{
    try {
        const {userId} = req
        const {name, email, avatar} = req.body

        if(!name?.trim()){
            return res.json({success:false, message:"Name is required"})
        }
        if(!validator.isEmail(email || "")){
            return res.json({success:false, message:"Please enter a valid email"})
        }

        const existingUser = await User.findOne({email, _id: {$ne: userId}})
        if(existingUser){
            return res.json({success:false, message:"Email already in use"})
        }

        const updateData = {
            name: name.trim(),
            email,
        }

        if(typeof avatar === "string"){
            updateData.avatar = avatar
        }

        const user = await User.findByIdAndUpdate(userId, updateData, {new:true}).select("-password")
        return res.json({success:true, message:"Profile updated successfully", user})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// UPDATE USER PASSWORD
export const updatePassword = async (req,res)=>{
    try {
        const {userId} = req
        const {currentPassword, newPassword, confirmPassword} = req.body

        if(!currentPassword || !newPassword || !confirmPassword){
            return res.json({success:false, message:"Please fill all password fields"})
        }
        if(newPassword !== confirmPassword){
            return res.json({success:false, message:"Passwords do not match"})
        }
        if(newPassword.length < 8){
            return res.json({success:false, message:"Please enter a strong password"})
        }

        const user = await User.findById(userId)
        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if(!isMatch){
            return res.json({success:false, message:"Current password is incorrect"})
        }

        user.password = await bcrypt.hash(newPassword, 10)
        await user.save()
        return res.json({success:true, message:"Password updated successfully"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// UPDATE USER NOTIFICATION SETTINGS
export const updateNotificationSettings = async (req,res)=>{
    try {
        const {userId} = req
        const {newArrivals} = req.body

        if(typeof newArrivals !== "boolean"){
            return res.json({success:false, message:"New arrivals setting is required"})
        }

        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set:{
                    "notificationSettings.emailNotifications": true,
                    "notificationSettings.newArrivals": newArrivals,
                    "notificationSettings.marketingEmails": true,
                }
            },
            {new:true}
        ).select("-password")

        return res.json({success:true, message:"Notification settings updated", user})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// GET USER WISHLIST
export const getWishlist = async (req,res)=>{
    try {
        const {userId} = req
        const user = await User.findById(userId).populate({
            path: "wishlist",
            match: {$or: [{quantity: {$gt: 0}}, {quantity: {$exists: false}}]},
        })

        if(!user){
            return res.json({success:false, message:"User not found"})
        }

        const wishlist = (user.wishlist || []).filter(Boolean)
        return res.json({success:true, wishlist})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// TOGGLE WISHLIST BOOK
export const toggleWishlist = async (req,res)=>{
    try {
        const {userId} = req
        const {productId} = req.body

        if(!productId){
            return res.json({success:false, message:"Product is required"})
        }

        const product = await Product.findById(productId)
        if(!product){
            return res.json({success:false, message:"Book not found"})
        }

        const user = await User.findById(userId)
        if(!user){
            return res.json({success:false, message:"User not found"})
        }

        const wishlist = user.wishlist || []
        const isWishlisted = wishlist.some((itemId) => itemId.toString() === productId)

        if(isWishlisted){
            user.wishlist = wishlist.filter((itemId) => itemId.toString() !== productId)
        }else{
            user.wishlist = [...wishlist, product._id]
        }

        await user.save()

        if(!isWishlisted){
            await UserActivity.create({
                userId,
                productId: product._id,
                action: "wishlist",
            }).catch(() => {})
        }

        return res.json({
            success:true,
            message:isWishlisted ? "Removed from wishlist" : "Added to wishlist",
            wishlist:user.wishlist,
            isWishlisted:!isWishlisted,
        })
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// DELETE USER ACCOUNT
export const deleteAccount = async (req,res)=>{
    try {
        const {userId} = req

        await Promise.all([
            Notification.deleteMany({userId}),
            User.findByIdAndDelete(userId),
        ])

        res.clearCookie("token", cookieOptions)
        return res.json({success:true, message:"Account deleted successfully"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// LOGOUT USER
export const logout = async (req,res)=>{
    try {
        res.clearCookie("token", cookieOptions)
        return res.json({success:true, message:"Successfully Logged out"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}
