const http = require('http')
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const Blog = require(`./models/blog`)
const blogsRouter = require(`./controllers/blogs`)
const usersRouter = require(`./controllers/users`)
const loginRouter = require(`./controllers/login`)
require('dotenv').config()

const mongoUrl = 'mongodb+srv://kiitus:m2f69JomE4CdMcSP@cluster0-ppj5g.mongodb.net/Blogs?retryWrites=true&w=majority'
mongoose.connect(mongoUrl, {
    useCreateIndex: true,
    useUnifiedTopology:true,
    useNewUrlParser:true,
    useFindAndModify:false
    })

app.use(cors())
app.use(express.json())
app.use(express.static('build'))


app.use('/api/users', usersRouter)
app.use('/api/blogs', blogsRouter)
app.use(`/api/login`, loginRouter)

const PORT =  process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})