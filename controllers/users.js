const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')


usersRouter.get("/",(req,res)=>
{
    User.find({}).populate(`blogs`).then((users)=>
    {
        res.json(users)
    })
})
usersRouter.post("/",(req,res)=>
{
   const body = req.body
    const saltRounds = 10
 if(body.password.length > 3)
 {
  bcrypt.hash(body.password, saltRounds).then((hash)=>
  {

    const user=new User({
        userName: body.userName,
        name:body.name,
        passwordHash:hash
    })
    user.save().then((result)=>{
        res.status(201).json(result)
    }).catch((error)=>
    {
        res.status(400).json({message:error.message})
    })
  })
}
else
res.status(400).json({message:"Password is too short"})
  
})

module.exports = usersRouter