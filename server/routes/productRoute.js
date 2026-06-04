import express from "express"
import { upload } from "../middlewares/multer.js"
import authAdmin from "../middlewares/authAdmin.js"
import { addProduct, analyzeProductImage, changeStock, listProduct, recommendProducts, singleProduct } from "../controllers/productController.js"

const productRouter = express.Router()

productRouter.post('/add', upload.array(["images"]), authAdmin, addProduct)
productRouter.post('/analyze-image', authAdmin, upload.single("image"), analyzeProductImage)
productRouter.get('/list', listProduct)
productRouter.get('/recommendations', recommendProducts)
productRouter.post('/single', singleProduct)
productRouter.post('/stock', changeStock)

export default productRouter
