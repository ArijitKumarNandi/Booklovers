import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    userId: {type:String, required:true, ref:'user'},
    items: [{
        product: {type:String, required:true, ref:'product'},
        quantity: {type:Number, required:true},
    }],
    amount: {type:Number, required:true},
    address: {type:String, required:true, ref:'address'},
    status: {type:String, default:"Order Placed"},
    paymentMethod: {type:String, required:true},
    isPaid: {type:Boolean, required:true, default:false},
    cancelRequest: {
        requested: {type:Boolean, default:false},
        reason: {type:String, default:""},
        requestedAt: {type:Date},
        decidedAt: {type:Date},
        adminNote: {type:String, default:""},
    },
    returnRequest: {
        requested: {type:Boolean, default:false},
        reason: {type:String, default:""},
        requestedAt: {type:Date},
        decidedAt: {type:Date},
        adminNote: {type:String, default:""},
        status: {type:String, enum:["None", "Pending", "Approved", "Rejected"], default:"None"},
    },
}, {timestamps: true})  

const Order = mongoose.models.order || mongoose.model("order", orderSchema)

export default Order
