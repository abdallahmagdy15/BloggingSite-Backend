const express = require('express');
const router = express.Router();

const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");


const { getBlogs, getFollowingsBlogs, createBlog, updateBlog, removeBlog,
  createComment, updateComment, removeComment, likeBlog, unlikeBlog, likeComment, unlikeComment } = require('../controllers/blog');

// get all blogs
router.get('/search', async (req, res, next) => {
  let { query: { body, title, tag, limit, skip } } = req;
  let _query = { $or: [{}] }
  if (title != undefined)
    _query.$or.push({ title: { $regex: ".*" + title + ".*" } });
  if (tag != undefined)
    _query.$or.push({ tags: tag })
  if (body != undefined)
    _query.$or.push({ body: { $regex: ".*" + body + ".*" } })
  if (limit == undefined || limit == '')
    limit = 10
  if (skip == undefined)
    skip = 0
  if (_query.$or.length > 1)
    _query.$or.splice(0, 1)
  let _pagination = { limit: Number(limit), skip: Number(skip) }
  getBlogs(_query, _pagination).then(blogs => res.json(blogs)).catch(err => next(err))
});

//get followings' blogs
router.get('/followings', async (req, res, next) => {
  let { query: { body, title, tag, limit, skip } } = req;
  let _query = { $or: [{}] }
  if (title != undefined)
    _query.$or.push({ title: { $regex: "^" + title } });
  if (tag != undefined)
    _query.$or.push({ tags: tag })
  if (body != undefined)
    _query.$or.push({ body: { $regex: ".*" + body + ".*" } })
  if (_query.$or.length > 1)
    _query.$or.splice(0, 1)
  if (limit == undefined || limit == '')
    limit = 10
  if (skip == undefined)
    skip = 0
  let _pagination = { limit: Number(limit), skip: Number(skip) }
  try {
    const blogs = await getFollowingsBlogs(_query, _pagination, req.user.followings) //check in controller if author undefined
    res.json(blogs);
  } catch (e) {
    next(e);
  }
});

// get user blogs
router.get('/user/:userid', async (req, res, next) => {
  let { params: { userid }, query: { title, body, tag, limit, skip } } = req;
  let _query = { author: userid, $or: [{}] }

  if (title != undefined)
    _query.$or.push({ title: { $regex: "^" + title } });
  if (tag != undefined)
    _query.$or.push({ tags: tag })
  if (body != undefined)
    _query.$or.push({ body: { $regex: ".*" + body + ".*" } })
  if (_query.$or.length > 1)
    _query.$or.splice(0, 1)
  if (limit == undefined || limit == '')
    limit = 10
  if (skip == undefined)
    skip = 0
  let _pagination = { limit: Number(limit), skip: Number(skip) }
  try {
    const blogs = await getBlogs(_query, _pagination)
    res.json(blogs);
  } catch (e) {
    next(e);
  }
});



// create new blog
router.post('/', upload.single("photo"), async (req, res, next) => {
  // 'photo' is the name of our file input field in the HTML form

  const { body, user: { id, DisplayPicture, firstName, lastName } } = req;
  try {
    // Upload image to cloudinary
    if (req.file != undefined) {
      const result = await cloudinary.uploader.upload(req.file.path);
      body.photo = result.secure_url;
    }
    if (body.tags)
      body.tags = JSON.parse(body.tags)
    createBlog({ ...body, author: id, authorDp: DisplayPicture, authorName: firstName + ' ' + lastName })
      .then(blog => res.json(blog)).catch(err => next(err))
  } catch (err) {
    console.log(err);
  }
});

// update one blog
router.patch('/:blogid', (req, res, next) => {
  const { user: { blogs }, body, params: { blogid } } = req;
  updateBlog(blogs, blogid, body).then(blog => res.json(blog)).catch(err => next(err))
});

// delete blog
router.delete('/:blogid', async (req, res, next) => {
  const { user: { id, blogs }, params: { blogid } } = req;
  try {
    const blog = await removeBlog({ id, blogs }, blogid)
    res.json(blog);
  } catch (e) {
    next(e);
  }
});


//comments 

// create new comment
router.post('/:blogid/comments', upload.single("photo"), async (req, res, next) => {
  // 'photo' is the name of our file input field in the HTML form

  const { body, params: { blogid }, user: { id, DisplayPicture, firstName, lastName } } = req;

  try {
    // Upload image to cloudinary
    if (req.file != undefined) {
      const result = await cloudinary.uploader.upload(req.file.path);
      body.photo = result.secure_url;
    }

    createComment(blogid, { ...body, author: id, authorDp: DisplayPicture, authorName: firstName + ' ' + lastName })
      .then(comment => res.json(comment)).catch(err => next(err))
  } catch (err) {
    console.log(err);
  }
});

// update one comment
router.patch('/:blogid/comments/:commentid', (req, res, next) => {
  const { user: { id }, body, params: { blogid, commentid } } = req;
  updateComment(id, blogid, commentid, body).then(comment => res.json(comment)).catch(err => next(err))
});

// delete one comment
router.delete('/:blogid/comments/:commentid', async (req, res, next) => {
  const { user: { id }, params: { blogid, commentid } } = req;
  try {
    const comment = await removeComment(id, blogid, commentid)
    res.json(comment);
  } catch (e) {
    next(e);
  }
});

//like blog
router.post('/:blogid/like', async (req, res, next) => {
  const { params: { blogid }, user: { id } } = req;
  await likeBlog(id, blogid).then(status => res.json(status)).catch(err => {
    console.log(err);
    next(err);
  });
})

//unlike blog
router.post('/:blogid/unlike', async (req, res, next) => {
  const { params: { blogid }, user: { id } } = req;
  await unlikeBlog(id, blogid).then(status => res.json(status)).catch(err => {
    console.log(err);
    next(err);
  });
})

//like comment
router.post('/:blogid/comments/:commentid/like', async (req, res, next) => {
  const { params: { blogid, commentid }, user: { id } } = req;
  await likeComment(id, blogid, commentid).then(status => res.json(status)).catch(err => {
    console.log(err);
    next(err);
  });
})

//unlike comment
router.post('/:blogid/comments/:commentid/unlike', async (req, res, next) => {
  const { params: { blogid, commentid }, user: { id } } = req;
  await unlikeComment(id, blogid, commentid).then(status => res.json(status)).catch(err => {
    console.log(err);
    next(err);
  });
})

module.exports = router;
