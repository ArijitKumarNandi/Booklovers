import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    avatar:{type:String, default:""},
    notificationSettings:{
        emailNotifications:{type:Boolean, default:true},
        newArrivals:{type:Boolean, default:true},
        marketingEmails:{type:Boolean, default:true},
    },
    cartData:{type:Object, default:{}},
    wishlist:[{type:mongoose.Schema.Types.ObjectId, ref:"product"}],
    resetPasswordToken:{type:String, default:""},
    resetPasswordExpires:{type:Date},
}, {minimize: false, timestamps:true})

const User = mongoose.models.user || mongoose.model('user', userSchema)

export default User
