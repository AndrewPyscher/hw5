const express = require('express')
const router = new express.Router()
const Product = require('../models/product')
const User = require('../models/user')
const authenticateUser = require('../middleware/authenticateUser')

// Post that creates a new product
router.post('/products',authenticateUser, async(req,res)=>{
    try{
        const p = new Product({name:req.body.name, price:req.body.price, owner:req.user._id})
        await p.save()
        res.send(await p.save())
    }catch(error){
        res.send(error)
    }
})

// GET that returns all of the products
router.get('/products',async(req,res)=>{
    try{
        res.send(await Product.find({}))
    }catch(error){
        res.send(error)
    }
})

// Post to buy an item
// check the 3 conditions
// update the buyer and sellers balance
// then change the owner of the item
router.post('/products/buy', authenticateUser, async(req,res)=>{
    try{
        const p = await Product.findById(req.body.productID)
        if(!p){
            res.send("item id doesnt exist")
            return
        }
        if(req.user._id.toString() === p.owner.toString()){
            res.send({msg:"Oops, "+ req.user.name + " already owns this item"})
            return
        }
        if(req.user.balance < p.price){
            res.send({msg:"Oops, "+ req.user.name + "  has insufficient funds"})
            return
        }

        const seller = await User.findById(p.owner)
        // update the sellers balance
        await User.updateOne({_id:p.owner}, {balance: (seller.balance + p.price)})
        // update the buyers balance
        await User.updateOne({_id:req.user._id}, {balance: (req.user.balance - p.price)})
        await Product.updateOne({_id:p._id}, {owner:req.user._id})
        res.send({msg:"Transaction successful!"})


    }catch(error){
        res.send(error.message)
    }
})
// delete an item by its id
router.delete('/products/:id',authenticateUser, async(req,res)=>{
    try{
        const p = await Product.findById(req.params.id)
        // check if the item id is valid
        if(!p){
            res.send("Invalid product id")
            return
        }// if the item belongs to someone else
        if(req.user._id.toString() !== p.owner.toString()){
            res.send("You are not authorized to perform this operation")
            return
        }
        await Product.deleteOne({_id:p._id})
        res.send("item has been deleted")

    }catch(error){
        res.send(error)
    }
})

module.exports=router