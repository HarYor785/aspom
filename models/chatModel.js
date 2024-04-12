import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AuthUser'
        }
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        }
    ],
    lastMessageTime: {
        type: String,
        default: null
    }
},{timestamps: true})


const Chat = mongoose.model('Chat', chatSchema)

export default Chat