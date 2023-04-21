const mongoose = require('mongoose')
const Product = require('./product')
// Schema for User collection
// the middleware is from the Travel diary and im using it here
const UserSchema = mongoose.Schema({
    name:{required:true, type:String},
    user_name:{type:String, unique:true},
    balance:{type:Number, default:100},
    password:{required:true,type:String}
    
})


// virtual field for items
// Uses id to match owner with item
UserSchema.virtual('items',{
    ref:'Product',
    localField:'_id',
    foreignField:'owner'
})
UserSchema.set('toJSON',{virtuals:true})
UserSchema.set('toObject',{virtuals:true})

UserSchema.pre('save',function(next){
    console.log("A new user is being created!")
    next()
})
UserSchema.post('save',function(doc){
    console.log("A new user was just created")
})

// middleware for deleting a user. Deletes all products associated with the owner
UserSchema.pre('deleteOne',{document:true},function(next){
    console.log("Middleware deleting all posts for the user...")
    Product.deleteMany({owner:this._id},(error,result)=>{
        if(error)
            result.send(error)
        else{
            next()
        }
    })
})
const User = mongoose.model("User",UserSchema,"users")

module.exports =User