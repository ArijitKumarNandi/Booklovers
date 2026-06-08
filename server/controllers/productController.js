import {v2 as cloudinary} from "cloudinary"
import { readFile, unlink } from "fs/promises"
import Notification from "../models/Notification.js"
import Product from "../models/Product.js"
import User from "../models/User.js"

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const parseAiProductInfo = (text) => {
    const cleanText = text?.replace(/```(?:json)?|```/gi, "").trim()

    if(!cleanText){
        throw new Error("AI could not read product details from this image")
    }

    try {
        return JSON.parse(cleanText)
    } catch (error) {
        const jsonMatch = cleanText?.match(/\{[\s\S]*\}/)

        if(jsonMatch){
            const jsonText = jsonMatch[0]
            try {
                return JSON.parse(jsonText)
            } catch {
                const normalizedJson = jsonText
                    .replace(/([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)/g, '$1"$2"$3')
                    .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, value) => `"${value.replace(/"/g, '\\"')}"`)

                return JSON.parse(normalizedJson)
            }
        }

        const name = cleanText.match(/(?:name|title)\s*:\s*(.+)/i)?.[1]?.trim()
        const description = cleanText.match(/description\s*:\s*([\s\S]+)/i)?.[1]?.trim()

        if(name && description){
            return { name, description }
        }

        throw new Error("AI could not read product details from this image")
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
                                text: "Read this bookstore product image and identify the product. Use the visible book title as the name when possible. Return only the requested JSON fields. The description must be 2-3 natural ecommerce sentences for a book store."
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
                    responseSchema: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            description: { type: "string" }
                        },
                        required: ["name", "description"]
                    },
                    maxOutputTokens: 500
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

        const users = await User.find({}).select("_id")
        if(users.length > 0){
            await Notification.insertMany(users.map((user) => ({
                userId: user._id,
                type: "product_added",
                title: "New books added",
                message: "New books have been added to the collection, check it out",
                targetPath: "/shop",
            })))
        }

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
