import AuthUser from "../models/authModel.js"
import Chat from "../models/chatModel.js"
import Message from "../models/messageModel.js"

export const createChat = async (req, res) => {
    try {
        const {userId} = req.body.user
        const {receiverId} = req.body

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(401).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        // let existChat = await Chat.find({ participants: [userId, receiverId] });
        let existingChat = await Chat.findOne({ participants: { $all: [userId, receiverId] } }).populate({
            path: 'participants'
        })
        if (existingChat) {
            // If chat exists, return the chat data
            return res.status(200).json({
                success: true,
                message: 'Chat already exists',
                data: existingChat
            });
        }

        const chat = new Chat({participants: [userId, receiverId]})

        await chat.save()

        existingChat = await Chat.findOne({ participants: { $all: [userId, receiverId] } }).populate({
            path: 'participants'
        })

        res.status(200).json({
            success: true,
            message: 'Chat created successfully',
            data: existingChat,
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

export const fetchUserChat = async (req, res) =>{
    try{
        const {userId} = req.body.user

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(401).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const conversations = await Chat.find()
        .populate({
            path: 'participants',
            select: 'staffId firstName lastName role department profilePic'
        })
        .populate('messages')
        .sort({lastMessageTime: -1})

        res.status(200).json({
            success: true,
            message: 'Chats fetched!',
            data: conversations
        })
    }catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

export const sendMessage = async (req, res) => {
    try {
        const {userId} = req.body.user
        const {chatId, senderId, text} = req.body
        const file = req.file

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(401).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        if(!text){
            return res.status(401).json({
                success: false,
                message: 'Empty input field'
            })
        }

        const message = new Message({
            senderId,
            text,
            attachment: file ? file.filename : ''
        })

        const result = await message.save()

        await Chat.findByIdAndUpdate(chatId,{
            $push: {messages: result._id},
            $set: {lastMessageTime: new Date()}
        })

        res.status(200).json({
            success: true,
            message: 'Message saved successfully',
            data: result
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}


export const fetchMessages = async (req, res)=> {
    try {
        const {userId} = req.body.user
        const {chatId} = req.params

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(401).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const chats = await Chat.findById(chatId).populate('messages')

        const messages = chats ? chats.messages : []

        res.status(200).json({
            success: true,
            message: 'Message fetched successfully!',
            data: messages
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

export const updateMessageStatus = async (req, res) =>{
    try {
        const {userId} = req.body.user
        const {chatId} = req.params

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(401).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const chats = await Chat.findById(chatId);

        if (!chats) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        const status = 'Read'
        const update = await Promise.all(chats.messages.map(async(item)=>{
            const updated = await Message.findByIdAndUpdate(item,{
                status: status
            },{new: true})

            return updated
        }))

        res.status(200).json({
            success: true,
            message: 'Message updated successfully!',
            data: update
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}
