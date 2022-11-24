const express = require('express');
const router = express.Router();
const { getUser, getFollowers, getFollowings,
  register, login, update, remove, follow, unfollow, getSuggestions } = require('../controllers/user');
const authMiddleware = require('../middleware/authorization')
const upload = require("../utils/multer");
const cloudinary = require("../utils/cloudinary");


//get user profile
router.get('/:userid', authMiddleware, async (req, res, next) => {
  let { params: { userid } } = req
  try {
    const user = await getUser(userid);
    res.json(user);
  } catch (e) {
    next(e);
  }
})

//get followers* search by authorname or username
router.get('/:userid/followers', authMiddleware, async (req, res, next) => {
  let { params: { userid }, query } = req
  try {
    const followers = await getFollowers(userid, query);
    res.json(followers);
  } catch (e) {
    next(e);
  }
})

//get followings * search by authorname or username
router.get('/:userid/followings', authMiddleware, async (req, res, next) => {
  let { params: { userid } , query } = req
  try {
    const followings = await getFollowings(userid , query);
    res.json(followings);
  } catch (e) {
    next(e);
  }
})

//get suggestions * search by authorname or username
router.get('/suggestions/list', authMiddleware, async (req, res, next) => {
  let { user, query } = req

  try {
    const suggestions = await getSuggestions(user, query);
    res.json(suggestions);
  } catch (e) {
    next(e);
  }
})

//follow user
router.post('/follow/:userid', authMiddleware, async (req, res, next) => {
  let { user: { id }, params: { userid } } = req
  try {
    const user = await follow(id, userid)
    res.json(user);
  } catch (e) {
    next(e);
  }
})

//unfollow user
router.post('/unfollow/:userid', authMiddleware, async (req, res, next) => {
  let { user: { id }, params: { userid } } = req
  try {
    const user = await unfollow(id, userid)
    res.json(user);
  } catch (e) {
    next(e);
  }
})

// login user
router.post('/login', async (req, res, next) => {
  const { body } = req;
  try {
    const user = await login(body)
    res.json(user);
  } catch (e) {
    next(e);
  }
});

// register new user**
router.post('/register', async (req, res, next) => {
  const { body: newUser } = req;
  try {
    const user = await register(newUser)
    res.json(user);
  } catch (e) {
    next(e);
  }
});


// update one user data
router.patch('/', authMiddleware,upload.single("dp"), async (req, res, next) => {
  const { user: { id }, body: userUpdated } = req;
    try {
      // Upload image to cloudinary
      if (req.file != undefined) {
        const result = await cloudinary.uploader.upload(req.file.path);
        userUpdated.dp = result.secure_url;
      }
    const user = await update(id, userUpdated)
    res.json(user);
  } catch (e) {
    next(e);
  }
});

// delete user
router.delete('/', authMiddleware, async (req, res, next) => {
  try {
    const user = await remove(req.user.id)
    res.json(user);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
