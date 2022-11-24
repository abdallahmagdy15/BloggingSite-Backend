const Mongoose = require('mongoose')
const { Schema } = Mongoose

const commentSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    authorDp: String,
    authorName: { type: String, required: true },
    body: {
        type: String,
        maxlength: 1024,
        required: true
    },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    photo: String,
    likes: [{ type: Schema.Types.ObjectId, ref: 'user' }]
});

const blogSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    title: { type: String, required: true, maxLength: 160 },
    body: { type: String, required: true, maxLength: 6000 },
    authorDp: String,
    authorName: { type: String, required: true },
    photo: String,
    tags: [String],
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    comments: [commentSchema],
    likes: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    likesCount: Number

})

const blogModel = Mongoose.model('blog', blogSchema)
module.exports = blogModel;