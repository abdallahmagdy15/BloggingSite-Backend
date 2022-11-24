const express = require('express')
const blogsRouter = require('./blog')
const userRouter = require('./user')
const router = express.Router()
const { getBlogs, getOneBlog } = require('../controllers/blog')

const authMiddleware = require('../middleware/authorization')
const { route } = require('./blog')

// get all blogs for any user * homepage*
router.get('/home', async (req, res, next) => {
  let { query: { limit, skip } } = req;
  let _query = {}
  if (limit == undefined || limit == '')
    limit = 10
  if (skip == undefined)
    skip = 0
  let _pagination = { limit: Number(limit), skip: Number(skip) }
  try {
    console.log(_pagination);
    const blogs = await getBlogs(_query, _pagination) //check in controller if author undefined
    res.json(blogs);
  } catch (e) {
    next(e);
  }
});

// get one blog by id
router.get('/blogs/blog/:blogid', async (req, res, next) => {
  try {
    const blog = await getOneBlog(req.params.blogid)
    res.json(blog);
  } catch (e) {
    next(e);
  }
});

router.use('/blogs', authMiddleware, blogsRouter)

router.use('/users', userRouter)

module.exports = router

