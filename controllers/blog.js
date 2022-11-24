const blogModel = require('../models/blog')
const userModel = require('../models/user')


const getBlogs = async (query, pagination) => {
    return blogModel.find(query).limit(pagination.limit)
        .skip(pagination.skip).sort([['updatedAt', -1]]).exec().then().catch(e => {
            throw new Error("Caught error in getBlogs :" + e.message)
        })
}


const getFollowingsBlogs = async (query, pagination, followingsIds) => {
    return blogModel.find(query).where('author').in(followingsIds).sort([['updatedAt', -1]])
        .limit(pagination.limit).skip(pagination.skip).exec()
        .then().catch(e => {
            throw new Error("Caught error in getFollowingsBlogs :" + e.message)
        })
}

const getOneBlog = (id) => blogModel.findById(id).exec().then().catch(e => {
    throw new Error("Caught error in getOneBlog :" + e.message)
})

const createBlog = async (blog) => {
    blog.createdAt = new Date()
    blog.updatedAt = new Date()

    const _blog = await blogModel.create(blog).then().catch(e => {
        throw new Error("Caught error in createBlog :" + e.message)
    })
    //update user blogs
    userModel.findByIdAndUpdate(blog.author, { $push: { blogs: _blog.id } }, { new: true })
        .exec().then().catch(e => {
            throw new Error("Caught error in createB log :" + e.message)
        })

    return _blog;

}


const updateBlog = async (userblogsIds, blogid, blogBody) => {
    let ublog = userblogsIds.filter(id => id == blogid)[0];
    if (ublog == undefined)
        return { "status": "Denied , not authorized to update this blog!" }
    blogBody.updatedAt = new Date()
    return blogModel.findByIdAndUpdate(blogid, blogBody, { new: true })
        .exec().then().catch(e => {
            throw new Error("Caught error in updateBlog :" + e.message)
        })
}


const removeBlog = async ({ blogs, id }, blogid) => {
    let ublog = blogs.filter(bid => bid == blogid)[0];
    if (ublog == undefined)
        return { "status": "Denied , not authorized to delete this blog!" }
    const blog = await blogModel.findByIdAndDelete(blogid)
        .exec().then().catch(e => {
            throw new Error("Caught error in removeBlog :" + e.message)
        })

    await userModel.findByIdAndUpdate(id, { $pull: { blogs: blog.id } }, { new: true })
        .exec().then().catch(e => {
            throw new Error("Caught error in removeBlog :" + e.message)
        })
    return blog
}

const createComment = async (blogid, comment) => {

    comment.createdAt = new Date()
    comment.updatedAt = new Date()

    await blogModel.findByIdAndUpdate(blogid, { $push: { comments: comment } }, { new: true })
        .exec().then().catch(e => {
            throw new Error("Caught error in createComment :" + e.message)
        })
    return comment;
}

const updateComment = async (uid, blogid, commentid, comment) => {
    let blog = await blogModel.findById(blogid).exec();
    let cmnt = blog.comments.id(commentid).remove();
    cmnt.body = comment.body;
    if (cmnt.author != uid)
        return { "status": "Denied , not authorized to update this comment!" }
    cmnt.updatedAt = new Date()
    blog.comments.push(cmnt);
    await blog.save(function (err) {
        if (err)
            throw new Error("Caught error in updateComment :" + err.message)
    })
    return cmnt;
}


const removeComment = async (uid, blogid, commentid) => {
    let blog = await blogModel.findById(blogid).exec();
    let cmnt = blog.comments.id(commentid).remove();

    if (cmnt.author != uid)
        return { "status": "Denied , not authorized to update this comment!" }

    await blog.save(function (err) {
        if (err)
            throw new Error("Caught error in updateComment :" + err.message)
    })
    return cmnt;
}

const likeBlog = async (uid, blogid) => {
    await blogModel.findByIdAndUpdate(blogid, { $addToSet: { likes: uid } }, { new: true })
        .exec().then().catch(e => {
            throw new Error("Caught error in likeBlog :" + e.message)
        })
    return {
        "status": "blog is liked !"
    }
}

const unlikeBlog = async (uid, blogid) => {
    await blogModel.findByIdAndUpdate(blogid, { $pull: { likes: uid } }, { new: true })
        .exec().then().catch(e => {
            throw new Error("Caught error in likeBlog :" + e.message)
        })
    return {
        "status": "blog is unliked !"
    }
}

const likeComment = async (uid, blogid, commentid) => {
    let blog = await blogModel.findById(blogid).exec();
    let cmnt = blog.comments.id(commentid).remove();

    cmnt.likes.addToSet(uid);

    blog.comments.push(cmnt);
    await blog.save(function (err) {
        if (err)
            throw new Error("Caught error in likeComment :" + err.message)
    })

    return {
        "status": "comment is liked !"
    }
}

const unlikeComment = async (uid, blogid, commentid) => {
    let blog = await blogModel.findById(blogid).exec();
    let cmnt = blog.comments.id(commentid).remove();

    cmnt.likes.pop(uid);

    blog.comments.push(cmnt);
    await blog.save(function (err) {
        if (err)
            throw new Error("Caught error in unlikeComment :" + err.message)
    })

    return {
        "status": "comment is unliked !"
    }
}

module.exports = {
    getBlogs, getOneBlog, createBlog, updateBlog, removeBlog, getFollowingsBlogs,
    createComment, updateComment, removeComment, likeBlog, unlikeBlog, likeComment,
    unlikeComment
}