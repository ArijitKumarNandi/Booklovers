import express from "express"
import { upload } from "../middlewares/multer.js"
import authAdmin from "../middlewares/authAdmin.js"
import authUser from "../middlewares/authUser.js"
import { addProduct, analyzeProductImage, changeStock, deleteProduct, listProduct, recommendProducts, recordProductActivity, singleProduct, updateProduct } from "../controllers/productController.js"

const productRouter = express.Router()

productRouter.post('/add', upload.array(["images"]), authAdmin, addProduct)
productRouter.post('/analyze-image', authAdmin, upload.single("image"), analyzeProductImage)
productRouter.get('/list', listProduct)
productRouter.get('/recommendations', recommendProducts)
productRouter.post('/activity', authUser, recordProductActivity)
productRouter.post('/single', singleProduct)
productRouter.post('/stock', authAdmin, changeStock)
productRouter.put('/:productId', authAdmin, upload.array(["images"]), updateProduct)
productRouter.delete('/:productId', authAdmin, deleteProduct)

export default productRouter
