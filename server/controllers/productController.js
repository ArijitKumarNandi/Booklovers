import {v2 as cloudinary} from "cloudinary"
import Product from "../models/Product.js"

// CONTROLLER FUNCTION FOR ADDING PRODUCT
export const addProduct = async (req,res)=>{
    try {
        const productData = JSON.parse(req.body.productData)

        const images = req.files

        // Upload images to cloudinary or use a default image
        let imagesUrl = await Promise.all(
            images.map(async (item)=>{
                let result = await cloudinary.uploader.upload(item.path, {resource_type: "image"})
                return result.secure_url
            })
        )

        console.log(productData)

        await Product.create({...productData, image:imagesUrl})

        res.json({success:true, message:"Product Added"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// CONTROLLER FUNCTION FOR PRODUCT LIST
export const listProduct = async (req,res)=>{
    try {
        const products = await Product.find({})
        res.json({success:true, products})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// CONTROLLER FUNCTION FOR GETTING A PRODUCT DETAILS
export const singleProduct = async (req,res)=>{
    try {
        const {productId} = req.body
        const product = await Product.findById(productId)
        res.json({success:true, product})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// CONTROLLER FUNCTION FOR CHANGING THE PRODUCT STOCK
export const changeStock = async (req,res)=>{
    try {
        const {productId, inStock} = req.body
        await Product.findByIdAndUpdate(productId, {inStock})
        res.json({success:true, message: "Stock Updated"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}