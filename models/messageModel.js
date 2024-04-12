import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',
    },
    text: {
        type: String, 
        required: true
    },
    attachment: {
        type: String,
    },
    time: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: String,
        enum: ['Read', 'Unread'],
        default: 'Unread'
    }
},{timestamps: true})

const Message = mongoose.model('Message', messageSchema)

export default Message