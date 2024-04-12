import mongoose from "mongoose";


const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser'
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Forum'
    },
    comment: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    likes: [{type: String}]
},{timestamps: true});


const  Comment = mongoose.model('Comment', commentSchema);

export default Comment;