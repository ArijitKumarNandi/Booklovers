import Address from "../models/Address.js"


// ADD ADDRESS FOR USER ORDER
export const addAddress = async (req,res)=>{
    try {
        const {address} = req.body
        const userId = req.userId
        await Address.create({...address, userId})
        res.json({success:true, message:"Address created successfully"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}


// GET ADDRESS FOR USER ORDER
export const getAddress = async (req,res)=>{
    try {
       const userId = req.userId
       const addresses = await Address.find({userId}).sort({createdAt: -1})
       res.json({success:true, addresses}) 
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}