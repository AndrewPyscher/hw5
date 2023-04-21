const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const authenticateUser = require('../middleware/authenticateUser')
const bcrypt = require('bcrypt')


// new route to allow users to log in
router.post('/users/login',async (req,res)=>{
    try{
        const user = await User.findOne({user_name:req.body.user_name})
        if(!user){
            res.send("Auth error")
            return 
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password)
        if(!isMatch){
            res.send("Auth error")
            return 
        }
        req.session.user_id = user._id
        res.send({message: "Successfully logged in. Welcome " + user.name})

    } catch(err){
        res.send({message:"Error"})
    }
})

// Post to add a new user
router.post('/users/register', async(req,res)=>{
    // check if the user exists already
    try{
    if(await User.findOne({user_name: req.body.user_name}) !== null){
        res.send("This username already exists")
        return
    }
    if(req.body.balance === undefined)
        req.body.balance = 100
    // create the new user
    const u = new User({name:req.body.name, user_name:req.body.user_name, balance: req.body.balance, password: await bcrypt.hash(req.body.password,8)})
    await u.save()
    // send the user info without the password
    res.send({_id:u._id,name:req.body.name,user_name:req.body.user_name,balance:req.body.balance})
}
catch(error){
    res.send({message:"Error"})
}
    
})


// GET that returns the signed in user
router.get('/users/me', authenticateUser, async(req,res)=>{
    try{
        const user = await User.findById(req.user._id).populate('items')
        // filter out the password
        res.send({_id:user._id,name:user.name,user_name:user.user_name,balance:user.balance,items:user.items})
    }catch(error){
        res.send({message:"Error"})
    }
})
// sign the user out
router.post("/users/logout", authenticateUser, async (req,res)=>{
    req.session.destroy(()=>{
        res.send("Successfully logged out "+ req.user.name)
    })
})

// Delete user that is signed in
router.delete('/users/me',authenticateUser, async(req,res)=>{
    try{
        await User.deleteOne({user_name: req.user.user_name})
        req.session.destroy(()=>{
            res.send("Successfully deleted  "+ req.user.name)
        })
    }catch(eror){
        res.send({message:"Error"})
    }
})

// GET that shows the summary of users and their items
router.get('/summary',async(req,res)=>{
    try{
        const users = await User.find({}).populate('items')
        const allUsers = users.map(u=> {return{_id:u._id,name:u.name,user_name:u.user_name,balance:u.balance, items:u.items, id:u.id}})
        res.send(allUsers)
    }catch(error){
        res.send({message:"Error"})
    }
})


module.exports = router