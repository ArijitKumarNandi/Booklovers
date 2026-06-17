import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{type:String, required:true},
    description:{type:String, required:true},
    price:{type:Number, required:true},
    offerPrice:{type:Number, required:true},
    quantity:{type:Number, default:10, min:0},
    image:{type:Array, required:true},
    author:{type:String, default:""},
    publisher:{type:String, default:""},
    language:{type:String, default:""},
    category:{type:String, default:""},
    genres:{type:[String], default:[]},
    subgenres:{type:[String], default:[]},
    genrePaths:{type:[String], default:[]},
    popular:{type:Boolean},
    inStock:{type:Boolean, default:true},
    
}, {timestamps:true})

const Product = mongoose.models.product || mongoose.model('product', productSchema)

export default Product
