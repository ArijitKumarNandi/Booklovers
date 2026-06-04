import {v2 as cloudinary} from "cloudinary"
import { readFile, unlink } from "fs/promises"
import Product from "../models/Product.js"

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const parseAiProductInfo = (text) => {
    try {
        return JSON.parse(text)
    } catch (error) {
        const jsonMatch = text?.match(/\{[\s\S]*\}/)
        if(!jsonMatch) throw error
        return JSON.parse(jsonMatch[0])
    }
}

const getGeminiResponseText = (response) => {
    return response.candidates
        ?.flatMap((candidate) => candidate.content?.parts ?? [])
        ?.map((part) => part.text ?? "")
        ?.join("")
        ?.trim()
}

// CONTROLLER FUNCTION FOR AI IMAGE ANALYSIS
export const analyzeProductImage = async (req,res)=>{
    const tempPath = req.file?.path

    try {
        if(!req.file){
            return res.json({success:false, message:"Please upload an image for AI analysis"})
        }

        if(!process.env.GEMINI_API_KEY){
            return res.json({success:false, message:"GEMINI_API_KEY is missing on the server"})
        }

        const imageBuffer = await readFile(req.file.path)
        const imageBase64 = imageBuffer.toString("base64")
        const model = process.env.GEMINI_MODEL || "gemini-2.5-flash"

        const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: "POST",
            headers: {
                "x-goog-api-key": process.env.GEMINI_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: "Analyze this bookstore product image. Return only valid JSON with two string fields: name and description. If this is a book cover, use the visible book title as the product name. Write a natural ecommerce description in 2-3 sentences for a book store. Do not include price, markdown, or extra keys."
                            },
                            {
                                inline_data: {
                                    mime_type: req.file.mimetype,
                                    data: imageBase64
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    responseMimeType: "application/json",
                    maxOutputTokens: 350
                }
            })
        })

        const result = await aiResponse.json()

        if(!aiResponse.ok){
            return res.json({
                success:false,
                message: result.error?.message || "Gemini image analysis failed"
            })
        }

        const productInfo = parseAiProductInfo(getGeminiResponseText(result))
        const name = productInfo.name?.trim()
        const description = productInfo.description?.trim()

        if(!name || !description){
            return res.json({success:false, message:"AI could not detect enough product details"})
        }

        res.json({success:true, product:{name, description}})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    } finally {
        if(tempPath){
            await unlink(tempPath).catch(() => {})
        }
    }
}

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

// CONTROLLER FUNCTION FOR RECOMMENDING PRODUCTS BY SEARCH TEXT
export const recommendProducts = async (req,res)=>{
    try {
        const query = req.query.q?.trim()

        if(!query){
            return res.json({success:true, products:[]})
        }

        const searchRegex = new RegExp(escapeRegex(query), "i")
        const products = await Product.find({
            inStock:true,
            $or:[
                {name: searchRegex},
                {description: searchRegex},
                {category: searchRegex}
            ]
        }).limit(20)

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
