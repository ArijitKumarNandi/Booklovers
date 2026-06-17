import Product from "../models/Product.js"
import User from "../models/User.js"

const getAvailableQuantity = (product) => {
    const quantity = Number(product?.quantity)
    return Number.isFinite(quantity) ? Math.max(0, quantity) : 10
}

// ADDING TO CART
export const addToCart = async (req, res)=>{
    try {
        const {itemId} = req.body
        const userId = req.userId
        const product = await Product.findById(itemId)

        if(!product){
            return res.json({success:false, message:"Book not found"})
        }

        const availableQuantity = getAvailableQuantity(product)
        const userData = await User.findById(userId)
        const cartData = userData.cartData || {}
        const nextQuantity = (cartData[itemId] || 0) + 1

        if(nextQuantity > availableQuantity){
            return res.json({success:false, message:`Only ${availableQuantity} copies left for ${product.name}`})
        }

        cartData[itemId] = nextQuantity

        await User.findByIdAndUpdate(userId, {cartData})
        res.json({success:true, message:"Added to Cart"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// UPDATE THE CART
export const updateCart = async (req, res)=>{
    try {
        const {itemId, quantity} = req.body
        const userId = req.userId

        const userData = await User.findById(userId)
        const cartData = userData.cartData

        if(quantity <= 0){
            delete cartData[itemId]
        }else{
            const product = await Product.findById(itemId)
            if(!product){
                return res.json({success:false, message:"Book not found"})
            }

            const availableQuantity = getAvailableQuantity(product)
            if(quantity > availableQuantity){
                return res.json({success:false, message:`Only ${availableQuantity} copies left for ${product.name}`})
            }

            cartData[itemId] = quantity

        }

        
        await User.findByIdAndUpdate(userId, {cartData})
        res.json({success:true, message:"Cart Updated"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

