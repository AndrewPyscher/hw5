const mongoose = require('mongoose')
// Schema for the product collection
// has a name, price, and an owner
const ProductSchema = mongoose.Schema({
    name:{required:true, type:String},
    price:{required:true, type:Number},
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
    
})

const Product = mongoose.model("Product",ProductSchema,"products")

module.exports = Product