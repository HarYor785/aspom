import mongoose from "mongoose";


const forumSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',
    },
    description: {
        type: String,
        required: [true, 'Description field is required']
    },
    file: {type: String},
    likes: [{type: String}],
    comment: [{type: mongoose.Schema.Types.ObjectId, ref:'Comment'}],
},{timestamps: true})


const Forum = mongoose.model('Forum', forumSchema)

export default Forum