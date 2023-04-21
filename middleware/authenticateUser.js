const User = require('../models/user')
async function authenticateUser(req,res,next){
  if(!req.session.user_id){
      res.send("This page requires authentication")
      return 

  }
  req.user = await User.findById(req.session.user_id)
  next()
}
module.exports = authenticateUser