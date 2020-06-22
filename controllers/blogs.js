const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

const jwt = require('jsonwebtoken')


const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

blogsRouter.get('/', (request, response) => {
    Blog
      .find({}).populate(`user`,{ userName: 1})
      .then(blogs => {
        response.json(blogs)
      })
  })
  
  blogsRouter.post('/', (request, response) => {
    const body = request.body

    const token = getTokenFrom(request)

    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    

   User.findById(decodedToken.id).then((user)=>{
      const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes:body.likes,
      user: user.id})

      
      blog
      .save()
      .then(saved => {
        user.blogs.push(saved.id)
        user.save().then(()=>
        {
          response.status(201).json(saved)
        })
        
      })
  })
  
   
  })
blogsRouter.delete('/:id',(req,res)=>
{

  const body = req.body


  const token = getTokenFrom(req)

  const decodedToken = jwt.verify(token, process.env.SECRET)


  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }
  
  Blog.findById(req.params.id).then((blog)=>
  {
  
    if(blog === null)
    {
     return res.status(401).json({error: 'blog to delete doesnt excist'});
    }
    
    if(decodedToken.id.toString()!==blog.user.toString())
    {
    return res.status(401).json({error: 'blog was created by someone else'});
    }
    
    
      User.findById({_id:decodedToken.id}).then((user)=>
      {
      
        let filter = user.blogs.filter((blog)=>
        {
         return blog.toString() !== req.params.id.toString();
        })
        user.blogs = filter;
        user.save().then(() =>
        {
      
          Blog.findByIdAndDelete({_id:req.params.id}).then(()=>
          {
            res.status(204).end()
          })
          
        })
      })
    
    }).catch((error)=>
  {
    return res.status(401).json({error:error.message})
  })
  

  /*  try{
        console.log("Ennen poisoa")
   await Blog.findByIdAndDelete({_id:req.params.id})
        res.status(204).end()
      }
      catch(error)
      {
          console.log(error)
    }
    */

})

blogsRouter.put("/:id",async(req,res)=>
{
    const body = req.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  try {
    const chancedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, { new: true })
    res.json(chancedBlog)
  } catch (error) {
      console.log(error)
  }
})

module.exports = blogsRouter