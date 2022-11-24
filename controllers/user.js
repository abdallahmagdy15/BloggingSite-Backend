const userModel = require('../models/user')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const jwtSignAsync = promisify(jwt.sign)


const getFollowings = async (id, { authorname, username }) => {

    let query = { $or: [{}] };
    if (authorname != undefined)
        query.$or.push(
            { firstName: { $regex: "^" + authorname } },
            { lastName: { $regex: "^" + authorname } });
    if (username != undefined)
        query.$or.push({ username })
    if (query.$or.length > 1)
        query.$or.splice(0, 1)
    const { followings } = await getUser(id)

    return userModel.find(query).where('_id').in(followings).exec().then().catch(e => {
        throw new Error("Caught error in getFollowings :" + e.message)
    })
}
const getFollowers = async (id, { authorname, username }) => {
    let query = { $or: [{}] };
    if (authorname != undefined)
        query.$or.push(
            { firstName: { $regex: "^" + authorname } },
            { lastName: { $regex: "^" + authorname } });
    if (username != undefined)
        query.$or.push({ username })
    if (query.$or.length > 1)
        query.$or.splice(0, 1)
    const { followers } = await getUser(id)
    return userModel.find(query).where('_id').in(followers).exec().then().catch(e => {
        throw new Error("Caught error in getFollowers :" + e.message)
    })
}

const getUser = (id) => {
    return userModel.findById(id).exec().then().catch(e => {
        throw new Error("Caught error in getUser :" + e.message)
    })
}

const getSuggestions = (currUser, { authorname, username }) => {
    const excludedUsersIds = [...currUser.followings, currUser.id];
    let query = { $or: [{}] };
    if (authorname != undefined)
        query.$or.push(
            { firstName: { $regex: "^" + authorname } },
            { lastName: { $regex: "^" + authorname } });
    if (username != undefined)
        query.$or.push({ username })
    if (query.$or.length > 1)
        query.$or.splice(0, 1)
    query._id = { $nin: excludedUsersIds }
    return userModel.find(query).exec().then().catch(e => {
        throw new Error("Caught error in getSuggestions :" + e.message)
    })
}

const register = (user) => userModel.create(user).then().catch(e => {
    throw new Error("Caught error in register :" + e.message)
})

const login = async ({ username, password }) => {
    //login
    const user = await userModel.findOne({ username }).exec().then().catch(e => {
        throw new Error("Caught error in login :" + e.message)
    })
    if (!user)
        throw new Error('AUTHENTICATION_REQUIRED')

    const valid = await user.validatePassword(password);

    if (!valid)
        throw new Error('AUTHENTICATION_REQUIRED')

    const token = await jwtSignAsync({
        username: username,
        id: user.id,
    }, process.env.SECRET, { expiresIn: '1d' }).then().catch(e => {
        throw new Error("Caught error in login :" + e.message)
    });

    return { ...user.toJSON(), token } // this will be returned as promise
}

const follow = (userid, followedid) => {
    if (userid == followedid)
        return { "status": "can't follow your self" }
    //update follower's followings
    userModel.findByIdAndUpdate(userid, { $addToSet: { followings: followedid } }, { new: true })
        .exec().then().catch(e => {
            throw new Error("Caught error in follow :" + e.message)
        })

    //update followed one's followers
    userModel.findByIdAndUpdate(followedid, { $addToSet: { followers: userid } }, { new: true })
        .exec().then().catch(e => {
            throw new Error("Caught error in follow :" + e.message)
        })
    return { "status": "followed" }
}
const unfollow = (userid, followedid) => {
    //update follower's followings
    userModel.findByIdAndUpdate(userid, { $pull: { followings: followedid } }, { new: true })
        .exec().then().catch(e => {
            throw new Error("Caught error in unfollow :" + e.message)
        })

    //update followed one's followers
    userModel.findByIdAndUpdate(followedid, { $pull: { followers: userid } }, { new: true })
        .exec().then().catch(e => {
            throw new Error("Caught error in unfollow :" + e.message)
        })
    return { "status": "unfollowed" }

}

const remove = (id) => userModel.findByIdAndDelete(id).exec().then().catch(e => {
    throw new Error("Caught error in remove *user* :" + e.message)
})

const update = (id, userUpdated) => userModel.findByIdAndUpdate(id, userUpdated, { new: true })
    .exec().then().catch(e => {
        throw new Error("Caught error in  update *user* :" + e.message)
    })

module.exports = {
    getUser, getFollowers, getFollowings, register, login, update, remove, follow, unfollow, getSuggestions
}