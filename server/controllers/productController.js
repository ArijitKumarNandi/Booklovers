import {v2 as cloudinary} from "cloudinary"
import { readFile, unlink } from "fs/promises"
import jwt from "jsonwebtoken"
import Notification from "../models/Notification.js"
import Order from "../models/Order.js"
import Product from "../models/Product.js"
import User from "../models/User.js"
import UserActivity from "../models/UserActivity.js"

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const getArray = (value) => Array.isArray(value) ? value.filter(Boolean) : []
const normalizeText = (value) => value?.toString().trim().toLowerCase() || ""

const getProductQuantity = (product) => {
    const quantity = Number(product?.quantity)
    return Number.isFinite(quantity) ? Math.max(0, quantity) : 10
}

const getRequestUserId = (req) => {
    const {token} = req.cookies ?? {}

    if(!token || !process.env.JWT_SECRET){
        return null
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET)?.id ?? null
    } catch {
        return null
    }
}

const getProductTaxonomy = (product) => ([
    ...(product.genres ?? []),
    ...(product.subgenres ?? []),
    ...(product.genrePaths ?? []),
    product.category,
]).filter(Boolean)

const addWeightedValues = (map, values = [], weight = 1) => {
    values.filter(Boolean).forEach((value) => {
        const key = normalizeText(value)
        map.set(key, (map.get(key) || 0) + weight)
    })
}

const addProductPreference = (preferences, product, weight) => {
    if(!product) return

    addWeightedValues(preferences.genres, product.genres, weight)
    addWeightedValues(preferences.subgenres, product.subgenres, weight)
    addWeightedValues(preferences.genrePaths, product.genrePaths, weight)
    addWeightedValues(preferences.authors, [product.author], weight)
    addWeightedValues(preferences.languages, [product.language], Math.max(1, weight / 2))
}

const getTopPreferences = (map, limit = 5) => (
    [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([label, score]) => ({label, score}))
)

const normalizeProductNumbers = (productData) => ({
    ...productData,
    price: Number(productData.price),
    offerPrice: Number(productData.offerPrice),
    quantity: Math.max(0, Math.min(100, Number(productData.quantity ?? 10))),
})

const normalizeProductTaxonomy = (productData) => {
    const genrePaths = getArray(productData.genrePaths)
    const genres = getArray(productData.genres)
    const subgenres = getArray(productData.subgenres)

    if(genrePaths.length === 0 && productData.category){
        genrePaths.push(productData.category)
    }

    const rootsFromPaths = genrePaths.map((path) => path.split(" > ")[0]).filter(Boolean)
    const subgenresFromPaths = genrePaths.flatMap((path) => path.split(" > ").slice(1)).filter(Boolean)

    return {
        ...normalizeProductNumbers(productData),
        category: rootsFromPaths[0] || productData.category || "",
        genres: [...new Set([...genres, ...rootsFromPaths])],
        subgenres: [...new Set([...subgenres, ...subgenresFromPaths])],
        genrePaths: [...new Set(genrePaths)],
    }
}

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

        const normalizedProductData = normalizeProductTaxonomy(productData)

        await Product.create({...normalizedProductData, image:imagesUrl, inStock: normalizedProductData.quantity > 0})

        const users = await User.find({"notificationSettings.newArrivals": {$ne: false}}).select("_id")
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
        res.json({success:true, products: products.map((product) => ({
            ...product.toObject(),
            quantity: getProductQuantity(product),
        }))})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// CONTROLLER FUNCTION FOR RECOMMENDING PRODUCTS BY USER INTERESTS AND SEARCH TEXT
export const recommendProducts = async (req,res)=>{
    try {
        const query = req.query.q?.trim() || ""
        const queryText = normalizeText(query)
        const userId = getRequestUserId(req)

        if(userId && queryText.length >= 2){
            await UserActivity.create({
                userId,
                action: "search",
                searchText: query.slice(0, 120),
            }).catch(() => {})
        }

        const products = await Product.find({$or: [{quantity: {$gt: 0}}, {quantity: {$exists: false}}]})
        const preferences = {
            genres: new Map(),
            subgenres: new Map(),
            genrePaths: new Map(),
            authors: new Map(),
            languages: new Map(),
        }
        const excludedProductIds = new Set()
        const reasonSet = new Set()

        if(userId){
            const [user, orders, activities] = await Promise.all([
                User.findById(userId).populate("wishlist"),
                Order.find({userId, $or: [{paymentMethod: "COD"}, {isPaid:true}]}).populate("items.product").sort({createdAt: -1}).limit(20),
                UserActivity.find({userId}).populate("productId").sort({createdAt: -1}).limit(80),
            ])

            ;(user?.wishlist ?? []).filter(Boolean).forEach((product) => {
                addProductPreference(preferences, product, 7)
                reasonSet.add("wishlist")
            })

            orders.forEach((order) => {
                order.items?.forEach((item) => {
                    addProductPreference(preferences, item.product, 9)
                    if(item.product?._id){
                        excludedProductIds.add(item.product._id.toString())
                    }
                    reasonSet.add("order history")
                })
            })

            activities.forEach((activity) => {
                if(activity.action === "view" && activity.productId){
                    addProductPreference(preferences, activity.productId, 3)
                    reasonSet.add("recent views")
                }

                if(activity.action === "wishlist" && activity.productId){
                    addProductPreference(preferences, activity.productId, 6)
                    reasonSet.add("wishlist")
                }

                if(activity.action === "search" && activity.searchText){
                    addWeightedValues(preferences.genrePaths, [activity.searchText], 1)
                    reasonSet.add("search history")
                }
            })
        }

        const scoredProducts = products
            .filter((product) => !excludedProductIds.has(product._id.toString()) || products.length <= 8)
            .map((product) => {
                let score = 0
                const matchedReasons = []
                const textFields = [
                    product.name,
                    product.description,
                    product.author,
                    product.publisher,
                    product.language,
                    ...getProductTaxonomy(product),
                ].map(normalizeText)
                const productGenreKeys = (product.genres ?? []).map(normalizeText)
                const productSubgenreKeys = (product.subgenres ?? []).map(normalizeText)
                const productGenrePathKeys = (product.genrePaths ?? []).map(normalizeText)

                productGenreKeys.forEach((genre) => {
                    const value = preferences.genres.get(genre) || 0
                    if(value){
                        score += value * 4
                        matchedReasons.push("genre")
                    }
                })

                productSubgenreKeys.forEach((subgenre) => {
                    const value = preferences.subgenres.get(subgenre) || 0
                    if(value){
                        score += value * 5
                        matchedReasons.push("subgenre")
                    }
                })

                productGenrePathKeys.forEach((path) => {
                    const value = preferences.genrePaths.get(path) || 0
                    if(value){
                        score += value * 3
                        matchedReasons.push("reading pattern")
                    }
                })

                const authorScore = preferences.authors.get(normalizeText(product.author)) || 0
                if(authorScore){
                    score += authorScore * 3
                    matchedReasons.push("author")
                }

                const languageScore = preferences.languages.get(normalizeText(product.language)) || 0
                if(languageScore){
                    score += languageScore
                    matchedReasons.push("language")
                }

                if(queryText){
                    const queryMatches = textFields.some((field) => field.includes(queryText))
                    if(queryMatches){
                        score += 35
                        matchedReasons.push("search match")
                    }
                }

                if(product.popular){
                    score += 4
                }

                if(product.createdAt){
                    const ageInDays = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                    if(ageInDays <= 30){
                        score += 2
                    }
                }

                return {
                    product,
                    score,
                    reasons: [...new Set(matchedReasons)].slice(0, 3),
                }
            })
            .filter((item) => queryText ? item.reasons.includes("search match") || item.score > 0 : true)
            .sort((a, b) => b.score - a.score || new Date(b.product.createdAt) - new Date(a.product.createdAt))

        const productsToSend = scoredProducts
            .slice(0, 20)
            .map(({product, score, reasons}) => ({
                ...product.toObject(),
                quantity: getProductQuantity(product),
                recommendationScore: Math.round(score),
                recommendationReasons: reasons,
            }))

        const hasPersonalData = [...Object.values(preferences)].some((map) => map.size > 0)

        res.json({
            success:true,
            products:productsToSend,
            mode: hasPersonalData ? "personalized" : "fallback",
            signals:[...reasonSet],
            preferenceSummary:{
                genres:getTopPreferences(preferences.genres),
                subgenres:getTopPreferences(preferences.subgenres),
                authors:getTopPreferences(preferences.authors, 3),
            },
        })
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// CONTROLLER FUNCTION FOR RECORDING USER RECOMMENDATION ACTIVITY
export const recordProductActivity = async (req,res)=>{
    try {
        const {productId, action, searchText = ""} = req.body
        const allowedActions = ["view", "wishlist", "search"]

        if(!allowedActions.includes(action)){
            return res.json({success:false, message:"Invalid recommendation activity"})
        }

        if(action !== "search"){
            const product = await Product.findById(productId)
            if(!product){
                return res.json({success:false, message:"Book not found"})
            }
        }

        if(action === "search" && searchText.trim().length < 2){
            return res.json({success:true, message:"Activity ignored"})
        }

        await UserActivity.create({
            userId:req.userId,
            productId: action === "search" ? undefined : productId,
            action,
            searchText: action === "search" ? searchText.trim().slice(0, 120) : "",
        })

        res.json({success:true, message:"Activity recorded"})
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
        res.json({success:true, product: product ? {...product.toObject(), quantity: getProductQuantity(product)} : null})
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

// CONTROLLER FUNCTION FOR UPDATING PRODUCT
export const updateProduct = async (req,res)=>{
    try {
        const {productId} = req.params
        const productData = normalizeProductTaxonomy(JSON.parse(req.body.productData))
        const images = req.files || []

        const updateData = {
            ...productData,
            inStock: productData.quantity > 0,
        }

        if(images.length > 0){
            updateData.image = await Promise.all(
                images.map(async (item)=>{
                    const result = await cloudinary.uploader.upload(item.path, {resource_type: "image"})
                    return result.secure_url
                })
            )
        }

        const product = await Product.findByIdAndUpdate(productId, updateData, {new:true})

        if(!product){
            return res.json({success:false, message:"Product not found"})
        }

        res.json({success:true, message:"Product updated", product})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// CONTROLLER FUNCTION FOR DELETING PRODUCT
export const deleteProduct = async (req,res)=>{
    try {
        const {productId} = req.params
        const product = await Product.findByIdAndDelete(productId)

        if(!product){
            return res.json({success:false, message:"Product not found"})
        }

        res.json({success:true, message:"Product deleted"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}
